import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

// Verified Apify actor IDs
const ACTORS = {
  ig_comments:  'apify/instagram-comment-scraper',
  ig_followers: 'logical_scrapers/instagram-followers-scraper',
  x_mentions:   'apidojo/tweet-scraper',
};

async function runActor(actorId, input, webhookData, apiKey, appUrl) {
  const res = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs?token=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input,
        webhooks: [{
          eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
          requestUrl: `${appUrl}/api/apify/webhook`,
          payloadTemplate: JSON.stringify({
            eventType:   '{{eventType}}',
            resource:    '{{resource}}',
            webhookData,
          }),
        }],
      }),
    }
  );
  const data = await res.json();
  if (!res.ok || !data.data?.id) {
    console.error(`[apify] ${actorId} failed:`, JSON.stringify(data).slice(0, 300));
    return { actorId, error: data.error?.message || 'unknown' };
  }
  console.log(`[apify] started ${actorId} run ${data.data.id}`);
  return { actorId, runId: data.data.id };
}

export async function POST(req) {
  try {
    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'APIFY_API_KEY not set' }, { status: 500 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://audian.app';
    const body   = await req.json().catch(() => ({}));
    const skip   = new Set(body.skip || []);

    const runs   = [];
    const errors = [];

    // ── Get connected Instagram account ───────────────────────────────────
    const { data: conns } = await supabase
      .from('platform_connections')
      .select('platform, channel_name')
      .order('connected_at', { ascending: false });

    const ig = conns?.find(c => c.platform === 'instagram');

    if (ig) {
      const handle = ig.channel_name; // e.g. "freethink"

      // Get post permalinks from most recent metrics snapshot
      const { data: metrics } = await supabase
        .from('platform_metrics')
        .select('videos')
        .eq('platform', 'instagram')
        .order('snapshot_at', { ascending: false })
        .limit(1);

      const postUrls = (metrics?.[0]?.videos || [])
        .map(p => p.permalink)
        .filter(Boolean);

      // 1. Comments on all recent posts ─────────────────────────────────
      if (!skip.has('ig_comments') && postUrls.length > 0) {
        const r = await runActor(
          ACTORS.ig_comments,
          {
            directUrls:     postUrls,
            resultsPerPage: 100,
          },
          { type: 'ig_comments', platform: 'instagram', handle },
          apiKey, appUrl
        );
        r.error ? errors.push(`ig_comments: ${r.error}`) : runs.push(r);
      } else if (!skip.has('ig_comments')) {
        errors.push('ig_comments: no post URLs — run Sync Now first');
      }

      // 2. Recent followers (who followed the account) ───────────────────
      if (!skip.has('ig_followers')) {
        const r = await runActor(
          ACTORS.ig_followers,
          {
            usernames:    [handle],
            resultsLimit: 500,
          },
          { type: 'ig_followers', platform: 'instagram', handle },
          apiKey, appUrl
        );
        r.error ? errors.push(`ig_followers: ${r.error}`) : runs.push(r);
      }
    }

    // ── X mentions ────────────────────────────────────────────────────────
    // Search for anyone mentioning @bigthink or "Big Think" on X
    if (!skip.has('x_mentions')) {
      const r = await runActor(
        ACTORS.x_mentions,
        {
          searchTerms: ['@bigthink', '"Big Think"'],
          maxItems:    200,
          sort:        'Latest',
        },
        { type: 'x_mentions', platform: 'x', handle: 'bigthink' },
        apiKey, appUrl
      );
      r.error ? errors.push(`x_mentions: ${r.error}`) : runs.push(r);
    }

    const msg = `Started ${runs.length} scrapers${errors.length ? ` · ${errors.length} issues: ${errors.join('; ')}` : ''} — results arrive via webhook in ~2–5 min`;
    console.log('[apify trigger]', msg);

    return NextResponse.json({ success: true, runs, errors, message: msg });

  } catch (err) {
    console.error('[apify trigger] crash:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
