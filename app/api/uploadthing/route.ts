'/api/uploadthing/route.ts';
import { createRouteHandler } from 'uploadthing/next';
import { NextResponse } from 'next/server';
import { ourFileRouter } from './core';

import { UTApi } from 'uploadthing/server';
const utapi = new UTApi();

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

export const deleteUTFiles = async (files: string[]) => {
  try {
    await utapi.deleteFiles(files);
  } catch (error) {
    console.error('UTAPI: Error deleting files', error);
    throw error;
  }
};

export async function DELETE(req: Request) {
  const { fileKey } = await req.json();
  if (!fileKey) {
    return NextResponse.json({ error: 'Missing fileKey' }, { status: 400 });
  }
  try {
    await utapi.deleteFiles([fileKey]);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    console.error('UTAPI: Error deleting file', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
