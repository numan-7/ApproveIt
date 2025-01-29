"use client"

import { useState, useEffect } from "react"
import { ApprovalTable } from "@/components/dashboard/approval-table"
import { Pagination } from "@/components/dashboard/pagination"
// import { SpinnerLoader } from "@/components/ui/spinner-loader"
import type { Approval } from "@/types/approval"

const ITEMS_PER_PAGE = 10

export default function PendingApprovals() {
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([
    {
      id: 3,
      name: "HR Policy Update",
      requester: "Jane Smith",
      approver: "You",
      date: "2024-01-28",
      description: "Review and approve the updated HR policies for the upcoming fiscal year.",
      status: "pending",
      priority: "medium",
      comments: [],
      attachments: [{ name: "Updated_HR_Policies.pdf", type: "pdf", size: "3.1 MB", url: "#" }],
    },
    {
      id: 4,
      name: "IT Infrastructure Upgrade Proposal",
      requester: "Mike Johnson",
      approver: "You",
      date: "2024-01-29",
      description: "Approval needed for the proposed IT infrastructure upgrades, including budget and timeline.",
      status: "pending",
      priority: "high",
      comments: [
        { user: "You", text: "Can we get a breakdown of the costs for each phase of the upgrade?", date: "2024-01-30" },
      ],
      attachments: [
        { name: "IT_Upgrade_Proposal.pdf", type: "pdf", size: "5.7 MB", url: "#" },
        { name: "Upgrade_Timeline.xlsx", type: "excel", size: "1.3 MB", url: "#" },
      ],
    },
  ])

  const [currentPage, setCurrentPage] = useState(1)
//   const [isLoading, setIsLoading] = useState(true)

  const totalPages = Math.ceil(pendingApprovals.length / ITEMS_PER_PAGE)

  return (
    <div className="flex flex-col min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Pending My Approval</h1>

      <div className="flex-grow">
        <ApprovalTable approvals={pendingApprovals} currentPage={currentPage} itemsPerPage={ITEMS_PER_PAGE} />
      </div>

      <div className="mt-auto pt-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}

