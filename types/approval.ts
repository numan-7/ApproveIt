export interface Attachment {
  key: string;
  name: string;
  type: string;
  size: string;
  url: string;
}

export interface Comment {
  user: string;
  text: string;
  date: string;
}

interface Approvers {
  email: string;
  name: string;
  didApprove: boolean;
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
  attachments: Attachment[];
  expanded?: boolean;
}
