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

  const { data: approval, error: fetchError } = await supabase
    .from('approvals')
    .select('approvers')
    .eq('id', id)
    .single();

  if (fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 });

  const updatedApprovers = approval.approvers.map((ap: any) =>
    ap.email === user.email ? { ...ap, didApprove: false } : ap
  );

  const { error } = await supabase
    .from('approvals')
    .update({ approvers: updatedApprovers, status: 'rejected' })
    .eq('id', id)
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: 'Approval denied' });
}
