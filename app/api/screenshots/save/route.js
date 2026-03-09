import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { interactions } = await req.json();
    if (!interactions?.length) return NextResponse.json({ saved: 0 });

    // Load watchlist for zone correction
    const { data: wlRows } = await supabase.from('watchlist').select('platform,handle');
    const watchSet = new Set((wlRows || []).map(r => `${r.platform}:${r.handle.toLowerCase().replace(/^@/, '')}`));
    const isWatched = (platform, handle) =>
      watchSet.has(`${platform}:${(handle || '').toLowerCase().replace(/^@/, '')}`);

    const now = new Date().toISOString();
    let saved = 0;
    const errors = [];

    for (const item of interactions) {
      if (!item.handle) continue;

      const watched = isWatched(item.platform || 'instagram', item.handle);
      // Follower count is the primary zone signal. Verified alone means nothing without audience.
      const followers = item.followers || 0;
      const zone = watched ? 'ELITE' :
        followers >= 10000 ? 'INFLUENTIAL' :
        (item.verified && followers >= 1000) ? 'INFLUENTIAL' :
        'SIGNAL';

      // Compute influence score
      const followerPts = !item.followers ? 5 :
        item.followers >= 1_000_000 ? 60 :
        item.followers >= 500_000   ? 52 :
        item.followers >= 100_000   ? 42 :
        item.followers >= 50_000    ? 34 :
        item.followers >= 10_000    ? 26 :
        item.followers >= 1_000     ? 16 :
        item.followers >= 100       ? 8  : 3;
      const verifiedBonus = item.verified ? 15 : 0;
      const score = watched ? 85 : Math.min(100, followerPts + verifiedBonus);

      // Merge with existing
      const { data: existing } = await supabase
        .from('platform_interactions')
        .select('interaction_type, influence_score, comment_count')
        .eq('platform', item.platform || 'instagram')
        .eq('handle', item.handle)
        .single();

      const existingTypes = existing?.interaction_type
        ? existing.interaction_type.split(',')
        : [];
      const newType = item.interaction_type || 'unknown';
      const allTypes = [...new Set([...existingTypes, newType])].join(',');
      const finalScore = Math.max(score, existing?.influence_score || 0);

      const { error } = await supabase.from('platform_interactions').upsert({
        platform:         item.platform || 'instagram',
        handle:           item.handle,
        name:             item.name || item.handle,
        followers:        item.followers || null,
        verified:         item.verified || false,
        interaction_type: allTypes,
        content:          item.content?.slice(0, 500) || null,
        influence_score:  watched ? Math.max(finalScore, 80) : finalScore,
        zone,
        profile_url:      `https://instagram.com/${item.handle}`,
        on_watchlist:     watched,
        comment_count:    (existing?.comment_count || 0) + (newType === 'comment' ? 1 : 0),
        interacted_at:    now,
        synced_at:        now,
      }, { onConflict: 'platform,handle' });

      if (error) errors.push(`${item.handle}: ${error.message}`);
      else {
        saved++;
        // If marked ELITE, add to watchlist so it persists for future imports
        if (zone === 'ELITE') {
          await supabase.from('watchlist').upsert({
            platform: item.platform || 'instagram',
            handle:   item.handle.toLowerCase().replace(/^@/, ''),
            label:    item.name || item.handle,
          }, { onConflict: 'platform,handle' });
        }
      }
    }

    return NextResponse.json({ saved, errors: errors.length, message: `Saved ${saved} interactions` });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
