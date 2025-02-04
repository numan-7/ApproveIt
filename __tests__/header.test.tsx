import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/header';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('Header', () => {
  const openSidebar = vi.fn();
  const closeSidebar = vi.fn();

  it('renders header with logo and title', () => {
    render(
      <Header
        isSidebarOpen={false}
        openSidebar={openSidebar}
        closeSidebar={closeSidebar}
      />
    );
    expect(screen.getByAltText(/approveit/i)).toBeInTheDocument();
    expect(screen.getByText(/approveit/i)).toBeInTheDocument();
  });

  it('calls openSidebar when menu button is clicked', () => {
    render(
      <Header
        isSidebarOpen={false}
        openSidebar={openSidebar}
        closeSidebar={closeSidebar}
      />
    );
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuButton);
    expect(openSidebar).toHaveBeenCalled();
  });
});
