import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const appId       = process.env.INSTAGRAM_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;

  const scope = [
    'instagram_business_basic',
    'instagram_manage_comments',
    'instagram_business_manage_messages',
  ].join(',');

  const url = `https://api.instagram.com/oauth/authorize?` +
    `client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&response_type=code`;

  const response = NextResponse.redirect(url, 307);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}
