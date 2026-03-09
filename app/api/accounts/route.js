import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const url = new URL(req.url);
  const handle = url.searchParams.get('handle');
  const platform = url.searchParams.get('platform');

  if (handle && platform) {
    const { data } = await supabase.from('people').select('*')
      .eq(`handle_${platform}`, handle.replace(/^@/, '').toLowerCase()).maybeSingle();
    return NextResponse.json({ person: data });
  }

  const { data, error } = await supabase.from('people').select('*').order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ people: data || [], accounts: data || [] }); // backward compat alias
}

export async function POST(req) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();
    if (body.id) {
      const { data, error } = await supabase.from('people').update({ ...body, updated_at: now }).eq('id', body.id).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ person: data });
    }
    const { data, error } = await supabase.from('people').insert({ ...body, added_at: now, updated_at: now }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ person: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    // Deleting a person cascades to their interactions
    const { error } = await supabase.from('people').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
