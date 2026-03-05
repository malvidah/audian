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

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=instagram_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=no_code`);
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;
    
    // Exchange code for access token
    const tokenRes = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData.error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=token_exchange_failed`);
    }

    // Get long-lived token (60 days)
    const longTokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${process.env.INSTAGRAM_APP_ID}` +
      `&client_secret=${process.env.INSTAGRAM_APP_SECRET}` +
      `&fb_exchange_token=${tokenData.access_token}`
    );
    const longToken = await longTokenRes.json();

    // Get Facebook pages to find connected Instagram account
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${longToken.access_token || tokenData.access_token}`
    );
    const pagesData = await pagesRes.json();

    // Store token in Supabase
    // We'll associate with user session via cookie
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?connected=instagram`);
    
    // Store token data temporarily in cookie for the client to pick up
    response.cookies.set('instagram_token', JSON.stringify({
      access_token: longToken.access_token || tokenData.access_token,
      expires_in: longToken.expires_in,
      pages: pagesData.data || [],
    }), { 
      httpOnly: true, 
      secure: true,
      maxAge: 60 * 5, // 5 min for client to pick up
      path: '/'
    });

    return response;
  } catch (err) {
    console.error('Instagram OAuth error:', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=oauth_failed`);
  }
}