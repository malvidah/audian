import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(req) {
  try {
    const { id, updates } = await req.json();

    // Fields that live on the handles table
    const handleFields = ['bio', 'name', 'followed_by', 'zone', 'entity_type', 'tags', 'avatar_url',
      'handle_x', 'handle_instagram', 'handle_youtube', 'handle_linkedin',
      'followers_x', 'followers_instagram', 'followers_youtube', 'followers_linkedin'];
    // Fields that live on the interactions table
    const interactionFields = ['interaction_type', 'content', 'mention_url', 'post_url', 'interacted_at', 'platform'];

    // ── Resolve handle_id and platform ───────────────────────────────────
    let handleId = null;
    let plat = 'instagram';

    const { data: interaction, error: fetchErr } = await supabase
      .from('interactions')
      .select('handle_id, platform')
      .eq('id', id)
      .maybeSingle();

    if (!fetchErr && interaction?.handle_id) {
      handleId = interaction.handle_id;
      plat = interaction.platform || 'instagram';
    }

    if (!handleId) {
      const { data: handle } = await supabase
        .from('handles')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      if (handle) handleId = handle.id;
    }

    if (!handleId) {
      return NextResponse.json({ error: `Could not find handle for id: ${id}` }, { status: 404 });
    }

    const now = new Date().toISOString();

    // ── Update interactions table fields ─────────────────────────────────
    const intUpdates = Object.fromEntries(
      Object.entries(updates).filter(([k]) => interactionFields.includes(k))
    );

    if (Object.keys(intUpdates).length > 0) {
      const { error } = await supabase
        .from('interactions')
        .update(intUpdates)
        .eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── Update handles table fields (never overwrite with empty) ────────
    const handleUpdates = Object.fromEntries(
      Object.entries(updates)
        .filter(([k]) => handleFields.includes(k))
        .filter(([k, v]) => v != null && v !== '')  // never blank out existing data
        .map(([k, v]) => k.startsWith("followers_") ? [k, parseInt(v, 10) || null] : [k, v])
    );

    if (updates.followers != null && updates.followers !== '' && !Object.keys(updates).some(k => k.startsWith("followers_"))) {
      const parsed = parseInt(updates.followers);
      if (!isNaN(parsed)) {
        const usePlat = updates.platform || plat;
        handleUpdates[`followers_${usePlat}`] = parsed;
      }
    }

    if (Object.keys(handleUpdates).length > 0) {
      handleUpdates.updated_at = now;
      const { error } = await supabase
        .from('handles')
        .update(handleUpdates)
        .eq('id', handleId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, handleId, platform: plat });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
