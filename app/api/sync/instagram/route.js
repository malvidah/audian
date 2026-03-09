import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const { data: conn, error } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('platform', 'instagram')
      .single();

    if (error || !conn) {
      return NextResponse.json({ error: 'Instagram not connected' }, { status: 400 });
    }

    const pageToken = conn.access_token;
    const igId      = conn.metadata?.ig_business_id || conn.channel_id;

    // ── Account-level insights (last 7 days) ──────────────────────────────
    const since = Math.floor((Date.now() - 7 * 86400000) / 1000);
    const until = Math.floor(Date.now() / 1000);
    const insightsRes = await fetch(
      `https://graph.facebook.com/v19.0/${igId}/insights?` +
      `metric=impressions,reach,profile_views&period=day&since=${since}&until=${until}&` +
      `access_token=${pageToken}`
    );
    const insightsData = await insightsRes.json();

    const metricTotals = {};
    if (insightsData.data) {
      for (const metric of insightsData.data) {
        metricTotals[metric.name] = metric.values?.reduce((sum, v) => sum + (v.value || 0), 0) || 0;
      }
    }

    // ── Profile ───────────────────────────────────────────────────────────
    const profileRes = await fetch(
      `https://graph.facebook.com/v19.0/${igId}?fields=followers_count,media_count&access_token=${pageToken}`
    );
    const profile = await profileRes.json();

    // ── Recent media ──────────────────────────────────────────────────────
    const mediaRes = await fetch(
      `https://graph.facebook.com/v19.0/${igId}/media?` +
      `fields=id,caption,media_type,timestamp,like_count,comments_count,permalink&` +
      `limit=20&access_token=${pageToken}`
    );
    const mediaData = await mediaRes.json();
    const posts = mediaData.data || [];

    const totalLikes    = posts.reduce((s, p) => s + (p.like_count     || 0), 0);
    const totalComments = posts.reduce((s, p) => s + (p.comments_count || 0), 0);

    // ── Update connection with fresh follower count ───────────────────────
    await supabase.from('platform_connections').update({
      subscriber_count: profile.followers_count || conn.subscriber_count,
      updated_at: new Date().toISOString(),
    }).eq('platform', 'instagram');

    // ── Metrics snapshot ─────────────────────────────────────────────────────
    await supabase.from('platform_metrics').insert({
      platform:       'instagram',
      snapshot_at:    new Date().toISOString(),
      followers:      profile.followers_count || 0,
      impressions:    metricTotals['impressions']   || 0,
      reach:          metricTotals['reach']         || 0,
      likes:          totalLikes,
      comments_count: totalComments,
      videos: posts.slice(0, 20).map(p => ({
        id:        p.id,
        caption:   p.caption?.slice(0, 100),
        type:      p.media_type,
        likes:     p.like_count,
        comments:  p.comments_count,
        permalink: p.permalink,
        timestamp: p.timestamp,
      })),
      raw: {
        profile_views: metricTotals['profile_views'] || 0,
        media_count:   profile.media_count,
      },
    });

    // ── Comments from recent posts ────────────────────────────────────────
    let commentCount = 0;
    for (const post of posts.slice(0, 5)) {
      const commentsRes = await fetch(
        `https://graph.facebook.com/v19.0/${post.id}/comments?` +
        `fields=id,text,username,timestamp&limit=10&access_token=${pageToken}`
      );
      const commentsData = await commentsRes.json();
      for (const c of (commentsData.data || [])) {
        await supabase.from('platform_comments').upsert({
          platform:     'instagram',
          video_id:     post.id,          // reuse video_id col for post id
          video_title:  post.caption?.slice(0, 100) || post.permalink,
          author_name:  c.username,
          content:      c.text,
          published_at: c.timestamp,
          synced_at:    new Date().toISOString(),
        }, { onConflict: 'platform,author_name,content' });
        commentCount++;
      }
    }

    return NextResponse.json({
      success:     true,
      followers:   profile.followers_count,
      impressions: metricTotals['impressions'] || 0,
      reach:       metricTotals['reach']       || 0,
      posts:       posts.length,
      comments:    commentCount,
      likes:       totalLikes,
    });

  } catch (err) {
    console.error('Instagram sync error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
