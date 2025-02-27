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
import { SpinnerLoader } from '@/components/ui/spinner-loader';
import { DateTimePicker } from '@/components/date-time-picker';
import { Badge } from '@/components/ui/badge';
import { twMerge } from 'tailwind-merge';
import { convertToLocalTime } from '@/utils/date';
import { UploadDropzone } from '@/utils/uploadthing/uploadthing';
import { useZoomMeeting } from '@/hooks/useZoomMeeting';
import { toast } from 'react-toastify';
import { Suspense } from 'react';

import { join } from 'path';

type Approver = {
  email: string;
  name: string;
  didApprove: boolean | null;
};

export function ApprovalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { user, loading: authLoading } = useAuth();
  const { approvals, addApproval, updateApproval, loading } = useMyApprovals();

  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [newApprover, setNewApprover] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string>('');
  const [deletingFileKey, setDeletingFileKey] = useState<string | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [includeZoom, setIncludeZoom] = useState(false);
  const [zoomStartTime, setZoomStartTime] = useState<Date | undefined>(
    undefined
  );
  const [zoomDuration, setZoomDuration] = useState<number>(30);
  const [isZoomConnected, setIsZoomConnected] = useState(false);
  const [loadingZoom, setLoadingZoom] = useState(false);
  const { createMeeting, updateMeeting, deleteMeeting } = useZoomMeeting();

  useEffect(() => {
    if (editId) {
      const approvalToEdit = approvals.find(
        (a) => a.id.toString() === editId.toString()
      );
      if (approvalToEdit) {
        setName(approvalToEdit.name);
        setDescription(approvalToEdit.description);
        setApprovers(approvalToEdit.approvers);
        setDueDate(new Date(convertToLocalTime(approvalToEdit.due_date)));
        setPriority(approvalToEdit.priority);
        setAttachments(approvalToEdit.attachments);
        if (
          approvalToEdit.zoom_meeting &&
          approvalToEdit.zoom_meeting.start_time
        ) {
          setIncludeZoom(true);
          setZoomStartTime(new Date(approvalToEdit.zoom_meeting.start_time));
        }
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
      const draft = { name, description, approvers, priority, attachments };
      localStorage.setItem('approvalFormDraft', JSON.stringify(draft));
    }
  }, [name, description, approvers, priority, attachments, editId]);

  useEffect(() => {
    const checkZoomConnected = async () => {
      try {
        const res = await fetch('/api/zoom/is-connected');
        const data = await res.json();
        setIsZoomConnected(data.connected);
      } catch (err) {
        console.error('Error checking Zoom connection:', err);
        setIsZoomConnected(false);
      }
    };
    checkZoomConnected();
  }, []);

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
      return { key: file.key, name: file.name, size: sizeStr, url: file.url };
    });
    setAttachments((prev) => [...prev, ...newAttachments]);
    const existingKeys = JSON.parse(
      localStorage.getItem('unsubmittedFiles') || '[]'
    );
    const updatedKeys = [
      ...existingKeys,
      ...newAttachments.map((file) => file.key),
    ];
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
      setAttachments((prev) => prev.filter((att) => att.key !== attachmentKey));
      const existingKeys = JSON.parse(
        localStorage.getItem('unsubmittedFiles') || '[]'
      );
      const updatedKeys = existingKeys.filter(
        (key: string) => key !== attachmentKey
      );
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

    // Validate approvers
    if (approvers.length === 0) {
      setError('Please add at least one approver.');
      return;
    }
    if (user?.email && approvers.some((a) => a.email === user.email)) {
      setError('You cannot add yourself as an approver.');
      return;
    }
    // Validate due date
    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }
    // Ensure no file operations are in progress
    if (isFileUploading || deletingFileKey) {
      setError('Please wait until file uploads/deletions are complete.');
      return;
    }

    let zoomMeeting = null;
    let didDeleteMeeting = null;

    // Handle Zoom meeting creation/updating/deletion
    if (includeZoom) {
      if (!isZoomConnected) {
        setError(
          'Please connect your Zoom account in settings before including a meeting.'
        );
        return;
      }
      if (!zoomStartTime) {
        setError('Please select a Zoom meeting start time.');
        return;
      }
      setLoadingZoom(true);

      if (editId) {
        // Edit mode: Find the approval we're editing
        const approvalToEdit = approvals.find(
          (a) => a.id.toString() === editId.toString()
        );
        if (!approvalToEdit) {
          setError('Approval not found.');
          setLoadingZoom(false);
          return;
        }
        if (
          approvalToEdit.zoom_meeting &&
          approvalToEdit.zoom_meeting.meeting_id
        ) {
          // Update the existing meeting
          zoomMeeting = {
            topic: name,
            meetingStartTime: zoomStartTime.toISOString(),
            duration: zoomDuration,
            invitees: approvers.map((a) => a.email),
          };
          const data = await updateMeeting(
            approvalToEdit.zoom_meeting.meeting_id,
            zoomMeeting
          );
          console.log(data);
          // get rid of meetingStartTime
          const { meetingStartTime, ...rest } = zoomMeeting;
          zoomMeeting = rest;
          // Preserve the original join_url
          zoomMeeting = {
            ...zoomMeeting,
            start_time: zoomStartTime.toISOString(),
            meeting_id: data.meeting_id,
            join_url: approvalToEdit.zoom_meeting.join_url,
          };
          console.log(zoomMeeting);
        } else {
          // Create a new meeting since none exists
          zoomMeeting = await createMeeting({
            topic: name,
            meetingStartTime: zoomStartTime.toISOString(),
            duration: zoomDuration,
            invitees: approvers.map((a) => a.email),
          });
        }
      } else {
        // Create mode: Create a new meeting
        zoomMeeting = await createMeeting({
          topic: name,
          meetingStartTime: zoomStartTime.toISOString(),
          duration: zoomDuration,
          invitees: approvers.map((a) => a.email),
        });
      }

      if (!zoomMeeting) {
        setLoadingZoom(false);
        return;
      }
      setLoadingZoom(false);
    } else if (editId) {
      // In edit mode and user has unchecked includeZoom,
      // delete the existing meeting if any
      const approvalToEdit = approvals.find(
        (a) => a.id.toString() === editId.toString()
      );

      if (approvalToEdit && approvalToEdit?.zoom_meeting.meeting_id) {
        console.log('approvalToEdit.zoom_meeting', approvalToEdit.zoom_meeting);
        didDeleteMeeting = await deleteMeeting(
          approvalToEdit.zoom_meeting.meeting_id
        );
      }
    }

    // Convert due date to UTC formatted string
    const utcDueDate = new Date(dueDate)
      .toISOString()
      .replace('T', ' ')
      .replace('Z', '+00');

    setIsSubmitting(true);

    // Build the payload for approval
    const payload: Partial<Approval> = {
      name,
      description,
      requester: user?.email ?? 'unknown',
      due_date: utcDueDate,
      approvers,
      status: 'pending',
      priority,
      comments: [],
      attachments,
    };

    // Attach Zoom meeting data based on current state
    if (includeZoom) {
      // In creation/updating mode, add the meeting data
      // @ts-ignore
      payload.zoom_meeting = zoomMeeting;
    } else {
      // In edit mode with Zoom disabled, verify deletion if a meeting previously existed
      if (editId) {
        const approvalToEdit = approvals.find(
          (a) => a.id.toString() === editId.toString()
        );
        if (
          approvalToEdit?.zoom_meeting &&
          approvalToEdit.zoom_meeting.meeting_id &&
          !didDeleteMeeting
        ) {
          setError('Failed to delete Zoom meeting');
          return;
        }
      }
      // Set an empty meeting
      // @ts-ignore
      payload.zoom_meeting = {};
    }

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
      router.back();
    } catch (err: any) {
      setError(err.message);
      toast.error('Something went wrong on our end. Please try again later.');
    } finally {
      if (editId) {
        toast.success('Approval request updated successfully.');
      } else {
        toast.success('Approval request created successfully.');
      }
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
        { email: newApprover, name: newApprover, didApprove: null },
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
      const unsubmittedFiles = JSON.parse(
        localStorage.getItem('unsubmittedFiles') || '[]'
      );
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

  const formGroupClass = 'mb-4';

  const RedAsterisk = () => (
    <span className="text-red-600" aria-hidden="true">
      &nbsp;*
    </span>
  );

  return (
    <Suspense fallback={<SpinnerLoader />}>
      <>
        {isLoading ? (
          <SpinnerLoader />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-600">{error}</p>}

            {/* Request Name */}
            <div className={formGroupClass}>
              <Label htmlFor="name" className="block mb-1">
                Request Name
                <RedAsterisk />
              </Label>
              <Input
                id="name"
                placeholder="Enter approval name"
                required
                disabled={isFileUploading || isSubmitting || !!deletingFileKey}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className={formGroupClass}>
              <Label htmlFor="description" className="block mb-1">
                Description
                <RedAsterisk />
              </Label>
              <Textarea
                id="description"
                placeholder="Enter approval description"
                required
                disabled={isFileUploading || isSubmitting || !!deletingFileKey}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Approvers */}
            <div className={formGroupClass}>
              <Label className="block mb-1">
                Approver(s)
                <RedAsterisk />
              </Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  type="email"
                  placeholder="Enter approver email"
                  disabled={
                    isFileUploading || isSubmitting || !!deletingFileKey
                  }
                  value={newApprover}
                  onChange={(e) => setNewApprover(e.target.value)}
                  onKeyDown={handleApproverKeyDown}
                  className="flex-grow"
                />
                <Button type="button" onClick={addApproverHandler}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
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
                      disabled={
                        isFileUploading || isSubmitting || !!deletingFileKey
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className={formGroupClass}>
              <DateTimePicker date={dueDate} setDate={setDueDate} />
            </div>

            {/* Priority */}
            <div className={formGroupClass}>
              <Label className="block mb-1">
                Priority
                <RedAsterisk />
              </Label>
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

            {/* Attachments */}
            <div className={formGroupClass}>
              <Label htmlFor="attachments" className="block mb-1">
                Attachments
              </Label>
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
                <ul className="list-disc pl-5 mt-2 text-sm">
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
                          disabled={
                            isFileUploading || isSubmitting || !!deletingFileKey
                          }
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

            {/* Zoom Meeting Section */}
            <div className={formGroupClass}>
              <Label className="block mb-1">Zoom Meeting</Label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={includeZoom}
                  onChange={(e) => {
                    setIncludeZoom(e.target.checked);
                    if (!e.target.checked) {
                      setZoomStartTime(undefined);
                    }
                  }}
                />
                <span className="text-sm">
                  Create a 30m Zoom meeting for this Approval?
                </span>
              </div>
              {includeZoom && (
                <div className="space-y-2">
                  <DateTimePicker
                    isZoom={true}
                    date={zoomStartTime}
                    setDate={setZoomStartTime}
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full flex items-center justify-center"
              disabled={isSubmitting || isFileUploading || !!deletingFileKey}
            >
              {(isSubmitting || isFileUploading || loadingZoom) && (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              )}
              {editId ? 'Update Approval Request' : 'Create Approval Request'}
            </Button>
          </form>
        )}
      </>
    </Suspense>
  );
}
