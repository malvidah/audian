import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Enriches top SIGNAL accounts using the connected IG access token to
// look up public profile data. No Apify credits needed.
// Prioritizes: repeat commenters first, then alphabetical.
// Called by Score Now after rescoring.

export async function POST() {
  const { data: conn } = await supabase
    .from('platform_connections')
    .select('access_token, channel_id')
    .eq('platform', 'instagram')
    .order('connected_at', { ascending: false })
    .limit(1)
    .single();

  if (!conn?.access_token) {
    return NextResponse.json({ ok: false, message: 'No Instagram connection' });
  }

  // Get SIGNAL accounts with multiple comments but no follower data — most likely to be real people
  const { data: toEnrich } = await supabase
    .from('platform_interactions')
    .select('handle, comment_count, followers')
    .eq('platform', 'instagram')
    .eq('zone', 'SIGNAL')
    .is('followers', null)
    .order('comment_count', { ascending: false })
    .limit(20); // Stay well within rate limits

  if (!toEnrich?.length) return NextResponse.json({ ok: true, enriched: 0, message: 'Nothing to enrich' });

  let enriched = 0;
  const errors = [];

  for (const row of toEnrich) {
    try {
      // Use IG Basic Display API user search via the page token
      // This looks up basic profile info for a username using the connected token
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${conn.channel_id}?fields=business_discovery.fields(id,username,followers_count,biography,profile_picture_url,is_verified)&username=${encodeURIComponent(row.handle)}&access_token=${conn.access_token}`
      );
      const data = await res.json();
      const profile = data.business_discovery;

      if (!profile || data.error) {
        errors.push(row.handle);
        continue;
      }

      const followers = profile.followers_count || 0;
      const zone = followers >= 10000 ? 'INFLUENTIAL' : 'SIGNAL';

      await supabase.from('platform_interactions')
        .update({
          followers,
          bio:       profile.biography?.slice(0, 300) || null,
          avatar_url: profile.profile_picture_url || null,
          verified:  profile.is_verified || false,
          zone,
        })
        .eq('platform', 'instagram')
        .eq('handle', row.handle);

      enriched++;

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      errors.push(`${row.handle}: ${e.message}`);
    }
  }

  return NextResponse.json({
    ok: true,
    enriched,
    errors: errors.length,
    message: `Enriched ${enriched} profiles${errors.length ? ` · ${errors.length} failed` : ''}`,
  });
}
