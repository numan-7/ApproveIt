import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ClipboardList, CheckSquare } from 'lucide-react';
import { SummaryCards } from '@/components/dashboard/summary-cards';

export default function Dashboard() {
  return (
    <div className="p-4 space-y-4">
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
            <p className="mb-4 text-sm text-gray-600">
              Submit a new approval request for review.
            </p>
            <Link href="/dashboard/approvals/create">
              <Button className="w-full">Create Approval</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-green-500" />
              Outgoing Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              View and manage your outgoing approvals.
            </p>
            <Link href="/dashboard/approvals/outgoing">
              <Button variant="outline" className="w-full">
                View Approvals
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckSquare className="mr-2 h-5 w-5 text-yellow-500" />
              Incoming Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Review and act on pending incoming approvals.
            </p>
            <Link href="/dashboard/approvals/incoming">
              <Button variant="outline" className="w-full">
                Review Incoming
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
