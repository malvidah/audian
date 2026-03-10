import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Instagram sync via Meta Graph API.
// Fetches everything Instagram allows without third-party scrapers:
//   - Follower count + media count
//   - Recent posts: likes, comments, reach, impressions, saves (via insights)
//   - Account-level impressions & reach (last 30 days)
//   - Stories (last 24h) if accessible
// Interaction data (who liked/commented) is handled via screenshot import.

export async function POST() {
  try {
    const { data: conns } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('platform', 'instagram')
      .order('connected_at', { ascending: false })
      .limit(1);

    const conn = conns?.[0];
    if (!conn) return NextResponse.json({ error: 'Instagram not connected' }, { status: 400 });

    const token = conn.access_token;
    const igId  = conn.channel_id;

    // ── Fetch profile + recent media in parallel ──────────────────────────
    const [profileRes, mediaRes, accountInsightsRes] = await Promise.all([
      fetch(`https://graph.facebook.com/v19.0/${igId}?fields=followers_count,media_count,biography,website,name,username,profile_picture_url&access_token=${token}`),
      fetch(`https://graph.facebook.com/v19.0/${igId}/media?fields=id,caption,media_type,timestamp,like_count,comments_count,permalink,thumbnail_url,media_url&limit=25&access_token=${token}`),
      fetch(`https://graph.facebook.com/v19.0/${igId}/insights?metric=impressions,reach,profile_views&period=days_28&access_token=${token}`),
    ]);

    const [profile, mediaData, accountInsights] = await Promise.all([
      profileRes.json(), mediaRes.json(), accountInsightsRes.json()
    ]);

    const posts = mediaData.data || [];

    // ── Per-post insights (reach, impressions, saves) ─────────────────────
    // Fetch in parallel for all posts
    const postInsights = await Promise.allSettled(
      posts.map(p =>
        fetch(`https://graph.facebook.com/v19.0/${p.id}/insights?metric=reach,impressions,saved,video_views&access_token=${token}`)
          .then(r => r.json())
          .then(d => ({ id: p.id, insights: d.data || [] }))
          .catch(() => ({ id: p.id, insights: [] }))
      )
    );
    const insightMap = {};
    for (const r of postInsights) {
      if (r.status === 'fulfilled') {
        const { id, insights } = r.value;
        insightMap[id] = {};
        for (const m of insights) insightMap[id][m.name] = m.values?.[0]?.value ?? m.value ?? 0;
      }
    }

    // ── Account-level insight totals ──────────────────────────────────────
    const insightTotals = {};
    for (const m of (accountInsights.data || [])) {
      insightTotals[m.name] = m.values?.reduce((s, v) => s + (v.value || 0), 0) ?? 0;
    }

    // ── Aggregate post stats ──────────────────────────────────────────────
    const totalLikes    = posts.reduce((s, p) => s + (p.like_count     || 0), 0);
    const totalComments = posts.reduce((s, p) => s + (p.comments_count || 0), 0);
    const totalSaves    = Object.values(insightMap).reduce((s, m) => s + (m.saved || 0), 0);
    const totalReach    = insightTotals.reach || 0;
    const totalImpressions = insightTotals.impressions || 0;

    // ── Update connection record ───────────────────────────────────────────
    if (profile.followers_count) {
      await supabase.from('platform_connections')
        .update({
          subscriber_count: profile.followers_count,
          channel_name:     profile.name || profile.username,
          updated_at:       new Date().toISOString(),
        })
        .eq('platform', 'instagram');
    }

    // ── Save metrics snapshot ─────────────────────────────────────────────
    await supabase.from('platform_metrics').insert({
      platform:       'instagram',
      snapshot_at:    new Date().toISOString(),
      followers:      profile.followers_count || 0,
      likes:          totalLikes,
      comments_count: totalComments,
      saves:          totalSaves,
      reach:          totalReach,
      impressions:    totalImpressions,
      video_count:    posts.length,
      videos: posts.map(p => ({
        id:          p.id,
        caption:     p.caption?.slice(0, 150),
        type:        p.media_type,
        likes:       p.like_count     || 0,
        comments:    p.comments_count || 0,
        reach:       insightMap[p.id]?.reach        || 0,
        impressions: insightMap[p.id]?.impressions  || 0,
        saves:       insightMap[p.id]?.saved        || 0,
        views:       insightMap[p.id]?.video_views  || 0,
        permalink:   p.permalink,
        thumbnail:   p.thumbnail_url || p.media_url,
        timestamp:   p.timestamp,
      })),
      raw: {
        profile_views: insightTotals.profile_views || 0,
        media_count:   profile.media_count || 0,
        biography:     profile.biography || null,
        website:       profile.website || null,
      },
    });

    // ── Clean up stale null-author comment junk ───────────────────────────
    await supabase.from('platform_comments')
      .delete().eq('platform', 'instagram').is('author_name', null);

    return NextResponse.json({
      success:     true,
      followers:   profile.followers_count || 0,
      posts:       posts.length,
      likes:       totalLikes,
      comments:    totalComments,
      saves:       totalSaves,
      reach:       totalReach,
      impressions: totalImpressions,
      message:     `Synced ${posts.length} posts · ${(profile.followers_count || 0).toLocaleString()} followers`,
    });

  } catch (err) {
    console.error('Instagram sync error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
