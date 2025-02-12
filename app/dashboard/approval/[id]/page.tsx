'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ApprovalCard } from '@/components/dashboard/approval-card';
import { Button } from '@/components/ui/button';
import { SpinnerLoader } from '@/components/ui/spinner-loader';
import { ArrowLeft } from 'lucide-react';
import type { Approval } from '@/types/approval';
import { useMyApprovals } from '@/hooks/useMyApprovals';
import { usePendingApprovals } from '@/hooks/usePendingApprovals';
import { useAuth } from '@/context/AuthContext';
import { ApprovalTimeline } from '@/components/dashboard/approval-timeline';

export default function ApprovalDetail() {
  const [approval, setApproval] = useState<Approval | null>(null);
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
    useMyApprovals(true ? decodedType == 'outgoing' : false);
  const {
    viewedApproval,
    approvals: pendingApprovals,
    loading: pendingApprovalsLoading,
  } = usePendingApprovals(true ? decodedType == 'incoming' : false);

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
  }, [isLoading, myApprovals, pendingApprovals, params.id]);

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
        <div
          className={`w-full ${decodedType === 'outgoing' ? 'lg:w-3/4' : ''}`}
        >
          <ApprovalCard approval={approval} />
        </div>
        {decodedType === 'outgoing' && (
          <div className="w-full lg:w-1/4">
            <ApprovalTimeline events={approval.events} />
          </div>
        )}
      </div>
    </div>
  );
}
