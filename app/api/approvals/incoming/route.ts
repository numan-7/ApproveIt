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

  if (approvals && approvals.length > 0) {
    const approvalId = approvals[0].id;
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('approval_id', approvalId);

    if (commentsError)
      return NextResponse.json({ error: commentsError.message }, { status: 500 });

    approvals[0].comments = comments;
  }
  
  return NextResponse.json(approvals);
}
