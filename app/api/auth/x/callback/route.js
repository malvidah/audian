import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=x_denied`);
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/x/callback`;
    const challenge   = request.cookies.get('x_challenge')?.value || 'challenge123';
    const creds       = Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString('base64');

    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${creds}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: challenge,
      }),
    });

    const tokens = await tokenRes.json();
    if (tokens.error) {
      console.error('X token error:', tokens);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=x_token_failed`);
    }

    const userRes = await fetch(
      'https://api.twitter.com/2/users/me?user.fields=public_metrics,description,profile_image_url,verified',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const userData = await userRes.json();
    const user     = userData.data;

    await supabase.from('platform_connections').upsert({
      platform:          'x',
      channel_id:        user?.id,
      channel_name:      user?.name,
      channel_thumbnail: user?.profile_image_url,
      subscriber_count:  user?.public_metrics?.followers_count || 0,
      access_token:      tokens.access_token,
      refresh_token:     tokens.refresh_token,
      expires_at:        tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
      connected_at:      new Date().toISOString(),
    }, { onConflict: 'platform' });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?connected=x`);
  } catch (err) {
    console.error('X OAuth error:', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=oauth_failed`);
  }
}
