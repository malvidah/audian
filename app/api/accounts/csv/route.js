import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLATS = new Set(['instagram', 'x', 'twitter', 'youtube', 'linkedin']);
function normPlat(p) {
  if (!p) return null;
  const s = p.trim().toLowerCase();
  if (s === 'twitter') return 'x';
  return PLATS.has(s) ? s : null;
}

export async function POST(req) {
  try {
    const { csv, category = 'SIGNAL' } = await req.json();
    if (!csv?.trim()) return NextResponse.json({ error: 'No CSV provided' }, { status: 400 });

    const VALID = new Set(['ELITE','INFLUENTIAL','SIGNAL','IGNORE']);
    const zone = VALID.has(category) ? category : 'SIGNAL';
    const lines = csv.trim().split('\n').map(l => l.trim()).filter(Boolean);

    // Skip header row
    const first = lines[0].toLowerCase();
    const start = (first.includes('handle') || first.includes('name') || first.includes('platform')) ? 1 : 0;

    const now = new Date().toISOString();
    let imported = 0, skipped = 0;
    const errors = [];

    for (let i = start; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.startsWith('#')) continue;
      const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));

      let platform = 'instagram', handle = null, name = null, bio = null;

      if (parts.length === 1) {
        handle = parts[0];
      } else {
        const p0 = normPlat(parts[0]);
        if (p0) {
          platform = p0; handle = parts[1]; name = parts[2] || null; bio = parts[3] || null;
        } else {
          handle = parts[0]; name = parts[1] || null; bio = parts[2] || null;
        }
      }

      if (!handle) { skipped++; continue; }
      const clean = handle.replace(/^@/, '').toLowerCase().trim();
      if (!clean) { skipped++; continue; }

      const handleCol = `handle_${platform}`;
      const followersCol = `followers_${platform}`;

      // Check if handle already exists for this platform
      const { data: existing } = await supabase
        .from('handles')
        .select('id, zone, name, bio')
        .eq(handleCol, clean)
        .maybeSingle();

      if (existing) {
        // Don't downgrade ELITE; merge in missing name/bio
        const { error } = await supabase.from('handles').update({
          zone: existing.zone === 'ELITE' ? 'ELITE' : zone,
          ...(name && !existing.name ? { name } : {}),
          ...(bio  && !existing.bio  ? { bio  } : {}),
          updated_at: now,
        }).eq('id', existing.id);
        if (error) errors.push(`L${i+1}: ${error.message}`);
        else imported++;
      } else {
        const { error } = await supabase.from('handles').insert({
          [handleCol]: clean,
          name: name || clean,
          bio:  bio || null,
          zone,
          added_at:   now,
          updated_at: now,
        });
        if (error) errors.push(`L${i+1}: ${error.message}`);
        else imported++;
      }
    }

    return NextResponse.json({ imported, skipped, errors: errors.length, errorDetails: errors.slice(0, 5) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
