"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { ApprovalList } from "@/components/dashboard/approval-list"
import type { Approval } from "@/app/types/approval"

export default function Dashboard() {
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
      expanded: false,
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
      expanded: false,
    },
  ])

  const [pendingMyApproval, setPendingMyApproval] = useState<Approval[]>([
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
      expanded: false,
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
      expanded: false,
    },
  ])

  const toggleExpand = (id: number, isMyRequest: boolean) => {
    const updateFunction = isMyRequest ? setMyRequests : setPendingMyApproval
    updateFunction((prevApprovals: Approval[]) =>
      prevApprovals.map((approval) => (approval.id === id ? { ...approval, expanded: !approval.expanded } : approval)),
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/dashboard/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Approval Request
          </Button>
        </Link>
      </div>

      <SummaryCards myRequestsCount={myRequests.length} pendingApprovalsCount={pendingMyApproval.length} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">My Requests</h2>
        <ApprovalList approvals={myRequests} isMyRequest={true} onToggleExpand={(id) => toggleExpand(id, true)} />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Pending My Approval</h2>
        <ApprovalList
          approvals={pendingMyApproval}
          isMyRequest={false}
          onToggleExpand={(id) => toggleExpand(id, false)}
        />
      </div>
    </div>
  )
}

