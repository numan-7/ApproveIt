import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function DashboardContent() {
  const pendingApprovals = [
    { id: 1, name: "Project A", requester: "John Doe", date: "2024-01-26" },
    { id: 2, name: "Budget B", requester: "Jane Smith", date: "2024-01-27" },
    { id: 3, name: "Proposal C", requester: "Bob Johnson", date: "2024-01-28" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-white">Admin Dashboard</h1>
      <Card className="bg-white/10 backdrop-blur-lg border-none">
        <CardHeader>
          <CardTitle className="text-white">Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-white/20">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{approval.name}</h3>
                  <p className="text-sm text-white/70">
                    Requested by {approval.requester} on {approval.date}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                    <Check className="mr-1 h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="bg-red-500 hover:bg-red-600 text-white">
                    <X className="mr-1 h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

