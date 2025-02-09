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
    .update({ did_approve: true })
    .eq('approval_id', id)
    .eq('email', user.email)
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: approvers, error: approversError } = await supabase
    .from('approvers')
    .select('did_approve')
    .eq('approval_id', id);
  if (approversError)
    return NextResponse.json(
      { error: approversError.message },
      { status: 500 }
    );
  const allApproved = approvers?.every((a: any) => a.did_approve);
  if (allApproved) {
    await supabase
      .from('approvals')
      .update({ status: 'approved' })
      .eq('id', id);
  }
  return NextResponse.json({ message: 'Approval updated' });
}
