import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

// Apify actor IDs for Instagram scraping
const ACTORS = {
  followers:   'apify/instagram-followers-scraper',
  likers:      'apify/instagram-post-likers-scraper',
  mentions:    'apify/instagram-hashtag-scraper', // reused for @mention search
};

export async function POST(req) {
  try {
    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'APIFY_API_KEY not set' }, { status: 500 });

    // Get connected Instagram account
    const { data: conns } = await supabase
      .from('platform_connections')
      .select('channel_name, channel_id, subscriber_count')
      .eq('platform', 'instagram')
      .order('connected_at', { ascending: false })
      .limit(1);

    const conn = conns?.[0];
    if (!conn) return NextResponse.json({ error: 'No Instagram account connected' }, { status: 400 });

    const handle = conn.channel_name; // e.g. "freethink"
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/apify/webhook`;

    const body = await req.json().catch(() => ({}));
    const types = body.types || ['followers', 'likers', 'mentions'];

    const runs = [];

    // ── 1. Followers scraper ─────────────────────────────────────────────────
    if (types.includes('followers')) {
      const res = await fetch(
        `https://api.apify.com/v2/acts/${ACTORS.followers}/runs?token=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: handle,
            resultsLimit: 500,
            webhookUrl,
            webhookData: { type: 'followers', handle, source: 'apify' },
          }),
        }
      );
      const data = await res.json();
      if (data.data?.id) runs.push({ type: 'followers', runId: data.data.id });
      else console.error('Followers actor error:', JSON.stringify(data));
    }

    // ── 2. Post likers scraper ───────────────────────────────────────────────
    if (types.includes('likers')) {
      // Get recent post IDs from platform_metrics
      const { data: metrics } = await supabase
        .from('platform_metrics')
        .select('videos')
        .eq('platform', 'instagram')
        .order('snapshot_at', { ascending: false })
        .limit(1);

      const posts = metrics?.[0]?.videos?.slice(0, 5) || [];
      const postUrls = posts.map(p => p.permalink).filter(Boolean);

      if (postUrls.length > 0) {
        const res = await fetch(
          `https://api.apify.com/v2/acts/${ACTORS.likers}/runs?token=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              directUrls: postUrls,
              resultsLimit: 200,
              webhookUrl,
              webhookData: { type: 'likers', handle, source: 'apify' },
            }),
          }
        );
        const data = await res.json();
        if (data.data?.id) runs.push({ type: 'likers', runId: data.data.id });
        else console.error('Likers actor error:', JSON.stringify(data));
      }
    }

    // ── 3. Mentions scraper (searches @handle in recent posts) ───────────────
    if (types.includes('mentions')) {
      const res = await fetch(
        `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            directUrls: [`https://www.instagram.com/${handle}/`],
            resultsType: 'posts',
            resultsLimit: 20,
            addParentData: false,
            webhookUrl,
            webhookData: { type: 'mentions', handle, source: 'apify' },
          }),
        }
      );
      const data = await res.json();
      if (data.data?.id) runs.push({ type: 'mentions', runId: data.data.id });
      else console.error('Mentions actor error:', JSON.stringify(data));
    }

    return NextResponse.json({
      success: true,
      handle,
      runs,
      message: `Triggered ${runs.length} scrapers for @${handle}`,
    });

  } catch (err) {
    console.error('Apify trigger error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
