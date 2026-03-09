import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// GET — fetch all watchlist entries
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await adminClient()
    .from('watchlist')
    .select('*')
    .order('added_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: data });
}

// POST — upsert entries from CSV upload
// Body: { entries: [{ platform, handle, label }] }
export async function POST(req) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { entries } = await req.json();
  if (!entries?.length) return NextResponse.json({ error: 'No entries provided' }, { status: 400 });

  // Normalize handles (strip @, lowercase)
  const normalized = entries.map(e => ({
    platform: e.platform?.toLowerCase() || 'instagram',
    handle: e.handle?.replace(/^@/, '').toLowerCase().trim(),
    label: e.label || null,
  })).filter(e => e.handle);

  const { error, count } = await adminClient()
    .from('watchlist')
    .upsert(normalized, { onConflict: 'platform,handle', count: 'exact' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, added: count || normalized.length });
}

// DELETE — remove a handle
export async function DELETE(req) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { platform, handle } = await req.json();
  const { error } = await adminClient()
    .from('watchlist')
    .delete()
    .eq('platform', platform)
    .eq('handle', handle.replace(/^@/, '').toLowerCase());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
