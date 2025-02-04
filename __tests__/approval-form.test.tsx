// __tests__/components/dashboard/approval-form.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApprovalForm } from '@/components/dashboard/approval-form';
import { vi, it, describe, expect } from 'vitest';

// Mock Next.js navigation hooks
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => new URLSearchParams(''),
}));

// Stub the global ResizeObserver (used by some UI components)
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Mock the useMyApprovals hook
const addApprovalMock = vi.fn();
vi.mock('@/hooks/useMyApprovals', () => ({
  useMyApprovals: () => ({
    approvals: [],
    addApproval: addApprovalMock,
    updateApproval: vi.fn(),
    loading: false,
  }),
}));

// Mock the AuthContext hook
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'user@example.com' },
    loading: false,
    signOut: async () => {},
  }),
}));

// Helper function to fill in required fields (name and description)
const fillRequiredFields = () => {
  fireEvent.change(screen.getByPlaceholderText(/enter approval name/i), {
    target: { value: 'New Approval' },
  });
  fireEvent.change(screen.getByPlaceholderText(/enter approval description/i), {
    target: { value: 'Description text' },
  });
};

describe('ApprovalForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form inputs', () => {
    render(<ApprovalForm />);
    expect(
      screen.getByPlaceholderText(/enter approval name/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter approval description/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter approver email/i)
    ).toBeInTheDocument();
  });

  it('shows error if no approvers are added when submitting', async () => {
    render(<ApprovalForm />);
    fillRequiredFields();
    const submitButton = screen.getByRole('button', {
      name: /create approval request/i,
    });
    fireEvent.click(submitButton);
    expect(
      await screen.findByText(/please add at least one approver/i)
    ).toBeInTheDocument();
  });

  it('prevents adding self as approver', async () => {
    render(<ApprovalForm />);
    fillRequiredFields();
    const approverInput = screen.getByPlaceholderText(/enter approver email/i);
    fireEvent.change(approverInput, { target: { value: 'user@example.com' } });
    fireEvent.keyDown(approverInput, { key: 'Enter', code: 'Enter' });
    expect(
      await screen.findByText(/you cannot add yourself as an approver/i)
    ).toBeInTheDocument();
  });

  it('submits the form when valid', async () => {
    render(<ApprovalForm />);
    fillRequiredFields();
    const approverInput = screen.getByPlaceholderText(/enter approver email/i);
    fireEvent.change(approverInput, {
      target: { value: 'approver@example.com' },
    });
    fireEvent.keyDown(approverInput, { key: 'Enter', code: 'Enter' });
    const submitButton = screen.getByRole('button', {
      name: /create approval request/i,
    });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(addApprovalMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
  });
});
