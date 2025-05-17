import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Header from '../components/navbar/Header';
import { AuthContext } from '../components/context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

// Mock fetch for favorites API
global.fetch = jest.fn();

// Helper to render component with AuthContext and Router
const renderWithContext = (isLoggedIn = false, logoutFn = jest.fn()) => {
  return render(
    <AuthContext.Provider value={{ isLoggedIn, logout: logoutFn }}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders login/signup button when not logged in', () => {
    renderWithContext(false);
    expect(screen.getByText(/LOGIN \/ SIGN UP/i)).toBeInTheDocument();
  });

  test('renders user menu and favorites when logged in', async () => {
    // Setup localStorage token and userName
    localStorage.setItem('token', 'dummy.token.value');
    localStorage.setItem('userName', 'TestUser');

    // Mock fetch response for favorites
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { favoriteId: '1', itemId: '100', itemName: 'Test Item', brand: 'BrandX' }
      ],
    });

    renderWithContext(true);

    // Wait for user name to appear (loading ends)
    await waitFor(() => expect(screen.getByText('TestUser')).toBeInTheDocument());

    // Favorites badge shows the number of favorites (1)
    expect(screen.getByLabelText('favorites')).toBeInTheDocument();

    // User avatar icon (AccountCircle) shown when no profileImage
    expect(screen.getByTestId('AccountCircleIcon')).toBeInTheDocument?.();

    // Click user menu opens dropdown
    fireEvent.click(screen.getByText('TestUser'));
    expect(screen.getByRole('menu')).toBeVisible();

    // Dropdown menu contains Profile, My Favorites, Logout options
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('My Favorites')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('handles user menu navigation clicks correctly', async () => {
    localStorage.setItem('token', 'dummy.token.value');
    localStorage.setItem('userName', 'TestUser');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithContext(true);

    await waitFor(() => screen.getByText('TestUser'));

    fireEvent.click(screen.getByText('TestUser')); // open menu

    fireEvent.click(screen.getByText('Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('/profile');

    fireEvent.click(screen.getByText('My Favorites'));
    expect(mockNavigate).toHaveBeenCalledWith('/favorites');
  });

  test('handles logout correctly', async () => {
    localStorage.setItem('token', 'dummy.token.value');
    localStorage.setItem('userName', 'TestUser');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const logoutMock = jest.fn();

    renderWithContext(true, logoutMock);

    await waitFor(() => screen.getByText('TestUser'));

    fireEvent.click(screen.getByText('TestUser')); // open menu

    fireEvent.click(screen.getByText('Logout'));

    expect(logoutMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('fetch favorites handles API failure gracefully', async () => {
    localStorage.setItem('token', 'dummy.token.value');
    localStorage.setItem('userName', 'TestUser');

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    renderWithContext(true);

    // Wait for loading to finish and favorites to be empty
    await waitFor(() => expect(screen.getByText('TestUser')).toBeInTheDocument());
    expect(screen.getByLabelText('favorites')).toBeInTheDocument();

    // Badge count should be 0 on error
    expect(screen.queryByText('0')).toBeInTheDocument();
  });

  test('logo click navigates home and reloads if already on home', () => {
    renderWithContext();

    // Mock window.location.href setter
    delete window.location;
    window.location = { href: '', assign: jest.fn() };

    const logo = screen.getByAltText('Culinary Mart');
    fireEvent.click(logo.parentElement);

    expect(window.location.href).toBe('/');
  });

  test('favorites icon click navigates to /favorites', () => {
    localStorage.setItem('token', 'dummy.token.value');
    localStorage.setItem('userName', 'TestUser');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithContext(true);

    waitFor(() => screen.getByLabelText('favorites')).then(() => {
      fireEvent.click(screen.getByLabelText('favorites'));
      expect(mockNavigate).toHaveBeenCalledWith('/favorites');
    });
  });

  test('does not fetch favorites or user data if not logged in', () => {
    renderWithContext(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  test('handles invalid token gracefully', async () => {
    localStorage.setItem('token', 'invalid.token');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithContext(true);

    // Should log errors but still render fallback UI
    await waitFor(() => {
      expect(screen.getByText(/Guest/i)).toBeInTheDocument();
    });
  });
});
