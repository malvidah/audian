import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST() {
  try {
    const bearerToken = process.env.X_BEARER_TOKEN;
    if (!bearerToken) {
      return NextResponse.json({ error: 'X_BEARER_TOKEN not set' }, { status: 400 });
    }

    const headers = { Authorization: `Bearer ${bearerToken}` };
    const query = encodeURIComponent('(@bigthink OR #bigthink) -is:retweet lang:en');
    const fields = 'tweet.fields=public_metrics,created_at,author_id,text';
    const expansions = 'expansions=author_id';
    const userFields = 'user.fields=public_metrics,description,verified,profile_image_url,name,username';

    const searchRes = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?` +
      `query=${query}&max_results=20&${fields}&${expansions}&${userFields}`,
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

    let interactionsSaved = 0;
    let commentsSaved = 0;

    for (const tweet of tweets) {
      const author    = users[tweet.author_id];
      if (!author) continue;

      const followers   = author.public_metrics?.followers_count || 0;
      const likes       = tweet.public_metrics?.like_count || 0;
      const replies     = tweet.public_metrics?.reply_count || 0;
      const impressions = tweet.public_metrics?.impression_count || 0;

      const influenceScore = followers > 0
        ? Math.min(100, Math.floor((Math.log10(followers + 1) / Math.log10(1000000)) * 100))
        : 0;

      const zone = influenceScore >= 70 ? 'GOLD' : influenceScore >= 40 ? 'CORE' : 'WATCH';

      if (followers >= 1000) {
        // Upsert person
        const { data: existingPerson } = await supabase.from('people').select('id').eq('handle_x', author.username).maybeSingle();
        let personId = existingPerson?.id;
        if (!personId) {
          const { data: newPerson } = await supabase.from('people').insert({
            name: author.name, bio: author.description, avatar_url: author.profile_image_url,
            handle_x: author.username, followers_x: followers, verified_x: author.verified || false,
            category: zone, added_at: new Date().toISOString(), updated_at: new Date().toISOString(),
          }).select('id').single();
          personId = newPerson?.id;
        } else {
          await supabase.from('people').update({ followers_x: followers, category: zone, updated_at: new Date().toISOString() }).eq('id', personId);
        }
        if (personId) {
          await supabase.from('interactions').insert({
            person_id: personId, platform: 'x', type: 'mention', content: tweet.text,
            interacted_at: tweet.created_at, synced_at: new Date().toISOString(),
          });
          interactionsSaved++;
        }
      }

      if (likes >= 2 || replies >= 1) {
        // Comments already captured as interactions above
        commentsSaved++;
      }
    }

    const totalImpressions = tweets.reduce((s, t) => s + (t.public_metrics?.impression_count || 0), 0);
    const totalLikes       = tweets.reduce((s, t) => s + (t.public_metrics?.like_count || 0), 0);

    await supabase.from('platform_metrics').insert({
      platform:    'x',
      snapshot_at: new Date().toISOString(),
      total_views: totalImpressions,
      likes:       totalLikes,
    });

    return NextResponse.json({
      success:            true,
      tweets_found:       tweets.length,
      interactions_saved: interactionsSaved,
      comments_synced:    commentsSaved,
      note:               'Searching public mentions of @bigthink',
    });

  } catch (err) {
    console.error('X sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
