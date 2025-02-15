import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClientForServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });
  }
  const { error: deleteError } = await supabase
    .from('user_zoom_tokens')
    .delete()
    .eq('user_id', user.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
