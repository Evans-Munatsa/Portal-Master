import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.searchParams.get('origin') || 'http://localhost:3000';
  const redirectUri = `${origin}/api/auth/linkedin/callback`;

  const clientId = process.env.LINKEDIN_CLIENT_ID || '86lk6996pnp8m1';
  
  // Construct real LinkedIn OAuth V2 URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: 'auth_state_launchpath',
    scope: 'openid profile email',
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  return NextResponse.json({ url: authUrl });
}
