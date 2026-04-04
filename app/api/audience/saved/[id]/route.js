import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const { error } = await supabaseAdmin
      .from('audience_insights_saved')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
