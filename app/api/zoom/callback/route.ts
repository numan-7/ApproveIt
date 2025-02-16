import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/zoom/callback`;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  );

  const tokenResponse = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });
  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    return NextResponse.json(
      { error: tokenData.error || 'Failed to get token' },
      { status: 400 }
    );
  }

  const supabase = await createClientForServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 403 }
    );
  }
  const { error: upsertError } = await supabase
    .from('user_zoom_tokens')
    .upsert({
      user_id: user.id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    });
  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings`
  );
}
