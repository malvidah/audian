import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PATCH(req) {
  try {
    const { id, updates } = await req.json(); // id = interaction id

    // First resolve person_id from interaction
    const { data: interaction, error: fetchErr } = await supabase
      .from('interactions').select('person_id, platform').eq('id', id).single();
    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 404 });

    // Build safe people updates
    const plat = interaction.platform;
    const allowed = ['bio', 'name', 'followed_by', 'notes', 'category'];
    const peopleUpdates = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));

    // Handle per-platform followers update
    if (updates.followers != null) {
      peopleUpdates[`followers_${plat}`] = parseInt(updates.followers) || null;
    }
    peopleUpdates.updated_at = new Date().toISOString();

    const { error: updateErr } = await supabase
      .from('people')
      .update(peopleUpdates)
      .eq('id', interaction.person_id);

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
