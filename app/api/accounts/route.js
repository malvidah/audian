import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export const dynamic = 'force-dynamic';

// GET — returns all accounts as a lookup map by every known handle
// Used by import page for autofill. Response:
// { accounts: Account[], byHandle: { "handle": account_id } }
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Build multi-platform lookup map
    const byHandle = {};
    const PLATFORMS = ['instagram', 'x', 'youtube', 'linkedin'];
    for (const acct of (data || [])) {
      for (const plat of PLATFORMS) {
        const h = acct[`handle_${plat}`];
        if (h) byHandle[`${plat}:${h.toLowerCase()}`] = acct.id;
      }
    }

    return NextResponse.json({ accounts: data || [], byHandle });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — upsert a single account, returns the account with id
// Matches by platform handle. If no match found, creates new.
// Body: { platform, handle, name, bio, category, followers, verified, avatar_url }
export async function POST(req) {
  try {
    const body = await req.json();
    const { platform, handle, name, bio, category, followers, verified, avatar_url } = body;

    if (!platform || !handle) {
      return NextResponse.json({ error: 'platform and handle required' }, { status: 400 });
    }

    const cleanHandle = handle.toLowerCase().replace(/^@/, '');
    const handleCol   = `handle_${platform}`;
    const followersCol = `followers_${platform}`;
    const verifiedCol  = `verified_${platform}`;

    // Find existing account with this handle
    const { data: existing } = await supabase
      .from('accounts')
      .select('*')
      .eq(handleCol, cleanHandle)
      .maybeSingle();

    const now = new Date().toISOString();

    if (existing) {
      // Update
      const updates = {
        updated_at: now,
        ...(name        && { name }),
        ...(bio         && { bio }),
        ...(category    && { category }),
        ...(followers   && { [followersCol]: followers }),
        ...(verified !== undefined && { [verifiedCol]: verified }),
        ...(avatar_url  && { avatar_url }),
      };
      const { data: updated, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ account: updated });
    } else {
      // Create
      const { data: created, error } = await supabase
        .from('accounts')
        .insert({
          name:          name || cleanHandle,
          bio:           bio || null,
          category:      category || 'SIGNAL',
          [handleCol]:   cleanHandle,
          [followersCol]: followers || null,
          [verifiedCol]:  verified || false,
          avatar_url:    avatar_url || null,
          added_at:      now,
          updated_at:    now,
        })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ account: created });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — update followed_by array for an account
// Body: { id, followed_by: ["instagram:handle", "x:handle", ...] }
export async function PATCH(req) {
  try {
    const { id, followed_by } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { data, error } = await supabase
      .from('accounts')
      .update({ followed_by: followed_by || [], updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ account: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
