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
  'podcast','author','book','writer','journalist','professor','phd','dr ',
  'scientist','academic','researcher','educator','ted','kurzgesagt',
  'veritasium','curious','fascinating','learning','education','insight',
];

function nicheScore(bio = '', handle = '', fullName = '') {
  const lower = [bio, handle, fullName].join(' ').toLowerCase();
  return NICHE_KEYWORDS.filter(k => lower.includes(k)).length;
}

function assignZone(onWatchlist, followers = 0, niche = 0) {
  if (onWatchlist)            return 'CORE';
  if (followers >= 10_000)    return 'INFLUENTIAL';
  if (followers >= 1_000 || niche >= 2) return 'INFLUENTIAL';
  return 'RADAR';
}

function influenceScore(onWatchlist, followers = 0, niche = 0) {
  if (onWatchlist) return Math.min(100, 85 + niche * 2);
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

async function loadWatchSet() {
  const { data } = await supabase
    .from('watchlist')
    .select('handle')
    .eq('platform', 'instagram');
  return new Set((data || []).map(r => r.handle.toLowerCase().replace(/^@/, '')));
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { eventType, resource, webhookData } = body;

    if (eventType !== 'ACTOR.RUN.SUCCEEDED') {
      console.log('Apify webhook skip:', eventType);
      return NextResponse.json({ ok: true, skipped: eventType });
    }

    const { type, handle: targetHandle } = webhookData || {};
    const datasetId = resource?.defaultDatasetId;
    if (!datasetId) return NextResponse.json({ error: 'No datasetId' }, { status: 400 });

    // Fetch results from Apify dataset
    const apiKey   = process.env.APIFY_API_KEY;
    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiKey}&limit=500&clean=true`
    );
    const items = await itemsRes.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: true, processed: 0, type, message: 'Empty dataset' });
    }

    const watchSet  = await loadWatchSet();
    const isWatched = h => watchSet.has((h || '').toLowerCase().replace(/^@/, ''));
    const now       = new Date().toISOString();
    let processed   = 0;

    // ── LIKERS: who liked your recent posts ───────────────────────────────────
    if (type === 'likers') {
      for (const item of items) {
        // instaprism/instagram-likers-scraper output schema
        const username = item.username || item.userName;
        const fullName = item.fullName  || item.full_name || '';
        const avatar   = item.profilePicUrl || item.profilePicture || null;
        const userId   = item.userId   || item.id || null;

        if (!username) continue;

        const watched = isWatched(username);
        const niche   = nicheScore('', username, fullName);
        const zone    = assignZone(watched, 0, niche); // no follower data from likers
        const score   = influenceScore(watched, 0, niche);

        await supabase.from('platform_interactions').upsert({
          platform:         'instagram',
          handle:           username,
          name:             fullName || username,
          followers:        null, // enriched later by profiles run
          interaction_type: 'like',
          content:          `Liked a @${targetHandle} post`,
          influence_score:  score,
          zone,
          profile_url:      `https://instagram.com/${username}`,
          avatar_url:       avatar,
          on_watchlist:     watched,
          interacted_at:    now,
          synced_at:        now,
        }, { onConflict: 'platform,handle' });

        processed++;
      }
    }

    // ── PROFILES: enrich handles with follower counts + bio ───────────────────
    else if (type === 'profiles') {
      for (const item of items) {
        // apify/instagram-profile-scraper output schema
        const username  = item.username  || item.userName;
        const fullName  = item.fullName  || item.full_name || '';
        const followers = parseInt(item.followersCount || item.followersCount || 0);
        const bio       = item.biography || item.bio || '';
        const avatar    = item.profilePicUrl || item.profilePicture || null;
        const verified  = item.verified  || item.isVerified || false;
        const postsCount = item.postsCount || 0;

        if (!username) continue;

        const watched = isWatched(username);
        const niche   = nicheScore(bio, username, fullName);
        const zone    = assignZone(watched, followers, niche);
        const score   = influenceScore(watched, followers, niche);

        // Upsert interaction record with enriched data
        await supabase.from('platform_interactions').upsert({
          platform:         'instagram',
          handle:           username,
          name:             fullName || username,
          followers,
          bio:              bio.slice(0, 300) || null,
          avatar_url:       avatar,
          verified,
          interaction_type: 'comment', // base type; enriching existing records
          influence_score:  score,
          zone,
          profile_url:      `https://instagram.com/${username}`,
          on_watchlist:     watched,
          synced_at:        now,
        }, { onConflict: 'platform,handle' });

        processed++;
      }
    }

    // ── COMMENTS: richer comment data with profile pics + likes ──────────────
    else if (type === 'comments') {
      for (const item of items) {
        // apify/instagram-comment-scraper output schema
        const username    = item.ownerUsername || item.username;
        const fullName    = item.ownerFullName || '';
        const avatar      = item.ownerProfilePicUrl || item.profilePicUrl || null;
        const commentText = item.text || item.comment || '';
        const commentLikes = parseInt(item.likesCount || item.likes || 0);
        const timestamp   = item.timestamp || item.createdAt || now;

        if (!username) continue;

        const watched = isWatched(username);
        const niche   = nicheScore(commentText, username, fullName);
        const score   = Math.min(100,
          influenceScore(watched, 0, niche) +
          Math.min(20, commentLikes * 2)
        );
        const zone = assignZone(watched, 0, niche);

        await supabase.from('platform_interactions').upsert({
          platform:         'instagram',
          handle:           username,
          name:             fullName || username,
          avatar_url:       avatar,
          interaction_type: 'comment',
          content:          commentText.slice(0, 500),
          influence_score:  score,
          zone,
          profile_url:      `https://instagram.com/${username}`,
          on_watchlist:     watched,
          interacted_at:    timestamp,
          synced_at:        now,
        }, { onConflict: 'platform,handle' });

        processed++;
      }
    }

    console.log(`Apify webhook: processed ${processed} ${type} for @${targetHandle}`);
    return NextResponse.json({ ok: true, type, processed, handle: targetHandle });

  } catch (err) {
    console.error('Apify webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
