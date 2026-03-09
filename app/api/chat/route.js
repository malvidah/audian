import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { question } = await request.json();
    if (!question?.trim()) return NextResponse.json({ error: 'No question' }, { status: 400 });

    const [metricsRes, interactionsRes, connectionsRes] = await Promise.all([
      supabaseAdmin.from('platform_metrics').select('*').order('snapshot_at', { ascending: false }).limit(20),
      supabaseAdmin.from('interactions')
        .select('*, handles(name, handle_instagram, handle_x, handle_youtube, handle_linkedin, followers_instagram, followers_x, followers_youtube, followers_linkedin)')
        .eq('interaction_type', 'comment')
        .order('interacted_at', { ascending: false })
        .limit(30),
      supabaseAdmin.from('platform_connections').select('platform, channel_name, subscriber_count'),
    ]);

    const metrics     = metricsRes.data || [];
    const interactions = interactionsRes.data || [];
    const connections = connectionsRes.data || [];

    let context = 'CONNECTED PLATFORMS:\n';
    connections.forEach(c => {
      context += `- ${c.platform}: ${c.channel_name} (${(c.subscriber_count || 0).toLocaleString()} followers)\n`;
    });
    context += '\n';

    const latestPerPlatform = {};
    metrics.forEach(m => { if (!latestPerPlatform[m.platform]) latestPerPlatform[m.platform] = m; });

    context += 'LATEST METRICS:\n';
    Object.entries(latestPerPlatform).forEach(([p, m]) => {
      context += `${p.toUpperCase()}: ${m.followers?.toLocaleString()} followers`;
      if (m.total_views)  context += `, ${m.total_views?.toLocaleString()} total views`;
      if (m.impressions)  context += `, ${m.impressions?.toLocaleString()} impressions`;
      if (m.reach)        context += `, ${m.reach?.toLocaleString()} reach`;
      if (m.likes)        context += `, ${m.likes?.toLocaleString()} likes`;
      context += '\n';
      if (m.videos?.length) {
        context += `  Recent videos:\n`;
        m.videos.slice(0, 5).forEach(v => {
          context += `    - "${v.title}" — ${v.views?.toLocaleString()} views, ${v.likes} likes\n`;
        });
      }
    });
    context += '\n';

    if (interactions.length > 0) {
      context += `RECENT COMMENTS (${interactions.length}):\n`;
      interactions.slice(0, 15).forEach(i => {
        const h      = i.handles || {};
        const handle = h[`handle_${i.platform}`] || h.handle_instagram || '?';
        context += `- @${handle} on ${i.platform}: "${i.content?.slice(0, 120)}"\n`;
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
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: `You are Audian AI, a social media intelligence assistant for Big Think — a media company focused on ideas, science, philosophy, and human potential. You have access to their real social data and answer questions about performance, trends, content strategy, and audience insights.

Be specific, direct, and editorial. Reference actual numbers and content from the data. Keep answers concise (3-6 sentences). If the data doesn't support an answer, say so.`,
        messages: [{ role: 'user', content: `DATA:\n${context}\n\nQUESTION: ${question}` }],
      }),
    });

    const data   = await res.json();
    const answer = data.content?.[0]?.text || 'No response.';
    return NextResponse.json({ answer });
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
