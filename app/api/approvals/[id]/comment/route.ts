import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';

export async function POST(
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

  const body = await req.json(); // Expected { comment: string }
  const { comment } = body;

  const { data, error } = await supabase
    .from('comments')
    .insert([{ approval_id: id, user_email: user.email, comment }])
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
