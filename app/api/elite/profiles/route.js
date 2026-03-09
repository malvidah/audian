import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Returns all handles as a lookup map keyed by "platform:handle".
// Used by the import page for autofill — any previously seen handle on any
// platform will autofill name/bio/zone.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('handles')
      .select('id, name, bio, zone, avatar_url, handle_instagram, handle_x, handle_youtube, handle_linkedin, followers_instagram, followers_x, followers_youtube, followers_linkedin, verified_instagram, verified_x, verified_youtube, verified_linkedin')
      .order('updated_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const PLATFORMS = ['instagram', 'x', 'youtube', 'linkedin'];
    const profiles  = {};

    for (const h of (data || [])) {
      for (const plat of PLATFORMS) {
        const handle = h[`handle_${plat}`];
        if (!handle) continue;
        const key = `${plat}:${handle.toLowerCase()}`;
        profiles[key] = {
          handle_id:    h.id,
          name:         h.name,
          bio:          h.bio,
          zone:         h.zone,
          ignored:      h.zone === 'IGNORE',
          on_watchlist: h.zone === 'ELITE',
          followers:    h[`followers_${plat}`],
          verified:     h[`verified_${plat}`] || false,
          avatar_url:   h.avatar_url,
          handles:      PLATFORMS.reduce((acc, p) => {
            if (h[`handle_${p}`]) acc[p] = h[`handle_${p}`];
            return acc;
          }, {}),
        };
      }
    }

    return NextResponse.json({ profiles });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
