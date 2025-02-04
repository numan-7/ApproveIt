import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApprovalCard } from '@/components/dashboard/approval-card';
import { vi, describe, it, beforeEach } from 'vitest';

const pushMock = vi.fn();
const backMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    back: backMock,
  }),
}));

let userEmail = 'test@example.com';
let authLoading = false;

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: userEmail ? { email: userEmail } : null,
    loading: authLoading,
    signOut: vi.fn(),
  }),
}));

const updateMyApprovalMock = vi.fn();
const deleteMyApprovalMock = vi.fn();
vi.mock('@/hooks/useMyApprovals', () => ({
  useMyApprovals: () => ({
    updateApproval: updateMyApprovalMock,
    deleteApproval: deleteMyApprovalMock,
  }),
}));

const updatePendingMock = vi.fn();
const approveMock = vi.fn();
const denyMock = vi.fn();
vi.mock('@/hooks/usePendingApprovals', () => ({
  usePendingApprovals: () => ({
    updateApproval: updatePendingMock,
    approveApproval: approveMock,
    denyApproval: denyMock,
  }),
}));

const baseApproval = {
  id: 123,
  name: 'Test Approval',
  requester: 'test@example.com',
  approvers: ['approver@example.com'],
  date: '2024-01-01',
  status: 'pending',
  priority: 'high',
  description: 'desc',
  attachments: [],
  comments: [],
};

describe('ApprovalCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userEmail = 'test@example.com';
    authLoading = false;
    window.confirm = vi.fn(() => true);
  });

  it('renders info for owner', () => {
    render(<ApprovalCard approval={baseApproval} />);
    expect(screen.getByText(/test approval/i)).toBeInTheDocument();

    expect(screen.getByText('desc', { selector: 'p' })).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /edit approval/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /delete approval/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /approve/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /reject/i })).toBeNull();
  });

  it('renders info for non-owner', () => {
    const nonOwner = { ...baseApproval, requester: 'other@example.com' };
    render(<ApprovalCard approval={nonOwner} />);
    expect(screen.getByText(/test approval/i)).toBeInTheDocument();
    expect(screen.getByText('desc', { selector: 'p' })).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /edit approval/i })).toBeNull();
    expect(
      screen.queryByRole('button', { name: /delete approval/i })
    ).toBeNull();
    expect(
      screen.getByRole('button', { name: /approve/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('handles approve/reject for non-owner', () => {
    const nonOwner = { ...baseApproval, requester: 'someone@example.com' };
    render(<ApprovalCard approval={nonOwner} />);
    fireEvent.click(screen.getByRole('button', { name: /approve/i }));
    expect(approveMock).toHaveBeenCalledWith(123);

    fireEvent.click(screen.getByRole('button', { name: /reject/i }));
    expect(denyMock).toHaveBeenCalledWith(123);
  });

  it('adds a comment as owner', async () => {
    render(<ApprovalCard approval={baseApproval} />);
    fireEvent.change(screen.getByPlaceholderText(/add a comment/i), {
      target: { value: 'Nice approval' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => {
      expect(updateMyApprovalMock).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          comments: expect.arrayContaining([
            expect.objectContaining({ text: 'Nice approval' }),
          ]),
        })
      );
    });
    expect(screen.getByText(/nice approval/i)).toBeInTheDocument();
  });

  it('adds a comment as non-owner', async () => {
    const approval = { ...baseApproval, requester: 'other@example.com' };
    render(<ApprovalCard approval={approval} />);
    fireEvent.change(screen.getByPlaceholderText(/add a comment/i), {
      target: { value: 'Pending comment' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => {
      expect(updatePendingMock).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          comments: expect.arrayContaining([
            expect.objectContaining({ text: 'Pending comment' }),
          ]),
        })
      );
    });
    expect(screen.getByText(/pending comment/i)).toBeInTheDocument();
  });

  it('deletes a comment', async () => {
    const approvalWithComments = {
      ...baseApproval,
      comments: [
        { user: 'test@example.com', date: 'yesterday', text: 'Delete me' },
      ],
    };
    render(<ApprovalCard approval={approvalWithComments} />);
    expect(screen.getByText(/delete me/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => {
      expect(updateMyApprovalMock).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          comments: [],
        })
      );
    });
    expect(screen.queryByText(/delete me/i)).toBeNull();
  });

  it('deletes entire approval if owner and confirm is true', () => {
    window.confirm = vi.fn(() => true);
    render(<ApprovalCard approval={baseApproval} />);
    fireEvent.click(screen.getByRole('button', { name: /delete approval/i }));
    expect(window.confirm).toHaveBeenCalled();
    expect(deleteMyApprovalMock).toHaveBeenCalledWith([123]);
    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });

  it('does not delete if confirm is false', () => {
    window.confirm = vi.fn(() => false);
    render(<ApprovalCard approval={baseApproval} />);
    fireEvent.click(screen.getByRole('button', { name: /delete approval/i }));
    expect(window.confirm).toHaveBeenCalled();
    expect(deleteMyApprovalMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('edits the entire approval if owner', () => {
    render(<ApprovalCard approval={baseApproval} />);
    fireEvent.click(screen.getByRole('button', { name: /edit approval/i }));
    expect(pushMock).toHaveBeenCalledWith(
      '/dashboard/approvals/create?edit=123'
    );
  });
});
