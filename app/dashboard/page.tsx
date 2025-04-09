'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, ClipboardList, CheckSquare, Clock } from 'lucide-react';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { useEffect, useState } from 'react';
import { SpinnerLoader } from '@/components/ui/spinner-loader';
import { ApprovalDashboardTimeline } from '@/components/dashboard/approval-dashboard-timeline';
import { UpcomingApprovalsCalendar } from '@/components/dashboard/upcoming-approvals-calendar';
import { Approval } from '@/types/approval';
import createClientForBrowser from '@/utils/supabase/client';

export default function Dashboard() {
  interface ApprovalNumbers {
    approvals: Approval[];
    incomingLength: number;
    outgoingLength: number;
    recentEvents: {
      id: string;
      type: string;
      name: string;
      date: string;
      approvalID: string;
      approvalName: string;
    }[];
  }

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [approvalStats, setApprovalStats] = useState<ApprovalNumbers>({
    approvals: [],
    incomingLength: 0,
    outgoingLength: 0,
    recentEvents: [],
  });

  const supabase = createClientForBrowser();

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

  useEffect(() => {
    const channel = supabase
      .channel('approval-and-events-update')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        (payload) => {
          const newEvent = payload.new as {
            id: string;
            type: string;
            name: string;
            date: string;
            approval_id: string;
          };

          if (!newEvent) return;

          const associatedApproval = approvalStats.approvals.find(
            (approval) =>
              approval.id.toString() == newEvent.approval_id.toString()
          );

          if (!associatedApproval) {
            console.log('No associated approval found for event:', newEvent);
            return;
          }

          const eventAsType = {
            id: newEvent.id,
            type: newEvent.type,
            name: newEvent.name,
            date: newEvent.date,
            approvalID: newEvent.approval_id,
            approvalName: associatedApproval.name,
          };

          setApprovalStats((prevStats) => ({
            ...prevStats,
            recentEvents: [eventAsType, ...prevStats.recentEvents],
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'approvals',
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const deletedApproval = payload.old as Approval;

            if (!deletedApproval) return;

            setApprovalStats((prevStats) => ({
              ...prevStats,
              approvals: prevStats.approvals.filter(
                (approval) => approval.id != deletedApproval.id
              ),
            }));

            return;
          } else {
            // must be an insert or update
            const newApproval = payload.new as Approval;

            if (!newApproval) return;

            if (payload.eventType === 'INSERT') {
              setApprovalStats((prevStats) => ({
                ...prevStats,
                approvals: [newApproval, ...prevStats.approvals],
              }));
            }

            if (payload.eventType === 'UPDATE') {
              setApprovalStats((prevStats) => ({
                ...prevStats,
                approvals: prevStats.approvals.map((approval) =>
                  approval.id === newApproval.id ? newApproval : approval
                ),
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (isLoading) return <SpinnerLoader />;

  return (
    <div className="p-4 space-y-3 min-h-screen md:flex md:flex-col">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <SummaryCards
        myRequestsCount={approvalStats.outgoingLength}
        pendingApprovalsCount={approvalStats.incomingLength}
      />

      <div className="grid md:grid-cols-3 gap-3">
        <Card className="rounded-md flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlusCircle className="mr-2 h-5 w-5 text-blue-500" />
              New Request
            </CardTitle>
            <CardDescription>
              Submit a new approval request for review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/approvals/create">
              <Button className="w-full">Create Approval</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-md flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center p-">
              <ClipboardList className="mr-2 h-5 w-5 text-green-500" />
              Outgoing Approvals
            </CardTitle>
            <CardDescription>
              View and manage your outgoing approvals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/approvals/outgoing">
              <Button variant="outline" className="w-full">
                View Approvals
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-md flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckSquare className="mr-2 h-5 w-5 text-yellow-500" />
              Incoming Approvals
            </CardTitle>
            <CardDescription>
              Review and act on pending incoming approvals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/approvals/incoming">
              <Button variant="outline" className="w-full">
                Review Incoming
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1">
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-purple-500" />
                <div className="relative">
                  <span>Approval Activity - Last 7 Days</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ApprovalDashboardTimeline events={approvalStats.recentEvents} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <UpcomingApprovalsCalendar approvals={approvalStats.approvals} />
        </div>
      </div>
    </div>
  );
}
