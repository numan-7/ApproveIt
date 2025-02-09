import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClientForServer();
  const { id } = params;
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });

  const { data, error } = await supabase
    .from('approvers')
    .update({ did_approve: false })
    .eq('approval_id', id)
    .eq('email', user.email)
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('approvals').update({ status: 'rejected' }).eq('id', id);
  return NextResponse.json({ message: 'Approval denied' });
}
