import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

// ── Verified Apify actor IDs ──────────────────────────────────────────────────
const ACTORS = {
  ig_comments:   'apify/instagram-comment-scraper',
  ig_followers:  'logical_scrapers/instagram-followers-scraper',
  ig_posts:      'apify/instagram-scraper',       // for tagged mentions
  x_mentions:    'apidojo/tweet-scraper',          // search @handle "Big Think"
};

async function triggerActor(actorId, input, webhookData, apiKey, appUrl) {
  const webhookUrl = `${appUrl}/api/apify/webhook`;
  const body = {
    ...input,
    webhooks: [{
      eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
      requestUrl: webhookUrl,
      payloadTemplate: JSON.stringify({
        eventType: '{{eventType}}',
        resource: '{{resource}}',
        webhookData,
      }),
    }],
  };

  const res = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs?token=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  const data = await res.json();
  if (!res.ok || !data.data?.id) {
    console.error(`Actor ${actorId} failed:`, JSON.stringify(data));
    return null;
  }
  return { actorId, runId: data.data.id };
}

export async function POST(req) {
  try {
    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'APIFY_API_KEY not set' }, { status: 500 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.audian.app';
    const body = await req.json().catch(() => ({}));

    // ── Auto-detect connected platforms ──────────────────────────────────────
    const { data: connections } = await supabase
      .from('platform_connections')
      .select('platform, channel_name, channel_id');

    const ig   = connections?.find(c => c.platform === 'instagram');
    const runs = [];
    const errors = [];

    // ── INSTAGRAM ─────────────────────────────────────────────────────────────
    if (ig) {
      const handle = ig.channel_name; // e.g. "freethink"

      // 1. New followers — who recently followed the account
      if (!body.skip?.includes('ig_followers')) {
        const run = await triggerActor(
          ACTORS.ig_followers,
          { usernames: [handle], resultsLimit: 300 },
          { type: 'ig_followers', platform: 'instagram', handle },
          apiKey, appUrl
        );
        if (run) runs.push(run); else errors.push('ig_followers');
      }

      // 2. Comments on recent posts — fetch post URLs first
      if (!body.skip?.includes('ig_comments')) {
        const { data: metrics } = await supabase
          .from('platform_metrics')
          .select('videos')
          .eq('platform', 'instagram')
          .order('snapshot_at', { ascending: false })
          .limit(1);

        const posts = metrics?.[0]?.videos || [];
        const postUrls = posts
          .map(p => p.permalink || p.url)
          .filter(Boolean)
          .slice(0, 10); // last 10 posts

        if (postUrls.length > 0) {
          const run = await triggerActor(
            ACTORS.ig_comments,
            { directUrls: postUrls, resultsPerPage: 100 },
            { type: 'ig_comments', platform: 'instagram', handle },
            apiKey, appUrl
          );
          if (run) runs.push(run); else errors.push('ig_comments');
        } else {
          errors.push('ig_comments (no post URLs in metrics — run Sync first)');
        }
      }

      // 3. Tagged mentions — posts where others tagged @handle
      if (!body.skip?.includes('ig_mentions')) {
        const run = await triggerActor(
          ACTORS.ig_posts,
          {
            directUrls: [`https://www.instagram.com/${handle}/`],
            resultsType: 'details',
            resultsLimit: 1,
          },
          { type: 'ig_mentions', platform: 'instagram', handle },
          apiKey, appUrl
        );
        if (run) runs.push(run); else errors.push('ig_mentions');
      }
    }

    // ── X / TWITTER ──────────────────────────────────────────────────────────
    // Search for @bigthink mentions and "Big Think" quotes on X
    if (!body.skip?.includes('x_mentions')) {
      const xHandle = 'bigthink'; // hardcoded for now — TODO: pull from x platform_connections
      const run = await triggerActor(
        ACTORS.x_mentions,
        {
          searchTerms: [`@${xHandle}`, `"Big Think"`],
          maxItems: 100,
          sort: 'Latest',
          tweetLanguage: 'en',
        },
        { type: 'x_mentions', platform: 'x', handle: xHandle },
        apiKey, appUrl
      );
      if (run) runs.push(run); else errors.push('x_mentions');
    }

    return NextResponse.json({
      success: true,
      runs,
      errors: errors.length ? errors : undefined,
      message: `Triggered ${runs.length} scrapers${errors.length ? ` (${errors.length} skipped: ${errors.join(', ')})` : ''}`,
    });

  } catch (err) {
    console.error('Apify trigger error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
