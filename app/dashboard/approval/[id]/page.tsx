"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ApprovalCard } from "@/components/dashboard/approval-card"
import { Button } from "@/components/ui/button"
import { SpinnerLoader } from "@/components/ui/spinner-loader"
import { ArrowLeft } from "lucide-react"
import type { Approval } from "@/types/approval"

const mockApprovals: Approval[] = [
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
  }
]

export default function ApprovalDetail() {
  const params = useParams()
  const router = useRouter()
  const [approval, setApproval] = useState<Approval | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // tesitng daaaa loader
    const fetchApproval = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const fetchedApproval = mockApprovals.find((a) => a.id === Number(params.id))
      setApproval(fetchedApproval || null)
      setIsLoading(false)
    }

    fetchApproval()
  }, [params.id])

  if (isLoading) {
    return <SpinnerLoader />
  }

  if (!approval) {
    return <div>Approval not found</div>
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">Approval Details</h1>
        <Button variant="outline" size="sm" className="flex items-center" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <ApprovalCard approval={approval} />
    </div>
  )
}

