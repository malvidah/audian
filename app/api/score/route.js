import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

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

function computeScore({ followers = 0, commentCount = 1, contentLength = 0, niche = 0, ytSubs = 0 }) {
  const subPts =
    (ytSubs || followers) >= 1_000_000 ? 60 :
    (ytSubs || followers) >= 500_000   ? 52 :
    (ytSubs || followers) >= 100_000   ? 42 :
    (ytSubs || followers) >= 50_000    ? 34 :
    (ytSubs || followers) >= 10_000    ? 26 :
    (ytSubs || followers) >= 1_000     ? 16 :
    (ytSubs || followers) >= 100       ? 8  : 0;

  const repeatPts  = Math.min(12, (commentCount - 1) * 4);
  const depthPts   = Math.min(8, Math.floor(contentLength / 30));
  const nichePts   = Math.min(15, niche * 4);

  return Math.min(100, subPts + repeatPts + depthPts + nichePts);
}

function assignZone(score, onWatchlist, followers = 0) {
  if (onWatchlist)        return 'CORE';
  if (followers >= 10000) return 'INFLUENTIAL';
  if (score >= 50)        return 'INFLUENTIAL';
  return 'RADAR';
}

async function getYouTubeToken() {
  const { data: rows } = await supabase
    .from('platform_connections').select('access_token,refresh_token,expires_at')
    .eq('platform','youtube').order('connected_at',{ascending:false}).limit(1);
  const conn = rows?.[0];
  if (!conn) return null;
  if (new Date(conn.expires_at) > new Date(Date.now() + 60_000)) return conn.access_token;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body: new URLSearchParams({ refresh_token: conn.refresh_token, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, grant_type:'refresh_token' }),
  });
  const rd = await r.json();
  if (!rd.access_token) return conn.access_token;
  await supabase.from('platform_connections').update({ access_token: rd.access_token, expires_at: new Date(Date.now() + rd.expires_in * 1000).toISOString() }).eq('platform','youtube');
  return rd.access_token;
}

export async function POST() {
  console.log('[score] POST called at', new Date().toISOString());
  try {
    const results = { youtube: 0, instagram: 0, errors: [] };

    // Load watchlist
    const { data: wlRows } = await supabase.from('watchlist').select('platform,handle');
    const watchlistSets = {};
    for (const row of (wlRows || [])) {
      const plat = row.platform.toLowerCase();
      if (!watchlistSets[plat]) watchlistSets[plat] = new Set();
      watchlistSets[plat].add(row.handle.toLowerCase().replace(/^@/, ''));
    }
    const isWatched = (platform, handle) =>
      watchlistSets[platform]?.has((handle || '').toLowerCase().replace(/^@/, '')) || false;

    // Load any existing enriched follower data from platform_interactions
    const { data: existingInteractions } = await supabase
      .from('platform_interactions').select('platform,handle,followers,bio,verified,avatar_url');
    const enriched = {};
    for (const row of (existingInteractions || [])) {
      enriched[`${row.platform}:${row.handle}`] = row;
    }

    // ── YOUTUBE ───────────────────────────────────────────────────────────────
    const { data: ytComments } = await supabase
      .from('platform_comments').select('*').eq('platform','youtube')
      .order('published_at',{ascending:false}).limit(500);

    if (ytComments?.length > 0) {
      const byAuthor = {};
      for (const c of ytComments) {
        if (!c.author_name) continue;
        if (!byAuthor[c.author_name]) byAuthor[c.author_name] = [];
        byAuthor[c.author_name].push(c);
      }
      const channelIdMap = {};
      for (const c of ytComments) {
        if (c.author_name && c.author_channel_url) {
          const m = c.author_channel_url.match(/channel\/(UC[\w-]+)/);
          if (m) channelIdMap[c.author_name] = m[1];
        }
      }
      const subCounts = {};
      const channelIds = [...new Set(Object.values(channelIdMap))];
      if (channelIds.length > 0) {
        const token = await getYouTubeToken();
        if (token) {
          for (let i = 0; i < channelIds.length; i += 50) {
            const batch = channelIds.slice(i,i+50).join(',');
            const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${batch}&maxResults=50`, { headers:{Authorization:`Bearer ${token}`} });
            const data = await res.json();
            for (const ch of (data.items||[])) {
              const author = Object.keys(channelIdMap).find(n => channelIdMap[n] === ch.id);
              if (author) subCounts[author] = parseInt(ch.statistics?.subscriberCount || 0);
            }
          }
        }
      }

      for (const [author, comments] of Object.entries(byAuthor)) {
        const watched   = isWatched('youtube', author);
        const subs      = subCounts[author] || 0;
        const bestByLike = comments.reduce((a,b) => (b.likes||0) > (a.likes||0) ? b : a);
        const allText   = comments.map(c=>c.content||'').join(' ');
        const niche     = nicheScore(allText, author);
        const score     = computeScore({ ytSubs: subs, commentCount: comments.length, contentLength: bestByLike.content?.length||0, niche });
        const zone      = assignZone(score, watched, subs);

        const { error } = await supabase.from('platform_interactions').upsert({
          platform:'youtube', handle:author, name:author,
          followers: subs || null,
          interaction_type:'comment',
          content: bestByLike.content?.slice(0,500) || null,
          influence_score: watched ? Math.max(score,75) : score,
          zone,
          profile_url: channelIdMap[author] ? `https://youtube.com/channel/${channelIdMap[author]}` : bestByLike.author_channel_url || null,
          comment_count: comments.length,
          on_watchlist: watched,
          interacted_at: comments[0].published_at,
          synced_at: new Date().toISOString(),
        }, { onConflict: 'platform,handle' });
        if (error) results.errors.push(`YT ${author}: ${error.message}`);
        else results.youtube++;
      }
    }

    // ── INSTAGRAM ─────────────────────────────────────────────────────────────
    const { data: igComments } = await supabase
      .from('platform_comments').select('*').eq('platform','instagram')
      .order('published_at',{ascending:false}).limit(500);

    console.log('[score] IG comments:', igComments?.length || 0);
    if (igComments?.length > 0) {
      const byAuthor = {};
      for (const c of igComments) {
        if (!c.author_name) continue;
        if (!byAuthor[c.author_name]) byAuthor[c.author_name] = [];
        byAuthor[c.author_name].push(c);
      }

      for (const [handle, comments] of Object.entries(byAuthor)) {
        const watched    = isWatched('instagram', handle);
        // Pull any previously-enriched follower data from Apify
        const prev       = enriched[`instagram:${handle}`];
        const followers  = prev?.followers || 0;
        const bestByLen  = comments.reduce((a,b) => (b.content?.length||0) > (a.content?.length||0) ? b : a);
        const allText    = comments.map(c=>c.content||'').join(' ');
        const niche      = nicheScore(allText, handle);
        const score      = computeScore({ followers, commentCount: comments.length, contentLength: bestByLen.content?.length||0, niche });
        const zone       = assignZone(score, watched, followers);

        console.log('[score] upserting IG:', handle, 'score:', watched ? Math.max(computeScore({ followers, commentCount: comments.length, contentLength: bestByLen.content?.length||0, niche }),75) : computeScore({ followers, commentCount: comments.length, contentLength: bestByLen.content?.length||0, niche }));
        const { error } = await supabase.from('platform_interactions').upsert({
          platform:'instagram', handle,
          name: prev?.name || handle,
          followers: followers || null,
          bio: prev?.bio || null,
          avatar_url: prev?.avatar_url || null,
          verified: prev?.verified || false,
          interaction_type: 'comment',
          content: bestByLen.content?.slice(0,500) || null,
          influence_score: watched ? Math.max(score,75) : score,
          zone,
          profile_url: `https://instagram.com/${handle.replace(/^@/,'')}`,
          comment_count: comments.length,
          on_watchlist: watched,
          interacted_at: comments[0].published_at,
          synced_at: new Date().toISOString(),
        }, { onConflict: 'platform,handle' });
        if (error) results.errors.push(`IG ${handle}: ${error.message}`);
        else results.instagram++;
      }
    }

    console.log('[score] done — YT:', results.youtube, 'IG:', results.instagram, 'errors:', results.errors);
    const total = results.youtube + results.instagram;
    return NextResponse.json({
      success: true,
      scored: { ...results, total },
      message: `Scored ${total} interactions (${results.youtube} YT · ${results.instagram} IG)${results.errors.length ? ` · ${results.errors.length} errors` : ''}`,
      errors: results.errors.length ? results.errors : undefined,
    });

  } catch (err) {
    console.error('Score error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
