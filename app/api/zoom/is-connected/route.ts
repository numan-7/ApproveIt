// app/api/zoom/is-connected/route.ts
import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClientForServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ connected: false });
  }
  const { data, error: tokenError } = await supabase
    .from('user_zoom_tokens')
    .select('access_token')
    .eq('user_id', user.id)
    .maybeSingle();
  if (tokenError || !data) {
    return NextResponse.json({ connected: false });
  }
  return NextResponse.json({ connected: true });
}
