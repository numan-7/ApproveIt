import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/zoom/callback`;
  const clientId = process.env.ZOOM_CLIENT_ID;

  const state = 'zoom_connect';
  const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  return NextResponse.redirect(zoomAuthUrl);
}
