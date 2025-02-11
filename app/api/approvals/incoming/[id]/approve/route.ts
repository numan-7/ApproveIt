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

  // fetch the current approvers array for the approval.
  const { data: approval, error: fetchError } = await supabase
    .from('approvals')
    .select('approvers')
    .eq('id', id)
    .single();

  console.log(approval);

  if (fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 });

  // update the approvers array: set didApprove to true for the current user.
  const updatedApprovers = approval.approvers.map((ap: any) =>
    ap.email === user.email ? { ...ap, didApprove: true } : ap
  );

  // update the approval record with the new approvers array.
  const { data: updateData, error: updateError } = await supabase
    .from('approvals')
    .update({ approvers: updatedApprovers })
    .eq('id', id)
    .select();

  if (updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 });

  // check if every approver has approved.
  const allApproved = updatedApprovers.every(
    (ap: any) => ap.didApprove === true
  );
  if (allApproved) {
    const { error: statusError } = await supabase
      .from('approvals')
      .update({ status: 'approved' })
      .eq('id', id);
    if (statusError)
      return NextResponse.json({ error: statusError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Approval updated' });
}
