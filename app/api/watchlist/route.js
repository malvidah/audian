import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getUser(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(req) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await adminClient()
    .from('watchlist')
    .select('*')
    .order('added_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: data });
}

export async function POST(req) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { entries } = await req.json();
  if (!entries?.length) return NextResponse.json({ error: 'No entries provided' }, { status: 400 });

  const normalized = entries.map(e => ({
    platform: e.platform?.toLowerCase() || 'instagram',
    handle: e.handle?.replace(/^@/, '').toLowerCase().trim(),
    label: e.label || null,
  })).filter(e => e.handle);

  // Batch in chunks of 500 to stay under Supabase row limit
  const CHUNK = 500;
  let totalAdded = 0;
  for (let i = 0; i < normalized.length; i += CHUNK) {
    const chunk = normalized.slice(i, i + CHUNK);
    const { error, count } = await adminClient()
      .from('watchlist')
      .upsert(chunk, { onConflict: 'platform,handle', count: 'exact' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    totalAdded += count || chunk.length;
  }

  return NextResponse.json({ success: true, added: totalAdded });
}

export async function DELETE(req) {
  const user = await getUser(req);
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
