import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export const dynamic = 'force-dynamic';

// Returns all instagram watchlist handles with their last-known profile data.
// Used by the import page to autofill name/followers/verified for known accounts.
export async function GET() {
  try {
    // Get all instagram handles from watchlist
    const { data: wl, error: wlErr } = await supabase
      .from('watchlist')
      .select('handle, label')
      .eq('platform', 'instagram');

    if (wlErr) return NextResponse.json({ error: wlErr.message }, { status: 500 });
    if (!wl?.length) return NextResponse.json({ profiles: {} });

    const handles = wl.map(r => r.handle.toLowerCase().replace(/^@/, ''));

    // Join with platform_interactions for saved profile data
    const { data: interactions } = await supabase
      .from('platform_interactions')
      .select('handle, name, followers, verified, avatar_url, bio, interaction_type, influence_score, interacted_at')
      .eq('platform', 'instagram')
      .in('handle', handles);

    // Build a lookup map keyed by handle
    const profileMap = {};

    // Start with watchlist entries (handle + label as fallback name)
    for (const w of wl) {
      const h = w.handle.toLowerCase().replace(/^@/, '');
      profileMap[h] = { handle: h, name: w.label || h, zone: 'ELITE', on_watchlist: true };
    }

    // Overlay with richer profile data from interactions if available
    for (const p of (interactions || [])) {
      const h = p.handle.toLowerCase().replace(/^@/, '');
      if (profileMap[h]) {
        profileMap[h] = {
          ...profileMap[h],
          name:        p.name || profileMap[h].name,
          followers:   p.followers,
          verified:    p.verified,
          avatar_url:  p.avatar_url,
          bio:         p.bio,
          last_seen:   p.interacted_at,
        };
      }
    }

    return NextResponse.json({ profiles: profileMap });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
