'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ApprovalCard } from '@/components/dashboard/approval-card';
import { ApprovalTimeline } from '@/components/dashboard/approval-timeline';
import { Button } from '@/components/ui/button';
import { SpinnerLoader } from '@/components/ui/spinner-loader';
import { ArrowLeft } from 'lucide-react';
import type { Approval } from '@/types/approval';
import { useMyApprovals } from '@/hooks/useMyApprovals';
import { usePendingApprovals } from '@/hooks/usePendingApprovals';
import { useAuth } from '@/context/AuthContext';
import { CommentsCard } from '@/components/dashboard/approval-comments';

export default function ApprovalDetail() {
  const [approval, setApproval] = useState<Approval | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const hasViewedRef = useRef(false);

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const encodedType = searchParams.get('type') ?? '';
  let decodedType = '';
  try {
    decodedType = atob(encodedType);
    decodedType = decodedType.slice(0, 8);
  } catch (error) {
    decodedType = '';
  }

  const { approvals: myApprovals, loading: myApprovalsLoading } =
    useMyApprovals(decodedType === 'outgoing');
  const {
    viewedApproval,
    approvals: pendingApprovals,
    loading: pendingApprovalsLoading,
  } = usePendingApprovals(decodedType === 'incoming');

  const isLoading = myApprovalsLoading || pendingApprovalsLoading;

  useEffect(() => {
    if (!isLoading) {
      const combinedApprovals = [...myApprovals, ...pendingApprovals];
      const foundApproval = combinedApprovals.find(
        (a) => a.id.toString() === params.id.toString()
      );
      setApproval(foundApproval ?? null);

      if (
        !hasViewedRef.current &&
        decodedType === 'incoming' &&
        foundApproval
      ) {
        viewedApproval(foundApproval.id);
        hasViewedRef.current = true;
      }
    }
  }, [
    isLoading,
    myApprovals,
    pendingApprovals,
    params.id,
    decodedType,
    viewedApproval,
  ]);

  useEffect(() => {
    if (approval) {
      setComments(approval.comments || []);
    }
  }, [approval]);

  if (isLoading) {
    return <SpinnerLoader />;
  }

  if (!approval) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        Approval not found
      </div>
    );
  }

  const handleAddComment = async (text: string) => {
    try {
      const res = await fetch(`/api/approvals/${approval.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: text }),
      });
      const data = await res.json();
      if (res.ok) {
        // API returns an array with the new comment object
        const newComment = data[0];
        setComments((prev) => [...prev, newComment]);
      } else {
        console.error('Error adding comment:', data.error);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(
        `/api/approvals/${approval.id}/comment/${commentId}`,
        {
          method: 'DELETE',
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );
      } else {
        console.error('Error deleting comment:', data.error);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="p-4 space-y-4 h-screen">
      <div className="space-y-4 mb-4">
        <h1 className="text-3xl font-bold">Approval Details</h1>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 lg:pb-4">
        <div className="w-full lg:w-2/3 space-y-8">
          <ApprovalCard approval={approval} />
          {decodedType === 'outgoing' && (
            <ApprovalTimeline events={approval.events} />
          )}
        </div>
        <div className="w-full lg:w-1/3">
          <CommentsCard
            comments={comments}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      </div>
    </div>
  );
}
