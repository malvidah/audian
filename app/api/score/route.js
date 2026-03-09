import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

// ── Niche alignment signals ───────────────────────────────────────────────────
const NICHE_KEYWORDS = [
  'neuroscience','psychology','cognitive','brain','mind','consciousness',
  'science','research','study','data','evidence','theory','evolution',
  'philosophy','ethics','critical thinking','skeptic',
  'curious','fascinating','interesting','learning','education',
  'podcast','author','book','writer','journalist','professor','phd','dr ',
  'scientist','academic','researcher','educator','expert',
  'ted','kurzgesagt','veritasium','vsauce','thoughtful','insight',
];

function nicheScore(text = '', handle = '') {
  const lower = (text + ' ' + handle).toLowerCase();
  return NICHE_KEYWORDS.filter(k => lower.includes(k)).length;
}

// ── Engagement quality score (0–100) ─────────────────────────────────────────
function engagementScore({ commentLikes = 0, replyCount = 0, commentCount = 1, contentLength = 0, niche = 0, ytSubs = 0 }) {
  // Subscriber tier: 0–50
  const subPts =
    ytSubs >= 1_000_000 ? 50 :
    ytSubs >= 500_000   ? 44 :
    ytSubs >= 100_000   ? 36 :
    ytSubs >= 50_000    ? 28 :
    ytSubs >= 10_000    ? 20 :
    ytSubs >= 1_000     ? 12 :
    ytSubs >= 100       ? 6  : 0;

  // Comment likes/replies: 0–25
  const engPts = Math.min(25, commentLikes * 3 + replyCount * 5);

  // Repeat engagement: 0–12
  const repeatPts = Math.min(12, (commentCount - 1) * 4);

  // Comment depth (length as quality proxy): 0–8
  const depthPts = Math.min(8, Math.floor(contentLength / 30));

  // Niche alignment: 0–15
  const nichePts = Math.min(15, niche * 4);

  return Math.min(100, subPts + engPts + repeatPts + depthPts + nichePts);
}

// ── Zone assignment ───────────────────────────────────────────────────────────
// CORE        = on watchlist (curated accounts you explicitly track)
// INFLUENTIAL = high follower count or very high engagement — notable even if unknown
// RADAR       = promising signal but not verified influential yet
function assignZone(score, onWatchlist, ytSubs = 0) {
  if (onWatchlist)       return 'CORE';
  if (ytSubs >= 10_000)  return 'INFLUENTIAL';
  if (score >= 55)       return 'INFLUENTIAL';
  return 'RADAR';
}

// ── Refresh YouTube access token if needed ────────────────────────────────────
async function getYouTubeToken() {
  const { data: rows } = await supabase
    .from('platform_connections')
    .select('access_token, refresh_token, expires_at')
    .eq('platform', 'youtube')
    .order('connected_at', { ascending: false })
    .limit(1);
  const conn = rows?.[0];
  if (!conn) return null;

  if (new Date(conn.expires_at) > new Date(Date.now() + 60_000)) return conn.access_token;

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token:  conn.refresh_token,
      client_id:      process.env.GOOGLE_CLIENT_ID,
      client_secret:  process.env.GOOGLE_CLIENT_SECRET,
      grant_type:     'refresh_token',
    }),
  });
  const rd = await r.json();
  if (!rd.access_token) return conn.access_token; // fall back to existing

  await supabase.from('platform_connections').update({
    access_token: rd.access_token,
    expires_at:   new Date(Date.now() + rd.expires_in * 1000).toISOString(),
  }).eq('platform', 'youtube');

  return rd.access_token;
}

export async function POST() {
  try {
    const results = { youtube: 0, instagram: 0, skipped: 0 };

    // ── Load watchlist into memory ────────────────────────────────────────────
    const { data: wlRows } = await supabase.from('watchlist').select('platform,handle');
    const watchlistSets = {};
    for (const row of (wlRows || [])) {
      const plat = row.platform.toLowerCase();
      if (!watchlistSets[plat]) watchlistSets[plat] = new Set();
      watchlistSets[plat].add(row.handle.toLowerCase().replace(/^@/, ''));
    }
    const isWatched = (platform, handle) =>
      watchlistSets[platform]?.has((handle || '').toLowerCase().replace(/^@/, '')) || false;

    // ── YOUTUBE ───────────────────────────────────────────────────────────────
    const { data: ytComments } = await supabase
      .from('platform_comments')
      .select('*')
      .eq('platform', 'youtube')
      .order('published_at', { ascending: false })
      .limit(200);

    if (ytComments?.length > 0) {
      // Group by author
      const byAuthor = {};
      for (const c of ytComments) {
        if (!c.author_name) continue;
        if (!byAuthor[c.author_name]) byAuthor[c.author_name] = [];
        byAuthor[c.author_name].push(c);
      }

      // Map author → channel ID
      const channelIdMap = {};
      for (const c of ytComments) {
        if (c.author_name && c.author_channel_url) {
          const m = c.author_channel_url.match(/channel\/(UC[\w-]+)/);
          if (m) channelIdMap[c.author_name] = m[1];
        }
      }

      // Batch-fetch subscriber counts for known channel IDs
      const subCounts = {};
      const channelIds = [...new Set(Object.values(channelIdMap))];
      if (channelIds.length > 0) {
        const token = await getYouTubeToken();
        if (token) {
          for (let i = 0; i < channelIds.length; i += 50) {
            const batch = channelIds.slice(i, i + 50).join(',');
            const res  = await fetch(
              `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${batch}&maxResults=50`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            for (const ch of (data.items || [])) {
              // Find which author maps to this channel
              const author = Object.keys(channelIdMap).find(n => channelIdMap[n] === ch.id);
              if (author) subCounts[author] = parseInt(ch.statistics?.subscriberCount || 0);
            }
          }
        }
      }

      // Score and upsert each unique commenter
      for (const [author, comments] of Object.entries(byAuthor)) {
        const watched    = isWatched('youtube', author);
        const subs       = subCounts[author] || 0;
        const bestByLike = comments.reduce((a, b) => (b.likes || 0) > (a.likes || 0) ? b : a);
        const allText    = comments.map(c => c.content || '').join(' ');
        const niche      = nicheScore(allText, author);

        const score = engagementScore({
          commentLikes:  bestByLike.likes || 0,
          replyCount:    bestByLike.reply_count || 0,
          commentCount:  comments.length,
          contentLength: bestByLike.content?.length || 0,
          niche,
          ytSubs:        subs,
        });

        const zone = assignZone(score, watched, subs);

        // Skip very low signal non-watched accounts
        if (score < 5 && !watched) { results.skipped++; continue; }

        await supabase.from('platform_interactions').upsert({
          platform:         'youtube',
          handle:           author,
          name:             author,
          followers:        subs || null,
          interaction_type: 'comment',
          content:          bestByLike.content?.slice(0, 500) || null,
          influence_score:  watched ? Math.max(score, 75) : score,
          zone,
          profile_url:      channelIdMap[author]
                              ? `https://youtube.com/channel/${channelIdMap[author]}`
                              : bestByLike.author_channel_url || null,
          comment_count:    comments.length,
          on_watchlist:     watched,
          interacted_at:    comments[0].published_at,
          synced_at:        new Date().toISOString(),
        }, { onConflict: 'platform,handle,content' });

        results.youtube++;
      }
    }

    // ── INSTAGRAM ─────────────────────────────────────────────────────────────
    const { data: igComments } = await supabase
      .from('platform_comments')
      .select('*')
      .eq('platform', 'instagram')
      .order('published_at', { ascending: false })
      .limit(200);

    if (igComments?.length > 0) {
      const byAuthor = {};
      for (const c of igComments) {
        if (!c.author_name) continue;
        if (!byAuthor[c.author_name]) byAuthor[c.author_name] = [];
        byAuthor[c.author_name].push(c);
      }

      for (const [handle, comments] of Object.entries(byAuthor)) {
        const watched    = isWatched('instagram', handle);
        const bestByLen  = comments.reduce((a, b) =>
          (b.content?.length || 0) > (a.content?.length || 0) ? b : a);
        const allText    = comments.map(c => c.content || '').join(' ');
        const niche      = nicheScore(allText, handle);

        const score = engagementScore({
          commentCount:  comments.length,
          contentLength: bestByLen.content?.length || 0,
          niche,
        });

        const zone = assignZone(score, watched, 0);

        if (score < 5 && !watched) { results.skipped++; continue; }

        await supabase.from('platform_interactions').upsert({
          platform:         'instagram',
          handle,
          name:             handle,
          followers:        null,
          interaction_type: 'comment',
          content:          bestByLen.content?.slice(0, 500) || null,
          influence_score:  watched ? Math.max(score, 75) : score,
          zone,
          profile_url:      `https://instagram.com/${handle.replace(/^@/, '')}`,
          comment_count:    comments.length,
          on_watchlist:     watched,
          interacted_at:    comments[0].published_at,
          synced_at:        new Date().toISOString(),
        }, { onConflict: 'platform,handle,content' });

        results.instagram++;
      }
    }

    const total = results.youtube + results.instagram;
    return NextResponse.json({
      success: true,
      scored: results,
      message: `Scored ${total} interactions (${results.youtube} YT · ${results.instagram} IG · ${results.skipped} skipped)`,
    });

  } catch (err) {
    console.error('Score error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
