import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { question } = await request.json();
    if (!question?.trim()) return NextResponse.json({ error: 'No question' }, { status: 400 });

    // Load all data for context
    const [metricsRes, commentsRes, connectionsRes] = await Promise.all([
      supabase.from('platform_metrics').select('*').order('snapshot_at', { ascending: false }).limit(20),
      supabase.from('platform_comments').select('*').order('published_at', { ascending: false }).limit(30),
      supabase.from('platform_connections').select('platform,channel_name,subscriber_count,metadata'),
    ]);

    const metrics     = metricsRes.data || [];
    const comments    = commentsRes.data || [];
    const connections = connectionsRes.data || [];

    let context = 'CONNECTED PLATFORMS:\n';
    connections.forEach(c => {
      context += `- ${c.platform}: ${c.channel_name} (${(c.subscriber_count || c.metadata?.followers_count || 0).toLocaleString()} followers)\n`;
    });
    context += '\n';

    const latestPerPlatform = {};
    metrics.forEach(m => { if (!latestPerPlatform[m.platform]) latestPerPlatform[m.platform] = m; });

    context += 'LATEST METRICS:\n';
    Object.entries(latestPerPlatform).forEach(([p, m]) => {
      context += `${p.toUpperCase()}: ${m.followers?.toLocaleString()} followers`;
      if (m.total_views) context += `, ${m.total_views?.toLocaleString()} total views`;
      if (m.metadata?.impressions) context += `, ${m.metadata.impressions?.toLocaleString()} impressions (7d)`;
      if (m.metadata?.reach) context += `, ${m.metadata.reach?.toLocaleString()} reach (7d)`;
      if (m.metadata?.total_likes) context += `, ${m.metadata.total_likes} likes on recent posts`;
      context += '\n';
      if (m.videos?.length) {
        context += `  Recent videos:\n`;
        m.videos.slice(0, 5).forEach(v => {
          context += `    - "${v.title}" — ${v.views?.toLocaleString()} views, ${v.likes} likes\n`;
        });
      }
      if (m.metadata?.recent_posts?.length) {
        context += `  Recent posts:\n`;
        m.metadata.recent_posts.slice(0, 5).forEach(p2 => {
          context += `    - "${p2.caption?.slice(0, 60) || '[post]'}" — ${p2.likes} likes, ${p2.comments} comments\n`;
        });
      }
    });
    context += '\n';

    if (comments.length > 0) {
      context += `RECENT COMMENTS (${comments.length}):\n`;
      comments.slice(0, 15).forEach(c => {
        context += `- ${c.author_name} on ${c.platform}${c.video_title ? ` ("${c.video_title?.slice(0, 40)}")` : ''}: "${c.content?.slice(0, 120)}"\n`;
      });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: `You are Audian AI, a social media intelligence assistant for Big Think — a media company focused on ideas, science, philosophy, and human potential. You have access to their real social data and answer questions about performance, trends, content strategy, and audience insights.

Be specific, direct, and editorial. Reference actual numbers and content from the data. Keep answers concise (3-6 sentences). If the data doesn't support an answer, say so.`,
        messages: [{ role: 'user', content: `DATA:\n${context}\n\nQUESTION: ${question}` }],
      }),
    });

    const data = await res.json();
    const answer = data.content?.[0]?.text || 'No response.';
    return NextResponse.json({ answer });
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
