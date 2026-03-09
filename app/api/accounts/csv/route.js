import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const KNOWN_PLATFORMS = new Set(['instagram', 'x', 'twitter', 'youtube', 'linkedin']);

function normPlatform(p) {
  if (!p) return null;
  const s = p.trim().toLowerCase();
  if (s === 'twitter') return 'x';
  return KNOWN_PLATFORMS.has(s) ? s : null;
}

export async function POST(req) {
  try {
    const { csv, category = 'SIGNAL' } = await req.json();
    if (!csv?.trim()) return NextResponse.json({ error: 'No CSV provided' }, { status: 400 });

    const VALID = new Set(['ELITE','INFLUENTIAL','SIGNAL','IGNORE']);
    const zone = VALID.has(category) ? category : 'SIGNAL';
    const lines = csv.trim().split('\n').map(l => l.trim()).filter(Boolean);

    // Skip header row if present
    const firstLine = lines[0].toLowerCase();
    const start = (firstLine.includes('handle') || firstLine.includes('name') || firstLine.includes('platform')) ? 1 : 0;

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
        const p0 = normPlatform(parts[0]);
        if (p0) {
          platform = p0; handle = parts[1]; name = parts[2] || null; bio = parts[3] || null;
        } else {
          handle = parts[0]; name = parts[1] || null; bio = parts[2] || null;
        }
      }

      if (!handle) { skipped++; continue; }
      const clean = handle.replace(/^@/, '').toLowerCase().trim();
      if (!clean) { skipped++; continue; }

      // Upsert into platform_interactions — conflict on (platform, handle)
      const { error } = await supabase
        .from('platform_interactions')
        .upsert({
          platform,
          handle:       clean,
          name:         name || clean,
          bio:          bio || null,
          zone,
          interaction_type: 'import',
          interacted_at: now,
          synced_at:     now,
        }, { onConflict: 'platform,handle', ignoreDuplicates: false });

      if (error) errors.push(`Line ${i+1}: ${error.message}`);
      else imported++;
    }

    return NextResponse.json({ imported, skipped, errors: errors.length, errorDetails: errors.slice(0, 5) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
