'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ClipboardList, CheckSquare, Clock } from 'lucide-react';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { useEffect, useState } from 'react';
import { SpinnerLoader } from '@/components/ui/spinner-loader';
import { ApprovalDashboardTimeline } from '@/components/dashboard/approval-dashboard-timeline';

export default function Dashboard() {
  interface ApprovalNumbers {
    incoming: number;
    outgoing: number;
    recentEvents: {
      id: string;
      type: string;
      name: string;
      date: string;
      approvalName: string;
    }[];
  }

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [approvalStats, setApprovalStats] = useState<ApprovalNumbers>({
    incoming: 0,
    outgoing: 0,
    recentEvents: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/approvals');
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        setApprovalStats(json);
      } catch (error) {
        console.error('Error fetching approvals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <SpinnerLoader />;

  const mockRecentEvents = [
    {
      id: 1,
      type: 'viewed',
      user: 'alice@example.com',
      date: '2025-02-11T20:30:00.000Z',
      approvalName: 'Budget Approval',
    },
    {
      id: 2,
      type: 'approved',
      user: 'bob@example.com',
      date: '2025-02-11T21:00:00.000Z',
      approvalName: 'Project X Kickoff',
    },
    {
      id: 3,
      type: 'rejected',
      user: 'charlie@example.com',
      date: '2025-02-11T21:15:00.000Z',
      approvalName: 'New Hire Request',
    },
    {
      id: 4,
      type: 'viewed',
      user: 'david@example.com',
      date: '2025-02-11T22:00:00.000Z',
      approvalName: 'Marketing Campaign',
    },
    {
      id: 5,
      type: 'approved',
      user: 'eve@example.com',
      date: '2025-02-12T09:00:00.000Z',
      approvalName: 'Software License Renewal',
    },
    {
      id: 6,
      type: 'approved',
      user: 'eve@example.com',
      date: '2025-02-12T09:00:00.000Z',
      approvalName: 'Software License Renewal',
    },
    {
      id: 7,
      type: 'approved',
      user: 'eve@example.com',
      date: '2025-02-12T09:00:00.000Z',
      approvalName: 'Software License Renewal',
    },
    {
      id: 8,
      type: 'approved',
      user: 'eve@example.com',
      date: '2025-02-12T09:00:00.000Z',
      approvalName: 'Software License Renewal',
    },
    {
      id: 9,
      type: 'approved',
      user: 'eve@example.com',
      date: '2025-02-12T09:00:00.000Z',
      approvalName: 'Software License Renewal',
    },
  ];

  return (
    <div className="p-4 space-y-3 min-h-screen md:flex md:flex-col">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <SummaryCards
        myRequestsCount={approvalStats.outgoing}
        pendingApprovalsCount={approvalStats.incoming}
      />

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
      <Card className="flex flex-col md:flex-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-purple-500" />
            Recent Approval Events
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <ApprovalDashboardTimeline events={approvalStats.recentEvents} />
        </CardContent>
      </Card>
    </div>
  );
}
