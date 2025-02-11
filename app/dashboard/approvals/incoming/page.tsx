'use client';

import { usePendingApprovals } from '@/hooks/usePendingApprovals';
import { ApprovalTable } from '@/components/dashboard/approval-table';
import { Pagination } from '@/components/dashboard/pagination';
import { useState } from 'react';
import { SpinnerLoader } from '@/components/ui/spinner-loader';

const ITEMS_PER_PAGE = 10;

export default function PendingApprovals() {
  const { approvals, loading, approveApproval, denyApproval } =
    usePendingApprovals();
  const [currentPage, setCurrentPage] = useState(1);
  if (loading) return <SpinnerLoader />;
  const totalPages = Math.ceil(approvals.length / ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Incoming Approvals</h1>
      <div className="flex-grow">
        <ApprovalTable
          approvals={approvals}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          type="incoming"
          onApprove={approveApproval}
          onDeny={denyApproval}
        />
      </div>
      <div className="mt-auto pt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
