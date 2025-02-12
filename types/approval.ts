export interface Attachment {
  key: string;
  name: string;
  type: string;
  size: string;
  url: string;
}

export interface Comment {
  id?: number;
  user: string;
  text: string;
  date: string;
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
  id: number;
  name: string;
  requester: string;
  approvers: Approvers[];
  date: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  comments: Comment[];
  events: Events[];
  attachments: Attachment[];
  expanded?: boolean;
}
