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
      approvers,
      comments: comments ( id, name, user_email, comment, created_at ),
      attachments: attachments ( name, type, size, url, key ),
      events: events ( id, date, type, name, approval_id)
    `
    )
    .eq('requester', user.email)
    .order('date', { ascending: true });

  const incomingApprovalslength = incoming.length || 0;
  const outgoingApprovalslength = outgoing?.length || 0;
  let allEvents: {
    id: string;
    type: string;
    name: string;
    date: string;
    approvalName: string;
  }[] = [];

  console.log(outgoing);

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
          });
        });
      }
    });
  }

  allEvents.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const recent10Events = allEvents.slice(0, 10);

  if (incomingError) {
    return NextResponse.json({ error: incomingError.message }, { status: 500 });
  } else if (outgoingError) {
    return NextResponse.json({ error: outgoingError.message }, { status: 500 });
  }

  const data = {
    incoming: incomingApprovalslength,
    outgoing: outgoingApprovalslength,
    recentEvents: recent10Events,
  };

  return NextResponse.json(data);
}
