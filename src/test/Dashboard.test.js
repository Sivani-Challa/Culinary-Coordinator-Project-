import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../components/Dashboard';

// Positive test cases
describe('Dashboard Component - Positive Cases', () => {
  it('renders header and navigation buttons', () => {
    render(<Dashboard />);
    expect(screen.getByText(/culinary coordinator/i)).toBeInTheDocument();
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/my favorites/i)).toBeInTheDocument();
  });

  it('renders search input and filter controls', () => {
    render(<Dashboard />);
    expect(screen.getByLabelText(/search food items/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/brand/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/manufacturer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ingredients/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weight range min/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weight range max/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/recently added only/i)).toBeInTheDocument();
  });

  it('calls handleSearch when clicking Search button', () => {
    console.log = jest.fn();
    render(<Dashboard />);
    fireEvent.change(screen.getByLabelText(/search food items/i), {
      target: { value: 'Pizza' },
    });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(console.log).toHaveBeenCalledWith(
      'Searching for:', 'Pizza', '', '', { min: '', max: '' }, false
    );
  });
});

// Negative test cases
describe('Dashboard Component - Negative Cases', () => {
  it('does not break when all inputs are empty and search is clicked', () => {
    console.log = jest.fn();
    render(<Dashboard />);
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(console.log).toHaveBeenCalled();
  });

  it('handles changing brand and manufacturer to non-existing values gracefully', () => {
    render(<Dashboard />);
    const brandSelect = screen.getByLabelText(/brand/i);
    fireEvent.change(brandSelect, { target: { value: 'non-existent-brand' } });
    expect(brandSelect.value).toBe('non-existent-brand');
  });

  it('handles invalid weight inputs without crashing', () => {
    render(<Dashboard />);
    const weightMin = screen.getByLabelText(/weight range min/i);
    fireEvent.change(weightMin, { target: { value: 'invalid' } });
    expect(weightMin.value).toBe('invalid');
  });
});
