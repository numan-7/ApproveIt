import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '@/components/dashboard/pagination';
import { vi } from 'vitest';

describe('Pagination', () => {
  it('renders current page and total pages', () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />
    );
    expect(screen.getByText(/page 2 of 5/i)).toBeInTheDocument();
  });

  it('calls onPageChange when next/prev are clicked', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />
    );
    const prevBtn = screen.getAllByRole('button')[0];
    const nextBtn = screen.getAllByRole('button')[1];
    fireEvent.click(prevBtn);
    expect(onPageChange).toHaveBeenCalledWith(1);
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
