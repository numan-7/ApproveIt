import { Approval } from "@/app/types/approval"
import { ApprovalCard } from "@/components/dashboard/approval-card"

interface ApprovalListProps {
  approvals: Approval[]
  isMyRequest: boolean
  onToggleExpand: (id: number) => void
}

export function ApprovalList({ approvals, isMyRequest, onToggleExpand }: ApprovalListProps) {
  return (
    <div className="space-y-6">
      {approvals.map((approval) => (
        <ApprovalCard
          key={approval.id}
          approval={approval}
          isMyRequest={isMyRequest}
          onToggleExpand={() => onToggleExpand(approval.id)}
        />
      ))}
    </div>
  )
}

