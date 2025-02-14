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
  id: number;
  name: string;
  requester: string;
  approvers: Approvers[];
  due_date: string;
  date: Date;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  comments: Comment[];
  events: Events[];
  attachments: Attachment[];
}
