import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const ZONE_RANK = { ELITE: 0, INFLUENTIAL: 1, SIGNAL: 2, IGNORE: 3 };
const PLATFORMS = ['x', 'instagram', 'youtube', 'linkedin'];

function bestZone(a, b) {
  return (ZONE_RANK[a] ?? 99) <= (ZONE_RANK[b] ?? 99) ? a : b;
}

// Pick the most complete value (prefer non-empty, longer)
function pick(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a.length >= b.length ? a : b;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run !== false; // default to dry run for safety

    const { data: allHandles, error } = await supabase
      .from('handles')
      .select('*')
      .order('added_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Build match groups: handles that share a name or any platform handle
    // Use union-find to cluster them
    const parent = {};
    const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    const union = (a, b) => { parent[find(a)] = find(b); };

    for (const h of allHandles) parent[h.id] = h.id;

    // Index by name and platform handles
    const byName = {};
    const byPlatHandle = {};

    for (const h of allHandles) {
      // Match by name (case-insensitive, trimmed)
      const normName = (h.name || '').trim().toLowerCase();
      if (normName) {
        if (byName[normName]) {
          union(h.id, byName[normName]);
        } else {
          byName[normName] = h.id;
        }
      }

      // Match by platform handles
      for (const p of PLATFORMS) {
        const handle = (h[`handle_${p}`] || '').trim().toLowerCase();
        if (!handle) continue;
        const key = `${p}:${handle}`;
        if (byPlatHandle[key]) {
          union(h.id, byPlatHandle[key]);
        } else {
          byPlatHandle[key] = h.id;
        }
      }
    }

    // Group handles by their root
    const groups = {};
    for (const h of allHandles) {
      const root = find(h.id);
      if (!groups[root]) groups[root] = [];
      groups[root].push(h);
    }

    // Filter to only groups with duplicates
    const dupeGroups = Object.values(groups).filter(g => g.length > 1);

    if (dupeGroups.length === 0) {
      return NextResponse.json({ message: 'No duplicates found', merged: 0 });
    }

    const mergeLog = [];

    for (const group of dupeGroups) {
      // Pick primary: prefer the one with the best zone, most data
      group.sort((a, b) => {
        const zDiff = (ZONE_RANK[a.zone] ?? 99) - (ZONE_RANK[b.zone] ?? 99);
        if (zDiff !== 0) return zDiff;
        // Prefer the one with more filled fields
        const filledA = Object.values(a).filter(v => v != null && v !== '').length;
        const filledB = Object.values(b).filter(v => v != null && v !== '').length;
        return filledB - filledA;
      });

      const primary = group[0];
      const dupes = group.slice(1);

      // Merge all data into primary
      const merged = {};
      for (const dupe of dupes) {
        merged.name = pick(primary.name, dupe.name);
        merged.bio = pick(primary.bio, dupe.bio);
        merged.zone = bestZone(primary.zone || 'SIGNAL', dupe.zone || 'SIGNAL');
        merged.avatar_url = pick(primary.avatar_url, dupe.avatar_url);
        merged.followed_by = primary.followed_by || dupe.followed_by;

        for (const p of PLATFORMS) {
          const hKey = `handle_${p}`;
          const fKey = `followers_${p}`;
          const vKey = `verified_${p}`;
          if (!primary[hKey] && dupe[hKey]) merged[hKey] = dupe[hKey];
          if ((dupe[fKey] || 0) > (primary[fKey] || 0)) merged[fKey] = dupe[fKey];
          if (dupe[vKey] && !primary[vKey]) merged[vKey] = dupe[vKey];
        }
      }

      // Only include fields that actually change
      const updates = {};
      for (const [k, v] of Object.entries(merged)) {
        if (v != null && v !== '' && v !== primary[k]) updates[k] = v;
      }

      const dupeIds = dupes.map(d => d.id);
      const dupeNames = dupes.map(d => d.name || d.id);

      mergeLog.push({
        primary: { id: primary.id, name: primary.name },
        merged: dupeNames,
        updates: Object.keys(updates),
        interactions_moved: 0,
      });

      if (!dryRun) {
        // Update primary handle with merged data
        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
          await supabase.from('handles').update(updates).eq('id', primary.id);
        }

        // Re-point all interactions from dupes to primary
        for (const dupeId of dupeIds) {
          const { data: moved } = await supabase
            .from('interactions')
            .update({ handle_id: primary.id })
            .eq('handle_id', dupeId)
            .select('id');
          mergeLog[mergeLog.length - 1].interactions_moved += (moved?.length || 0);
        }

        // Delete dupe handles
        await supabase.from('handles').delete().in('id', dupeIds);
      }
    }

    return NextResponse.json({
      dry_run: dryRun,
      message: dryRun
        ? `Found ${dupeGroups.length} duplicate groups. Run with dry_run: false to merge.`
        : `Merged ${dupeGroups.length} duplicate groups.`,
      groups: dupeGroups.length,
      merges: mergeLog,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
