import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export const dynamic = 'force-dynamic';

// Returns ALL previously seen instagram accounts for autofill on import.
// Elite accounts get zone=ELITE enforced. Ignored accounts are flagged.
// All others carry their last-known zone, followers, bio etc.
export async function GET() {
  try {
    // All stored instagram interactions
    const { data: interactions, error } = await supabase
      .from('platform_interactions')
      .select('handle, name, followers, verified, bio, avatar_url, zone, on_watchlist, ignored, influence_score, interaction_type, interacted_at')
      .eq('platform', 'instagram')
      .order('interacted_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Build lookup map — most recent record wins per handle
    const profileMap = {};
    for (const p of (interactions || [])) {
      const h = p.handle.toLowerCase().replace(/^@/, '');
      if (!profileMap[h]) {
        profileMap[h] = {
          handle:      h,
          name:        p.name,
          followers:   p.followers,
          verified:    p.verified,
          bio:         p.bio,
          avatar_url:  p.avatar_url,
          zone:        p.on_watchlist ? 'ELITE' : p.zone,
          on_watchlist: p.on_watchlist,
          ignored:     p.ignored || false,
          last_seen:   p.interacted_at,
        };
      }
    }

    return NextResponse.json({ profiles: profileMap });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
