'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-toastify';
import {
  Paperclip,
  Download,
  Pencil,
  X,
  Users,
  FileText,
  Calendar,
  Eye,
} from 'lucide-react';
import { useMyApprovals } from '@/hooks/useMyApprovals';
import { usePendingApprovals } from '@/hooks/usePendingApprovals';
import { useAuth } from '@/context/AuthContext';
import { SpinnerLoader } from '@/components/ui/spinner-loader';
import type { Approval } from '@/types/approval';
import '@cyntler/react-doc-viewer/dist/index.css';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';

interface ApprovalCardProps {
  approval: Approval;
}

export function ApprovalCard({ approval }: ApprovalCardProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { deleteApproval } = useMyApprovals(false);
  const { approveApproval, denyApproval } = usePendingApprovals(false);

  if (authLoading) return <SpinnerLoader />;

  const currentUserApprover = approval.approvers.find(
    (a) => a.email === user?.email
  );

  const handleEditApproval = () => {
    router.push(`/dashboard/approvals/create?edit=${approval.id}`);
  };

  const handleDeleteApproval = () => {
    if (approval.requester !== user?.email) return;
    if (confirm('Are you sure you want to delete this approval?')) {
      try {
        deleteApproval(approval.id);
      } catch (err) {
        toast.error(
          'Error deleting approval, something is wrong with the server.'
        );
      } finally {
        toast.success('Approval has been deleted successfully.');
        router.push('/dashboard');
      }
    }
  };

  const handleApproveApproval = async () => {
    try {
      await approveApproval(approval.id);
    } catch (error) {
      toast.error(
        'Error approving approval, something is wrong with the server.'
      );
    } finally {
      router.back();
      toast.success('Approval has been approved successfully.');
    }
  };

  const handleDenyApproval = async () => {
    try {
      await denyApproval(approval.id);
    } catch (err) {
      toast.error(
        'Error denying approval, something is wrong with the server.'
      );
    } finally {
      router.back();
      toast.success('Approval has been denied successfully.');
    }
  };

  return (
    <div className="space-y-4">
      {/* // @ts-ignore */}
      {user && <ApprovalDetailsCard approval={approval} user={user} />}
      <ApprovalStatusCard
        approval={approval}
        user={user}
        currentUserApprover={currentUserApprover}
        onEdit={handleEditApproval}
        onDelete={handleDeleteApproval}
        onApprove={handleApproveApproval}
        onDeny={handleDenyApproval}
      />
    </div>
  );
}

interface ApprovalDetailsCardProps {
  approval: Approval;
  user: {
    email?: string;
    name?: string;
  };
}

function ApprovalDetailsCard({ approval, user }: ApprovalDetailsCardProps) {
  // State to track the file selected for preview
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    url: string;
  } | null>(null);

  // List of allowed file extensions for previewing with DocViewer
  const supportedExtensions = [
    'bmp',
    'csv',
    'odt',
    'doc',
    'docx',
    'gif',
    'htm',
    'html',
    'jpg',
    'jpeg',
    'pdf',
    'png',
    'ppt',
    'pptx',
    'tiff',
    'txt',
    'xls',
    'xlsx',
    'mp4',
    'webp',
  ];

  // Handler for the view button
  const handleViewFile = (file: {
    name: string;
    size: string;
    url: string;
  }) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && supportedExtensions.includes(extension)) {
      setSelectedFile(file);
    } else {
      toast.info('This file type is not supported for preview.');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {approval.name}
          </CardTitle>
          {approval.expired && (
            <div className="flex items-center justify-between p-3 font-dm bg-red-50 rounded-lg">
              <span className="text-red-500 font-semibold">
                {user && user.email === approval.requester
                  ? 'Approval expired! You are still able to edit or delete this approval.'
                  : 'Approval has expired! Please contact the requester if you want to make changes.'}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between sm:flex-row flex-col">
            <div className="flex flex-col space-y-1">
              <div className="flex items-left flex-col">
                <span className="text-sm text-gray-500 text-center sm:text-left">
                  Requested By:
                </span>
                <span className="font-medium text-gray-800">
                  {approval.requester}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge
                variant={
                  approval.priority === 'high' ? 'destructive' : 'outline'
                }
                className="text-sm font-semibold"
              >
                {approval.priority.toUpperCase()} PRIORITY
              </Badge>
              <Badge
                variant="outline"
                className="text-sm font-semibold text-center flex items-center justify-center"
              >
                {approval.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="font-semibold">Due By:</span>
            </div>
            <span className="text-sm">
              {new Date(approval.due_date).toLocaleString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            {approval.description ? (
              <p className="text-gray-700">{approval.description}</p>
            ) : (
              <p className="text-sm text-gray-500">No description available.</p>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Attachments</h3>
            <div className="space-y-2">
              {approval.attachments && approval.attachments.length > 0 ? (
                approval.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Paperclip className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewFile(file)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            const response = await fetch(file.url);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', file.name);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('Error downloading file:', error);
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No attachments available.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-md shadow-2xl overflow-hidden transform transition-transform duration-300 ease-in-out scale-100">
            <button
              onClick={() => setSelectedFile(null)}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 hover:bg-gray-500 text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="h-[80vh] w-full overflow-auto">
              <DocViewer
                documents={[{ uri: selectedFile.url }]}
                pluginRenderers={DocViewerRenderers}
                config={{
                  header: {
                    disableFileName: true,
                    disableHeader: false,
                  },
                }}
                style={{ height: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface ApprovalStatusCardProps {
  approval: Approval;
  user: any;
  currentUserApprover?: {
    email: string;
    didApprove: boolean | null;
    name: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onApprove: () => void;
  onDeny: () => void;
}

function ApprovalStatusCard({
  approval,
  user,
  currentUserApprover,
  onEdit,
  onDelete,
  onApprove,
  onDeny,
}: ApprovalStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Approval Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approval.approvers.map((approver, index) => (
            <div
              key={index}
              className="flex items-center justify-between flex-col sm:flex-row"
            >
              <div>
                <p className="font-semibold">{approver.name}</p>
              </div>
              <Badge
                variant={
                  approver.didApprove === true
                    ? 'default'
                    : approver.didApprove === false
                      ? 'destructive'
                      : 'outline'
                }
              >
                {approver.didApprove === true
                  ? 'Approved'
                  : approver.didApprove === false
                    ? 'Rejected'
                    : 'Pending'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full space-y-2">
          {approval.requester === (user ? user.email : '') ? (
            <>
              <Button onClick={onEdit} variant="outline" className="w-full">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Approval
              </Button>
              <Button
                onClick={onDelete}
                variant="destructive"
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Delete Approval
              </Button>
            </>
          ) : (
            <>
              {currentUserApprover && (
                <>
                  <Button
                    onClick={onApprove}
                    variant="outline"
                    className="w-full bg-emerald-800 hover:bg-emerald-700 text-white"
                    disabled={
                      currentUserApprover.didApprove === true ||
                      approval.expired
                    }
                  >
                    {currentUserApprover.didApprove ? 'Approved' : 'Approve'}
                  </Button>
                  <Button
                    onClick={onDeny}
                    variant="destructive"
                    className="w-full"
                    disabled={
                      currentUserApprover.didApprove === false ||
                      approval.expired
                    }
                  >
                    {currentUserApprover.didApprove === false
                      ? 'Rejected'
                      : 'Reject'}
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
