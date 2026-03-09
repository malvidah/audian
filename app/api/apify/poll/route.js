import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

// Polls recent Apify runs and imports SUCCEEDED ones.
// Fallback for when webhooks don't fire.

const ACTOR_TYPES = {
  'apify~instagram-comment-scraper':              'ig_comments',
  'logical_scrapers~instagram-followers-scraper': 'ig_followers',
  'apidojo~tweet-scraper':                        'x_mentions',
  'apify~instagram-scraper':                      'ig_mentions',
};

export async function GET() {
  const apiKey = process.env.APIFY_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'APIFY_API_KEY not set' }, { status: 500 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://audian.app';
  const results = [];

  for (const [encodedId, type] of Object.entries(ACTOR_TYPES)) {
    const actorId = encodedId.replace('~', '/');
    const runsRes = await fetch(
      `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs?token=${apiKey}&limit=3&desc=1`
    ).catch(() => null);
    if (!runsRes?.ok) continue;

    const runsData = await runsRes.json();
    const runs = runsData.data?.items || [];

    for (const run of runs) {
      if (run.status !== 'SUCCEEDED') continue;
      const age = Date.now() - new Date(run.finishedAt || run.startedAt).getTime();
      if (age > 2 * 60 * 60 * 1000) continue; // only last 2 hrs

      const platform = type.startsWith('x_') ? 'x' : 'instagram';
      const webhookRes = await fetch(`${appUrl}/api/apify/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType:   'ACTOR.RUN.SUCCEEDED',
          resource:    { defaultDatasetId: run.defaultDatasetId },
          webhookData: { type, platform },
        }),
      });
      const webhookResult = await webhookRes.json().catch(() => ({}));
      results.push({ actorId, type, runId: run.id, ...webhookResult });
    }
  }

  return NextResponse.json({
    ok: true,
    results,
    message: `Polled ${results.length} completed runs`,
  });
}
