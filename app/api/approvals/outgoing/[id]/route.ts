import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';
import { UTApi } from 'uploadthing/server';
import { generateApprovalEmbedding } from '@/utils/embedding/embed';

const deleteUTFiles = async (files: string[]) => {
  const utapi = new UTApi();
  try {
    await utapi.deleteFiles(files);
  } catch (error) {
    console.error('UTAPI: Error deleting files', error);
    throw error;
  }
};

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
    .select('requester, approvers')
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

  const embedding = await generateApprovalEmbedding(approvalUpdates);

  if (embedding) {
    approvalUpdates.embedding = embedding;
  }

  const { data: huhuh, error: updateError } = await supabase
    .from('approvals')
    .update(approvalUpdates)
    .eq('id', id);

  if (updateError) {
    console.error('Error updating approval', updateError);
    return NextResponse.json('Something went wrong', { status: 500 });
  }

  if (Array.isArray(attachments)) {
    const { data: currentAttachments, error: currentAttsError } = await supabase
      .from('attachments')
      .select('id, key')
      .eq('approval_id', id);

    if (currentAttsError) {
      return NextResponse.json(
        { error: currentAttsError.message },
        { status: 500 }
      );
    }

    const currentIds = currentAttachments.map((att) => att.id);
    const submittedIds = attachments.map((att) => att.id).filter(Boolean);

    const currentKeys = currentAttachments.map((att) => att.key);
    const submittedKeys = attachments.map((att) => att.key).filter(Boolean);

    const toDelete = currentIds.filter(
      (currId) => !submittedIds.includes(currId)
    );

    const toDeleteKey = currentKeys.filter(
      (currKey) => !submittedKeys.includes(currKey)
    );

    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('attachments')
        .delete()
        .in('id', toDelete);

      deleteUTFiles(toDeleteKey);

      if (deleteError) {
        console.error('Error deleting attachments', deleteError);
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
        due_date,
        priority,
        approvers,
        expired,
        attachments: attachments ( id, name, size, url, key )
        comments: comments ( id, name, user_email, comment, created_at ),
      `
    )
    .eq('id', params.id)
    .single();

  if (fetchUpdatedError) {
    console.error('Error fetching updated approval', fetchUpdatedError);
    return NextResponse.json(
      { error: fetchUpdatedError.message },
      { status: 500 }
    );
  } else {
    // @ts-ignore
    const existingEmails = new Set(existing.approvers.map((a: any) => a.email));
    // @ts-ignore
    const updatedEmails = new Set(
      // @ts-ignore
      updatedApproval.approvers.map((a: any) => a.email)
    );

    // Find approvers that exist in updatedApproval but NOT in existing
    // @ts-ignore
    const newApprovers = updatedApproval.approvers.filter(
      (approver: any) => !existingEmails.has(approver.email)
    );

    if (newApprovers.length > 0) {
      await supabase.functions.invoke('invite-approvers', {
        body: {
          approvalId: id,
          requester: user.email,
          approvers: newApprovers,
        },
      });
    }
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
    .select(
      `
        requester,
        attachments: attachments ( id, name, size, url, key )
      `
    )
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

  const attachments = existing.attachments.map((att) => att.key);
  await deleteUTFiles(attachments);
  return NextResponse.json({ message: 'Approval deleted successfully' });
}
