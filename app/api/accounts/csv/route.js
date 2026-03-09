import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export const dynamic = 'force-dynamic';

// POST — bulk import accounts from CSV for any category (default: ELITE)
// CSV formats supported:
//   handle                           → instagram assumed
//   platform,handle                  → e.g. instagram,@jofrost
//   platform,handle,name             → with display name
//   platform,handle,name,bio         → with bio
//   instagram_handle,x_handle,name   → multi-platform row
//
// All rows upsert into accounts table, matching on the platform handle.

const KNOWN_PLATFORMS = new Set(['instagram', 'x', 'twitter', 'youtube', 'linkedin']);

function normalizePlatform(p) {
  if (!p) return null;
  const s = p.trim().toLowerCase();
  if (s === 'twitter') return 'x';
  return KNOWN_PLATFORMS.has(s) ? s : null;
}

export async function POST(req) {
  try {
    const { csv, category = 'ELITE' } = await req.json();
    if (!csv?.trim()) return NextResponse.json({ error: 'No CSV provided' }, { status: 400 });

    const lines = csv.trim().split('\n').map(l => l.trim()).filter(Boolean);
    const CATEGORIES = new Set(['ELITE', 'INFLUENTIAL', 'SIGNAL', 'IGNORE']);
    if (!CATEGORIES.has(category)) return NextResponse.json({ error: 'Invalid category' }, { status: 400 });

    const now = new Date().toISOString();
    let imported = 0, skipped = 0;
    const errors = [];

    // Detect if first line is a header
    const firstLine = lines[0].toLowerCase();
    const startIdx = (
      firstLine.includes('handle') ||
      firstLine.includes('name') ||
      firstLine.includes('platform')
    ) ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.startsWith('#')) continue;
      const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));

      let platform = null, handle = null, name = null, bio = null;

      if (parts.length === 1) {
        // Just a handle — assume instagram
        handle = parts[0];
        platform = 'instagram';
      } else if (parts.length >= 2) {
        const maybePlat = normalizePlatform(parts[0]);
        if (maybePlat) {
          platform = maybePlat;
          handle   = parts[1];
          name     = parts[2] || null;
          bio      = parts[3] || null;
        } else {
          // First col is a handle, not a platform
          handle   = parts[0];
          platform = 'instagram';
          name     = parts[1] || null;
          bio      = parts[2] || null;
        }
      }

      if (!handle) { skipped++; continue; }
      const cleanHandle = handle.replace(/^@/, '').toLowerCase().trim();
      if (!cleanHandle) { skipped++; continue; }

      const handleCol = `handle_${platform}`;

      // Upsert — match on the platform-specific handle
      const { data: existing } = await supabase
        .from('accounts')
        .select('id, name, bio')
        .eq(handleCol, cleanHandle)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from('accounts').update({
          category,
          ...(name && !existing.name ? { name } : {}),
          ...(bio  && !existing.bio  ? { bio  } : {}),
          updated_at: now,
        }).eq('id', existing.id);
        if (error) errors.push(`Line ${i+1}: ${error.message}`);
        else imported++;
      } else {
        const { error } = await supabase.from('accounts').insert({
          category,
          name:       name || cleanHandle,
          bio:        bio || null,
          [handleCol]: cleanHandle,
          added_at:   now,
          updated_at: now,
        });
        if (error) errors.push(`Line ${i+1}: ${error.message}`);
        else imported++;
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      errors: errors.length,
      errorDetails: errors.slice(0, 10),
      message: `Imported ${imported} accounts as ${category}`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
