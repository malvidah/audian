import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const clientId    = process.env.X_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/x/callback`;
  const state    = crypto.randomBytes(16).toString('hex');
  const verifier = crypto.randomBytes(32).toString('base64url'); // proper PKCE code verifier

  const url = 'https://twitter.com/i/oauth2/authorize?' +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('tweet.read users.read offline.access')}` +
    `&state=${state}` +
    `&code_challenge=${verifier}` +
    `&code_challenge_method=plain`;

  const response = NextResponse.redirect(url);
  response.cookies.set('x_state',     state,    { httpOnly: true, secure: true, maxAge: 300 });
  response.cookies.set('x_challenge', verifier, { httpOnly: true, secure: true, maxAge: 300 });
  return response;
}
