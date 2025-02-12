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

  if (fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 });

  // update the approvers array: set didApprove to true for the current user.
  const updatedApprovers = approval.approvers.map((ap: any) =>
    ap.email === user.email ? { ...ap, didApprove: true } : ap
  );

  const allApproved = updatedApprovers.every(
    (ap: any) => ap.didApprove === true
  );

  const status = allApproved ? 'approved' : 'pending';

  // update the approval record with the new approvers array.
  const { error: updateError } = await supabase
    .from('approvals')
    .update({ approvers: updatedApprovers, status: status })
    .eq('id', id)
    .select();

  if (updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 });

  const { error: eventError } = await supabase.from('events').insert([
    {
      type: 'approved',
      name: user.user_metadata.full_name,
      approval_id: id,
    },
  ]);

  if (eventError)
    return NextResponse.json({ error: eventError.message }, { status: 500 });

  return NextResponse.json({ message: 'Approval updated' });
}
