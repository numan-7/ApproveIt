'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ApprovalCard } from '@/components/dashboard/approval-card';
import { Button } from '@/components/ui/button';
import { SpinnerLoader } from '@/components/ui/spinner-loader';
import { ArrowLeft } from 'lucide-react';
import type { Approval } from '@/types/approval';
import { useMyApprovals } from '@/hooks/useMyApprovals';
import { usePendingApprovals } from '@/hooks/usePendingApprovals';
import { a } from 'vitest/dist/chunks/suite.BJU7kdY9.js';

export default function ApprovalDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const encodedType = searchParams.get('type') ?? '';
  let decodedType = '';
  try {
    decodedType = atob(encodedType);
  } catch (error) {
    decodedType = '';
  }

  const { approvals: myApprovals, loading: myApprovalsLoading } =
    useMyApprovals();
  const { approvals: pendingApprovals, loading: pendingApprovalsLoading } =
    usePendingApprovals();

  const [approval, setApproval] = useState<Approval | null>(null);

  const isLoading = myApprovalsLoading || pendingApprovalsLoading;

  useEffect(() => {
    if (!isLoading) {
      const combinedApprovals = [...myApprovals, ...pendingApprovals];
      const foundApproval = combinedApprovals.find(
        (a) => a.id.toString() === params.id.toString()
      );
      console.log('foundApproval', foundApproval);
      setApproval(foundApproval ?? null);
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
    <div className="p-4 space-y-4">
      <div className="space-y-4 mb-6">
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
      <ApprovalCard approval={approval} />
    </div>
  );
}
