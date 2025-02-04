import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/footer';

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />);
    expect(
      screen.getByText(/2024 ApproveIt. All rights reserved./i)
    ).toBeInTheDocument();
  });
});
