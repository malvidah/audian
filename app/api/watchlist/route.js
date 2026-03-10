import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET — returns ELITE handles (replaces old watchlist table)
export async function GET() {
  const { data, error } = await supabase
    .from('handles')
    .select('id, name, zone, handle_instagram, handle_x, handle_youtube, handle_linkedin, updated_at')
    .eq('zone', 'ELITE')
    .order('updated_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ entries: [], total: 0, _error: error.message });
  return NextResponse.json({ entries: data || [], total: data?.length || 0 });
}

// POST — add/update handles as ELITE
export async function POST(req) {
  try {
    const { entries } = await req.json();
    if (!entries?.length) return NextResponse.json({ error: 'No entries' }, { status: 400 });
    const now = new Date().toISOString();

    await Promise.all(entries.map(async e => {
      const platform = (e.platform || 'instagram').toLowerCase();
      const handle   = e.handle?.replace(/^@/, '').toLowerCase().trim();
      if (!handle) return;
      const handleCol = `handle_${platform}`;

      const { data: existing } = await supabase.from('handles').select('id').eq(handleCol, handle).maybeSingle();
      if (existing) {
        await supabase.from('handles').update({ zone: 'ELITE', updated_at: now }).eq('id', existing.id);
      } else {
        await supabase.from('handles').insert({ [handleCol]: handle, name: handle, zone: 'ELITE', added_at: now, updated_at: now });
      }
    }));

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — demote from ELITE back to SIGNAL (not delete the handle)
export async function DELETE(req) {
  try {
    const text = await req.text();
    if (!text || text === '{}') {
      // Demote all ELITE → SIGNAL
      await supabase.from('handles').update({ zone: 'SIGNAL' }).eq('zone', 'ELITE');
      return NextResponse.json({ success: true, cleared: true });
    }
    const { platform, handle } = JSON.parse(text);
    const handleCol = `handle_${platform || 'instagram'}`;
    const clean = handle?.replace(/^@/, '').toLowerCase();
    await supabase.from('handles').update({ zone: 'SIGNAL' }).eq(handleCol, clean);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
