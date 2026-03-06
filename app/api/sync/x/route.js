import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function refreshXToken(refreshToken) {
  const creds = Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${creds}` },
    body: new URLSearchParams({ refresh_token: refreshToken, grant_type: 'refresh_token' }),
  });
  return res.json();
}

export async function POST() {
  try {
    const { data: conn, error } = await supabase
      .from('platform_connections').select('*').eq('platform', 'x').single();

    if (error || !conn) return NextResponse.json({ error: 'X not connected' }, { status: 400 });

    let accessToken = conn.access_token;
    if (conn.expires_at && new Date(conn.expires_at) < new Date()) {
      const refreshed = await refreshXToken(conn.refresh_token);
      if (refreshed.access_token) {
        accessToken = refreshed.access_token;
        await supabase.from('platform_connections').update({
          access_token: accessToken,
          refresh_token: refreshed.refresh_token || conn.refresh_token,
          expires_at: refreshed.expires_in ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString() : null,
        }).eq('platform', 'x');
      }
    }

    const headers = { Authorization: `Bearer ${accessToken}` };

    const userRes = await fetch(
      `https://api.twitter.com/2/users/${conn.channel_id}?user.fields=public_metrics,description`,
      { headers }
    );
    const userData = await userRes.json();
    const user     = userData.data;

    const tweetsRes = await fetch(
      `https://api.twitter.com/2/users/${conn.channel_id}/tweets?max_results=20&tweet.fields=public_metrics,created_at`,
      { headers }
    );
    const tweetsData = await tweetsRes.json();
    const tweets     = tweetsData.data || [];

    await supabase.from('platform_metrics').insert({
      platform:    'x',
      snapshot_at: new Date().toISOString(),
      followers:   user?.public_metrics?.followers_count,
      total_views: tweets.reduce((s, t) => s + (t.public_metrics?.impression_count || 0), 0),
    });

    const mentionsRes = await fetch(
      `https://api.twitter.com/2/users/${conn.channel_id}/mentions?max_results=20&tweet.fields=public_metrics,created_at&expansions=author_id&user.fields=public_metrics,description,verified`,
      { headers }
    );
    const mentionsData = await mentionsRes.json();
    const mentions     = mentionsData.data || [];
    const mentionUsers = Object.fromEntries((mentionsData.includes?.users || []).map(u => [u.id, u]));

    let interactionsSaved = 0;
    for (const mention of mentions) {
      const author    = mentionUsers[mention.author_id];
      if (!author) continue;
      const followers = author.public_metrics?.followers_count || 0;
      if (followers < 1000) continue;
      const influenceScore = Math.min(100, Math.floor((Math.log10(followers + 1) / Math.log10(1000000)) * 100));
      await supabase.from('platform_interactions').upsert({
        platform:         'x',
        handle:           author.username,
        name:             author.name,
        followers,
        bio:              author.description,
        verified:         author.verified || false,
        interaction_type: 'mention',
        content:          mention.text,
        influence_score:  influenceScore,
        zone:             influenceScore >= 70 ? 'GOLD' : influenceScore >= 40 ? 'CORE' : 'WATCH',
        interacted_at:    mention.created_at,
        synced_at:        new Date().toISOString(),
      }, { onConflict: 'platform,handle,content' });
      interactionsSaved++;
    }

    return NextResponse.json({ success: true, followers: user?.public_metrics?.followers_count, tweets_synced: tweets.length, comments_synced: interactionsSaved });
  } catch (err) {
    console.error('X sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
