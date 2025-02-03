import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ClipboardList, CheckSquare } from "lucide-react";
import { SummaryCards } from "@/components/dashboard/summary-cards";

export default function Dashboard() {
  return (
    <div className ="p-4 space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <SummaryCards myRequestsCount={5} pendingApprovalsCount={3} />

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlusCircle className="mr-2 h-5 w-5 text-blue-500" />
              New Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">Submit a new approval request for review.</p>
            <Link href="/dashboard/approvals/create">
              <Button className="w-full">Create Request</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-green-500" />
              My Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">View and manage your submitted requests.</p>
            <Link href="/dashboard/approvals/my-requests">
              <Button variant="outline" className="w-full">
                View Requests
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckSquare className="mr-2 h-5 w-5 text-yellow-500" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">Review and act on pending approval requests.</p>
            <Link href="/dashboard/approvals/pending">
              <Button variant="outline" className="w-full">
                Review Pending
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

