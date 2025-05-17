import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../components/context/ThemeContext';

// Create a test component to consume the context
const TestComponent = () => {
  const { themeMode, toggleTheme } = useTheme();
  return (
    <div>
      <p data-testid="theme-mode">{themeMode}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('ThemeContext', () => {
  test('renders with default light theme (positive)', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-mode').textContent).toBe('light');
  });

  test('toggles theme to dark (positive)', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText(/toggle theme/i));
    expect(screen.getByTestId('theme-mode').textContent).toBe('dark');
  });

  test('toggles theme back to light (positive)', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText(/toggle theme/i)); // light -> dark
    fireEvent.click(screen.getByText(/toggle theme/i)); // dark -> light
    expect(screen.getByTestId('theme-mode').textContent).toBe('light');
  });

  test('throws error when useTheme is used outside provider (negative)', () => {
    // Temporarily suppress console.error
    const originalError = console.error;
    console.error = jest.fn();

    const BrokenComponent = () => {
      const { themeMode } = useTheme(); // should throw error
      return <p>{themeMode}</p>;
    };

    expect(() => render(<BrokenComponent />)).toThrow();

    console.error = originalError; // Restore original
  });
});
