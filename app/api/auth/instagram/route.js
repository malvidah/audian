import { NextResponse } from 'next/server';

export async function GET() {
  const appId      = process.env.INSTAGRAM_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;

  const scope = [
    'instagram_business_basic',
    'instagram_manage_comments',
    'instagram_business_manage_messages',
  ].join(',');

  const url = `https://www.facebook.com/v19.0/dialog/oauth?` +
    `client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&response_type=code`;

  return NextResponse.redirect(url);
}
