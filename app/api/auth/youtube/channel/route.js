import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const BASE = 'https://www.googleapis.com/youtube/v3';

// Refresh token if expired, same helper as sync route
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

// POST /api/auth/youtube/channel
// body: { handle: "@bigthink" | "UCxxxxxxx" | "https://youtube.com/@bigthink" }
// Resolves the handle/ID to a YouTube channel and updates platform_connections.
export async function POST(request) {
  try {
    const { handle: raw } = await request.json();
    if (!raw) return NextResponse.json({ error: 'No handle provided' }, { status: 400 });

    // Normalise: strip URL noise, strip leading @
    let handle = raw.trim();
    // Extract handle from a full URL like https://www.youtube.com/@bigthink or /channel/UCxxx
    const urlMatch = handle.match(/youtube\.com\/(?:@([\w.-]+)|channel\/(UC[\w-]+))/i);
    if (urlMatch) {
      handle = urlMatch[1] ? `@${urlMatch[1]}` : urlMatch[2];
    }

    const { data: conns } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('platform', 'youtube')
      .order('connected_at', { ascending: false })
      .limit(1);

    const conn = conns?.[0];
    if (!conn) return NextResponse.json({ error: 'YouTube not connected' }, { status: 400 });

    const token = await getAccessToken(conn);

    // Resolve: try forHandle first (handles starting with @), then by id
    let channel = null;
    if (handle.startsWith('UC')) {
      // Looks like a channel ID
      const res = await fetch(`${BASE}/channels?part=snippet,statistics,contentDetails&id=${encodeURIComponent(handle)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      channel = data.items?.[0] || null;
    } else {
      // Handle like @bigthink (strip leading @ for the API param)
      const h = handle.replace(/^@/, '');
      const res = await fetch(`${BASE}/channels?part=snippet,statistics,contentDetails&forHandle=${encodeURIComponent(h)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      channel = data.items?.[0] || null;
    }

    if (!channel) {
      return NextResponse.json({ error: `Channel not found for "${raw}"` }, { status: 404 });
    }

    // Update platform_connections with the resolved channel
    await supabase.from('platform_connections').update({
      channel_id:        channel.id,
      channel_name:      channel.snippet?.title,
      channel_thumbnail: channel.snippet?.thumbnails?.default?.url,
      subscriber_count:  parseInt(channel.statistics?.subscriberCount || 0),
      updated_at:        new Date().toISOString(),
    }).eq('platform', 'youtube');

    return NextResponse.json({
      success:      true,
      channel_id:   channel.id,
      channel_name: channel.snippet?.title,
      subscribers:  channel.statistics?.subscriberCount,
    });
  } catch (err) {
    console.error('YouTube channel resolve error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
