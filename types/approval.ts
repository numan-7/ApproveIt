export interface ZoomMeeting {
  meetingStartTime: string;
  join_url: string;
  meeting_id: string;
  start_time: string;
  duration: number;
}

export interface Attachment {
  key: string;
  name: string;
  size: string;
  url: string;
}

export interface Comment {
  id: string;
  approval_id: string;
  user_email: string;
  comment: string;
  created_at: Date;
  name: string;
}

interface Approvers {
  email: string;
  name: string;
  didApprove: boolean | null;
}

export interface Events {
  approval_id: string;
  date: string;
  id: string;
  name: string;
  type: string;
}

export interface Approval {
  meeting_id(
    meeting_id: any,
    arg1: {
      topic: string;
      meetingStartTime: string;
      duration: number;
      invitees: string[];
    }
  ): any;
  id: string;
  name: string;
  requester: string;
  approvers: Approvers[];
  due_date: string;
  date: Date;
  description: string;
  expired: boolean;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  comments: Comment[];
  events: Events[];
  attachments: Attachment[];
  zoom_meeting: ZoomMeeting;
}

export interface AnalysisResponse {
  agree_summary: {
    points: string[];
  };
  disagree_summary: {
    points: string[];
  };
}
