import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

// Niche keywords that signal a curious/science/culture audience
const NICHE_SIGNALS = [
  'neuroscience','psychology','science','research','study','brain','cognitive',
  'fascinating','curious','interesting','mind','theory','philosophy','evolution',
  'data','analysis','podcast','author','professor','phd','dr ','scientist',
  'journalist','writer','educator','ted','kurzgesagt','veritasium',
];

function nicheScore(text = '', handle = '') {
  const lower = (text + ' ' + handle).toLowerCase();
  return NICHE_SIGNALS.filter(k => lower.includes(k)).length;
}

function computeScore({ commentLikes = 0, replyCount = 0, commentCount = 1, contentLength = 0, niche = 0, ytSubscribers = 0 }) {
  // YouTube subscribers if available (0–50 pts)
  let subScore = 0;
  if (ytSubscribers >= 1000000)     subScore = 50;
  else if (ytSubscribers >= 100000) subScore = 40;
  else if (ytSubscribers >= 10000)  subScore = 28;
  else if (ytSubscribers >= 1000)   subScore = 16;
  else if (ytSubscribers >= 100)    subScore = 8;

  // Comment engagement (0–25 pts)
  const engScore = Math.min(25, (commentLikes * 4) + (replyCount * 6));

  // Repeat commenter signal — engaged audience member (0–10 pts)
  const repeatScore = Math.min(10, (commentCount - 1) * 4);

  // Comment quality proxy: length (0–10 pts)
  const qualityScore = Math.min(10, Math.floor(contentLength / 25));

  // Niche alignment (0–15 pts)
  const nicheBonus = Math.min(15, niche * 5);

  return Math.min(100, subScore + engScore + repeatScore + qualityScore + nicheBonus);
}

function getZone(score) {
  if (score >= 60) return 'GOLD';
  if (score >= 30) return 'CORE';
  return 'RADAR';
}

export async function POST() {
  try {
    const results = { youtube: 0, instagram: 0, total: 0 };

    // ── YOUTUBE ───────────────────────────────────────────────────────────────
    const { data: ytComments } = await supabase
      .from('platform_comments')
      .select('*')
      .eq('platform', 'youtube')
      .order('likes', { ascending: false })
      .limit(100);

    if (ytComments?.length > 0) {
      // Group by author
      const byAuthor = {};
      ytComments.forEach(c => {
        if (!byAuthor[c.author_name]) byAuthor[c.author_name] = [];
        byAuthor[c.author_name].push(c);
      });

      // Extract channel IDs
      const channelMap = {};
      ytComments.forEach(c => {
        if (!c.author_channel_url) return;
        const match = c.author_channel_url.match(/channel\/(UC[A-Za-z0-9_-]+)/);
        if (match) channelMap[c.author_name] = match[1];
      });

      // Fetch subscriber counts for known channel IDs
      const subCounts = {};
      const channelIds = Object.values(channelMap).filter(Boolean);
      if (channelIds.length > 0) {
        const { data: ytConn } = await supabase
          .from('platform_connections')
          .select('access_token, refresh_token, expires_at')
          .eq('platform', 'youtube')
          .order('connected_at', { ascending: false })
          .limit(1);

        const conn = ytConn?.[0];
        if (conn) {
          let token = conn.access_token;
          if (new Date(conn.expires_at) < new Date()) {
            const r = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({ refresh_token: conn.refresh_token, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, grant_type: 'refresh_token' }),
            });
            const rd = await r.json();
            if (rd.access_token) {
              token = rd.access_token;
              await supabase.from('platform_connections').update({ access_token: token, expires_at: new Date(Date.now() + rd.expires_in * 1000).toISOString() }).eq('platform', 'youtube');
            }
          }

          for (let i = 0; i < channelIds.length; i += 50) {
            const batch = channelIds.slice(i, i + 50);
            const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${batch.join(',')}&maxResults=50`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            for (const ch of (data.items || [])) {
              const name = Object.keys(channelMap).find(n => channelMap[n] === ch.id);
              if (name) subCounts[name] = parseInt(ch.statistics?.subscriberCount || 0);
            }
          }
        }
      }

      // Score each unique commenter
      for (const [authorName, comments] of Object.entries(byAuthor)) {
        const best = comments.sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
        const allText = comments.map(c => c.content || '').join(' ');
        const niche = nicheScore(allText, authorName);

        const score = computeScore({
          commentLikes: best.likes || 0,
          replyCount: best.reply_count || 0,
          commentCount: comments.length,
          contentLength: best.content?.length || 0,
          niche,
          ytSubscribers: subCounts[authorName] || 0,
        });

        if (score < 8) continue;

        const channelUrl = best.author_channel_url;
        await supabase.from('platform_interactions').upsert({
          platform:         'youtube',
          handle:           authorName,
          name:             authorName,
          followers:        subCounts[authorName] || null,
          interaction_type: 'comment',
          content:          best.content?.slice(0, 500),
          influence_score:  score,
          zone:             getZone(score),
          profile_url:      channelUrl || null,
          comment_count:    comments.length,
          interacted_at:    best.published_at,
          synced_at:        new Date().toISOString(),
        }, { onConflict: 'platform,handle,content' });

        results.youtube++;
      }
    }

    // ── INSTAGRAM ─────────────────────────────────────────────────────────────
    const { data: igComments } = await supabase
      .from('platform_comments')
      .select('*')
      .eq('platform', 'instagram')
      .order('published_at', { ascending: false })
      .limit(100);

    if (igComments?.length > 0) {
      const byAuthor = {};
      igComments.forEach(c => {
        if (!byAuthor[c.author_name]) byAuthor[c.author_name] = [];
        byAuthor[c.author_name].push(c);
      });

      for (const [handle, comments] of Object.entries(byAuthor)) {
        const best = comments.sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0))[0];
        const allText = comments.map(c => c.content || '').join(' ');
        const niche = nicheScore(allText, handle);

        const score = computeScore({
          commentLikes: 0,  // IG API doesn't return comment likes
          commentCount: comments.length,
          contentLength: best.content?.length || 0,
          niche,
        });

        if (score < 5) continue;

        await supabase.from('platform_interactions').upsert({
          platform:         'instagram',
          handle,
          name:             handle,
          followers:        null,  // Not available via API — user vets manually
          interaction_type: 'comment',
          content:          best.content?.slice(0, 500),
          influence_score:  score,
          zone:             getZone(score),
          profile_url:      `https://instagram.com/${handle}`,
          comment_count:    comments.length,
          interacted_at:    best.published_at,
          synced_at:        new Date().toISOString(),
        }, { onConflict: 'platform,handle,content' });

        results.instagram++;
      }
    }

    results.total = results.youtube + results.instagram;
    return NextResponse.json({ success: true, scored: results, message: `Scored ${results.total} interactions (${results.youtube} YouTube, ${results.instagram} Instagram)` });

  } catch (err) {
    console.error('Score error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
