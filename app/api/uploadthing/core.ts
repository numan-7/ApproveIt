// app/api/uploadthing/core.ts
import { createClientForServer } from '@/utils/supabase/server';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

const auth = async (req: Request) => {
  const supabase = await createClientForServer();
  const { data } = await supabase.auth.getUser();
  return data;
};

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: '16MB',
      maxFileCount: 5,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError('Unauthorized');
      return { userId: user.user?.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
