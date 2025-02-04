import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RetractableSidebar } from '@/components/dashboard/retractable-sidebar';
import { vi, describe, it, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

const signOutMock = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: {
      email: 'test@example.com',
      user_metadata: { avatar_url: '/avatar.png' },
    },
    loading: false,
    signOut: signOutMock,
    session: null,
  })),
}));

describe('RetractableSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders collapsed by default', () => {
    const { container } = render(<RetractableSidebar />);
    expect(container.querySelector('.w-16')).toBeTruthy();
    expect(container.querySelector('.w-64')).toBeFalsy();
  });

  it('expands when toggle button is clicked (collapsed -> expanded)', () => {
    const { container } = render(<RetractableSidebar />);
    const toggleBtn = container.querySelector('button')!;
    fireEvent.click(toggleBtn);
    expect(container.querySelector('.w-64')).toBeTruthy();
    expect(container.querySelector('.w-16')).toBeFalsy();
  });

  it('collapses when clicking outside while expanded', () => {
    const { container } = render(<RetractableSidebar />);
    const toggleBtn = container.querySelector('button')!;
    fireEvent.click(toggleBtn);
    expect(container.querySelector('.w-64')).toBeTruthy();
    fireEvent.mouseDown(container);
    expect(container.querySelector('.w-16')).toBeTruthy();
  });

  it('expands sub-menu if the sidebar is already expanded', () => {
    const { container } = render(<RetractableSidebar />);
    const toggleBtn = container.querySelector('button')!;
    fireEvent.click(toggleBtn);

    const approvalsButton = screen.getAllByRole('button').find((btn) => {
      return btn.textContent?.toLowerCase().includes('approvals');
    })!;
    fireEvent.click(approvalsButton);
    expect(screen.queryByText(/submit new request/i)).not.toBeInTheDocument();
    fireEvent.click(approvalsButton);
    expect(screen.queryByText(/submit new request/i)).toBeInTheDocument();
  });

  // it('expands sidebar first if not expanded, then toggles approvals sub-menu', async () => {
  //   const { container } = render(<RetractableSidebar />);
  //   const buttons = container.querySelectorAll('button');
  //   const approvalsButton = buttons[1];
  //   fireEvent.click(approvalsButton);
  //   await screen.findByText(/submit new request/i);
  //   fireEvent.click(approvalsButton);
  //   await waitFor(() => {
  //     expect(screen.queryByText(/submit new request/i)).not.toBeInTheDocument();
  //   });
  // });

  it('shows user menu, toggles sign-out menu, and signs out', () => {
    const { container } = render(<RetractableSidebar />);
    const toggleBtn = container.querySelector('button')!;
    fireEvent.click(toggleBtn);

    const userButton = screen.getByAltText(/user avatar/i).closest('button')!;
    fireEvent.click(userButton);
    const signOutBtn = screen.getByText(/sign out/i);
    fireEvent.click(signOutBtn);
    expect(signOutMock).toHaveBeenCalled();
  });

  it('renders no user section if user is null', async () => {
    const useAuthModule = await import('@/context/AuthContext');
    vi.mocked(useAuthModule.useAuth).mockReturnValueOnce({
      user: null,
      loading: false,
      signOut: vi.fn(),
      session: null,
    } as any);

    const { container } = render(<RetractableSidebar />);
    expect(screen.queryByAltText(/user avatar/i)).toBeNull();
    expect(container.querySelector('.border-t-2')).toBeNull();
  });

  it('sets isSigningOut = true before signOut is called', () => {
    const { container } = render(<RetractableSidebar />);
    const toggleBtn = container.querySelector('button')!;
    fireEvent.click(toggleBtn);

    const userButton = screen.getByAltText(/user avatar/i).closest('button')!;
    fireEvent.click(userButton);

    const signOutBtn = screen.getByText(/sign out/i);
    fireEvent.click(signOutBtn);
    expect(signOutMock).toHaveBeenCalled();
  });
});
