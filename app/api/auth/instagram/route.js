import { NextResponse } from 'next/server';

export async function GET() {
  const appId       = process.env.INSTAGRAM_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;

  const scope = [
    'instagram_business_basic',
    'instagram_manage_comments',
    'instagram_business_manage_messages',
  ].join(',');

  // Use Instagram's OAuth endpoint, not Facebook's
  const url = `https://api.instagram.com/oauth/authorize?` +
    `client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&response_type=code`;

  return NextResponse.redirect(url);
}
