import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export const dynamic = 'force-dynamic';

export async function PATCH(req) {
  try {
    const { id, updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const allowed = ['bio', 'followers', 'followed_by', 'zone', 'on_watchlist', 'name', 'notes'];
    const safe = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
    safe.synced_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('platform_interactions')
      .update(safe)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ interaction: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
