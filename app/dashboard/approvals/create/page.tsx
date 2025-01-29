import { ApprovalForm } from "@/components/dashboard/approval-form"

export default function CreateApproval() {
  return (
    <div className="min-h-full bg-white">
        <div className ="p-4 space-y-4">
            <h1 className="text-3xl font-bold">Create New Approval</h1>
            <ApprovalForm />
      </div>
    </div>
  )
}

