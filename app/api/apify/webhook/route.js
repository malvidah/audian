import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

// ── Niche alignment scoring ───────────────────────────────────────────────────
const NICHE_KEYWORDS = [
  'neuroscience','psychology','cognitive','brain','mind','consciousness',
  'science','research','study','evidence','theory','evolution','philosophy',
  'podcast','author','book','writer','journalist','professor','phd','dr ',
  'scientist','academic','researcher','educator','ted','kurzgesagt',
  'veritasium','curious','fascinating','learning','education','insight',
];

function nicheScore(bio = '', handle = '', name = '') {
  const lower = [bio, handle, name].join(' ').toLowerCase();
  return NICHE_KEYWORDS.filter(k => lower.includes(k)).length;
}

function computeScore(onWatchlist, followers = 0, niche = 0) {
  if (onWatchlist) return Math.min(100, 85 + niche * 3);
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

function assignZone(onWatchlist, followers = 0, score = 0, verified = false) {
  if (onWatchlist)                          return 'CORE';
  if (followers >= 10000)                   return 'INFLUENTIAL';
  if (verified && followers >= 1000)        return 'INFLUENTIAL';
  if (!followers && score >= 55)            return 'INFLUENTIAL';
  return 'RADAR';
}

// ── Normalize items from different actor output schemas ───────────────────────
function normalizeItem(item, type) {
  // ig_followers: { username, fullName, followersCount, biography, profilePicUrl, verified }
  // ig_comments:  { ownerUsername, ownerFullName, text, timestamp, likesCount, profilePicUrl }
  // x_mentions:   { author.userName, author.name, author.followers, author.description, text, likeCount, retweetCount, replyCount, url }

  if (type === 'ig_followers') {
    return {
      username:    item.username,
      name:        item.fullName || item.username,
      followers:   parseInt(item.followersCount || item.followers_count || 0),
      bio:         item.biography || item.bio || '',
      avatar:      item.profilePicUrl || item.profile_pic_url || null,
      verified:    item.verified || item.is_verified || false,
      content:     null,
      postUrl:     null,
      interactionType: 'follow',
    };
  }

  if (type === 'ig_comments') {
    return {
      username:    item.ownerUsername || item.owner?.username || item.username,
      name:        item.ownerFullName || item.owner?.full_name || item.ownerUsername,
      followers:   null, // ig_comments scraper doesn't return follower counts
      bio:         '',
      avatar:      item.ownerProfilePicUrl || item.profilePicUrl || null,
      verified:    item.ownerVerified || false,
      content:     (item.text || item.comment || '').slice(0, 500),
      postUrl:     item.postUrl || null,
      likes:       parseInt(item.likesCount || item.likes_count || 0),
      interactionType: 'comment',
    };
  }

  if (type === 'ig_mentions') {
    // instagram-scraper returns post data; extract taggedUsers
    const tagged = item.taggedUsers || item.coauthorProducers || [];
    return tagged.map(u => ({
      username:    u.username,
      name:        u.full_name || u.username,
      followers:   parseInt(u.edge_followed_by?.count || 0),
      bio:         u.biography || '',
      avatar:      u.profile_pic_url || null,
      verified:    u.is_verified || false,
      content:     `Tagged in: ${(item.caption || '').slice(0, 200)}`,
      postUrl:     item.url || null,
      interactionType: 'mention',
    }));
  }

  if (type === 'x_mentions') {
    const author = item.author || item.user || {};
    return {
      username:    author.userName || author.screen_name || item.username,
      name:        author.name || author.displayName || author.userName,
      followers:   parseInt(author.followers || author.followersCount || 0),
      bio:         author.description || author.bio || '',
      avatar:      author.profilePicture || author.profile_image_url || null,
      verified:    author.isBlueVerified || author.verified || false,
      content:     (item.text || item.full_text || '').slice(0, 500),
      postUrl:     item.url || item.tweetUrl || null,
      interactionType: item.retweetCount > 0 ? 'retweet' :
                       item.replyCount > 0   ? 'reply'   : 'mention',
    };
  }

  return null;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { eventType, resource, webhookData } = body;

    if (eventType !== 'ACTOR.RUN.SUCCEEDED') {
      console.log('Apify webhook skipped:', eventType);
      return NextResponse.json({ ok: true, skipped: eventType });
    }

    const { type, platform, handle: targetHandle } = webhookData || {};
    const datasetId = resource?.defaultDatasetId;

    if (!datasetId || !type) {
      return NextResponse.json({ error: 'Missing datasetId or type' }, { status: 400 });
    }

    // Fetch results from Apify dataset
    const apiKey = process.env.APIFY_API_KEY;
    const resultsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiKey}&limit=500&clean=true`
    );
    const items = await resultsRes.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: true, processed: 0, message: 'Empty dataset' });
    }

    // Load watchlist for this platform
    const { data: wlRows } = await supabase
      .from('watchlist')
      .select('handle')
      .eq('platform', platform === 'x' ? 'x' : 'instagram');
    const watchSet = new Set((wlRows || []).map(r => r.handle.toLowerCase().replace(/^@/, '')));
    const isWatched = h => watchSet.has((h || '').toLowerCase().replace(/^@/, ''));

    const now = new Date().toISOString();
    let processed = 0;

    for (const item of items) {
      // ig_mentions returns arrays of tagged users — flatten
      const normalized = Array.isArray(normalizeItem(item, type))
        ? normalizeItem(item, type)
        : [normalizeItem(item, type)];

      for (const n of normalized) {
        if (!n || !n.username) continue;

        const watched  = isWatched(n.username);
        const niche    = nicheScore(n.bio, n.username, n.name);
        const score    = computeScore(watched, n.followers, niche);
        const zone     = assignZone(watched, n.followers, score);
        const profUrl  = platform === 'x'
          ? `https://x.com/${n.username}`
          : `https://instagram.com/${n.username}`;

        // Upsert — merge interaction_types array with existing
        const { data: existing } = await supabase
          .from('platform_interactions')
          .select('interaction_type, influence_score')
          .eq('platform', platform)
          .eq('handle', n.username)
          .single();

        // Merge interaction types
        const existingTypes = existing?.interaction_type
          ? existing.interaction_type.split(',')
          : [];
        const allTypes = [...new Set([...existingTypes, n.interactionType])].join(',');

        // Keep higher score between existing and new
        const finalScore = Math.max(score, existing?.influence_score || 0);

        await supabase.from('platform_interactions').upsert({
          platform,
          handle:           n.username,
          name:             n.name || n.username,
          followers:        (n.followers !== undefined && n.followers !== null && n.followers > 0) ? n.followers : null,
          bio:              n.bio?.slice(0, 300) || null,
          avatar_url:       n.avatar,
          verified:         n.verified,
          interaction_type: allTypes,
          content:          n.content,
          influence_score:  watched ? Math.max(finalScore, 75) : finalScore,
          zone,
          profile_url:      profUrl,
          on_watchlist:     watched,
          interacted_at:    now,
          synced_at:        now,
        }, { onConflict: 'platform,handle' });

        // Also save comment to platform_comments for scoring later
        if (n.interactionType === 'comment' && n.content) {
          await supabase.from('platform_comments').upsert({
            platform,
            video_id:    n.postUrl || 'unknown',
            video_title: null,
            author_name: n.username,
            content:     n.content,
            likes:       n.likes || 0,
            published_at: now,
            synced_at:   now,
          }, { onConflict: 'platform,author_name,content', ignoreDuplicates: true }).catch(() => {});
        }

        processed++;
      }
    }

    let enriched = 0;
    if (type === 'ig_followers') {
      enriched = await enrichCommentersWithFollowerData(supabase);
      console.log(`[webhook] enriched ${enriched} commenters with follower data`);
    }

    return NextResponse.json({
      ok: true,
      type,
      platform,
      processed,
      enriched,
      message: `Processed ${processed} ${type} interactions${enriched ? ` · enriched ${enriched} commenters` : ''}`,
    });

  } catch (err) {
    console.error('Apify webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── Enrichment helper ─────────────────────────────────────────────────────────
// After importing ig_followers, back-fills follower counts into commenters.
// Called automatically after ig_followers import completes.
async function enrichCommentersWithFollowerData(supabase) {
  // Get all ig follower rows that have real follower counts
  const { data: followers } = await supabase
    .from('platform_interactions')
    .select('handle, followers, bio, avatar_url, verified')
    .eq('platform', 'instagram')
    .not('followers', 'is', null)
    .gt('followers', 0);

  if (!followers?.length) return 0;

  const followerMap = {};
  for (const f of followers) followerMap[f.handle.toLowerCase()] = f;

  // Get all IG interactions with missing follower counts
  const { data: toEnrich } = await supabase
    .from('platform_interactions')
    .select('handle, followers, zone, influence_score, on_watchlist')
    .eq('platform', 'instagram')
    .or('followers.is.null,followers.eq.0');

  let enriched = 0;
  for (const row of (toEnrich || [])) {
    const match = followerMap[row.handle.toLowerCase()];
    if (!match?.followers) continue;

    const watched = row.on_watchlist;
    const niche = 0; // already scored
    const followerPts =
      match.followers >= 1_000_000 ? 60 :
      match.followers >= 500_000   ? 52 :
      match.followers >= 100_000   ? 42 :
      match.followers >= 50_000    ? 34 :
      match.followers >= 10_000    ? 26 :
      match.followers >= 1_000     ? 16 :
      match.followers >= 100       ? 8  : 2;
    const newScore = Math.min(100, Math.max(row.influence_score || 0, followerPts));
    const newZone = watched ? 'CORE' :
                    match.followers >= 10000 ? 'INFLUENTIAL' :
                    newScore >= 55 ? 'INFLUENTIAL' : 'RADAR';

    await supabase.from('platform_interactions')
      .update({
        followers:       match.followers,
        bio:             match.bio || null,
        avatar_url:      match.avatar_url || null,
        verified:        match.verified || false,
        influence_score: watched ? Math.max(newScore, 75) : newScore,
        zone:            newZone,
      })
      .eq('platform', 'instagram')
      .eq('handle', row.handle);
    enriched++;
  }
  return enriched;
}
