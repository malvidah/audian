import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=instagram_denied`);
  if (!code)  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=no_code`);

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;

    // Step 1: Exchange code for a Facebook user access token
    const tokenRes = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri:  redirectUri,
        code,
      }),
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData.error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=token_exchange_failed`);
    }

    const userAccessToken = tokenData.access_token;

    // Step 2: Get Facebook Pages the user manages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`
    );
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      console.error('No Facebook Pages found:', pagesData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=no_pages_found`);
    }

    // Step 3: For each page, find connected Instagram Business Account
    let igAccount = null;
    let pageAccessToken = null;

    for (const page of pagesData.data) {
      const igRes = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      );
      const igData = await igRes.json();

      if (igData.instagram_business_account) {
        igAccount = igData.instagram_business_account;
        pageAccessToken = page.access_token;
        break;
      }
    }

    if (!igAccount) {
      console.error('No Instagram Business Account connected to any Facebook Page');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=no_instagram_business_account`);
    }

    // Step 4: Fetch Instagram profile + metrics
    const profileRes = await fetch(
      `https://graph.facebook.com/v19.0/${igAccount.id}?fields=id,username,followers_count,media_count,profile_picture_url&access_token=${pageAccessToken}`
    );
    const profile = await profileRes.json();

    // Step 5: Store in Supabase
    await supabase.from('platform_connections').upsert({
      platform:         'instagram',
      platform_user_id: String(igAccount.id),
      username:         profile.username || 'unknown',
      access_token:     pageAccessToken,
      metadata: {
        followers_count:      profile.followers_count,
        media_count:          profile.media_count,
        profile_picture_url:  profile.profile_picture_url,
        ig_business_id:       igAccount.id,
        user_access_token:    userAccessToken, // keep for refreshing
      },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'platform' });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?connected=instagram`);
  } catch (err) {
    console.error('Instagram OAuth error:', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=oauth_failed`);
  }
}
