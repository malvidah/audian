import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function refreshYouTubeToken(refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  });
  return res.json();
}

export async function POST() {
  try {
    // Get YouTube connection
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

    // Refresh token if expired
    let accessToken = conn.access_token;
    if (new Date(conn.expires_at) < new Date()) {
      const refreshed = await refreshYouTubeToken(conn.refresh_token);
      accessToken = refreshed.access_token;
      await supabase.from('platform_connections').update({
        access_token: accessToken,
        expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
      }).eq('platform', 'youtube');
    }

    const headers = { 'Authorization': `Bearer ${accessToken}` };

    // Fetch channel stats
    const channelRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      { headers }
    );
    const channelData = await channelRes.json();
    const channel = channelData.items?.[0];

    // Fetch recent videos
    const videosRes = await fetch(
      'https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&maxResults=20&order=date',
      { headers }
    );
    const videosData = await videosRes.json();
    const videoIds = videosData.items?.map(v => v.id.videoId).join(',');

    // Fetch video stats
    let videoStats = [];
    if (videoIds) {
      const statsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}`,
        { headers }
      );
      const statsData = await statsRes.json();
      videoStats = statsData.items || [];
    }

    // Fetch top comments across recent videos
    const comments = [];
    for (const video of videoStats.slice(0, 5)) {
      const commentsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${video.id}&maxResults=20&order=relevance`,
        { headers }
      );
      const commentsData = await commentsRes.json();
      const topComments = (commentsData.items || []).map(item => ({
        platform: 'youtube',
        video_id: video.id,
        video_title: video.snippet?.title,
        author_name: item.snippet?.topLevelComment?.snippet?.authorDisplayName,
        author_channel_url: item.snippet?.topLevelComment?.snippet?.authorChannelUrl,
        content: item.snippet?.topLevelComment?.snippet?.textDisplay,
        likes: item.snippet?.topLevelComment?.snippet?.likeCount,
        reply_count: item.snippet?.totalReplyCount,
        published_at: item.snippet?.topLevelComment?.snippet?.publishedAt,
      }));
      comments.push(...topComments);
    }

    // Store metrics snapshot
    const metrics = {
      platform: 'youtube',
      snapshot_at: new Date().toISOString(),
      followers: parseInt(channel?.statistics?.subscriberCount || 0),
      total_views: parseInt(channel?.statistics?.viewCount || 0),
      video_count: parseInt(channel?.statistics?.videoCount || 0),
      videos: videoStats.map(v => ({
        id: v.id,
        title: v.snippet?.title,
        published_at: v.snippet?.publishedAt,
        views: parseInt(v.statistics?.viewCount || 0),
        likes: parseInt(v.statistics?.likeCount || 0),
        comments: parseInt(v.statistics?.commentCount || 0),
        thumbnail: v.snippet?.thumbnails?.medium?.url,
      })),
    };

    await supabase.from('platform_metrics').insert(metrics);

    // Store comments
    if (comments.length > 0) {
      // Write YouTube comments to interactions table
      for (const comment of comments) {
        // Upsert person by name/handle
        const authorHandle = (comment.author_handle || comment.author_name || '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g,'');
        if (!authorHandle) continue;
        const { data: existingPerson } = await supabase.from('people').select('id').eq('handle_youtube', authorHandle).maybeSingle();
        let personId = existingPerson?.id;
        if (!personId) {
          const { data: newPerson } = await supabase.from('people').insert({
            name: comment.author_name, handle_youtube: authorHandle, category: 'SIGNAL',
            added_at: new Date().toISOString(), updated_at: new Date().toISOString(),
          }).select('id').single();
          personId = newPerson?.id;
        }
        if (personId) {
          await supabase.from('interactions').insert({
            person_id: personId, platform: 'youtube', type: 'comment',
            content: comment.content, content_title: comment.video_title, likes: comment.likes || 0,
            interacted_at: comment.published_at || new Date().toISOString(),
            synced_at: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      channel: channel?.snippet?.title,
      subscribers: channel?.statistics?.subscriberCount,
      videos_synced: videoStats.length,
      comments_synced: comments.length,
    });

  } catch (err) {
    console.error('YouTube sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}