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
  
    const { data: incoming, error: incomingError } = await supabase.rpc('get_approvals_for_user', {
        user_email: user.email,
    });

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
      attachments: attachments ( name, type, size, url, key)
    `
    )
    .eq('requester', user.email)
    .order('date', { ascending: true });

    const incomingApprovalslength = incoming.length || 0;
    const outgoingApprovalslength = outgoing?.length || 0;


    if ( incomingError ) {
        return NextResponse.json({ error: incomingError.message }, { status: 500 });
    } else if ( outgoingError ) {
        return NextResponse.json({ error: outgoingError.message }, { status: 500 });
    }

    const data = {
        incoming: incomingApprovalslength,
        outgoing: outgoingApprovalslength
    }

    return NextResponse.json(data);
}