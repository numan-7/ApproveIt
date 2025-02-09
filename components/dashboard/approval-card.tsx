'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Pencil, Paperclip, Download } from 'lucide-react';
import type { Approval } from '@/types/approval';
import { useMyApprovals } from '@/hooks/useMyApprovals';
import { usePendingApprovals } from '@/hooks/usePendingApprovals';
import { useAuth } from '@/context/AuthContext';
import { SpinnerLoader } from '../ui/spinner-loader';

interface Comment {
  user: string;
  date: string;
  text: string;
}

interface ApprovalCardProps {
  approval: Approval;
}

export function ApprovalCard({ approval }: ApprovalCardProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const myApprovalsHook = useMyApprovals();
  const pendingApprovalsHook = usePendingApprovals();
  const [newCommentText, setNewCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>(approval.comments ?? []);
  const [editingCommentIndex, setEditingCommentIndex] = useState<number | null>(
    null
  );
  const [editedCommentText, setEditedCommentText] = useState('');

  if (authLoading) return <SpinnerLoader />;

  // Determine if the current user is one of the approvers
  const currentUserApprover = approval.approvers.find(
    (a) => a.email === user?.email
  );

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const newComment: Comment = {
      user: user?.email ?? 'unknown',
      date: new Date().toLocaleString(),
      text: newCommentText,
    };
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    if (user && approval.requester === user.email) {
      myApprovalsHook.updateApproval(approval.id, {
        ...approval,
        comments: updatedComments,
      });
    } else {
      pendingApprovalsHook.updateApproval(approval.id, {
        ...approval,
        comments: updatedComments,
      });
    }
    setNewCommentText('');
  };

  const handleDeleteComment = (index: number) => {
    const updatedComments = comments.filter((_, i) => i !== index);
    setComments(updatedComments);
    if (user && approval.requester === user.email) {
      myApprovalsHook.updateApproval(approval.id, {
        ...approval,
        comments: updatedComments,
      });
    } else {
      pendingApprovalsHook.updateApproval(approval.id, {
        ...approval,
        comments: updatedComments,
      });
    }
    if (editingCommentIndex === index) {
      setEditingCommentIndex(null);
      setEditedCommentText('');
    }
  };

  const handleEditComment = (index: number) => {
    setEditingCommentIndex(index);
    setEditedCommentText(comments[index].text);
  };

  const handleSaveEditedComment = (index: number) => {
    const updatedComments = comments.map((comment, i) =>
      i === index
        ? {
            ...comment,
            text: editedCommentText,
            date: new Date().toLocaleString(),
          }
        : comment
    );
    setComments(updatedComments);
    if (user && approval.requester === user.email) {
      myApprovalsHook.updateApproval(approval.id, {
        ...approval,
        comments: updatedComments,
      });
    } else {
      pendingApprovalsHook.updateApproval(approval.id, {
        ...approval,
        comments: updatedComments,
      });
    }
    setEditingCommentIndex(null);
    setEditedCommentText('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEditApproval = () => {
    router.push(`/dashboard/approvals/create?edit=${approval.id}`);
  };

  const handleDeleteApproval = () => {
    if (approval.requester !== user?.email) {
      return;
    }
    if (confirm('Are you sure you want to delete this approval?')) {
      myApprovalsHook.deleteApproval([approval.id]);
      router.push('/dashboard');
    }
  };

  const handleApproveApproval = () => {
    pendingApprovalsHook.approveApproval(approval.id);
  };

  const handleDenyApproval = () => {
    pendingApprovalsHook.denyApproval(approval.id);
  };

  return (
    <Card className="overflow-hidden border border-gray-200 mb-4">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="w-full">
            <CardTitle className="text-xl sm:text-2xl font-semibold break-words">
              {approval.name}
            </CardTitle>
            <CardDescription className="mt-1 text-sm break-words">
              Requester: {approval.requester} • Approver(s):{' '}
              {approval.approvers
                .map((a) => `${a.name}${a.didApprove ? ' (Approved)' : ''}`)
                .join(', ')}{' '}
              • {approval.date}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`${getPriorityColor(approval.priority)} mt-2 sm:mt-0 text-sm font-normal`}
          >
            {approval.priority.charAt(0).toUpperCase() +
              approval.priority.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6">
        <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-sm break-words">{approval.description}</p>
        </div>

        <div>
          <h3 className="font-medium mb-3">Attachments</h3>
          <div className="grid gap-2">
            {approval.attachments.map((file, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0 mb-2 sm:mb-0">
                  <Paperclip className="h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate max-w-[150px] sm:max-w-full">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto sm:ml-2">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Comments</h3>
          <ScrollArea className="h-[240px] rounded-md border p-4">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="flex items-start space-x-3 mb-4">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>
                      {comment.user?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold">
                          {comment.user}
                        </span>
                        <span className="text-xs text-gray-500">
                          {comment.date}
                        </span>
                      </div>
                      {comment.user === (user ? user.email : '') && (
                        <div className="flex space-x-2">
                          {editingCommentIndex === index ? (
                            <>
                              <Button
                                onClick={() => handleSaveEditedComment(index)}
                                variant="outline"
                                size="sm"
                              >
                                Save
                              </Button>
                              <Button
                                onClick={() => {
                                  setEditingCommentIndex(null);
                                  setEditedCommentText('');
                                }}
                                variant="ghost"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleEditComment(index)}
                                variant="ghost"
                                size="sm"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleDeleteComment(index)}
                                variant="ghost"
                                size="sm"
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {editingCommentIndex === index ? (
                      <Textarea
                        value={editedCommentText}
                        onChange={(e) => setEditedCommentText(e.target.value)}
                        rows={2}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm mt-1 break-words">{comment.text}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No comments yet.</p>
            )}
          </ScrollArea>

          <div className="mt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Textarea
                id="comment"
                className="flex-1"
                rows={2}
                placeholder="Add a comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              />
              <Button
                onClick={handleAddComment}
                className="w-full sm:w-auto sm:h-full"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-2">
        {/* If the current user is the approval’s owner, show edit/delete buttons */}
        {approval.requester === (user ? user.email : '') ? (
          <>
            <Button
              onClick={handleEditApproval}
              variant="outline"
              className="w-full sm:w-1/2 sm:h-full"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Approval
            </Button>
            <Button
              onClick={handleDeleteApproval}
              variant="destructive"
              className="w-full sm:w-1/2 sm:h-full"
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
                  onClick={handleApproveApproval}
                  variant="outline"
                  className="w-full sm:w-1/2 bg-emerald-800 hover:bg-emerald-700 text-white hover:text-white"
                  disabled={
                    !!currentUserApprover.didApprove ||
                    approval.status !== 'pending'
                  }
                >
                  {currentUserApprover.didApprove ? 'Approved' : 'Approve'}
                </Button>
                <Button
                  onClick={handleDenyApproval}
                  variant="destructive"
                  className="w-full sm:w-1/2"
                  disabled={approval.status !== 'pending'}
                >
                  Reject
                </Button>
              </>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
