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

  const { data: existing, error: fetchError } = await supabase
    .from('approvals')
    .select('requester')
    .eq('id', id)
    .single();
  if (fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (existing.requester !== user.email)
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const body = await req.json();
  const { data, error } = await supabase
    .from('approvals')
    .update(body)
    .eq('id', id)
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE: Delete an outgoing approval (only if requester)
export async function DELETE(
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

  const { data: existing, error: fetchError } = await supabase
    .from('approvals')
    .select('requester')
    .eq('id', id)
    .single();
  if (fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (existing.requester !== user.email)
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const { data, error } = await supabase
    .from('approvals')
    .delete()
    .eq('id', id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Approval deleted successfully' });
}
