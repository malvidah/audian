import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('handles')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Map zone → category for dashboard compatibility
  const accounts = (data || []).map(h => ({ ...h, category: h.zone }));
  return NextResponse.json({ accounts });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const now  = new Date().toISOString();
    if (body.id) {
      const { data, error } = await supabaseAdmin.from('handles').update({ ...body, updated_at: now }).eq('id', body.id).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ handle: data });
    }
    const { data, error } = await supabaseAdmin.from('handles').insert({ ...body, added_at: now, updated_at: now }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ handle: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const allowed = ['name', 'bio', 'zone', 'followed_by', 'avatar_url',
      'handle_instagram', 'handle_x', 'handle_youtube', 'handle_linkedin',
      'followers_instagram', 'followers_x', 'followers_youtube', 'followers_linkedin'];
    const safe = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
    safe.updated_at = new Date().toISOString();
    const { data, error } = await supabaseAdmin.from('handles').update(safe).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ handle: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { error } = await supabaseAdmin.from('handles').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
