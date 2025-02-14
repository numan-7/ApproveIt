import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SummaryCardsProps {
  myRequestsCount: number;
  pendingApprovalsCount: number;
}

export function SummaryCards({
  myRequestsCount,
  pendingApprovalsCount,
}: SummaryCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
          <CardDescription>
            Pending approval requests you've sent out
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Requests</span>
              <span className="text-2xl font-bold">{myRequestsCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Pending My Approval</CardTitle>
          <CardDescription>
            Pending approval requests waiting for your approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Pending</span>
              <span className="text-2xl font-bold">
                {pendingApprovalsCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
