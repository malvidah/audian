import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export const dynamic = 'force-dynamic';

// ── Niche keyword alignment ────────────────────────────────────────────────
const NICHE_KEYWORDS = [
  'neuroscience','psychology','cognitive','brain','mind','consciousness',
  'science','research','study','evidence','theory','evolution','philosophy',
  'podcast','author','book','writer','journalist','professor','phd','dr ',
  'scientist','academic','researcher','educator','ted','kurzgesagt',
  'veritasium','curious','fascinating','learning','education','insight',
  'think','curiosity','ideas','knowledge','discovery',
];

function nicheScore(text = '') {
  const lower = text.toLowerCase();
  return NICHE_KEYWORDS.filter(k => lower.includes(k)).length;
}

// ── Scoring: works with OR without follower data ───────────────────────────
// When we have followers: follower count dominates (60 pts max)
// When we don't: engagement signals fill in (comment quality, frequency, likes)
function computeScore({
  onWatchlist,
  followers = null,
  commentCount = 1,
  commentLikes = 0,
  contentLength = 0,
  niche = 0,
  handle = '',
}) {
  if (onWatchlist) return Math.min(100, 80 + niche * 3);

  let score = 0;

  if (followers !== null && followers > 0) {
    // Follower-based scoring (authoritative when available)
    score +=
      followers >= 1_000_000 ? 60 :
      followers >= 500_000   ? 52 :
      followers >= 100_000   ? 42 :
      followers >= 50_000    ? 34 :
      followers >= 10_000    ? 26 :
      followers >= 1_000     ? 16 :
      followers >= 100       ? 8  : 2;
  } else {
    // Engagement-based scoring when no follower data
    // Repeat commenter: 10 pts per extra comment, max 30
    score += Math.min(30, (commentCount - 1) * 10);
    // Comment likes: community votes them as valuable
    score += Math.min(20, commentLikes * 4);
    // Comment depth: thoughtful vs drive-by
    score += Math.min(10,
      contentLength >= 200 ? 10 :
      contentLength >= 100 ? 7  :
      contentLength >= 50  ? 4  : 1
    );
    // Handle signals (e.g. "dr.", "prof", numbers suggest throwaway)
    if (/dr\.|prof|ph\.?d/i.test(handle)) score += 5;
    if (/\d{4,}/.test(handle)) score -= 3; // likely throwaway account
  }

  // Niche bonus always applies
  score += Math.min(15, niche * 4);

  return Math.max(1, Math.min(100, score));
}

function assignZone(onWatchlist, followers = null, score = 0, commentCount = 1, verified = false) {
  if (onWatchlist) return 'CORE';
  // Follower count is the primary signal
  if (followers !== null && followers >= 50000) return 'INFLUENTIAL';
  if (followers !== null && followers >= 10000) return 'INFLUENTIAL';
  // Verified + meaningful audience (1K+) = INFLUENTIAL
  if (verified && followers !== null && followers >= 1000) return 'INFLUENTIAL';
  // Without follower data: use strong engagement signals only
  if (followers === null && (score >= 40 || commentCount >= 3)) return 'INFLUENTIAL';
  return 'RADAR';
}

export async function POST() {
  try {
    const results = { rescored: 0, youtube: 0, errors: [] };

    // ── Load watchlist ────────────────────────────────────────────────────
    const { data: wlRows } = await supabase.from('watchlist').select('platform,handle');
    const watchlistSets = {};
    for (const row of (wlRows || [])) {
      const p = row.platform.toLowerCase();
      if (!watchlistSets[p]) watchlistSets[p] = new Set();
      watchlistSets[p].add(row.handle.toLowerCase().replace(/^@/, ''));
    }
    const isWatched = (platform, handle) =>
      watchlistSets[platform]?.has((handle || '').toLowerCase().replace(/^@/, '')) || false;

    // ── Pull platform_comments to count repeats + likes per user ─────────
    const { data: allComments } = await supabase
      .from('platform_comments')
      .select('platform, author_name, content, likes');

    const commentStats = {}; // key: "platform:handle"
    for (const c of (allComments || [])) {
      if (!c.author_name) continue;
      const key = `${c.platform}:${c.author_name.toLowerCase()}`;
      if (!commentStats[key]) commentStats[key] = { count: 0, totalLikes: 0, longestComment: 0 };
      commentStats[key].count++;
      commentStats[key].totalLikes += c.likes || 0;
      commentStats[key].longestComment = Math.max(commentStats[key].longestComment, (c.content || '').length);
    }

    // ── Re-score all existing platform_interactions ───────────────────────
    const { data: existing } = await supabase
      .from('platform_interactions')
      .select('id,platform,handle,followers,bio,content,comment_count,influence_score,zone,on_watchlist');

    for (const row of (existing || [])) {
      const watched  = isWatched(row.platform, row.handle);
      const key      = `${row.platform}:${row.handle.toLowerCase()}`;
      const stats    = commentStats[key] || {};
      const niche    = nicheScore([row.bio || '', row.handle, row.content || ''].join(' '));
      const score    = computeScore({
        onWatchlist:   watched,
        followers:     row.followers ?? null,
        commentCount:  stats.count || row.comment_count || 1,
        commentLikes:  stats.totalLikes || 0,
        contentLength: stats.longestComment || (row.content || '').length,
        niche,
        handle:        row.handle,
      });
      const zone = assignZone(watched, row.followers ?? null, score, stats.count || row.comment_count || 1);
      const finalScore = watched ? Math.max(score, 80) : score;

      // Update comment_count from live comment table data
      const newCommentCount = stats.count || row.comment_count || 1;

      const { error } = await supabase.from('platform_interactions')
        .update({
          zone,
          influence_score: finalScore,
          on_watchlist: watched,
          comment_count: newCommentCount,
        })
        .eq('platform', row.platform)
        .eq('handle', row.handle);

      if (error) results.errors.push(`${row.platform}:${row.handle}: ${error.message}`);
      else results.rescored++;
    }

    // ── YOUTUBE: score from comments (API gives us attribution) ──────────
    const { data: ytComments } = await supabase
      .from('platform_comments')
      .select('*')
      .eq('platform', 'youtube')
      .order('published_at', { ascending: false })
      .limit(500);

    if (ytComments?.length > 0) {
      const byAuthor = {};
      for (const c of ytComments) {
        if (!c.author_name) continue;
        if (!byAuthor[c.author_name]) byAuthor[c.author_name] = [];
        byAuthor[c.author_name].push(c);
      }
      for (const [author, comments] of Object.entries(byAuthor)) {
        const watched    = isWatched('youtube', author);
        const bestByLike = comments.reduce((a, b) => (b.likes || 0) > (a.likes || 0) ? b : a);
        const allText    = comments.map(c => c.content || '').join(' ');
        const niche      = nicheScore(allText);
        const totalLikes = comments.reduce((s, c) => s + (c.likes || 0), 0);
        const score      = computeScore({
          onWatchlist:   watched,
          followers:     null,
          commentCount:  comments.length,
          commentLikes:  totalLikes,
          contentLength: bestByLike.content?.length || 0,
          niche,
          handle:        author,
        });
        const zone = assignZone(watched, null, score, comments.length);
        const { error } = await supabase.from('platform_interactions').upsert({
          platform:         'youtube',
          handle:           author,
          name:             author,
          interaction_type: 'comment',
          content:          bestByLike.content?.slice(0, 500) || null,
          influence_score:  watched ? Math.max(score, 80) : score,
          zone,
          comment_count:    comments.length,
          on_watchlist:     watched,
          interacted_at:    comments[0].published_at,
          synced_at:        new Date().toISOString(),
        }, { onConflict: 'platform,handle' });
        if (error) results.errors.push(`YT ${author}: ${error.message}`);
        else results.youtube++;
      }
    }

    const total = results.rescored + results.youtube;
    return NextResponse.json({
      success: true,
      scored: { ...results, total },
      message: `Rescored ${results.rescored} · ${results.youtube} YT · ${results.errors.length} errors`,
    });

  } catch (err) {
    console.error('Score error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
