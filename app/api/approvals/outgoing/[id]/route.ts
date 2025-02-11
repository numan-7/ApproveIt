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
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });
  }

  const { data: existing, error: existingError } = await supabase
    .from('approvals')
    .select('requester')
    .eq('id', id)
    .single();
  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }
  if (existing.requester !== user.email) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const body = await req.json();
  const { attachments, comments, ...approvalUpdates } = body;

  const { error: updateError } = await supabase
    .from('approvals')
    .update(approvalUpdates)
    .eq('id', id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (Array.isArray(attachments)) {
    const { data: currentAttachments, error: currentAttsError } = await supabase
      .from('attachments')
      .select('id')
      .eq('approval_id', id);

    if (currentAttsError) {
      return NextResponse.json(
        { error: currentAttsError.message },
        { status: 500 }
      );
    }

    const currentIds = currentAttachments.map((att) => att.id);
    const submittedIds = attachments.map((att) => att.id).filter(Boolean);

    const toDelete = currentIds.filter(
      (currId) => !submittedIds.includes(currId)
    );
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('attachments')
        .delete()
        .in('id', toDelete);

      if (deleteError) {
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 }
        );
      }
    }

    const toInsert = attachments.filter((att) => !att.id);
    if (toInsert.length > 0) {
      const { error: insertError } = await supabase.from('attachments').insert(
        toInsert.map((att) => ({
          approval_id: id,
          name: att.name,
          type: att.type,
          size: att.size,
          url: att.url,
          key: att.key,
        }))
      );
      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }
  }

  const { data: updatedApproval, error: fetchUpdatedError } = await supabase
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
        attachments: attachments ( id, name, type, size, url, key )
        comments: comments ( id, name, user_email, comment, created_at ),
      `
    )
    .eq('id', params.id)
    .single();

  if (fetchUpdatedError) {
    return NextResponse.json(
      { error: fetchUpdatedError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ updatedApproval });
}

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
