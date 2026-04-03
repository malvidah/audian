import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .select('key, value');
    if (error) throw error;
    const settings = {};
    (data || []).forEach(r => { settings[r.key] = r.value; });
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json({ settings: {}, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const updates = await req.json(); // { key: value, ... }
    const rows = Object.entries(updates).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabaseAdmin
      .from('user_settings')
      .upsert(rows, { onConflict: 'key' });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
