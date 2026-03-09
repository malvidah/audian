import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const runId    = searchParams.get('runId');
  const type     = searchParams.get('type');
  const platform = searchParams.get('platform') || (type?.startsWith('x_') ? 'x' : 'instagram');

  if (!runId || !type) {
    return NextResponse.json({
      error: 'Missing runId or type',
      usage: '/api/apify/import?runId=RUN_ID&type=ig_comments|ig_followers|x_mentions',
    }, { status: 400 });
  }

  const apiKey = process.env.APIFY_API_KEY;
  const runRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`);
  const runData = await runRes.json();
  const datasetId = runData.data?.defaultDatasetId;
  if (!datasetId) return NextResponse.json({ error: 'No dataset found', runData }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://audian.app';
  const webhookRes = await fetch(`${appUrl}/api/apify/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType:   'ACTOR.RUN.SUCCEEDED',
      resource:    { defaultDatasetId: datasetId },
      webhookData: { type, platform },
    }),
  });
  const result = await webhookRes.json();
  return NextResponse.json({ runId, datasetId, type, platform, ...result });
}
