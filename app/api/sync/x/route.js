import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    const bearerToken = process.env.X_BEARER_TOKEN;
    if (!bearerToken) {
      return NextResponse.json({ error: 'X_BEARER_TOKEN not set' }, { status: 400 });
    }

    const headers    = { Authorization: `Bearer ${bearerToken}` };
    const query      = encodeURIComponent('(@bigthink OR #bigthink) -is:retweet lang:en');
    const fields     = 'tweet.fields=public_metrics,created_at,author_id,text';
    const expansions = 'expansions=author_id';
    const userFields = 'user.fields=public_metrics,description,verified,profile_image_url,name,username';

    const searchRes = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=20&${fields}&${expansions}&${userFields}`,
      { headers }
    );
    const searchData = await searchRes.json();

    if (searchData.errors || searchData.error) {
      console.error('X search error:', searchData);
      return NextResponse.json({ error: searchData.errors?.[0]?.message || searchData.error }, { status: 400 });
    }

    const tweets = searchData.data || [];
    const users  = Object.fromEntries(
      (searchData.includes?.users || []).map(u => [u.id, u])
    );

    const now = new Date().toISOString();
    let interactionsSaved = 0;

    for (const tweet of tweets) {
      const author    = users[tweet.author_id];
      if (!author) continue;

      const followers      = author.public_metrics?.followers_count || 0;
      const influenceScore = followers > 0
        ? Math.min(100, Math.floor((Math.log10(followers + 1) / Math.log10(1_000_000)) * 100))
        : 0;
      const zone = influenceScore >= 70 ? 'GOLD' : influenceScore >= 40 ? 'CORE' : 'WATCH';

      if (followers < 1000) continue;

      // Upsert handle
      const { data: existing } = await supabaseAdmin
        .from('handles')
        .select('id')
        .eq('handle_x', author.username)
        .maybeSingle();

      let handleId = existing?.id;

      if (!handleId) {
        const { data: created } = await supabaseAdmin.from('handles').insert({
          name:        author.name,
          bio:         author.description,
          avatar_url:  author.profile_image_url,
          handle_x:    author.username,
          followers_x: followers,
          verified_x:  author.verified || false,
          zone,
          added_at:    now,
          updated_at:  now,
        }).select('id').single();
        handleId = created?.id;
      } else {
        await supabaseAdmin.from('handles')
          .update({ followers_x: followers, zone, updated_at: now })
          .eq('id', handleId);
      }

      if (!handleId) continue;

      await supabaseAdmin.from('interactions').insert({
        handle_id:        handleId,
        platform:         'x',
        interaction_type: 'mention',
        content:          tweet.text,
        interacted_at:    tweet.created_at,
        synced_at:        now,
      });
      interactionsSaved++;
    }

    const totalImpressions = tweets.reduce((s, t) => s + (t.public_metrics?.impression_count || 0), 0);
    const totalLikes       = tweets.reduce((s, t) => s + (t.public_metrics?.like_count || 0), 0);

    await supabaseAdmin.from('platform_metrics').insert({
      platform:    'x',
      snapshot_at: now,
      total_views: totalImpressions,
      likes:       totalLikes,
    });

    return NextResponse.json({
      success:            true,
      tweets_found:       tweets.length,
      interactions_saved: interactionsSaved,
    });
  } catch (err) {
    console.error('X sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
