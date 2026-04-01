import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST /api/posts/import
// Body: { posts: [ { platform, post_id, published_at, content, permalink, likes, comments,
//                    impressions, shares, saves, views, post_type, thumbnail_url, source } ] }
export async function POST(request) {
  try {
    const { posts } = await request.json();
    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ error: 'posts array required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const rows = posts.map(p => ({
      platform:      p.platform,
      post_id:       p.post_id || null,
      content:       p.content?.slice(0, 1000) || null,
      permalink:     p.permalink || null,
      published_at:  p.published_at || null,
      likes:         p.likes         ?? 0,
      comments:      p.comments      ?? 0,
      impressions:   p.impressions   ?? 0,
      shares:        p.shares        ?? 0,
      saves:         p.saves         ?? 0,
      views:         p.views         ?? 0,
      post_type:     p.post_type     || 'post',
      thumbnail_url: p.thumbnail_url || null,
      source:        p.source        || 'manual',
      synced_at:     now,
    }));

    const { data, error } = await supabaseAdmin
      .from('posts')
      .upsert(rows, { onConflict: 'platform,post_id', ignoreDuplicates: false })
      .select('id');

    if (error) throw error;

    return NextResponse.json({ imported: data?.length || rows.length, success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
