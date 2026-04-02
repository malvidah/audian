import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST /api/followers/import
// Body: { platform: "youtube", csv: "Date,Subscribers\n2026-01-02,8478895\n..." }
// Accepts any CSV with a date column and a followers/subscribers/count column.
// Upserts into platform_metrics — existing rows for the same platform+day are replaced.
export async function POST(request) {
  try {
    const { platform, csv } = await request.json();

    if (!platform || !csv) {
      return NextResponse.json({ error: 'platform and csv are required' }, { status: 400 });
    }

    const lines = csv.trim().split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have a header row and at least one data row' }, { status: 400 });
    }

    // Parse header — find the date column and the value column
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));

    const dateIdx = headers.findIndex(h =>
      h === 'date' || h === 'day' || h === 'timestamp' || h === 'snapshot_at' || h.includes('date')
    );
    const valIdx = headers.findIndex(h =>
      h === 'subscribers' || h === 'followers' || h === 'subscriber_count' ||
      h === 'follower_count' || h === 'count' || h === 'total' ||
      h.includes('subscriber') || h.includes('follower') || h.includes('count')
    );

    if (dateIdx === -1) return NextResponse.json({ error: 'Could not find a date column in the CSV' }, { status: 400 });
    if (valIdx  === -1) return NextResponse.json({ error: 'Could not find a subscribers/followers column in the CSV' }, { status: 400 });

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const rawDate = cols[dateIdx];
      const rawVal  = cols[valIdx];
      if (!rawDate || !rawVal) continue;

      // Parse date — accept YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY (best-effort)
      let isoDate = null;
      if (/^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
        isoDate = rawDate.slice(0, 10); // already ISO
      } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawDate)) {
        const [m, d, y] = rawDate.split('/');
        isoDate = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
      }
      if (!isoDate) continue;

      const count = parseInt(rawVal.replace(/[^0-9]/g, ''), 10);
      if (isNaN(count) || count <= 0) continue;

      rows.push({
        platform,
        snapshot_at: `${isoDate}T12:00:00Z`,
        followers:   count,
      });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid rows found in CSV' }, { status: 400 });
    }

    // Delete existing rows for this platform on the same dates, then insert fresh
    const dates = [...new Set(rows.map(r => r.snapshot_at.slice(0, 10)))];
    for (const d of dates) {
      await supabaseAdmin
        .from('platform_metrics')
        .delete()
        .eq('platform', platform)
        .gte('snapshot_at', `${d}T00:00:00Z`)
        .lte('snapshot_at', `${d}T23:59:59Z`);
    }

    // Insert in batches of 200
    let inserted = 0;
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await supabaseAdmin
        .from('platform_metrics')
        .insert(rows.slice(i, i + 200));
      if (error) throw error;
      inserted += Math.min(200, rows.length - i);
    }

    return NextResponse.json({ inserted, platform, rows: rows.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
