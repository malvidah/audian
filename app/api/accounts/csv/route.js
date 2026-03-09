import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function mapZone(label, sourceList, fallback) {
  const raw = (label || sourceList || '').toLowerCase().trim();
  if (raw.includes('elite'))       return 'ELITE';
  if (raw.includes('influential')) return 'INFLUENTIAL';
  if (raw.includes('ignore'))      return 'IGNORE';
  if (raw.includes('signal'))      return 'SIGNAL';
  return fallback;
}

export async function POST(req) {
  try {
    const { csv, category = 'SIGNAL' } = await req.json();
    if (!csv?.trim()) return NextResponse.json({ error: 'No CSV provided' }, { status: 400 });

    const VALID = new Set(['ELITE','INFLUENTIAL','SIGNAL','IGNORE']);
    const defaultZone = VALID.has(category) ? category : 'SIGNAL';
    const now = new Date().toISOString();

    const rawLines = csv.trim().split('\n').map(l => l.trim().replace(/\r$/, ''));
    const headers  = rawLines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^\w ]/g, ''));

    const col = (...names) => {
      for (const n of names) {
        const i = headers.findIndex(h => h.includes(n));
        if (i >= 0) return i;
      }
      return -1;
    };

    const iName    = col('name');
    const iXHandle = col('x handle', 'twitter handle', 'x_handle', 'twitter_handle');
    const iIg      = col('instagram handle', 'instagram_handle', 'ig handle');
    const iYt      = col('youtube handle', 'youtube_handle');
    const iLi      = col('linkedin handle', 'linkedin_handle');
    const iHandle  = col('handle');
    const iPlat    = col('platform');
    const iLabel   = col('label');
    const iSource  = col('source list');
    const iBio     = col('bio', 'description');

    // Parse all rows first
    const rows = [];
    let skipped = 0;

    for (let i = 1; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (!line || line.startsWith('#')) continue;
      const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      const get = idx => (idx >= 0 && idx < parts.length ? parts[idx]?.trim() || null : null);

      const name   = get(iName);
      const zone   = mapZone(get(iLabel), get(iSource), defaultZone);
      const bio    = get(iBio);

      let xH  = get(iXHandle)?.replace(/^@/, '').toLowerCase() || null;
      let igH = get(iIg)?.replace(/^@/, '').toLowerCase() || null;
      let ytH = get(iYt)?.replace(/^@/, '').toLowerCase() || null;
      let liH = get(iLi)?.replace(/^@/, '').toLowerCase() || null;

      if (!xH && !igH && !ytH && !liH) {
        const h = get(iHandle)?.replace(/^@/, '').toLowerCase();
        const p = (get(iPlat) || 'instagram').toLowerCase().replace('twitter', 'x');
        if (h) {
          if (p === 'x') xH = h; else if (p === 'youtube') ytH = h;
          else if (p === 'linkedin') liH = h; else igH = h;
        }
      }

      if (!xH && !igH && !ytH && !liH) { skipped++; continue; }

      rows.push({
        name: name || xH || igH || ytH || liH,
        bio:  bio  || null,
        zone,
        handle_x:         xH  || null,
        handle_instagram: igH || null,
        handle_youtube:   ytH || null,
        handle_linkedin:  liH || null,
        added_at:   now,
        updated_at: now,
      });
    }

    if (!rows.length) return NextResponse.json({ imported: 0, skipped, errors: 0 });

    // Upsert each row matching on whichever handle column is set.
    // Run in parallel batches of 20 to avoid Vercel timeout.
    const BATCH = 20;
    let imported = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      await Promise.all(batch.map(async row => {
        // Pick conflict column — must be non-null
        const conflictCol = row.handle_x ? 'handle_x'
          : row.handle_instagram ? 'handle_instagram'
          : row.handle_youtube   ? 'handle_youtube'
          : 'handle_linkedin';

        const { error } = await supabase
          .from('handles')
          .upsert(row, { onConflict: conflictCol, ignoreDuplicates: false });

        if (error) errors.push(error.message);
        else imported++;
      }));
    }

    return NextResponse.json({ imported, skipped, errors: errors.length, errorDetails: errors.slice(0, 5) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
