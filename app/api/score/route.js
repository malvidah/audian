import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

// ── Scoring formula ───────────────────────────────────────────────────────────
// Returns 0–100 influence score
function computeScore({ subscribers, commentLikes = 0, replyCount = 0, contentLength = 0 }) {
  // Follower/subscriber tier (0–60 pts)
  let followerScore = 0;
  if (subscribers >= 1000000)     followerScore = 60;
  else if (subscribers >= 100000) followerScore = 50;
  else if (subscribers >= 10000)  followerScore = 38;
  else if (subscribers >= 1000)   followerScore = 24;
  else if (subscribers >= 100)    followerScore = 12;
  else                             followerScore = 4;

  // Engagement on their comment (0–25 pts)
  const engScore = Math.min(25, Math.floor((commentLikes * 3 + replyCount * 5) / 2));

  // Content quality proxy: longer thoughtful comments score higher (0–15 pts)
  const qualityScore = Math.min(15, Math.floor(contentLength / 20));

  return Math.min(100, followerScore + engScore + qualityScore);
}

function getZone(score) {
  if (score >= 70) return 'GOLD';
  if (score >= 40) return 'CORE';
  return 'RADAR';
}

export async function POST() {
  try {
    const results = { youtube: 0, instagram: 0, total: 0 };

    // ── YOUTUBE: look up channel stats for commenters ─────────────────────────
    const { data: ytComments } = await supabase
      .from('platform_comments')
      .select('*')
      .eq('platform', 'youtube')
      .not('author_channel_url', 'is', null)
      .order('likes', { ascending: false })
      .limit(50);

    if (ytComments?.length > 0) {
      // Extract unique channel IDs from URLs
      const channelMap = {};
      ytComments.forEach(c => {
        if (!c.author_channel_url) return;
        // URL format: https://www.youtube.com/channel/UCxxxxx OR /user/name
        const match = c.author_channel_url.match(/channel\/(UC[A-Za-z0-9_-]+)/);
        if (match) channelMap[c.author_name] = { id: match[1], comments: [] };
      });
      ytComments.forEach(c => {
        if (channelMap[c.author_name]) channelMap[c.author_name].comments.push(c);
      });

      const channelIds = Object.values(channelMap).map(v => v.id).filter(Boolean);

      // Batch fetch channel stats (YouTube allows up to 50 per request)
      if (channelIds.length > 0) {
        const { data: ytConn } = await supabase.from('platform_connections').select('access_token, refresh_token, expires_at').eq('platform', 'youtube').single();

        if (ytConn) {
          let accessToken = ytConn.access_token;

          // Refresh if needed
          if (new Date(ytConn.expires_at) < new Date()) {
            const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                refresh_token: ytConn.refresh_token,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                grant_type: 'refresh_token',
              }),
            });
            const refreshData = await refreshRes.json();
            if (refreshData.access_token) {
              accessToken = refreshData.access_token;
              await supabase.from('platform_connections').update({
                access_token: accessToken,
                expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
              }).eq('platform', 'youtube');
            }
          }

          // Fetch in batches of 50
          for (let i = 0; i < channelIds.length; i += 50) {
            const batch = channelIds.slice(i, i + 50);
            const statsRes = await fetch(
              `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${batch.join(',')}&maxResults=50`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const statsData = await statsRes.json();

            for (const ch of (statsData.items || [])) {
              const subscribers = parseInt(ch.statistics?.subscriberCount || 0);
              const authorName = Object.keys(channelMap).find(name => channelMap[name].id === ch.id);
              if (!authorName) continue;

              const comments = channelMap[authorName].comments;
              const bestComment = comments.sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
              if (!bestComment) continue;

              const score = computeScore({
                subscribers,
                commentLikes: bestComment.likes || 0,
                replyCount: bestComment.reply_count || 0,
                contentLength: bestComment.content?.length || 0,
              });

              if (score < 8) continue; // Skip very low scores

              await supabase.from('platform_interactions').upsert({
                platform:         'youtube',
                handle:           authorName,
                name:             ch.snippet?.title || authorName,
                followers:        subscribers,
                avatar_url:       ch.snippet?.thumbnails?.default?.url,
                interaction_type: 'comment',
                content:          bestComment.content?.slice(0, 500),
                influence_score:  score,
                zone:             getZone(score),
                interacted_at:    bestComment.published_at,
                synced_at:        new Date().toISOString(),
              }, { onConflict: 'platform,handle,content' });

              results.youtube++;
            }
          }
        }
      }
    }

    // ── INSTAGRAM: AI-assisted name recognition for top commenters ────────────
    const { data: igComments } = await supabase
      .from('platform_comments')
      .select('*')
      .eq('platform', 'instagram')
      .order('published_at', { ascending: false })
      .limit(60);

    if (igComments?.length > 0) {
      // Deduplicate by author
      const byAuthor = {};
      igComments.forEach(c => {
        if (!byAuthor[c.author_name]) byAuthor[c.author_name] = [];
        byAuthor[c.author_name].push(c);
      });

      const authorList = Object.entries(byAuthor).map(([name, comments]) => ({
        handle: name,
        commentCount: comments.length,
        sample: comments[0].content?.slice(0, 150),
        postTitle: comments[0].video_title?.slice(0, 60),
      }));

      // Ask Claude to identify potentially notable accounts
      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: `You identify potentially influential or notable Instagram accounts based on their handle and comment quality.

Score each account 0-100 for likely influence. Consider:
- Handle patterns suggesting professionals, brands, journalists, academics, creators (e.g. @drXXX, @profXXX, company names, verified-style handles)
- Comment sophistication, domain expertise, thoughtfulness
- Multiple comments = engaged audience member

Respond ONLY with valid JSON array:
[{"handle": "...", "score": 0-100, "reason": "one phrase", "likely_type": "creator|journalist|academic|brand|professional|public|unknown"}]

Only include handles with score >= 20. Be conservative.`,
          messages: [{
            role: 'user',
            content: `Score these Instagram commenters for influence potential:\n\n${JSON.stringify(authorList, null, 2)}`,
          }],
        }),
      });

      const aiData = await aiRes.json();
      const raw = aiData.content?.[0]?.text || '[]';

      let scored = [];
      try {
        const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        scored = JSON.parse(clean);
      } catch { scored = []; }

      for (const s of scored) {
        if (s.score < 20) continue;
        const comments = byAuthor[s.handle] || [];
        const best = comments.sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0))[0];
        if (!best) continue;

        await supabase.from('platform_interactions').upsert({
          platform:         'instagram',
          handle:           s.handle,
          name:             s.handle,
          followers:        null, // Not available via Instagram API
          interaction_type: 'comment',
          content:          best.content?.slice(0, 500),
          influence_score:  s.score,
          zone:             getZone(s.score),
          interacted_at:    best.published_at,
          synced_at:        new Date().toISOString(),
        }, { onConflict: 'platform,handle,content' });

        results.instagram++;
      }
    }

    results.total = results.youtube + results.instagram;

    return NextResponse.json({
      success: true,
      scored: results,
      message: `Scored ${results.total} interactions (${results.youtube} YouTube, ${results.instagram} Instagram)`,
    });

  } catch (err) {
    console.error('Score error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
