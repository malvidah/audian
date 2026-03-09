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

// Map any label/list value → our zone
function mapZone(label, sourceList, fallback) {
  const raw = (label || sourceList || fallback || '').toLowerCase().trim();
  if (raw.includes('elite'))       return 'ELITE';
  if (raw.includes('influential')) return 'INFLUENTIAL';
  if (raw.includes('signal'))      return 'SIGNAL';
  if (raw.includes('ignore'))      return 'IGNORE';
  if (raw.includes('watch'))       return 'SIGNAL';
  return fallback; // caller-provided default
}

export async function POST(req) {
  try {
    const { csv, category = 'SIGNAL' } = await req.json();
    if (!csv?.trim()) return NextResponse.json({ error: 'No CSV provided' }, { status: 400 });

    const VALID = new Set(['ELITE','INFLUENTIAL','SIGNAL','IGNORE']);
    const defaultZone = VALID.has(category) ? category : 'SIGNAL';

    const rawLines = csv.trim().split('\n').map(l => l.trim().replace(/\r$/, ''));
    if (!rawLines.length) return NextResponse.json({ error: 'Empty CSV' }, { status: 400 });

    // Parse header row — detect column positions by name
    const headerLine = rawLines[0];
    const headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9 _]/g, ''));

    const col = (names) => {
      for (const n of names) {
        const idx = headers.findIndex(h => h.includes(n));
        if (idx >= 0) return idx;
      }
      return -1;
    };

    // Column index detection — handles your Brandwatch export + plain CSVs
    const iName       = col(['name']);
    const iXHandle    = col(['x handle', 'twitter handle', 'x_handle', 'twitter_handle']);
    const iIgHandle   = col(['instagram handle', 'instagram_handle', 'ig handle']);
    const iYtHandle   = col(['youtube handle', 'youtube_handle', 'yt handle']);
    const iLiHandle   = col(['linkedin handle', 'linkedin_handle']);
    const iHandle     = col(['handle']); // generic fallback
    const iPlatform   = col(['platform']);
    const iLabel      = col(['label']);
    const iSourceList = col(['source list']);
    const iBio        = col(['bio', 'description']);

    const now = new Date().toISOString();
    let imported = 0, skipped = 0;
    const errors = [];

    for (let i = 1; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (!line || line.startsWith('#')) continue;

      // Respect quoted fields (simple CSV split)
      const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));

      const get = (idx) => (idx >= 0 && idx < parts.length) ? parts[idx]?.trim() || null : null;

      const name       = get(iName);
      const label      = get(iLabel);
      const sourceList = get(iSourceList);
      const bio        = get(iBio);
      const zone       = mapZone(label, sourceList, defaultZone);

      // Collect all platform handles from named columns
      let xHandle  = get(iXHandle)?.replace(/^@/, '').toLowerCase() || null;
      let igHandle = get(iIgHandle)?.replace(/^@/, '').toLowerCase() || null;
      let ytHandle = get(iYtHandle)?.replace(/^@/, '').toLowerCase() || null;
      let liHandle = get(iLiHandle)?.replace(/^@/, '').toLowerCase() || null;

      // If no platform-specific columns found, try generic handle + platform columns
      if (!xHandle && !igHandle && !ytHandle && !liHandle) {
        const genericHandle = get(iHandle)?.replace(/^@/, '').toLowerCase();
        const platform = normPlat(get(iPlatform)) || 'instagram';
        if (genericHandle) {
          if (platform === 'x')         xHandle  = genericHandle;
          else if (platform === 'youtube') ytHandle = genericHandle;
          else if (platform === 'linkedin') liHandle = genericHandle;
          else                           igHandle = genericHandle;
        }
      }

      // Skip rows with no handle at all
      if (!xHandle && !igHandle && !ytHandle && !liHandle) { skipped++; continue; }

      // Build upsert object — prefer matching on x handle if present, else instagram
      const matchPlatform = xHandle ? 'x' : igHandle ? 'instagram' : ytHandle ? 'youtube' : 'linkedin';
      const matchHandle   = xHandle || igHandle || ytHandle || liHandle;
      const matchCol      = `handle_${matchPlatform}`;

      const { data: existing } = await supabase
        .from('handles')
        .select('id, zone, name, bio')
        .eq(matchCol, matchHandle)
        .maybeSingle();

      const payload = {
        ...(name                    ? { name }                    : {}),
        ...(bio                     ? { bio }                     : {}),
        ...(xHandle                 ? { handle_x: xHandle }       : {}),
        ...(igHandle                ? { handle_instagram: igHandle } : {}),
        ...(ytHandle                ? { handle_youtube: ytHandle } : {}),
        ...(liHandle                ? { handle_linkedin: liHandle } : {}),
        updated_at: now,
      };

      if (existing) {
        // Don't downgrade zone; fill in missing name/bio
        const { error } = await supabase.from('handles').update({
          ...payload,
          zone: existing.zone === 'ELITE' ? 'ELITE' : zone,
          ...(existing.name ? {} : { name: name || matchHandle }),
          ...(existing.bio  ? {} : { bio }),
        }).eq('id', existing.id);
        if (error) errors.push(`L${i+1}: ${error.message}`);
        else imported++;
      } else {
        const { error } = await supabase.from('handles').insert({
          ...payload,
          zone,
          name: name || matchHandle,
          added_at: now,
        });
        if (error) errors.push(`L${i+1}: ${error.message}`);
        else imported++;
      }
    }

    return NextResponse.json({
      imported, skipped, errors: errors.length,
      errorDetails: errors.slice(0, 5),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
