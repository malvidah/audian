import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { dateFrom, dateTo } = await request.json().catch(() => ({}));
    const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to   = dateTo   || new Date().toISOString();

    const [metricsRes, interactionsRes, connectionsRes] = await Promise.all([
      supabaseAdmin.from('platform_metrics').select('*').gte('snapshot_at', from).lte('snapshot_at', to).order('snapshot_at', { ascending: false }),
      supabaseAdmin.from('interactions').select('*, handles(*)').gte('interacted_at', from).lte('interacted_at', to).order('interacted_at', { ascending: false }).limit(30),
      supabaseAdmin.from('platform_connections').select('platform, channel_name, subscriber_count'),
    ]);

    const metrics      = metricsRes.data || [];
    const interactions = interactionsRes.data || [];
    const connections  = connectionsRes.data || [];

    const platformSummaries = {};
    metrics.forEach(m => {
      if (!platformSummaries[m.platform]) platformSummaries[m.platform] = [];
      platformSummaries[m.platform].push(m);
    });

    const dateLabel = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    let dataContext = `Date range: ${dateLabel(from)} – ${new Date(to).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n`;

    dataContext += `CONNECTED PLATFORMS:\n`;
    connections.forEach(c => {
      dataContext += `- ${c.platform}: ${c.channel_name} (${c.subscriber_count?.toLocaleString() || 0} followers)\n`;
    });
    dataContext += '\n';

    dataContext += `ENGAGEMENT METRICS:\n`;
    Object.entries(platformSummaries).forEach(([platform, snapshots]) => {
      const latest = snapshots[0];
      dataContext += `${platform.toUpperCase()}:\n`;
      if (latest.followers)    dataContext += `  Followers: ${latest.followers?.toLocaleString()}\n`;
      if (latest.impressions)  dataContext += `  Impressions: ${latest.impressions?.toLocaleString()}\n`;
      if (latest.likes)        dataContext += `  Likes: ${latest.likes?.toLocaleString()}\n`;
    });
    dataContext += '\n';

    dataContext += `NOTABLE INTERACTIONS (${interactions.length} this period):\n`;
    interactions.slice(0, 10).forEach(i => {
      const h      = i.handles || {};
      const handle = h[`handle_${i.platform}`] || h.handle_instagram || '?';
      dataContext += `- @${handle} (${h.zone || 'SIGNAL'}, ${h[`followers_${i.platform}`]?.toLocaleString() || '?'} followers): ${i.interaction_type}${i.content ? ` — "${i.content.slice(0, 100)}"` : ''}\n`;
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
    const aiData   = await res.json();
    const insights = aiData.content?.[0]?.text || 'Unable to generate insights.';
    return NextResponse.json({ insights, dataContext });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
