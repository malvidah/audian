import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { dateFrom, dateTo } = await request.json().catch(() => ({}));

    const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to   = dateTo   || new Date().toISOString();

    // Pull all data for the period
    const [metricsRes, commentsRes, interactionsRes, connectionsRes] = await Promise.all([
      supabase.from('platform_metrics').select('*').gte('snapshot_at', from).lte('snapshot_at', to).order('snapshot_at', { ascending: false }),
      supabase.from('platform_comments').select('*').gte('published_at', from).lte('published_at', to).order('likes', { ascending: false }).limit(20),
      supabase.from('platform_interactions').select('*').gte('interacted_at', from).lte('interacted_at', to).order('influence_score', { ascending: false }).limit(20),
      supabase.from('platform_connections').select('platform,channel_name,subscriber_count'),
    ]);

    const metrics      = metricsRes.data || [];
    const comments     = commentsRes.data || [];
    const interactions = interactionsRes.data || [];
    const connections  = connectionsRes.data || [];

    // Build context for Claude
    const platformSummaries = {};
    metrics.forEach(m => {
      if (!platformSummaries[m.platform]) platformSummaries[m.platform] = [];
      platformSummaries[m.platform].push(m);
    });

    let dataContext = `Date range: ${new Date(from).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${new Date(to).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n`;

    // Connected platforms
    dataContext += `CONNECTED PLATFORMS:\n`;
    connections.forEach(c => {
      dataContext += `- ${c.platform}: ${c.channel_name} (${c.subscriber_count?.toLocaleString() || 0} followers)\n`;
    });
    dataContext += '\n';

    // Metrics per platform
    dataContext += `ENGAGEMENT METRICS:\n`;
    Object.entries(platformSummaries).forEach(([platform, snapshots]) => {
      const latest = snapshots[0];
      dataContext += `${platform.toUpperCase()}:\n`;
      if (latest.followers)   dataContext += `  Followers: ${latest.followers?.toLocaleString()}\n`;
      if (latest.total_views) dataContext += `  Total views: ${latest.total_views?.toLocaleString()}\n`;
      if (latest.video_count) dataContext += `  Videos: ${latest.video_count}\n`;
      if (latest.likes)       dataContext += `  Likes: ${latest.likes?.toLocaleString()}\n`;
      if (latest.videos?.length) {
        dataContext += `  Recent videos:\n`;
        latest.videos.slice(0, 5).forEach(v => {
          dataContext += `    - "${v.title}" — ${v.views?.toLocaleString()} views, ${v.likes?.toLocaleString()} likes, ${v.comments} comments\n`;
        });
      }
    });
    dataContext += '\n';

    // Top interactions
    if (interactions.length > 0) {
      dataContext += `INFLUENTIAL INTERACTIONS (${interactions.length} total):\n`;
      interactions.slice(0, 10).forEach(i => {
        dataContext += `- ${i.name || i.handle} (${i.followers?.toLocaleString()} followers, ${i.zone} zone) on ${i.platform}: "${i.content?.slice(0, 100)}"\n`;
      });
      dataContext += '\n';
    }

    // Top comments
    if (comments.length > 0) {
      dataContext += `NOTABLE COMMENTS (${comments.length} total):\n`;
      comments.slice(0, 10).forEach(c => {
        dataContext += `- ${c.author_name} on ${c.platform}${c.video_title ? ` ("${c.video_title?.slice(0, 40)}")` : ''}: "${c.content?.slice(0, 120)}" (${c.likes} likes)\n`;
      });
      dataContext += '\n';
    }

    // Call Claude API for insights
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are a social media intelligence analyst for Big Think, a media company focused on ideas, science, philosophy, and human potential. Your job is to analyze social media data and surface meaningful stories and patterns.

Write in a clear, intelligent, editorial tone. Be specific — reference actual numbers, video titles, and names when available. Surface non-obvious patterns. Think like an editor, not a data analyst.

Format your response as JSON with this exact structure:
{
  "headline": "One punchy sentence summarizing the most important story this period (max 15 words)",
  "stories": [
    {
      "title": "Short story title",
      "insight": "2-3 sentences explaining the pattern with specific data points"
    }
  ],
  "recommendation": "One actionable recommendation based on the data"
}

Generate 2-4 stories. Only include stories supported by actual data. If data is sparse, say so honestly.`,
        messages: [{
          role: 'user',
          content: `Analyze this social media data and surface the key stories:\n\n${dataContext}`,
        }],
      }),
    });

    const claudeData = await claudeRes.json();

    if (claudeData.error) {
      return NextResponse.json({ error: claudeData.error.message }, { status: 500 });
    }

    const raw = claudeData.content?.[0]?.text || '';

    // Parse JSON from Claude response
    let insights;
    try {
      const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      insights = JSON.parse(clean);
    } catch(e) {
      insights = { headline: raw.slice(0, 100), stories: [], recommendation: '' };
    }

    return NextResponse.json({ success: true, insights, period: { from, to } });

  } catch (err) {
    console.error('AI insights error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
