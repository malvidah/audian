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
  const base  = process.env.NEXT_PUBLIC_APP_URL;

  if (error) return NextResponse.redirect(`${base}?error=instagram_denied`);
  if (!code)  return NextResponse.redirect(`${base}?error=no_code`);

  try {
    const redirectUri = `${base}/api/auth/instagram/callback`;

    // Step 1: Exchange code for Facebook user access token
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
      console.error('Token exchange error:', JSON.stringify(tokenData.error));
      return NextResponse.redirect(`${base}?error=token_exchange_failed`);
    }

    const userAccessToken = tokenData.access_token;

    // Step 2: Get Facebook Pages the user manages (Instagram must be linked to a Page)
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`
    );
    const pagesData = await pagesRes.json();

    console.log('Pages found:', JSON.stringify(pagesData?.data?.map(p => ({ id: p.id, name: p.name, has_ig: !!p.instagram_business_account }))));

    if (!pagesData.data || pagesData.data.length === 0) {
      console.error('No Facebook Pages found. Instagram must be linked to a Facebook Page.');
      return NextResponse.redirect(`${base}?error=no_facebook_pages&hint=Connect_Instagram_to_a_Facebook_Page_first`);
    }

    // Step 3: Find the page that has an Instagram Business Account linked
    // Fetch instagram_business_account inline with the pages request above
    let igAccount   = null;
    let pageToken   = null;
    let pageName    = null;

    for (const page of pagesData.data) {
      if (page.instagram_business_account) {
        igAccount = page.instagram_business_account;
        pageToken = page.access_token;
        pageName  = page.name;
        break;
      }
      // If not returned inline, fetch explicitly
      const igRes  = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      );
      const igData = await igRes.json();
      if (igData.instagram_business_account) {
        igAccount = igData.instagram_business_account;
        pageToken = page.access_token;
        pageName  = page.name;
        break;
      }
    }

    if (!igAccount) {
      console.error('No Instagram Business Account found on any page:', pagesData.data.map(p => p.name));
      return NextResponse.redirect(`${base}?error=no_instagram_on_pages&hint=Link_Instagram_to_your_Facebook_Page_in_Meta_Business_Suite`);
    }

    console.log('Found IG account:', igAccount.id, 'on page:', pageName);

    // Step 4: Fetch Instagram profile
    const profileRes = await fetch(
      `https://graph.facebook.com/v19.0/${igAccount.id}?fields=id,username,followers_count,media_count,profile_picture_url&access_token=${pageToken}`
    );
    const profile = await profileRes.json();

    if (profile.error) {
      console.error('Profile fetch error:', JSON.stringify(profile.error));
      return NextResponse.redirect(`${base}?error=profile_fetch_failed`);
    }

    console.log('IG profile:', JSON.stringify({ username: profile.username, followers: profile.followers_count }));

    // Step 5: Upsert to Supabase
    const { error: dbError } = await supabase.from('platform_connections').upsert({
      platform:          'instagram',
      channel_id:        String(igAccount.id),
      channel_name:      profile.username || pageName || 'unknown',
      channel_thumbnail: profile.profile_picture_url || null,
      subscriber_count:  profile.followers_count || 0,
      access_token:      pageToken,
      connected_at:      new Date().toISOString(),
      updated_at:        new Date().toISOString(),
    }, { onConflict: 'platform' });

    if (dbError) {
      console.error('Supabase upsert error:', JSON.stringify(dbError));
      return NextResponse.redirect(`${base}?error=db_write_failed`);
    }

    return NextResponse.redirect(`${base}?connected=instagram`);

  } catch (err) {
    console.error('Instagram OAuth error:', err.message);
    return NextResponse.redirect(`${base}?error=oauth_failed`);
  }
}
