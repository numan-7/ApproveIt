import { ZoomMeeting } from '@/types/approval';
import { Button } from '@/components/ui/button';
import { Video, Clock, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { convertToLocalTime } from '@/utils/date';

export const ApprovalZoom = ({ zoom }: { zoom: ZoomMeeting }) => {
  const handleCopyMeetingId = () => {
    navigator.clipboard.writeText(zoom.meeting_id.toString());
  };

  const handleJoinMeeting = () => {
    window.open(zoom.join_url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Video className="h-5 w-5 mr-2" />
          Zoom Meeting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Start Time:</span>
          </div>
          <span className="text-sm">{convertToLocalTime(zoom.start_time)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Duration:</span>
          </div>
          <span className="text-sm">{zoom.duration} minutes</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Meeting ID:</span>
            <span className="text-sm">{zoom.meeting_id}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyMeetingId}
            className="h-8 px-2"
          >
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy meeting ID</span>
          </Button>
        </div>

        <Button className="w-full" onClick={handleJoinMeeting}>
          Join Meeting
        </Button>
      </CardContent>
    </Card>
  );
};
