'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ApprovalEvent {
  id: string;
  type: string;
  name: string;
  date: string;
  approvalName: string;
  approvalID: string;
}

interface ApprovalEventsProps {
  events: ApprovalEvent[];
}

export function ApprovalDashboardTimeline({ events }: ApprovalEventsProps) {
  const router = useRouter();

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'viewed':
        return <Eye className="text-blue-500 h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="text-green-500 h-4 w-4" />;
      case 'rejected':
        return <XCircle className="text-red-500 h-4 w-4" />;
      default:
        return null;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'viewed':
        return 'bg-white border border-blue-500 text-white';
      case 'approved':
        return 'bg-white border border-green-500 text-white';
      case 'rejected':
        return 'bg-white border border-red-500 text-white';
      default:
        return 'bg-white border border-gray-500 text-white';
    }
  };

  return (
    <ScrollArea className="w-full h-[450px]">
      <div className="relative pt-4 pr-4">
        <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
        {events.map((event) => (
          <div key={event.id} className="relative mb-4 flex items-start">
            <div
              className={cn(
                'absolute left-4 flex items-center justify-center w-8 h-8 rounded-full -translate-x-1/2 z-10',
                getEventColor(event.type)
              )}
            >
              {getEventIcon(event.type)}
            </div>
            <div className="ml-12">
              <p
                className="font-medium cursor-pointer hover:underline"
                onClick={() => {
                  router.push(
                    `dashboard/approval/${event.approvalID}?type=${btoa('outgoing' + ' ' + event.name)}`
                  );
                }}
              >
                {event.approvalName}
              </p>
              <p className="text-sm text-gray-600">
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)} by{' '}
                {event.name}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(event.date).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
