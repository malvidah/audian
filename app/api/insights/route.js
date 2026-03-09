import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { dateFrom, dateTo } = await request.json().catch(() => ({}));
    const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to   = dateTo   || new Date().toISOString();

    const [metricsRes, interactionsRes, connectionsRes] = await Promise.all([
      supabase.from('platform_metrics').select('*').gte('snapshot_at', from).lte('snapshot_at', to).order('snapshot_at', { ascending: false }),
      supabase.from('interactions').select('*, people(*)').gte('interacted_at', from).lte('interacted_at', to).order('interacted_at', { ascending: false }).limit(30),
      supabase.from('platform_connections').select('platform,channel_name,subscriber_count'),
    ]);

    const metrics      = metricsRes.data || [];
    const interactions = interactionsRes.data || [];
    const connections  = connectionsRes.data || [];

    const platformSummaries = {};
    metrics.forEach(m => { if (!platformSummaries[m.platform]) platformSummaries[m.platform] = []; platformSummaries[m.platform].push(m); });

    let dataContext = `Date range: ${new Date(from).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${new Date(to).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n`;
    dataContext += `CONNECTED PLATFORMS:\n`;
    connections.forEach(c => { dataContext += `- ${c.platform}: ${c.channel_name} (${c.subscriber_count?.toLocaleString() || 0} followers)\n`; });
    dataContext += '\n';

    dataContext += `ENGAGEMENT METRICS:\n`;
    Object.entries(platformSummaries).forEach(([platform, snapshots]) => {
      const latest = snapshots[0];
      dataContext += `${platform.toUpperCase()}:\n`;
      if (latest.followers) dataContext += `  Followers: ${latest.followers?.toLocaleString()}\n`;
      if (latest.impressions) dataContext += `  Impressions: ${latest.impressions?.toLocaleString()}\n`;
      if (latest.likes) dataContext += `  Likes: ${latest.likes?.toLocaleString()}\n`;
    });
    dataContext += '\n';

    dataContext += `NOTABLE INTERACTIONS (${interactions.length} this period):\n`;
    interactions.slice(0, 10).forEach(i => {
      const p = i.people || {};
      const handle = p[`handle_${i.platform}`] || p.handle_instagram || '?';
      dataContext += `- @${handle} (${p.category || 'SIGNAL'}, ${p[`followers_${i.platform}`]?.toLocaleString() || '?'} followers): ${i.type}${i.content ? ` — "${i.content.slice(0,100)}"` : ''}\n`;
    });

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: 'You are a social media analyst for Big Think, a media company focused on science, philosophy, and intellectual content. Provide concise, actionable insights.',
        messages: [{ role: 'user', content: `Based on this social media data, provide 3-5 key insights and recommendations:\n\n${dataContext}` }],
      }),
    });
    const aiData = await res.json();
    const insights = aiData.content?.[0]?.text || 'Unable to generate insights.';
    return NextResponse.json({ insights, dataContext });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
