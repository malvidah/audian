import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PATCH(req) {
  try {
    const { id, updates } = await req.json();

    // Get handle_id + platform from this interaction
    const { data: interaction, error: fetchErr } = await supabase
      .from('interactions')
      .select('handle_id, platform')
      .eq('id', id)
      .single();
    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 404 });

    const plat = interaction.platform;
    const allowed = ['bio', 'name', 'followed_by', 'zone', 'avatar_url'];
    const handleUpdates = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));

    if (updates.followers != null) {
      handleUpdates[`followers_${plat}`] = parseInt(updates.followers) || null;
    }
    handleUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('handles')
      .update(handleUpdates)
      .eq('id', interaction.handle_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
