import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

// Verified Apify actor IDs
const ACTORS = {
  likers:   'instaprism/instagram-likers-scraper',   // who liked specific posts
  profiles: 'apify/instagram-profile-scraper',        // enrich handles → follower count, bio, verified
  comments: 'apify/instagram-comment-scraper',        // comments from post URLs
};

async function triggerActor(actorId, input, webhookData, apiKey, appUrl) {
  const webhookUrl = `${appUrl}/api/apify/webhook`;
  const res = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input,
        webhooks: [{
          eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
          requestUrl: webhookUrl,
          payloadTemplate: JSON.stringify({
            eventType: '{{eventType}}',
            resource:  '{{resource}}',
            webhookData,
          }),
        }],
      }),
    }
  );
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error?.message || `Actor ${actorId} failed to start`);
  return data.data?.id;
}

export async function POST(req) {
  try {
    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'APIFY_API_KEY not set in Vercel env vars' }, { status: 500 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.audian.app';

    // ── Get connected Instagram account automatically ─────────────────────────
    const { data: conns } = await supabase
      .from('platform_connections')
      .select('channel_name, channel_id')
      .eq('platform', 'instagram')
      .order('connected_at', { ascending: false })
      .limit(1);

    const conn = conns?.[0];
    if (!conn) return NextResponse.json({ error: 'No Instagram account connected' }, { status: 400 });

    const handle = conn.channel_name; // e.g. "freethink"
    const runs = [];
    const errors = [];

    // ── 1. Post likers — who liked your recent posts ──────────────────────────
    // Get recent post permalinks from stored metrics
    const { data: metrics } = await supabase
      .from('platform_metrics')
      .select('videos')
      .eq('platform', 'instagram')
      .order('snapshot_at', { ascending: false })
      .limit(1);

    const posts    = metrics?.[0]?.videos || [];
    const postUrls = posts.map(p => p.permalink).filter(Boolean).slice(0, 5);

    if (postUrls.length > 0) {
      try {
        const runId = await triggerActor(
          ACTORS.likers,
          { postUrls, maxLikersPerPost: 300 },
          { type: 'likers', handle, source: 'apify' },
          apiKey, appUrl
        );
        runs.push({ type: 'likers', runId, posts: postUrls.length });
      } catch (e) { errors.push(`likers: ${e.message}`); }
    } else {
      errors.push('likers: no post URLs found in metrics — run IG sync first');
    }

    // ── 2. Enrich existing commenters with full profile data ──────────────────
    // Pull unique handles from platform_comments (instagram) that lack follower counts
    const { data: comments } = await supabase
      .from('platform_comments')
      .select('author_name')
      .eq('platform', 'instagram')
      .order('published_at', { ascending: false })
      .limit(200);

    const uniqueHandles = [...new Set((comments || []).map(c => c.author_name).filter(Boolean))];

    if (uniqueHandles.length > 0) {
      try {
        const runId = await triggerActor(
          ACTORS.profiles,
          { usernames: uniqueHandles.slice(0, 100) },
          { type: 'profiles', handle, source: 'apify' },
          apiKey, appUrl
        );
        runs.push({ type: 'profiles', runId, accounts: uniqueHandles.length });
      } catch (e) { errors.push(`profiles: ${e.message}`); }
    }

    // ── 3. Deep comment scrape from recent posts (gets profile pics + likes) ──
    if (postUrls.length > 0) {
      try {
        const runId = await triggerActor(
          ACTORS.comments,
          { directUrls: postUrls, resultsLimit: 100 },
          { type: 'comments', handle, source: 'apify' },
          apiKey, appUrl
        );
        runs.push({ type: 'comments', runId });
      } catch (e) { errors.push(`comments: ${e.message}`); }
    }

    const msg = runs.length > 0
      ? `✓ ${runs.length} scraper${runs.length > 1 ? 's' : ''} running for @${handle} — results arrive in ~2–3 min`
      : `No scrapers started`;

    return NextResponse.json({
      success: runs.length > 0,
      handle,
      runs,
      errors: errors.length > 0 ? errors : undefined,
      message: msg,
    });

  } catch (err) {
    console.error('Apify trigger error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
