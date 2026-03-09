import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Instagram Insights requires the Facebook Login flow (not Instagram Login).
  // The user's Instagram account must be connected to a Facebook Page.
  // We use the Facebook App ID and facebook.com/dialog/oauth endpoint.
  const appId      = process.env.FACEBOOK_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;

  const scope = [
    'instagram_basic',
    'instagram_manage_insights',
    'pages_show_list',
    'pages_read_engagement',
    'business_management',
  ].join(',');

  const url =
    `https://www.facebook.com/dialog/oauth?` +
    `client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&response_type=code`;

  const response = NextResponse.redirect(url, 307);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}
