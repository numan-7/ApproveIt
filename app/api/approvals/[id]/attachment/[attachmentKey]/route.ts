'use server';

import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

export const deleteUTFiles = async (files: string[]) => {
  try {
    await utapi.deleteFiles(files);
  } catch (error) {
    console.error('UTAPI: Error deleting files', error);
    throw error;
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; attachmentKey: string } }
) {
  const supabase = await createClientForServer();
  const { id, attachmentKey } = params;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });
  }

  const { data: approval, error: approvalError } = await supabase
    .from('approvals')
    .select('requester')
    .eq('id', id)
    .single();
  if (approvalError) {
    return NextResponse.json({ error: approvalError.message }, { status: 500 });
  }
  if (approval.requester !== user.email) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  try {
    await deleteUTFiles([attachmentKey]);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Error deleting file from UploadThing' },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from('attachments')
    .delete()
    .eq('approval_id', id)
    .eq('key', attachmentKey);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Attachment deleted successfully' });
}
