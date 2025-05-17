import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../components/dashboard/Dashboard';

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test('renders dashboard with all main sections', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Culinary Coordinator/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Search Food Items/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ingredients/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weight Range Min/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weight Range Max/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recently Added Only/i)).toBeInTheDocument();
  });

  test('performs search when clicking Search button', () => {
    render(<Dashboard />);
    fireEvent.change(screen.getByLabelText(/Search Food Items/i), {
      target: { value: 'apple' },
    });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(console.log).toHaveBeenCalledWith(
      'Searching for:',
      'apple',
      '',
      '',
      '',
      { min: '', max: '' },
      false
    );
  });

  test('sets weight range and recentlyAdded checkbox', () => {
    render(<Dashboard />);
    fireEvent.change(screen.getByLabelText(/Weight Range Min/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/Weight Range Max/i), {
      target: { value: '500' },
    });
    fireEvent.click(screen.getByLabelText(/Recently Added Only/i));

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(console.log).toHaveBeenCalledWith(
      'Searching for:',
      '',
      '',
      '',
      '',
      { min: '100', max: '500' },
      true
    );
  });

  test('prevents non-numeric input in weight fields', () => {
    render(<Dashboard />);
    const minInput = screen.getByLabelText(/Weight Range Min/i);
    fireEvent.change(minInput, { target: { value: 'abc' } });

    // HTML input[type="number"] doesn't allow non-numeric — value stays ""
    expect(minInput.value).toBe('');
  });

  test('triggers search even with no inputs', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(console.log).toHaveBeenCalledWith(
      'Searching for:',
      '',
      '',
      '',
      '',
      { min: '', max: '' },
      false
    );
  });
});