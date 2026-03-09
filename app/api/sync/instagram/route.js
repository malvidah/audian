import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

// This route ONLY handles what the Meta basic API does reliably:
//   - follower count
//   - post list with permalinks (needed by Apify scrapers)
//   - engagement totals for the metrics chart
//
// ALL interaction data (comments, followers, likers) is scraped via Apify.
// After saving metrics, it auto-triggers the Apify scraper pipeline.

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

    // ── Profile metrics ───────────────────────────────────────────────────
    const [profileRes, mediaRes] = await Promise.all([
      fetch(`https://graph.facebook.com/v19.0/${igId}?fields=followers_count,media_count&access_token=${token}`),
      fetch(`https://graph.facebook.com/v19.0/${igId}/media?fields=id,caption,media_type,timestamp,like_count,comments_count,permalink&limit=20&access_token=${token}`),
    ]);
    const [profile, mediaData] = await Promise.all([profileRes.json(), mediaRes.json()]);
    const posts = mediaData.data || [];

    // ── Update follower count on connection ───────────────────────────────
    if (profile.followers_count) {
      await supabase.from('platform_connections')
        .update({ subscriber_count: profile.followers_count, updated_at: new Date().toISOString() })
        .eq('platform', 'instagram');
    }

    // ── Save metrics snapshot (follower trend + post list for Apify) ──────
    const totalLikes    = posts.reduce((s, p) => s + (p.like_count     || 0), 0);
    const totalComments = posts.reduce((s, p) => s + (p.comments_count || 0), 0);

    await supabase.from('platform_metrics').insert({
      platform:       'instagram',
      snapshot_at:    new Date().toISOString(),
      followers:      profile.followers_count || 0,
      likes:          totalLikes,
      comments_count: totalComments,
      videos: posts.map(p => ({
        id:        p.id,
        caption:   p.caption?.slice(0, 100),
        type:      p.media_type,
        likes:     p.like_count,
        comments:  p.comments_count,
        permalink: p.permalink,
        timestamp: p.timestamp,
      })),
    });

    // ── Purge any stale null-author junk from the old API approach ────────
    await supabase.from('platform_comments')
      .delete().eq('platform', 'instagram').is('author_name', null);

    // ── Auto-trigger Apify scrapers for ALL interaction data ──────────────
    const apifyKey = process.env.APIFY_API_KEY;
    let apifyResult = null;
    if (apifyKey) {
      try {
        const triggerRes = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'https://audian.app'}/api/apify/trigger`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }
        );
        apifyResult = await triggerRes.json();
      } catch (e) {
        console.error('Apify auto-trigger failed:', e.message);
      }
    }

    return NextResponse.json({
      success:   true,
      followers: profile.followers_count || 0,
      posts:     posts.length,
      likes:     totalLikes,
      comments_count: totalComments,
      apify:     apifyResult?.message || (apifyKey ? 'triggered' : 'no APIFY_API_KEY set'),
    });

  } catch (err) {
    console.error('Instagram sync error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
