import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(req) {
  try {
    const { id, updates } = await req.json();

    const allowed = ['bio', 'name', 'followed_by', 'zone', 'avatar_url'];

    // ── Strategy 1: look up via interactions table ─────────────────────────
    let handleId = null;
    let plat     = 'instagram';

    const { data: interaction, error: fetchErr } = await supabase
      .from('interactions')
      .select('handle_id, platform')
      .eq('id', id)
      .maybeSingle();

    if (!fetchErr && interaction?.handle_id) {
      handleId = interaction.handle_id;
      plat     = interaction.platform || 'instagram';
    }

    // ── Strategy 2: id might actually be handles.id directly ──────────────
    if (!handleId) {
      const { data: handle } = await supabase
        .from('handles')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      if (handle) handleId = handle.id;
    }

    if (!handleId) {
      console.error('[interactions/update] could not resolve handle for id:', id, fetchErr?.message);
      return NextResponse.json({ error: `Could not find handle for id: ${id}` }, { status: 404 });
    }

    // ── Build update payload ───────────────────────────────────────────────
    const handleUpdates = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k))
    );

    if (updates.followers != null && updates.followers !== '') {
      const parsed = parseInt(updates.followers);
      handleUpdates[`followers_${plat}`] = isNaN(parsed) ? null : parsed;
      // Also write to all platform columns that don't have a value yet,
      // so it's visible regardless of which platform the interaction was on
    }

    handleUpdates.updated_at = new Date().toISOString();

    if (Object.keys(handleUpdates).length === 1) {
      // Only updated_at — nothing to actually save
      return NextResponse.json({ ok: true, noop: true });
    }

    const { error: updateErr } = await supabase
      .from('handles')
      .update(handleUpdates)
      .eq('id', handleId);

    if (updateErr) {
      console.error('[interactions/update] handles update error:', updateErr.message);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    console.log('[interactions/update] saved', handleUpdates, 'for handle', handleId);
    return NextResponse.json({ ok: true, handleId, platform: plat, saved: handleUpdates });
  } catch (err) {
    console.error('[interactions/update] exception:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
