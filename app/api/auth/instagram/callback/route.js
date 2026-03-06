import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=instagram_denied`);
  if (!code) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=no_code`);

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;

    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error_type || tokenData.error) {
      console.error('Token exchange error:', tokenData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=token_exchange_failed`);
    }

    const shortToken = tokenData.access_token;
    const igUserId = tokenData.user_id;

    const longTokenRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${shortToken}`
    );
    const longToken = await longTokenRes.json();
    const accessToken = longToken.access_token || shortToken;

    const profileRes = await fetch(
      `https://graph.instagram.com/v19.0/me?fields=id,username,followers_count,media_count&access_token=${accessToken}`
    );
    const profile = await profileRes.json();

    await supabase.from('platform_connections').upsert({
      platform: 'instagram',
      platform_user_id: String(igUserId || profile.id),
      username: profile.username || 'unknown',
      access_token: accessToken,
      token_expires_at: longToken.expires_in ? new Date(Date.now() + longToken.expires_in * 1000).toISOString() : null,
      metadata: { followers_count: profile.followers_count, media_count: profile.media_count },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'platform' });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?connected=instagram`);
  } catch (err) {
    console.error('Instagram OAuth error:', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=oauth_failed`);
  }
}
