import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/followers?from=2026-01-01&to=2026-03-31&platform=instagram
// Returns follower snapshots from platform_metrics, plus latest count per platform
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const from     = searchParams.get('from');
    const to       = searchParams.get('to');

    let query = supabaseAdmin
      .from('platform_metrics')
      .select('platform, snapshot_at, followers, subscriber_count:followers')
      .not('followers', 'is', null)
      .order('snapshot_at', { ascending: true })
      .limit(2000);

    if (from) query = query.gte('snapshot_at', from);
    if (to)   query = query.lte('snapshot_at', to + 'T23:59:59Z');

    if (platform && platform !== 'all') {
      query = query.eq('platform', platform);
    }

    const { data: snapshots, error } = await query;
    if (error) throw error;

    // Keep only the latest snapshot per platform per UTC day.
    // Multiple syncs in one day should replace the earlier point, not stack.
    const dedupedByDay = new Map();
    for (const row of (snapshots || [])) {
      const day = row.snapshot_at?.slice(0, 10);
      if (!day) continue;
      const key = `${row.platform}:${day}`;
      const existing = dedupedByDay.get(key);
      if (!existing || new Date(row.snapshot_at) > new Date(existing.snapshot_at)) {
        dedupedByDay.set(key, row);
      }
    }
    const dedupedSnapshots = [...dedupedByDay.values()]
      .sort((a, b) => new Date(a.snapshot_at) - new Date(b.snapshot_at));

    // Also fetch latest count per platform from platform_connections
    const { data: connections } = await supabaseAdmin
      .from('platform_connections')
      .select('platform, subscriber_count');

    const latestByPlatform = {};
    for (const c of (connections || [])) {
      if (c.subscriber_count) latestByPlatform[c.platform] = c.subscriber_count;
    }
    // Also check latest snapshot per platform (overrides connection if more recent)
    for (const s of dedupedSnapshots) {
      if (s.followers) latestByPlatform[s.platform] = s.followers;
    }

    return NextResponse.json({
      snapshots: dedupedSnapshots,
      latest:    latestByPlatform,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
