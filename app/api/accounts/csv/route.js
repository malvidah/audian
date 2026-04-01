import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function splitCsvLine(line) {
  const out = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      out.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  out.push(current);
  return out;
}

function sanitizeHandle(value) {
  if (!value) return null;

  const raw = value
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\u200B/g, '')
    .replace(/\s+/g, '');

  if (!raw) return null;

  const normalized = raw.replace(/^@+/, '').toLowerCase();
  if (!normalized) return null;

  const invalid = new Set([
    'n/a',
    'na',
    'none',
    'null',
    'nil',
    'unknown',
    'unverified',
    '-',
    '--',
    '—',
  ]);

  if (invalid.has(normalized)) return null;
  if (normalized.includes('@')) return null;
  if (normalized.includes('/')) return null;
  if (!/^[a-z0-9._]+$/.test(normalized)) return null;
  if (/^[._]+$/.test(normalized)) return null;

  return normalized;
}

function mapZone(label, sourceList, fallback) {
  const raw = (label || sourceList || '').toLowerCase().trim();
  if (raw.includes('elite'))       return 'ELITE';
  if (raw.includes('influential')) return 'INFLUENTIAL';
  if (raw.includes('ignore'))      return 'IGNORE';
  if (raw.includes('signal'))      return 'SIGNAL';
  return fallback;
}

// Bulk upsert a bucket of rows that all share the same primary handle column.
// Constraint names must match what exists in Supabase (handles_handle_*_key).
async function bulkUpsert(rows, conflictCol) {
  const CHUNK = 500;
  let imported = 0;
  const errors = [];
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error, count } = await supabase
      .from('handles')
      .upsert(rows.slice(i, i + CHUNK), {
        onConflict: conflictCol,
        ignoreDuplicates: false,
        count: 'exact',
      });
    if (error) errors.push(error.message);
    else imported += rows.slice(i, i + CHUNK).length; // count inserts+updates
  }
  return { imported, errors };
}

export async function POST(req) {
  try {
    const { csv, category = 'SIGNAL' } = await req.json();
    if (!csv?.trim()) return NextResponse.json({ error: 'No CSV provided' }, { status: 400 });

    const VALID = new Set(['ELITE','INFLUENTIAL','SIGNAL','IGNORE']);
    const defaultZone = VALID.has(category) ? category : 'SIGNAL';
    const now = new Date().toISOString();

    const rawLines = csv.trim().split('\n').map(l => l.trim().replace(/\r$/, ''));
    const headers  = splitCsvLine(rawLines[0]).map(h => h.trim().toLowerCase().replace(/[^\w ]/g, ''));

    const col = (...names) => {
      for (const n of names) {
        const i = headers.findIndex(h => h.includes(n));
        if (i >= 0) return i;
      }
      return -1;
    };

    const iName   = col('name');
    const iX      = col('x handle', 'twitter handle', 'x_handle', 'twitter_handle');
    const iIg     = col('instagram handle', 'instagram_handle', 'ig handle');
    const iYt     = col('youtube handle', 'youtube_handle');
    const iLi     = col('linkedin handle', 'linkedin_handle');
    const iHandle = col('handle');
    const iPlat   = col('platform');
    const iLabel  = col('label');
    const iSource = col('source list');
    const iBio    = col('bio', 'description');

    const rows = [];
    let skipped = 0;
    let invalidHandles = 0;

    for (let i = 1; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (!line || line.startsWith('#')) continue;
      const parts = splitCsvLine(line).map(p => p.trim().replace(/^["']|["']$/g, ''));
      const get = idx => (idx >= 0 && idx < parts.length ? parts[idx]?.trim() || null : null);

      const name = get(iName);
      const zone = mapZone(get(iLabel), get(iSource), defaultZone);
      const bio  = get(iBio);

      let xH  = sanitizeHandle(get(iX));
      let igH = sanitizeHandle(get(iIg));
      let ytH = sanitizeHandle(get(iYt));
      let liH = sanitizeHandle(get(iLi));

      if (!xH && !igH && !ytH && !liH) {
        const h = sanitizeHandle(get(iHandle));
        const p = (get(iPlat) || 'instagram').toLowerCase().replace('twitter', 'x');
        if (h) {
          if (p === 'x') xH = h;
          else if (p === 'youtube') ytH = h;
          else if (p === 'linkedin') liH = h;
          else igH = h;
        }
      }

      if (!xH && !igH && !ytH && !liH) {
        skipped++;
        if (get(iX) || get(iIg) || get(iYt) || get(iLi) || get(iHandle)) invalidHandles++;
        continue;
      }

      rows.push({ name: name || xH || igH || ytH || liH, bio: bio || null, zone,
        handle_x: xH || null, handle_instagram: igH || null,
        handle_youtube: ytH || null, handle_linkedin: liH || null,
        added_at: now, updated_at: now });
    }

    if (!rows.length) return NextResponse.json({ imported: 0, skipped, errors: 0 });

    // Deduplicate by primary handle — last row wins (keeps most complete data)
    const seen = new Map();
    for (const row of rows) {
      const key = row.handle_x || row.handle_instagram || row.handle_youtube || row.handle_linkedin;
      seen.set(key, row);
    }
    const deduped = [...seen.values()];
    const dupes = rows.length - deduped.length;

    // Bucket by primary platform handle, then bulk upsert each bucket in parallel
    const xRows  = deduped.filter(r => r.handle_x);
    const igRows = deduped.filter(r => !r.handle_x && r.handle_instagram);
    const ytRows = deduped.filter(r => !r.handle_x && !r.handle_instagram && r.handle_youtube);
    const liRows = deduped.filter(r => !r.handle_x && !r.handle_instagram && !r.handle_youtube && r.handle_linkedin);

    const results = await Promise.all([
      xRows.length  ? bulkUpsert(xRows,  'handle_x')         : { imported: 0, errors: [] },
      igRows.length ? bulkUpsert(igRows, 'handle_instagram')  : { imported: 0, errors: [] },
      ytRows.length ? bulkUpsert(ytRows, 'handle_youtube')    : { imported: 0, errors: [] },
      liRows.length ? bulkUpsert(liRows, 'handle_linkedin')   : { imported: 0, errors: [] },
    ]);

    const imported = results.reduce((s, r) => s + r.imported, 0);
    const errors   = [...new Set(results.flatMap(r => r.errors))];

    return NextResponse.json({
      imported, skipped,
      dupes,
      invalidHandles,
      errors: errors.length,
      errorDetails: errors.slice(0, 5),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
