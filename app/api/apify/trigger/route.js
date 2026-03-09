import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export const dynamic = 'force-dynamic';

// Confirmed Apify actor IDs
const ACTORS = {
  // Scrapes full profile data from usernames: followers, bio, verified, avatar
  profileScraper: 'apify~instagram-profile-scraper',
  // Scrapes post comments including commenter usernames (then enriched above)
  commentScraper: 'apify~instagram-comment-scraper',
};

async function runActor(actorId, input, webhookUrl, webhookData, apiKey) {
  const webhooks = webhookUrl ? [{
    eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
    requestUrl: webhookUrl,
    payloadTemplate: JSON.stringify({
      eventType: '{{eventType}}',
      resource: '{{resource}}',
      webhookData,
    }),
  }] : [];

  const res = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, webhooks }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data));
  return data.data; // { id, defaultDatasetId, status }
}

export async function POST(req) {
  try {
    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'APIFY_API_KEY not set in Vercel env vars' }, { status: 500 });

    // Get connected Instagram account
    const { data: conns } = await supabase
      .from('platform_connections').select('channel_name,channel_id')
      .eq('platform','instagram').order('connected_at',{ascending:false}).limit(1);
    const conn = conns?.[0];
    if (!conn) return NextResponse.json({ error: 'No Instagram account connected' }, { status: 400 });

    const handle   = conn.channel_name; // e.g. "freethink"
    const appUrl   = process.env.NEXT_PUBLIC_APP_URL || 'https://www.audian.app';
    const webhookUrl = `${appUrl}/api/apify/webhook`;

    // Get existing commenters to enrich with real profile data
    const { data: commenters } = await supabase
      .from('platform_comments').select('author_name')
      .eq('platform','instagram');
    const uniqueHandles = [...new Set((commenters||[]).map(c=>c.author_name).filter(Boolean))];

    const runs = [];
    const body = await req.json().catch(() => ({}));
    const types = body.types || ['enrich', 'recent_posts'];

    // ── 1. Enrich existing commenters with real profile data ─────────────────
    // Uses instagram-profile-scraper: input is array of usernames
    // Returns: followers, bio, verified, avatar, website etc.
    if (types.includes('enrich') && uniqueHandles.length > 0) {
      // Batch to 50 handles max per run (cost control)
      const batch = uniqueHandles.slice(0, 50);
      const run = await runActor(
        ACTORS.profileScraper,
        { usernames: batch },
        webhookUrl,
        { type: 'profile_enrich', handle, source: 'apify', platform: 'instagram' },
        apiKey
      );
      runs.push({ type: 'profile_enrich', runId: run.id, handles: batch.length });
    }

    // ── 2. Scrape recent post comments (gets NEW commenters not yet in DB) ────
    // Uses instagram-comment-scraper on recent post URLs
    if (types.includes('recent_posts')) {
      // Get recent post URLs from platform_metrics
      const { data: metrics } = await supabase
        .from('platform_metrics').select('videos')
        .eq('platform','instagram').order('snapshot_at',{ascending:false}).limit(1);
      const posts   = metrics?.[0]?.videos?.slice(0,3) || [];
      const postUrls = posts.map(p => p.permalink || p.url).filter(Boolean);

      if (postUrls.length > 0) {
        const run = await runActor(
          ACTORS.commentScraper,
          { directUrls: postUrls, resultsLimit: 100 },
          webhookUrl,
          { type: 'post_comments', handle, source: 'apify', platform: 'instagram' },
          apiKey
        );
        runs.push({ type: 'post_comments', runId: run.id, posts: postUrls.length });
      } else {
        runs.push({ type: 'post_comments', skipped: true, reason: 'No post URLs in recent metrics — run Sync Now on Instagram first' });
      }
    }

    return NextResponse.json({
      success: true,
      handle,
      runs,
      message: `Triggered ${runs.filter(r=>r.runId).length} Apify jobs for @${handle} — results arrive via webhook in ~2 min`,
    });

  } catch (err) {
    console.error('Apify trigger error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
