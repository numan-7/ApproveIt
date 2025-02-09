// app/api/approvals/incoming/route.ts
import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';

export async function GET(req: Request) {
  const supabase = await createClientForServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });
  }

  // Query approvals where the nested approvers contain the current user's email.
  // (Assuming your Supabase schema lets you filter on the nested relation.)
  const { data, error } = await supabase
    .from('approvals')
    .select(
      `
      id,
      name,
      requester,
      date,
      description,
      status,
      priority,
      approvers:approvers ( email, name, did_approve ),
      comments:comments ( user_email, name, comment, created_at ),
      attachments:attachments ( name, type, size, url )
    `
    )
    .filter('approvers.email', 'eq', user.email)
    .order('date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
