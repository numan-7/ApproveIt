import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';
import {
  generateEmbedding,
  generateApprovalEmbedding,
} from '@/utils/embedding/embed';

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
      due_date,
      priority,
      approvers,
      zoom_meeting,
      expired,
      comments: comments ( id, name, user_email, comment, created_at ),
      attachments: attachments ( name, size, url, key ),
      events: events ( id, date, type, name, approval_id)
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
  const {
    name,
    description,
    due_date,
    priority,
    approvers,
    attachments,
    zoom_meeting,
  } = body;

  const vector = await generateApprovalEmbedding(body);

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
      if (Number(att.size) > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `Attachment '${att.name}' exceeds the ${MAX_FILE_SIZE} bytes limit`,
          },
          { status: 400 }
        );
      }
    }
  }

  const { data, error } = await supabase
    .from('approvals')
    .insert([
      {
        name: name,
        requester: user.email,
        description,
        priority,
        due_date,
        expired: false,
        status: 'pending',
        approvers: approvers || [],
        zoom_meeting: zoom_meeting || [],
        embedding: vector,
      },
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const approvalId = data[0].id;

  if (attachments && Array.isArray(attachments)) {
    const { error: attachError } = await supabase.from('attachments').insert(
      attachments.map((att: any) => ({
        approval_id: approvalId,
        name: att.name,
        size: att.size,
        url: att.url,
        key: att.key,
      }))
    );
    if (attachError)
      return NextResponse.json({ error: attachError.message }, { status: 500 });
  }

  if (approvers && approvers.length > 0) {
    await supabase.functions.invoke('invite-approvers', {
      body: {
        requester: user.email,
        approvers: approvers,
      },
    });
  }

  return NextResponse.json(data);
}
