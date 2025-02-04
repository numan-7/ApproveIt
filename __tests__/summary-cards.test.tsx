import React from 'react';
import { render, screen } from '@testing-library/react';
import { SummaryCards } from '@/components/dashboard/summary-cards';

describe('SummaryCards', () => {
  it('renders counts for myRequestsCount and pendingApprovalsCount', () => {
    render(<SummaryCards myRequestsCount={10} pendingApprovalsCount={3} />);
    expect(screen.getByText(/my requests/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText(/pending my approval/i)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
