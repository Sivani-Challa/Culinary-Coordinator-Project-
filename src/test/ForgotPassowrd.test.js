// src/test/ForgotPassword.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPassword from '../components/password/ForgotPassword';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch globally
beforeEach(() => {
  jest.spyOn(global, 'fetch');
  mockNavigate.mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ForgotPassword Component', () => {

  const fillForm = async () => {
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');

    userEvent.click(screen.getByLabelText(/security question/i));
    userEvent.click(screen.getByRole('option', { name: 'What was the name of your first pet?' }));

    userEvent.type(screen.getByLabelText(/security answer/i), 'Fluffy');

    const newPasswordInputs = screen.getAllByLabelText(/new password/i);
    userEvent.type(newPasswordInputs[0], 'password123');  // New Password
    userEvent.type(newPasswordInputs[1], 'password123');  // Confirm New Password
  };

  test('renders form fields', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/security question/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/security answer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  test('submits form successfully and navigates to login', async () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => 'Success',
    });

    await fillForm();

    userEvent.click(screen.getByRole('button', { name: /reset/i }));

    // Wait for success snackbar and navigation
    await waitFor(() => {
      expect(screen.getByText(/password reset successful/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('shows error alert when API call fails', async () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    // Mock failed API response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Invalid data',
    });

    await fillForm();

    userEvent.click(screen.getByRole('button', { name: /reset/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid data/i)).toBeInTheDocument();
    });
      await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('disables form fields and button while loading', async () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    // Make fetch never resolve immediately to simulate loading
    let resolveFetch;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    global.fetch.mockReturnValueOnce(fetchPromise);

    await fillForm();

    // Click submit (this triggers loading)
    userEvent.click(screen.getByRole('button', { name: /reset/i }));

    // Check all relevant inputs and the button are disabled
    // Using getAllByRole for inputs with role textbox + combobox for select

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeDisabled();

    const securityQuestionSelect = screen.getByRole('combobox', { name: /security question/i });
    expect(securityQuestionSelect).toBeDisabled();

    expect(screen.getByLabelText(/security answer/i)).toBeDisabled();

    // New password fields
    const newPasswordInputs = screen.getAllByLabelText(/new password/i);
    newPasswordInputs.forEach(input => expect(input).toBeDisabled());

    // Confirm new password
    expect(screen.getByLabelText(/confirm new password/i)).toBeDisabled();

    // Submit button disabled
    expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();

    // Resolve fetch to finish loading
    resolveFetch({ ok: true, text: async () => 'Success' });

    // Wait for the loading to finish
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).not.toBeDisabled();
    });
  });

  test('shows validation errors on empty submit', async () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    userEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/security question is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/security answer is required/i)).toBeInTheDocument();

    // Because "Password is required" appears twice (for password and confirm password),
    // use findAllByText and assert that at least one error exists for each.
    const passwordErrors = await screen.findAllByText(/password is required/i);
    expect(passwordErrors.length).toBeGreaterThanOrEqual(1);

    const confirmPasswordErrors = await screen.findAllByText(/confirm password is required/i);
    expect(confirmPasswordErrors.length).toBeGreaterThanOrEqual(1);
  });
});
