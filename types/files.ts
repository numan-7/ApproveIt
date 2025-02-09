export interface FileUpload {
  appUrl: string;
  customId: string | null;
  fileHash: string;
  key: string;
  lastModified: number;
  name: string;
  serverData: {
    uploadedBy: string;
  };
  size: number;
  type: string;
  url: string;
}
