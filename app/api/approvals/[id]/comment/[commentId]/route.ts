import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  const supabase = await createClientForServer();
  const { commentId } = params;
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });

  const body = await req.json();
  const { comment } = body;

  const { data: existing, error: fetchError } = await supabase
    .from('comments')
    .select('user_email')
    .eq('id', commentId)
    .single();
  if (fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (existing.user_email !== user.email)
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const { data, error } = await supabase
    .from('comments')
    .update({ comment })
    .eq('id', commentId)
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  const supabase = await createClientForServer();
  const { commentId } = params;
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });

  const { data: existing, error: fetchError } = await supabase
    .from('comments')
    .select('user_email')
    .eq('id', commentId)
    .single();
  if (fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (existing.user_email !== user.email)
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Comment deleted successfully' });
}
