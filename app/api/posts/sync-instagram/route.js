import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST /api/posts/sync-instagram
// Extracts individual post records from platform_metrics.videos JSONB
// and upserts them into the posts table.
export async function POST() {
  try {
    // Pull all Instagram metrics snapshots that have a videos array
    const { data: snapshots, error } = await supabaseAdmin
      .from('platform_metrics')
      .select('id, snapshot_at, videos')
      .eq('platform', 'instagram')
      .not('videos', 'is', null)
      .order('snapshot_at', { ascending: false });

    if (error) throw error;

    // Deduplicate posts by their Instagram post id
    const seen   = new Set();
    const rows   = [];
    const now    = new Date().toISOString();

    for (const snap of (snapshots || [])) {
      const videos = Array.isArray(snap.videos) ? snap.videos : [];
      for (const v of videos) {
        if (!v.id || seen.has(v.id)) continue;
        seen.add(v.id);
        rows.push({
          platform:      'instagram',
          post_id:       v.id,
          content:       v.caption || null,
          permalink:     v.permalink || null,
          published_at:  v.timestamp || snap.snapshot_at,
          likes:         v.likes         ?? 0,
          comments:      v.comments      ?? 0,
          impressions:   v.impressions   ?? 0,
          shares:        0,
          saves:         v.saves         ?? 0,
          views:         v.views         ?? 0,
          post_type:     v.type === 'VIDEO' ? 'reel' : (v.type === 'CAROUSEL_ALBUM' ? 'carousel' : 'post'),
          thumbnail_url: v.thumbnail     || null,
          source:        'api',
          synced_at:     now,
        });
      }
    }

    if (rows.length === 0) {
      return NextResponse.json({ imported: 0, message: 'No Instagram posts found in metrics snapshots. Run Instagram sync first.' });
    }

    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from('posts')
      .upsert(rows, { onConflict: 'platform,post_id', ignoreDuplicates: false })
      .select('id');

    if (upsertError) throw upsertError;

    return NextResponse.json({
      success:    true,
      imported:   upserted?.length || rows.length,
      snapshots:  snapshots?.length || 0,
      message:    `Imported ${upserted?.length || rows.length} Instagram posts from ${snapshots?.length || 0} metric snapshots`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
