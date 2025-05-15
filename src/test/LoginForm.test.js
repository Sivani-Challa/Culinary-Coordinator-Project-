import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../components/login/LoginForm';
import { AuthContext } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

const renderWithProviders = (ui, { providerProps, ...renderOptions }) => {
  return render(
    <AuthContext.Provider {...providerProps}>
      <BrowserRouter>{ui}</BrowserRouter>
    </AuthContext.Provider>,
    renderOptions
  );
};

describe('LoginForm Component', () => {
  const mockLogin = jest.fn();
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderWithProviders(<LoginForm onLogin={mockOnLogin} />, {
      providerProps: { value: { login: mockLogin } },
    });
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('shows validation error on empty form submit', async () => {
    renderWithProviders(<LoginForm onLogin={mockOnLogin} />, {
      providerProps: { value: { login: mockLogin } },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email format', async () => {
    renderWithProviders(<LoginForm onLogin={mockOnLogin} />, {
      providerProps: { value: { login: mockLogin } },
    });

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.blur(screen.getByPlaceholderText(/email/i));

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    const fakeResponse = {
      token: 'fake-jwt-token',
      userName: 'testuser',
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeResponse,
    });

    renderWithProviders(<LoginForm onLogin={mockOnLogin} />, {
      providerProps: { value: { login: mockLogin } },
    });

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ username: 'testuser' }, 'fake-jwt-token');
    });

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
    });

    await waitFor(() => {
      expect(localStorage.getItem('userName')).toBe('testuser');
    });
  });

  it('handles login failure with error message', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    renderWithProviders(<LoginForm onLogin={mockOnLogin} />, {
      providerProps: { value: { login: mockLogin } },
    });

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });
});
