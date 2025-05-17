import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { AuthContext, AuthProvider } from '../components/context/AuthContext';

describe('AuthContext', () => {
  const TestComponent = () => (
    <AuthContext.Consumer>
      {({ isLoggedIn, user, login, logout, authLoading }) => (
        <div>
          <div data-testid="logged-in">{isLoggedIn ? 'true' : 'false'}</div>
          <div data-testid="user">{user ? user.username : 'null'}</div>
          <div data-testid="loading">{authLoading ? 'true' : 'false'}</div>
          <button onClick={() => login({ username: 'john' }, 'token123')}>Login</button>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </AuthContext.Consumer>
  );

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('initial state when not logged in (negative)', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('logged-in').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  test('initial state with token and user in localStorage (positive)', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('logged-in').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('testuser');
  });

  test('initializes with token and userName only (fallback case)', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('userName', 'fallbackUser');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('logged-in').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('fallbackUser');
  });

  test('login updates context and localStorage (positive)', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Removed act() wrapper
    fireEvent.click(screen.getByText('Login'));

    expect(screen.getByTestId('logged-in').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('john');
    expect(localStorage.getItem('token')).toBe('token123');
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ username: 'john' });
    expect(localStorage.getItem('userName')).toBe('john');
  });

  test('logout clears context and localStorage (positive)', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', JSON.stringify({ username: 'john' }));
    localStorage.setItem('userName', 'john');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Removed act() wrapper
    fireEvent.click(screen.getByText('Logout'));

    expect(screen.getByTestId('logged-in').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('token')).toBe(null);
  });

  test('handles localStorage error (negative)', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('logged-in').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });
});