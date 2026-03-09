import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

const NICHE_KEYWORDS = [
  'neuroscience','psychology','cognitive','brain','mind','consciousness',
  'science','research','study','data','theory','evolution','philosophy',
  'podcast','author','book','writer','journalist','professor','phd','dr',
  'scientist','academic','researcher','educator','ted','kurzgesagt',
  'veritasium','curious','fascinating','learning','education','insight',
];

function nicheScore(bio = '', handle = '', fullName = '') {
  const lower = [bio, handle, fullName].join(' ').toLowerCase();
  return NICHE_KEYWORDS.filter(k => lower.includes(k)).length;
}

function assignZone(onWatchlist, followers = 0, niche = 0) {
  if (onWatchlist)       return 'CORE';
  if (followers >= 10000) return 'INFLUENTIAL';
  if (followers >= 1000 || niche >= 2) return 'INFLUENTIAL';
  return 'RADAR';
}

function influenceScore(onWatchlist, followers = 0, niche = 0) {
  if (onWatchlist) return Math.max(85, Math.min(100, 85 + niche * 2));
  const followerPts =
    followers >= 1_000_000 ? 60 :
    followers >= 500_000   ? 52 :
    followers >= 100_000   ? 42 :
    followers >= 50_000    ? 34 :
    followers >= 10_000    ? 26 :
    followers >= 1_000     ? 16 :
    followers >= 100       ? 8  : 2;
  return Math.min(100, followerPts + Math.min(15, niche * 4));
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Apify sends: { eventType, eventData, resource, webhookData }
    const { eventType, resource, webhookData } = body;

    // Only process successful runs
    if (eventType !== 'ACTOR.RUN.SUCCEEDED') {
      return NextResponse.json({ ok: true, skipped: eventType });
    }

    const { type, handle: targetHandle } = webhookData || {};
    const runId = resource?.id;

    if (!runId || !type) {
      return NextResponse.json({ error: 'Missing runId or type' }, { status: 400 });
    }

    // Fetch results from Apify dataset
    const apiKey = process.env.APIFY_API_KEY;
    const datasetId = resource?.defaultDatasetId;
    const resultsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiKey}&limit=500`
    );
    const items = await resultsRes.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: true, processed: 0, message: 'No items in dataset' });
    }

    // Load watchlist for this platform
    const { data: wlRows } = await supabase
      .from('watchlist')
      .select('handle')
      .eq('platform', 'instagram');
    const watchSet = new Set((wlRows || []).map(r => r.handle.toLowerCase().replace(/^@/, '')));
    const isWatched = (h) => watchSet.has((h || '').toLowerCase().replace(/^@/, ''));

    let processed = 0;
    const now = new Date().toISOString();

    for (const item of items) {
      // Normalize across different Apify actor output schemas
      const username  = item.username || item.ownerUsername || item.handle;
      const fullName  = item.fullName || item.name || '';
      const followers = parseInt(item.followersCount || item.followers || 0);
      const bio       = item.biography || item.bio || '';
      const avatar    = item.profilePicUrl || item.profilePicture || null;
      const verified  = item.verified || item.isVerified || false;
      const postUrl   = item.url || item.postUrl || null;
      const postCaption = item.caption || item.description || null;

      if (!username) continue;

      const watched = isWatched(username);
      const niche   = nicheScore(bio, username, fullName);
      const zone    = assignZone(watched, followers, niche);
      const score   = influenceScore(watched, followers, niche);

      // Map Apify type to interaction_type
      const interactionType =
        type === 'followers' ? 'follow' :
        type === 'likers'    ? 'like' :
        type === 'mentions'  ? 'mention' : 'comment';

      const content = type === 'likers' && postCaption
        ? `Liked: "${postCaption.slice(0, 100)}"`
        : type === 'followers'
        ? `Followed @${targetHandle}`
        : postCaption?.slice(0, 300) || null;

      await supabase.from('platform_interactions').upsert({
        platform:         'instagram',
        handle:           username,
        name:             fullName || username,
        followers:        followers || null,
        bio:              bio?.slice(0, 300) || null,
        avatar_url:       avatar,
        verified,
        interaction_type: interactionType,
        content,
        influence_score:  score,
        zone,
        profile_url:      `https://instagram.com/${username}`,
        on_watchlist:     watched,
        interacted_at:    now,
        synced_at:        now,
      }, { onConflict: 'platform,handle,content' });

      processed++;
    }

    return NextResponse.json({
      ok: true,
      type,
      processed,
      message: `Processed ${processed} ${type} from @${targetHandle}`,
    });

  } catch (err) {
    console.error('Apify webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
