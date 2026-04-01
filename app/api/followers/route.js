import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/followers?from=2026-01-01&to=2026-03-31&platform=instagram
// Returns follower snapshots from platform_metrics, plus latest count per platform
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const from     = searchParams.get('from') || '2026-01-01';
    const to       = searchParams.get('to')   || new Date().toISOString().slice(0, 10);

    let query = supabaseAdmin
      .from('platform_metrics')
      .select('platform, snapshot_at, followers, subscriber_count:followers')
      .not('followers', 'is', null)
      .gte('snapshot_at', from)
      .lte('snapshot_at', to + 'T23:59:59Z')
      .order('snapshot_at', { ascending: true })
      .limit(2000);

    if (platform && platform !== 'all') {
      query = query.eq('platform', platform);
    }

    const { data: snapshots, error } = await query;
    if (error) throw error;

    // Also fetch latest count per platform from platform_connections
    const { data: connections } = await supabaseAdmin
      .from('platform_connections')
      .select('platform, subscriber_count');

    const latestByPlatform = {};
    for (const c of (connections || [])) {
      if (c.subscriber_count) latestByPlatform[c.platform] = c.subscriber_count;
    }
    // Also check latest snapshot per platform (overrides connection if more recent)
    for (const s of (snapshots || [])) {
      if (s.followers) latestByPlatform[s.platform] = s.followers;
    }

    return NextResponse.json({
      snapshots: snapshots || [],
      latest:    latestByPlatform,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
