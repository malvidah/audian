import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.X_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/x/callback`;
  const state = Math.random().toString(36).slice(2);
  const challenge = 'challenge123';

  const url = 'https://twitter.com/i/oauth2/authorize?' +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('tweet.read users.read offline.access')}` +
    `&state=${state}` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=plain`;

  const response = NextResponse.redirect(url);
  response.cookies.set('x_state', state, { httpOnly: true, secure: true, maxAge: 300 });
  response.cookies.set('x_challenge', challenge, { httpOnly: true, secure: true, maxAge: 300 });
  return response;
}
