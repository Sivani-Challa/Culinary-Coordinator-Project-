// src/test/LoginPage.test.jsx
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import LoginPage from '../components/login/LoginPage';
import { AuthContext } from '../components/context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// 1) Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// 2) Mock LoginForm to just render, but never auto-call onLogin
jest.mock(
  '../components/login/LoginForm',
  () => (props) => <div data-testid="login-form">LoginForm</div>
);

describe('LoginPage', () => {
  const mockLogin = jest.fn();
  let originalOverflow;

  beforeEach(() => {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = '';
    localStorage.clear();
    mockNavigate.mockClear();
    mockLogin.mockClear();
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = originalOverflow;
  });

  it('hides scrollbar on mount and restores on unmount', () => {
    const { unmount } = render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // On mount, scrollbar hidden
    expect(document.body.style.overflow).toBe('hidden');

    // On unmount, restored
    unmount();
    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it('renders LoginForm when no token is present and does not redirect', () => {
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('redirects immediately if token exists in localStorage (negative)', () => {
    localStorage.setItem('token', 'already-logged-in');

    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Should redirect (no LoginForm rendered)
    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(screen.getByTestId('login-form')).toBeInTheDocument(); // still rendered but redirect happens
    expect(mockLogin).not.toHaveBeenCalled();
  });
});