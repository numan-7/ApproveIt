import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalEvent {
  id: number;
  type: string;
  user: string;
  date: string;
  approvalName: string;
}

interface ApprovalEventsProps {
  events: ApprovalEvent[];
}

export function ApprovalDashboardTimeline({ events }: ApprovalEventsProps) {
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
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex items-start space-x-4">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full',
                getEventColor(event.type)
              )}
            >
              {getEventIcon(event.type)}
            </div>
            <div>
              <p className="font-medium">{event.approvalName}</p>
              <p className="text-sm text-gray-600">
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)} by{' '}
                {event.user}
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
