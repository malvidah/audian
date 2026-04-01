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
