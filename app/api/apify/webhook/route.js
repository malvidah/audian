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
  'curious','fascinating','learning','education','podcast','author',
  'book','writer','journalist','professor','phd','dr ','scientist',
  'academic','researcher','educator','ted','kurzgesagt','veritasium','vsauce',
];

function nicheScore(bio='', handle='', name='') {
  const lower = [bio,handle,name].join(' ').toLowerCase();
  return NICHE_KEYWORDS.filter(k => lower.includes(k)).length;
}

function computeScore({ followers=0, commentCount=1, contentLength=0, niche=0 }) {
  const subPts =
    followers >= 1_000_000 ? 60 : followers >= 500_000 ? 52 :
    followers >= 100_000   ? 42 : followers >= 50_000  ? 34 :
    followers >= 10_000    ? 26 : followers >= 1_000   ? 16 :
    followers >= 100       ? 8  : 0;
  return Math.min(100, subPts + Math.min(12,(commentCount-1)*4) + Math.min(8,Math.floor(contentLength/30)) + Math.min(15,niche*4));
}

function assignZone(score, onWatchlist, followers=0) {
  if (onWatchlist)        return 'CORE';
  if (followers >= 10000) return 'INFLUENTIAL';
  if (score >= 50)        return 'INFLUENTIAL';
  return 'RADAR';
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { eventType, resource, webhookData } = body;

    if (eventType === 'ACTOR.RUN.FAILED') {
      console.error('Apify run failed:', resource?.id, webhookData);
      return NextResponse.json({ ok: false, message: 'Run failed' });
    }
    if (eventType !== 'ACTOR.RUN.SUCCEEDED') {
      return NextResponse.json({ ok: true, skipped: eventType });
    }

    const { type, platform = 'instagram' } = webhookData || {};
    const datasetId = resource?.defaultDatasetId;
    if (!datasetId) return NextResponse.json({ error: 'No dataset ID' }, { status: 400 });

    const apiKey = process.env.APIFY_API_KEY;
    const res = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiKey}&limit=500&clean=true`);
    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: true, processed: 0, message: 'Empty dataset' });
    }

    // Load watchlist
    const { data: wlRows } = await supabase.from('watchlist').select('handle').eq('platform', platform);
    const watchSet = new Set((wlRows||[]).map(r => r.handle.toLowerCase().replace(/^@/,'')));
    const isWatched = h => watchSet.has((h||'').toLowerCase().replace(/^@/,''));

    // Load existing comment counts to preserve them
    const { data: existingInteractions } = await supabase
      .from('platform_interactions').select('handle,comment_count,content,interacted_at')
      .eq('platform', platform);
    const existing = {};
    for (const row of (existingInteractions||[])) existing[row.handle] = row;

    let processed = 0;
    const now = new Date().toISOString();

    // ── Profile enrichment (instagram-profile-scraper output) ─────────────────
    if (type === 'profile_enrich') {
      for (const item of items) {
        // Profile scraper output schema
        const username  = item.username || item.inputUrl?.split('/').filter(Boolean).pop();
        const followers = parseInt(item.followersCount || item.followers || 0);
        const fullName  = item.fullName || item.name || '';
        const bio       = item.biography || item.bio || '';
        const avatar    = item.profilePicUrl || item.profilePicUrlHD || null;
        const verified  = item.verified || item.isVerified || false;
        if (!username) continue;

        const watched   = isWatched(username);
        const niche     = nicheScore(bio, username, fullName);
        const prev      = existing[username];
        const commentCount = prev?.comment_count || 1;
        const score     = computeScore({ followers, commentCount, niche });
        const zone      = assignZone(score, watched, followers);

        await supabase.from('platform_interactions').upsert({
          platform, handle: username,
          name: fullName || username,
          followers: followers || null,
          bio: bio?.slice(0,300) || null,
          avatar_url: avatar,
          verified,
          interaction_type: prev ? 'comment' : 'profile',
          content: prev?.content || null,
          influence_score: watched ? Math.max(score,75) : score,
          zone,
          profile_url: `https://instagram.com/${username}`,
          comment_count: commentCount,
          on_watchlist: watched,
          interacted_at: prev?.interacted_at || now,
          synced_at: now,
        }, { onConflict: 'platform,handle' });
        processed++;
      }
    }

    // ── Post comment scraping (instagram-comment-scraper output) ──────────────
    if (type === 'post_comments') {
      // Group by commenter username
      const byAuthor = {};
      for (const item of items) {
        const username = item.ownerUsername || item.username;
        if (!username) continue;
        if (!byAuthor[username]) byAuthor[username] = [];
        byAuthor[username].push(item);
      }

      for (const [username, comments] of Object.entries(byAuthor)) {
        const watched      = isWatched(username);
        const prev         = existing[username];
        const bestByLen    = comments.reduce((a,b) => (b.text?.length||0) > (a.text?.length||0) ? b : a);
        const allText      = comments.map(c=>c.text||'').join(' ');
        const niche        = nicheScore(allText, username);
        const commentCount = (prev?.comment_count || 0) + comments.length;
        // Use enriched follower data if we have it
        const followers    = prev?.followers || 0;
        const score        = computeScore({ followers, commentCount, contentLength: bestByLen.text?.length||0, niche });
        const zone         = assignZone(score, watched, followers);

        // First write comments to platform_comments
        for (const c of comments) {
          await supabase.from('platform_comments').upsert({
            platform,
            video_id: c.postId || c.id,
            video_title: c.postUrl || '',
            author_name: username,
            content: c.text?.slice(0,500) || '',
            published_at: c.timestamp || now,
            synced_at: now,
          }, { onConflict: 'platform,author_name,content' });
        }

        await supabase.from('platform_interactions').upsert({
          platform, handle: username,
          name: prev?.name || username,
          followers: prev?.followers || null,
          bio: prev?.bio || null,
          avatar_url: prev?.avatar_url || null,
          verified: prev?.verified || false,
          interaction_type: 'comment',
          content: bestByLen.text?.slice(0,500) || null,
          influence_score: watched ? Math.max(score,75) : score,
          zone,
          profile_url: `https://instagram.com/${username}`,
          comment_count: commentCount,
          on_watchlist: watched,
          interacted_at: comments[0].timestamp || now,
          synced_at: now,
        }, { onConflict: 'platform,handle' });
        processed++;
      }
    }

    // After webhook data is processed, trigger a re-score to update zones with enriched data
    if (processed > 0 && type === 'profile_enrich') {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.audian.app'}/api/score`, { method: 'POST' })
        .catch(e => console.error('Auto-rescore failed:', e));
    }

    return NextResponse.json({ ok: true, type, processed });

  } catch (err) {
    console.error('Apify webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
