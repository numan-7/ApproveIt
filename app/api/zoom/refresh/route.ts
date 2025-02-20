import type { NextApiRequest, NextApiResponse } from 'next';
import { createClientForServer } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

async function refreshZoomToken(refreshToken: string) {
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
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  return await tokenResponse.json();
}

export async function POST() {
  const supabase = await createClientForServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });
  }

  const { data: tokenData, error: tokenError } = await supabase
    .from('user_zoom_tokens')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (tokenError || !tokenData) {
    return NextResponse.json(
      { error: 'Zoom tokens not found' },
      { status: 404 }
    );
  }

  const { refresh_token, last_updated } = tokenData;

  const lastUpdated = new Date(last_updated);
  const now = new Date();
  const tokenAge = (now.getTime() - lastUpdated.getTime()) / 1000;

  // been last than 55 minutes since last update
  if (tokenAge < 3300) {
    console.log('Token is still fresh');
    return NextResponse.json({ refreshed: false });
  }

  try {
    const newTokenData = await refreshZoomToken(refresh_token);

    // update the database with the new token values and current timestamp
    const { data: newData, error: updateError } = await supabase
      .from('user_zoom_tokens')
      .update({
        access_token: newTokenData.access_token,
        refresh_token: newTokenData.refresh_token,
        last_updated: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ refreshed: true });
  } catch (err: any) {
    console.error('Error refreshing Zoom token:', err);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
