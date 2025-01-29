export interface Attachment {
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

export interface Approval {
  id: number;
  name: string;
  requester: string;
  approver: string;
  date: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  priority: "high" | "medium" | "low";
  comments: Comment[];
  attachments: Attachment[];
  expanded?: boolean;
}