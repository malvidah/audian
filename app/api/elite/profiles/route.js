import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export const dynamic = 'force-dynamic';

// Returns all accounts as a lookup map keyed by "platform:handle".
// Used by the import page for autofill — any previously seen account
// on any platform will autofill name/bio/category.
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const PLATFORMS = ['instagram', 'x', 'youtube', 'linkedin'];
    const profiles  = {};

    for (const acct of (data || [])) {
      for (const plat of PLATFORMS) {
        const h = acct[`handle_${plat}`];
        if (!h) continue;
        const key = `${plat}:${h.toLowerCase()}`;
        profiles[key] = {
          account_id:  acct.id,
          name:        acct.name,
          bio:         acct.bio,
          zone:        acct.category,
          ignored:     acct.category === 'IGNORE',
          on_watchlist: acct.category === 'ELITE',
          followers:   acct[`followers_${plat}`],
          verified:    acct[`verified_${plat}`] || false,
          avatar_url:  acct.avatar_url,
          // Also carry all handles so cross-platform display is possible
          handles:     PLATFORMS.reduce((acc, p) => {
            if (acct[`handle_${p}`]) acc[p] = acct[`handle_${p}`];
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
