"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ApprovalTable } from "@/components/dashboard/approval-table"
import { Pagination } from "@/components/dashboard/pagination"
// import { SpinnerLoader } from "@/components/ui/spinner-loader"
import type { Approval } from "@/types/approval"

const ITEMS_PER_PAGE = 10

export default function MyRequests() {
  const [myRequests, setMyRequests] = useState<Approval[]>([
    {
      id: 1,
      name: "Q4 Marketing Budget Approval",
      requester: "You",
      approver: "John Doe",
      date: "2024-01-26",
      description:
        "Review and approval needed for Q4 2024 marketing budget allocation across digital and traditional channels.",
      status: "pending",
      priority: "high",
      comments: [
        {
          user: "John Doe",
          text: "The social media budget allocation looks good, but we might need to adjust the PPC spending.",
          date: "2024-01-27",
        },
      ],
      attachments: [
        { name: "Q4_Budget_Breakdown.xlsx", type: "excel", size: "2.4 MB", url: "#" },
        { name: "Marketing_Strategy.pdf", type: "pdf", size: "1.8 MB", url: "#" },
      ],
    },
    {
      id: 2,
      name: "New Product Launch Timeline",
      requester: "You",
      approver: "Sarah Wilson",
      date: "2024-01-27",
      description: "Approval required for the revised product launch timeline and associated resource allocation.",
      status: "pending",
      priority: "medium",
      comments: [],
      attachments: [{ name: "Launch_Schedule.pdf", type: "pdf", size: "1.2 MB", url: "#" }],
    },
  ])

  const [currentPage, setCurrentPage] = useState(1)
//   const [isLoading, setIsLoading] = useState(true)

  const totalPages = Math.ceil(myRequests.length / ITEMS_PER_PAGE)

  return (
    <div className="flex flex-col min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">My Requests</h1>

      <div className="flex-grow">
        <ApprovalTable approvals={myRequests} currentPage={currentPage} itemsPerPage={ITEMS_PER_PAGE} />
      </div>

      <div className="mt-auto pt-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}

