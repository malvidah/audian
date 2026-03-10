import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Looks up Instagram profiles for a batch of handles using the connected
// business account's Instagram Graph API (business_discovery endpoint).
// Returns follower counts, names, verification, and zone assignment.

export async function POST(req) {
  try {
    const { handles } = await req.json();
    if (!handles?.length) return NextResponse.json({ results: [] });

    // Get connected IG token + business account ID
    const { data: conn } = await supabase
      .from('platform_connections')
      .select('access_token, channel_id')
      .eq('platform', 'instagram')
      .order('connected_at', { ascending: false })
      .limit(1)
      .single();

    if (!conn?.access_token) {
      return NextResponse.json({ error: 'No Instagram connection', results: [] });
    }

    // Load ELITE handles for zone detection
    const { data: eliteRows } = await supabase
      .from('handles')
      .select('handle_instagram')
      .eq('zone', 'ELITE')
      .not('handle_instagram', 'is', null);
    const watchSet = new Set((eliteRows || []).map(r => r.handle_instagram.toLowerCase()));

    const results = [];

    for (const handle of handles) {
      const clean = handle.toLowerCase().replace(/^@/, '').trim();
      if (!clean) continue;

      try {
        const res = await fetch(
          `https://graph.facebook.com/v19.0/${conn.channel_id}` +
          `?fields=business_discovery.fields(username,name,followers_count,biography,profile_picture_url,is_business_account,website)` +
          `&username=${encodeURIComponent(clean)}` +
          `&access_token=${conn.access_token}`
        );
        const data = await res.json();
        const p = data.business_discovery;

        if (!p || data.error) {
          // Not found or private — still return the handle so UI can mark it
          results.push({ handle: clean, found: false });
          await new Promise(r => setTimeout(r, 150));
          continue;
        }

        const followers = p.followers_count || 0;
        const onWatchlist = watchSet.has(clean);
        const zone = onWatchlist ? 'ELITE' :
          followers >= 10000 ? 'INFLUENTIAL' : 'SIGNAL';

        results.push({
          handle:      clean,
          name:        p.name || p.username || clean,
          followers,
          verified:    false, // business_discovery doesn't expose verified
          bio:         p.biography?.slice(0, 300) || null,
          avatar:      p.profile_picture_url || null,
          zone,
          on_watchlist: onWatchlist,
          found:       true,
        });

        // Small delay to respect rate limits
        await new Promise(r => setTimeout(r, 200));

      } catch (e) {
        console.error(`Lookup failed for ${clean}:`, e.message);
        results.push({ handle: clean, found: false, error: e.message });
      }
    }

    return NextResponse.json({ results });

  } catch (err) {
    console.error('Enrich lookup error:', err);
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
  }
}
