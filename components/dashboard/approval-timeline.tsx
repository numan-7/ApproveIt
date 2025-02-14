import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Eye, CheckCircle, XCircle } from 'lucide-react';

interface ApprovalTimelineProps {
  events: {
    id: string;
    type: string;
    name: string;
    date: string;
  }[];
}

export function ApprovalTimeline({ events }: ApprovalTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="relative pt-2">
            <div className="absolute left-4 top-0 h-full w-px bg-gray-200"></div>
            {events
              .slice()
              .reverse()
              .map((event) => (
                <div key={event.id} className="relative mb-8 last:mb-0">
                  <div className="flex items-center mb-2">
                    <div className="absolute left-4 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="ml-12">
                      <p className="font-medium">
                        {event.name} {event.type} the request
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
