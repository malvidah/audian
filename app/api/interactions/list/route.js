import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from('interactions')
    .select('*, people(*)')
    .order('interacted_at', { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten: derive handle/followers/verified from person + platform
  const rows = (data || []).map(i => {
    const p = i.people || {};
    const plat = i.platform;
    return {
      id:            i.id,
      person_id:     i.person_id,
      platform:      plat,
      interaction_type: i.type,
      type:          i.type,
      content:       i.content,
      content_title: i.content_title,
      content_url:   i.content_url,
      likes:         i.likes,
      screenshot_id: i.screenshot_id,
      interacted_at: i.interacted_at,
      synced_at:     i.synced_at,
      // person fields
      name:          p.name,
      bio:           p.bio,
      avatar_url:    p.avatar_url,
      zone:          p.category,
      followed_by:   p.followed_by,
      notes:         p.notes,
      handle:        p[`handle_${plat}`] || p.handle_instagram || p.handle_x || p.handle_youtube || p.handle_linkedin,
      followers:     p[`followers_${plat}`] || p.followers_instagram || p.followers_x || p.followers_youtube || p.followers_linkedin,
      verified:      p[`verified_${plat}`] || false,
      profile_url:   plat === 'instagram' ? `https://instagram.com/${p.handle_instagram}`
                   : plat === 'x'         ? `https://x.com/${p.handle_x}`
                   : plat === 'youtube'   ? `https://youtube.com/@${p.handle_youtube}`
                   : plat === 'linkedin'  ? `https://linkedin.com/in/${p.handle_linkedin}`
                   : null,
    };
  });

  return NextResponse.json({ interactions: rows });
}
