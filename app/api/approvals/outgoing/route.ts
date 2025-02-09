import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE = 16 * 1024 * 1024;

export async function GET(req: Request) {
  const supabase = await createClientForServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });

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
      comments:comments ( user_email, comment, created_at ),
      attachments:attachments ( name, type, size, url )
    `
    )
    .eq('requester', user.email)
    .order('date', { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createClientForServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });

  const body = await req.json();
  // Expected payload:
  // { name, description, priority, date?, approvers: [{ email, name }], attachments: [{ name, type, size (number), url }] }
  const { name, description, priority, date, approvers, attachments } = body;

  if (attachments) {
    if (!Array.isArray(attachments))
      return NextResponse.json(
        { error: 'Attachments must be an array' },
        { status: 400 }
      );
    if (attachments.length > MAX_ATTACHMENTS)
      return NextResponse.json(
        { error: `Maximum ${MAX_ATTACHMENTS} attachments allowed` },
        { status: 400 }
      );
    for (const att of attachments) {
      if (typeof att.size !== 'number' || att.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Attachment '${att.name}' exceeds the 10MB limit` },
          { status: 400 }
        );
      }
    }
  }

  const { data, error } = await supabase
    .from('approvals')
    .insert([
      {
        name,
        requester: user.email,
        description,
        priority,
        date: date || new Date().toISOString(),
        status: 'pending',
      },
    ])
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const approvalId = data[0].id;

  if (approvers && Array.isArray(approvers)) {
    const { error: approverError } = await supabase.from('approvers').insert(
      approvers.map((ap: any) => ({
        approval_id: approvalId,
        email: ap.email,
        name: ap.name,
        did_approve: false,
      }))
    );
    if (approverError)
      return NextResponse.json(
        { error: approverError.message },
        { status: 500 }
      );
  }

  if (attachments && Array.isArray(attachments)) {
    const { error: attachError } = await supabase.from('attachments').insert(
      attachments.map((att: any) => ({
        approval_id: approvalId,
        name: att.name,
        type: att.type,
        size: att.size,
        url: att.url,
      }))
    );
    if (attachError)
      return NextResponse.json({ error: attachError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
