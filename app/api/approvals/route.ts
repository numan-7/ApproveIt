import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';

export async function GET(req: Request) {
  const supabase = await createClientForServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });

  const { data: incoming, error: incomingError } = await supabase.rpc(
    'get_approvals_for_user',
    {
      user_email: user.email,
    }
  );

  const { data: outgoing, error: outgoingError } = await supabase
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
      due_date,
      approvers,
      comments: comments ( id, name, user_email, comment, created_at ),
      attachments: attachments ( name, size, url, key ),
      events: events ( id, date, type, name, approval_id)
    `
    )
    .eq('requester', user.email)
    .eq('status', 'pending')
    .order('date', { ascending: true });

  const incomingApprovalslength = incoming.length || 0;
  const outgoingApprovalslength = outgoing?.length || 0;

  let allEvents: {
    id: string;
    type: string;
    name: string;
    date: string;
    approvalName: string;
    approvalID: string;
  }[] = [];

  if (outgoing) {
    outgoing.forEach((approval: any) => {
      if (approval.events && approval.events.length) {
        approval.events.forEach((event: any) => {
          allEvents.push({
            id: event.id.toString(),
            type: event.type,
            name: event.name,
            date: event.date,
            approvalName: approval.name,
            approvalID: event.approval_id,
          });
        });
      }
    });
  }

  // get events within the last 7 days
  allEvents = allEvents.filter(
    (event) =>
      new Date(event.date).getTime() >=
      new Date(new Date().setDate(new Date().getDate() - 7)).getTime()
  );

  if (incomingError) {
    return NextResponse.json({ error: incomingError.message }, { status: 500 });
  } else if (outgoingError) {
    return NextResponse.json({ error: outgoingError.message }, { status: 500 });
  }

  const approvals = incoming.concat(outgoing);

  const data = {
    approvals: approvals,
    incomingLength: incomingApprovalslength,
    outgoingLength: outgoingApprovalslength,
    recentEvents: allEvents,
  };

  return NextResponse.json(data);
}
