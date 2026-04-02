import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/posts?platform=x&from=2026-01-01&to=2026-03-31&limit=500
//
// Returns real posts from the posts table PLUS stub posts synthesized from
// interactions that reference a post_url with no matching posts.permalink.
// This keeps all three tabs (Content / Interactions / Handles) unified on the
// same underlying data — if you import interactions for a post, that post
// automatically surfaces in the Content tab.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const from     = searchParams.get('from') || '2024-01-01';
    const to       = searchParams.get('to')   || new Date().toISOString();
    const limit    = parseInt(searchParams.get('limit') || '2000');

    // ── 1. Real posts (date-filtered, platform-filtered) ──────────────────────
    let postsQuery = supabaseAdmin
      .from('posts')
      .select('*')
      .gte('published_at', from)
      .lte('published_at', to)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (platform && platform !== 'all') {
      postsQuery = postsQuery.eq('platform', platform);
    }

    // Also fetch ALL existing permalinks (no date filter) so we don't generate
    // duplicate stub entries for real posts that fall outside the date window.
    const [{ data: realPosts, error: postsError }, { data: allPermalinkRows }] =
      await Promise.all([
        postsQuery,
        supabaseAdmin.from('posts').select('permalink').not('permalink', 'is', null),
      ]);

    if (postsError) throw postsError;

    const allPermalinks = new Set(
      (allPermalinkRows || []).map(r => r.permalink).filter(Boolean)
    );

    // ── 2. Stub posts synthesised from interactions.post_url ─────────────────
    const { data: ixRows } = await supabaseAdmin
      .from('interactions')
      .select('platform, post_url, interaction_type, interacted_at')
      .not('post_url', 'is', null)
      .not('post_url', 'eq', '');

    // Group by post_url, skip anything that already has a real posts row
    const stubMap = {};
    for (const ix of (ixRows || [])) {
      if (!ix.post_url || allPermalinks.has(ix.post_url)) continue;
      if (!stubMap[ix.post_url]) {
        stubMap[ix.post_url] = {
          platform: ix.platform,
          post_url: ix.post_url,
          likes: 0,
          comments: 0,
          dates: [],
        };
      }
      const s    = stubMap[ix.post_url];
      const type = (ix.interaction_type || '').split(',')[0].trim().toLowerCase();
      if (type === 'like')    s.likes++;
      if (type === 'comment') s.comments++;
      if (ix.interacted_at)  s.dates.push(new Date(ix.interacted_at).getTime());
    }

    const stubPosts = Object.values(stubMap)
      .map(s => ({
        id:          `stub:${s.post_url}`,
        platform:    s.platform,
        permalink:   s.post_url,
        content:     null,
        published_at: s.dates.length ? new Date(Math.min(...s.dates)).toISOString() : null,
        likes:       s.likes,
        comments:    s.comments,
        impressions: null,
        post_type:   'post',
        source:      'interactions',   // flag so the UI can show a stub indicator
      }))
      .filter(s => {
        if (platform && platform !== 'all' && s.platform !== platform) return false;
        // Apply date window using published_at proxy; if unknown, include it
        if (s.published_at) {
          const d = new Date(s.published_at);
          if (d < new Date(from) || d > new Date(to)) return false;
        }
        return true;
      });

    // ── 3. Merge, sort newest-first, respect limit ────────────────────────────
    const merged = [...(realPosts || []), ...stubPosts];
    merged.sort((a, b) => {
      const da = a.published_at ? new Date(a.published_at).getTime() : 0;
      const db = b.published_at ? new Date(b.published_at).getTime() : 0;
      return db - da;
    });

    return NextResponse.json({ posts: merged.slice(0, limit) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
