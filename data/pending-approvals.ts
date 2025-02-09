import type { Approval } from '@/types/approval';

export const DataApprovals: Approval[] = [
  {
    id: 3,
    name: 'HR Policy Update',
    requester: 'Jane Smith',
    approvers: [
      {
        email: 'numankhan165@gmail.com',
        name: 'Numan Khan',
        didApprove: false,
      },
    ],
    date: '2024-01-28',
    description:
      'Review and approve the updated HR policies for the upcoming fiscal year.',
    status: 'pending',
    priority: 'medium',
    comments: [],
    attachments: [
      {
        name: 'Updated_HR_Policies.pdf',
        type: 'pdf',
        size: '3.1 MB',
        url: '#',
      },
    ],
  },
  {
    id: 4,
    name: 'IT Infrastructure Upgrade Proposal',
    requester: 'Mike Johnson',
    approvers: [
      {
        email: 'numankhan165@gmail.com',
        name: 'Numan Khan',
        didApprove: false,
      },
    ],
    date: '2024-01-29',
    description:
      'Approval needed for the proposed IT infrastructure upgrades, including budget and timeline.',
    status: 'pending',
    priority: 'high',
    comments: [
      {
        user: 'You',
        text: 'Can we get a breakdown of the costs for each phase of the upgrade?',
        date: '2024-01-30',
      },
    ],
    attachments: [
      {
        name: 'IT_Upgrade_Proposal.pdf',
        type: 'pdf',
        size: '5.7 MB',
        url: '#',
      },
      {
        name: 'Upgrade_Timeline.xlsx',
        type: 'excel',
        size: '1.3 MB',
        url: '#',
      },
    ],
  },
];
