import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';

export async function GET(req: Request) {
  const supabase = await createClientForServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });

  const { data: approvals, error } = await supabase.rpc('get_approvals_for_user', {
    user_email: user.email,
  });
  
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json(approvals);
}
