import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const BASE = 'https://www.googleapis.com/youtube/v3';

// ── Token refresh ────────────────────────────────────────────────────────────
async function getAccessToken(conn) {
  if (!conn.expires_at || new Date(conn.expires_at) > new Date()) {
    return conn.access_token;
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token:  conn.refresh_token,
      client_id:      process.env.GOOGLE_CLIENT_ID,
      client_secret:  process.env.GOOGLE_CLIENT_SECRET,
      grant_type:     'refresh_token',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Token refresh failed: ' + JSON.stringify(data));
  await supabase.from('platform_connections').update({
    access_token: data.access_token,
    expires_at:   new Date(Date.now() + data.expires_in * 1000).toISOString(),
  }).eq('platform', 'youtube');
  return data.access_token;
}

async function ytGet(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// ── Main sync ─────────────────────────────────────────────────────────────────
export async function POST() {
  try {
    const { data: conns, error } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('platform', 'youtube')
      .order('connected_at', { ascending: false })
      .limit(1);

    const conn = conns?.[0];
    if (error || !conn) {
      return NextResponse.json({ error: 'YouTube not connected' }, { status: 400 });
    }

    const token = await getAccessToken(conn);

    // ── 1. Channel info + uploads playlist ID ────────────────────────────────
    // Prefer the explicitly-stored channel_id (set via Settings → Connections)
    // so Brand Accounts (e.g. @bigthink) work correctly. Fall back to mine=true
    // for freshly-connected accounts that haven't chosen a channel yet.
    const channelParam = conn.channel_id
      ? `id=${encodeURIComponent(conn.channel_id)}`
      : 'mine=true';
    const channelData = await ytGet(
      `/channels?part=snippet,statistics,contentDetails&${channelParam}`,
      token
    );
    const channel = channelData.items?.[0];
    if (!channel) {
      return NextResponse.json({
        error: conn.channel_id
          ? `Channel "${conn.channel_id}" not found — try updating the channel in Settings`
          : 'No YouTube channel found on this account',
      }, { status: 400 });
    }
    const uploadsId = channel.contentDetails?.relatedPlaylists?.uploads;

    // ── 2. Fetch recent videos via playlistItems (1 unit/req vs 100 for search) ─
    const allPlaylistItems = [];
    let pageToken = null;
    do {
      const data = await ytGet(
        `/playlistItems?part=snippet,contentDetails&playlistId=${uploadsId}&maxResults=50${pageToken ? `&pageToken=${pageToken}` : ''}`,
        token
      );
      allPlaylistItems.push(...(data.items || []));
      pageToken = data.nextPageToken || null;
    } while (pageToken && allPlaylistItems.length < 100);

    const videoIds = allPlaylistItems
      .map(v => v.contentDetails?.videoId)
      .filter(Boolean);

    // ── 3. Fetch video stats in batches of 50 (single request per batch) ─────
    const videoStats = [];
    for (let i = 0; i < videoIds.length; i += 50) {
      const ids  = videoIds.slice(i, i + 50).join(',');
      const data = await ytGet(
        `/videos?part=snippet,statistics&id=${ids}`,
        token
      );
      videoStats.push(...(data.items || []));
    }

    // ── 4. Upsert videos → posts table ────────────────────────────────────────
    const now      = new Date().toISOString();
    const postRows = videoStats.map(v => ({
      platform:      'youtube',
      post_id:       v.id,
      content:       v.snippet?.title || null,
      permalink:     `https://www.youtube.com/watch?v=${v.id}`,
      published_at:  v.snippet?.publishedAt || null,
      likes:         parseInt(v.statistics?.likeCount    || 0),
      comments:      parseInt(v.statistics?.commentCount || 0),
      views:         parseInt(v.statistics?.viewCount    || 0),
      impressions:   parseInt(v.statistics?.viewCount    || 0),
      post_type:     'video',
      thumbnail_url: v.snippet?.thumbnails?.medium?.url || null,
      source:        'api',
      synced_at:     now,
    }));

    // Split into new inserts vs stat updates — avoids relying on DB constraint
    let newVideos = 0;
    if (postRows.length > 0) {
      const { data: existingRows, error: fetchErr } = await supabase
        .from('posts').select('post_id').eq('platform', 'youtube');
      if (fetchErr) throw new Error('Fetch existing posts failed: ' + fetchErr.message);

      const existingIds = new Set((existingRows || []).map(r => r.post_id));
      const toInsert = postRows.filter(r => !existingIds.has(r.post_id));
      const toUpdate = postRows.filter(r =>  existingIds.has(r.post_id));
      newVideos = toInsert.length;

      if (toInsert.length > 0) {
        const { error: insertErr } = await supabase.from('posts').insert(toInsert);
        if (insertErr) throw new Error('Insert videos failed: ' + insertErr.message);
      }

      // Refresh stats on existing rows in batches of 50
      for (let i = 0; i < toUpdate.length; i += 50) {
        const batch = toUpdate.slice(i, i + 50);
        await Promise.all(batch.map(row =>
          supabase.from('posts')
            .update({ likes: row.likes, comments: row.comments, views: row.views,
                      impressions: row.impressions, synced_at: row.synced_at })
            .eq('platform', 'youtube')
            .eq('post_id', row.post_id)
        ));
      }
    }

    // ── 5. Subscriber history backfill via YouTube Analytics API ─────────────
    // Uses yt-analytics.readonly scope (already requested during OAuth).
    // Fetches daily subscribersGained + subscribersLost from channel creation
    // to today, then reconstructs absolute counts by working backwards from the
    // current subscriber count. Replaces all existing youtube platform_metrics
    // with biweekly snapshots + a current full snapshot (with video data).
    let backfillSnapshots = 0;
    try {
      const today      = now.slice(0, 10);
      const channelId  = channel.id;
      const currentSubs = parseInt(channel.statistics?.subscriberCount || 0);

      const analyticsUrl = new URL('https://youtubeanalytics.googleapis.com/v2/reports');
      analyticsUrl.searchParams.set('ids',        `channel==${channelId}`);
      analyticsUrl.searchParams.set('metrics',    'subscribersGained,subscribersLost');
      analyticsUrl.searchParams.set('dimensions', 'day');
      analyticsUrl.searchParams.set('startDate',  '2005-01-01'); // before YouTube existed; API clips to channel creation
      analyticsUrl.searchParams.set('endDate',    today);
      analyticsUrl.searchParams.set('sort',       'day');

      const analyticsRes  = await fetch(analyticsUrl.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const analyticsData = await analyticsRes.json();

      if (analyticsData.rows?.length > 0) {
        const rows = analyticsData.rows; // [[date, gained, lost], ...]

        // Reconstruct absolute counts backwards from today's known total
        const daily = new Array(rows.length);
        let running = currentSubs;
        for (let i = rows.length - 1; i >= 0; i--) {
          const [date, gained, lost] = rows[i];
          daily[i] = { date, count: Math.max(0, Math.round(running)) };
          running = running - gained + lost;
        }

        // Sample every 14 days (biweekly) for chart performance; always keep first + last
        const snapshots = daily
          .filter((_, i) => i % 14 === 0 || i === daily.length - 1)
          .map(({ date, count }) => ({
            platform:    'youtube',
            snapshot_at: `${date}T00:00:00Z`,
            followers:   count,
          }));

        // Wipe existing youtube metrics and replace with full history
        await supabase.from('platform_metrics').delete().eq('platform', 'youtube');

        for (let i = 0; i < snapshots.length; i += 200) {
          const { error: snapErr } = await supabase
            .from('platform_metrics')
            .insert(snapshots.slice(i, i + 200));
          if (snapErr) throw snapErr;
        }
        backfillSnapshots = snapshots.length;
      }
    } catch (analyticsErr) {
      // Analytics backfill is best-effort; don't abort the whole sync
      console.warn('Analytics subscriber backfill skipped:', analyticsErr.message);
    }

    // Always write the current full snapshot (with video data) — either as a
    // fresh insert (if Analytics succeeded) or as the sole snapshot (if not).
    await supabase.from('platform_metrics').insert({
      platform:    'youtube',
      snapshot_at: now,
      followers:   parseInt(channel.statistics?.subscriberCount || 0),
      total_views: parseInt(channel.statistics?.viewCount       || 0),
      video_count: parseInt(channel.statistics?.videoCount      || 0),
      videos: videoStats.map(v => ({
        id:           v.id,
        title:        v.snippet?.title,
        published_at: v.snippet?.publishedAt,
        views:        parseInt(v.statistics?.viewCount    || 0),
        likes:        parseInt(v.statistics?.likeCount    || 0),
        comments:     parseInt(v.statistics?.commentCount || 0),
        thumbnail:    v.snippet?.thumbnails?.medium?.url,
        permalink:    `https://www.youtube.com/watch?v=${v.id}`,
      })),
    });

    // ── 6. Fetch & store comments for the 15 most recent videos ─────────────
    // Uses commentThreads.list at 1 unit/req with maxResults=100.
    // Deduplicates by (handle_id, post_url, interacted_at) so re-syncing is safe.
    let commentsSaved = 0;
    const videosForComments = videoStats.slice(0, 15);

    for (const video of videosForComments) {
      const postUrl = `https://www.youtube.com/watch?v=${video.id}`;

      try {
        let commentPage = null;
        let pages       = 0;

        do {
          const data = await ytGet(
            `/commentThreads?part=snippet&videoId=${video.id}&maxResults=100&order=time${commentPage ? `&pageToken=${commentPage}` : ''}`,
            token
          );

          // Comments disabled on this video or quota hit — skip
          if (data.error) break;

          for (const item of (data.items || [])) {
            const c = item.snippet?.topLevelComment?.snippet;
            if (!c) continue;

            const channelId = c.authorChannelId?.value; // stable unique YouTube channel ID
            if (!channelId) continue;

            // ── Upsert handle by YouTube channel ID ──────────────────────────
            const { data: existing } = await supabase
              .from('handles')
              .select('id, name')
              .eq('handle_youtube', channelId)
              .maybeSingle();

            let handleId = existing?.id;

            if (!handleId) {
              const { data: created } = await supabase
                .from('handles')
                .insert({
                  name:           c.authorDisplayName,
                  handle_youtube: channelId,
                  zone:           'UNASSIGNED',
                  added_at:       now,
                  updated_at:     now,
                })
                .select('id')
                .single();
              handleId = created?.id;
            } else if (existing && !existing.name) {
              // Back-fill display name if missing
              await supabase.from('handles')
                .update({ name: c.authorDisplayName, updated_at: now })
                .eq('id', handleId);
            }

            if (!handleId) continue;

            // ── Dedup: skip if we already have this exact comment ────────────
            const { data: dup } = await supabase
              .from('interactions')
              .select('id')
              .eq('handle_id',      handleId)
              .eq('post_url',       postUrl)
              .eq('interacted_at',  c.publishedAt)
              .maybeSingle();

            if (dup) continue;

            await supabase.from('interactions').insert({
              handle_id:        handleId,
              platform:         'youtube',
              interaction_type: 'comment',
              content:          c.textDisplay,
              post_url:         postUrl,
              interacted_at:    c.publishedAt,
              synced_at:        now,
            });
            commentsSaved++;
          }

          commentPage = data.nextPageToken || null;
          pages++;
        } while (commentPage && pages < 3); // max 300 comments per video per sync

      } catch (err) {
        // Don't abort the whole sync if one video fails
        console.warn(`Comments skipped for video ${video.id}:`, err.message);
      }
    }

    // ── 7. Update subscriber count on connection record ───────────────────────
    await supabase.from('platform_connections').update({
      subscriber_count: parseInt(channel.statistics?.subscriberCount || 0),
      channel_name:     channel.snippet?.title,
      updated_at:       now,
    }).eq('platform', 'youtube');

    const updatedVideos = postRows.length - newVideos;
    const parts = [];
    if (newVideos > 0)          parts.push(`${newVideos} new video${newVideos !== 1 ? 's' : ''}`);
    if (updatedVideos > 0)      parts.push(`${updatedVideos} refreshed`);
    if (commentsSaved > 0)      parts.push(`${commentsSaved} new comment${commentsSaved !== 1 ? 's' : ''}`);
    if (backfillSnapshots > 0)  parts.push(`${backfillSnapshots} subscriber history points`);
    if (parts.length === 0)     parts.push(`${postRows.length} video${postRows.length !== 1 ? 's' : ''} already up to date`);
    const msg = parts.join(' · ');

    return NextResponse.json({
      success:            true,
      channel:            channel.snippet?.title,
      subscribers:        channel.statistics?.subscriberCount,
      playlist_items:     videoIds.length,
      videos_synced:      postRows.length,
      new_videos:         newVideos,
      comments_synced:    commentsSaved,
      backfill_snapshots: backfillSnapshots,
      message:            msg,
    });

  } catch (err) {
    console.error('YouTube sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
