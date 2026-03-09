import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Instagram Insights require the Facebook Login flow.
  // The Instagram account must be linked to a Facebook Page.
  // Uses the Facebook App ID + facebook.com/dialog/oauth endpoint.
  //
  // Scopes needed:
  //   instagram_basic            - read profile + media
  //   instagram_manage_insights  - account & media insights (must be added in Meta portal first)
  //   pages_show_list            - list user's Facebook Pages (required to find linked IG account)
  //   pages_read_engagement      - page-level engagement data
  //   business_management        - access business assets
  //
  // NOTE: instagram_manage_insights requires being added under
  //   Use Cases → Permissions and Features in Meta Developer portal.

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
