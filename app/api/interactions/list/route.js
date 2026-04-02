import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const handle_id = searchParams.get('handle_id');

  let query = supabase
    .from('interactions')
    .select(`
      id, platform, interaction_type, content, mention_url, post_url, screenshot_id, interacted_at, synced_at,
      handle_id,
      handles (
        id, name, bio, zone, followed_by, avatar_url,
        handle_instagram, handle_x, handle_youtube, handle_linkedin,
        followers_instagram, followers_x, followers_youtube, followers_linkedin
      )
    `)
    .order('interacted_at', { ascending: false })
    .limit(500);

  const post_url = searchParams.get('post_url');

  if (handle_id) query = query.eq('handle_id', handle_id);
  if (post_url)  query = query.eq('post_url', post_url);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten to a shape the Dashboard expects
  const interactions = (data || []).map(i => {
    const h = i.handles || {};
    const plat = i.platform || 'instagram';
    return {
      id:               i.id,
      handle_id:        i.handle_id,
      platform:         plat,
      handle:           h[`handle_${plat}`] || h.handle_instagram || h.handle_x || '',
      name:             h.name || '',
      bio:              h.bio  || '',
      zone:             h.zone || 'SIGNAL',
      followed_by:      h.followed_by || '',
      avatar_url:       h.avatar_url  || '',
      followers:        h[`followers_${plat}`] || h.followers_instagram || h.followers_x || null,
      interaction_type: i.interaction_type || '',
      content:          i.content || '',
      screenshot_id:    i.screenshot_id || null,
      interacted_at:    i.interacted_at,
      synced_at:        i.synced_at,
    };
  });

  return NextResponse.json({ interactions });
}
