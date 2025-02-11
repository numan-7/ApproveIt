'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { PlusCircle, X, Loader2 } from 'lucide-react';
import { useMyApprovals } from '@/hooks/useMyApprovals';
import { useAuth } from '@/context/AuthContext';
import type { Approval, Attachment } from '@/types/approval';
import type { FileUpload } from '@/types/files';
import { SpinnerLoader } from '../ui/spinner-loader';
import { Badge } from '@/components/ui/badge';
import { twMerge } from 'tailwind-merge';

import { UploadButton, UploadDropzone} from '@/utils/uploadthing/uploadthing';

type Approver = {
  email: string;
  name: string;
  didApprove: boolean;
};

export function ApprovalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { user, loading: authLoading } = useAuth();
  const { approvals, addApproval, updateApproval, loading } = useMyApprovals();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [newApprover, setNewApprover] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string>('');
  const [deletingFileKey, setDeletingFileKey] = useState<string | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editId) {
      const approvalToEdit = approvals.find(
        (a) => a.id.toString() === editId.toString()
      );
      if (approvalToEdit) {
        setName(approvalToEdit.name);
        setDescription(approvalToEdit.description);
        setApprovers(approvalToEdit.approvers);
        setPriority(approvalToEdit.priority);
        setAttachments(approvalToEdit.attachments);
      }
    }
  }, [editId, approvals]);

  useEffect(() => {
    if (!editId && typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem('approvalFormDraft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setName(draft.name || '');
          setDescription(draft.description || '');
          setApprovers(draft.approvers || []);
          setPriority(draft.priority || 'medium');
          setAttachments(draft.attachments || []);
        } catch (err) {
          console.error('Error parsing saved draft:', err);
        }
      }
    }
  }, [editId]);

  useEffect(() => {
    if (!editId && typeof window !== 'undefined') {
      const draft = {
        name,
        description,
        approvers,
        priority,
        attachments,
      };
      localStorage.setItem('approvalFormDraft', JSON.stringify(draft));
    }
  }, [name, description, approvers, priority, attachments, editId]);

  const isLoading = authLoading || loading;

  const handleUploadComplete = (files: FileUpload[]) => {
    setIsFileUploading(false);

    const newAttachments: Attachment[] = files.map((file) => {
      let sizeStr;
      if (file.size >= 1024 * 1024) {
        sizeStr = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
      } else {
        sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      }

      return {
        key: file.key,
        name: file.name,
        type: file.type,
        size: sizeStr,
        url: file.url,
      };
    });
    setAttachments((prev) => [...prev, ...newAttachments]);

    const existingKeys = JSON.parse(localStorage.getItem('unsubmittedFiles') || '[]');
    const updatedKeys = [...existingKeys, ...newAttachments.map((file) => file.key)];
    localStorage.setItem('unsubmittedFiles', JSON.stringify(updatedKeys));
  };

  const handleDeleteAttachment = async (attachmentKey: string) => {
    setDeletingFileKey(attachmentKey);

    try {
      if (!editId) {
        const res = await fetch('/api/uploadthing', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileKey: attachmentKey }),
        });
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || 'Failed to delete attachment');
          setDeletingFileKey(null);
          return;
        }
      }
      setAttachments((prevAttachments) =>
        prevAttachments.filter((att) => att.key !== attachmentKey)
      );

      const existingKeys = JSON.parse(localStorage.getItem('unsubmittedFiles') || '[]');
      const updatedKeys = existingKeys.filter((key: string) => key !== attachmentKey);
      localStorage.setItem('unsubmittedFiles', JSON.stringify(updatedKeys));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setDeletingFileKey(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setError('');

    if (approvers.length === 0) {
      setError('Please add at least one approver.');
      return;
    }
    if (user?.email && approvers.some((a) => a.email === user.email)) {
      setError('You cannot add yourself as an approver.');
      return;
    }

    if (isFileUploading || deletingFileKey) {
      setError('Please wait until file uploads/deletions are complete.');
      return;
    }

    setIsSubmitting(true);
    const payload: Partial<Approval> = {
      name,
      description,
      requester: user?.email ?? 'unknown',
      approvers,
      date: new Date().toLocaleDateString(),
      status: 'pending',
      priority,
      comments: [],
      attachments,
    };

    try {
      if (editId) {
        await updateApproval(editId, payload);
      } else {
        await addApproval(payload);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('approvalFormDraft');
        }
      }
      localStorage.removeItem('unsubmittedFiles');

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addApproverHandler = () => {
    if (!newApprover) return;
    if (user && newApprover === user.email) {
      setError('You cannot add yourself as an approver.');
      return;
    }
    if (!approvers.some((a) => a.email === newApprover)) {
      setApprovers([
        ...approvers,
        { email: newApprover, name: newApprover, didApprove: false },
      ]);
      setNewApprover('');
      setError('');
    }
  };

  const removeApprover = (email: string) => {
    setApprovers(approvers.filter((a) => a.email !== email));
  };

  const handleApproverKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addApproverHandler();
    }
  };

  useEffect(() => {
    return () => {
      const unsubmittedFiles = JSON.parse(localStorage.getItem('unsubmittedFiles') || '[]');
      if (unsubmittedFiles.length > 0) {
        unsubmittedFiles.forEach(async (fileKey: string) => {
          try {
            await fetch('/api/uploadthing', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileKey }),
            });
          } catch (error) {
            console.error('Error deleting unsubmitted file:', error);
          }
        });
      }
      localStorage.removeItem('unsubmittedFiles');
    };
  }, []);

  return (
    <>
      {isLoading ? (
        <SpinnerLoader />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-600">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="name">Request Name</Label>
            <Input
              id="name"
              placeholder="Enter approval name"
              required
              disabled={isFileUploading || isSubmitting || !!deletingFileKey}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter approval description"
              required
              disabled={isFileUploading || isSubmitting || !!deletingFileKey}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Approver(s)</Label>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter approver email"
                disabled={isFileUploading || isSubmitting || !!deletingFileKey}
                value={newApprover}
                onChange={(e) => setNewApprover(e.target.value)}
                onKeyDown={handleApproverKeyDown}
                className="flex-grow"
              />
              <Button type="button" onClick={addApproverHandler}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {approvers.map((approver) => (
                <Badge
                  key={approver.email}
                  variant="outline"
                  className="font-normal text-sm pl-2 pr-1"
                >
                  {approver.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-2 text-red-700 hover:text-red-700 rounded-sm"
                    onClick={() => removeApprover(approver.email)}
                    disabled={isFileUploading || isSubmitting || !!deletingFileKey}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup
              value={priority}
              onValueChange={(value: string) =>
                setPriority(value as 'high' | 'medium' | 'low')
              }
            >
              <div className="flex flex-col sm:flex-row sm:space-x-4 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="priority-low" />
                  <Label htmlFor="priority-low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="priority-medium" />
                  <Label htmlFor="priority-medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="priority-high" />
                  <Label htmlFor="priority-high">High</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments</Label>
            <div className="flex flex-col gap-2">
              <UploadDropzone
                endpoint="imageUploader"
                onBeforeUploadBegin={(files: File[]) => {
                  setIsFileUploading(true);
                  return files;
                }}            
                // @ts-ignore
                onClientUploadComplete={(files: FileUpload[]) => {
                  handleUploadComplete(files);
                  setIsFileUploading(false);
                }}
                onUploadError={(error: Error) => {
                  setError(`Upload error: ${error.message}`);
                  setIsFileUploading(false);
                }}
                config={{ cn: twMerge }}
                className="flex items-center justify-center ut-button:font-dm ut-button:h-9 ut-button:text-sm ut-button:bg-black hover:ut-button:bg-primary/90"
                disabled={isFileUploading || isSubmitting || !!deletingFileKey}
              />
              {attachments.length > 0 && (
                <ul className="list-disc pl-5 text-sm">
                  {attachments.map((file, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {deletingFileKey === file.key ? (
                        <Loader2 className="animate-spin h-4 w-4 text-red-700" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 text-red-700 hover:text-red-700"
                          onClick={() => handleDeleteAttachment(file.key)}
                          disabled={isFileUploading || isSubmitting || !!deletingFileKey}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <span>{file.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <Button
            type="submit"
            className="w-full flex items-center justify-center"
            disabled={isSubmitting || isFileUploading || !!deletingFileKey}
          >
            {isSubmitting || isFileUploading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            {editId ? 'Update Approval Request' : 'Create Approval Request'}
          </Button>
        </form>
      )}
    </>
  );
}
