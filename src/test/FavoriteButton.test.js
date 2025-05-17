import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FavoriteButton from '../components/favorites/FavoriteButton';
import * as favoriteService from '../api/favoriteService';
import '@testing-library/jest-dom';

// Mock LoginPopup
jest.mock('../components/common/LoginPopup', () => ({ open, onClose, onLogin }) => (
  open ? (
    <div data-testid="login-popup">
      Login Popup
      <button onClick={() => onLogin({ data: { token: 'dummy.token.jwt', userId: '123' } })}>
        Mock Login
      </button>
    </div>
  ) : null
));

// Mock favoriteService methods with defaults returning Promises
jest.mock('../api/favoriteService', () => ({
  checkIsFavorite: jest.fn().mockResolvedValue(false),
  toggleFavorite: jest.fn().mockResolvedValue({}),
  addToFavorites: jest.fn().mockResolvedValue({}),
}));

describe('FavoriteButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset mocks to default resolved values before each test
    favoriteService.checkIsFavorite.mockResolvedValue(false);
    favoriteService.toggleFavorite.mockResolvedValue({});
    favoriteService.addToFavorites.mockResolvedValue({});
  });

  test('renders with FavoriteBorderIcon when not favorite (positive)', () => {
    render(<FavoriteButton itemId="item123" isFavorite={false} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('FavoriteBorderIcon')).toBeInTheDocument();
  });

  test('renders with FavoriteIcon when already favorite (positive)', () => {
    render(<FavoriteButton itemId="item123" isFavorite={true} />);
    expect(screen.getByTestId('FavoriteIcon')).toBeInTheDocument();
  });

  test('clicking button when not logged in shows login popup (positive)', async () => {
    render(<FavoriteButton itemId="item123" />);
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByTestId('login-popup')).toBeInTheDocument();
  });

  test('adds item to favorites when logged in and not already favorited (positive)', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'test' }));
    favoriteService.checkIsFavorite.mockResolvedValue(false);
    favoriteService.addToFavorites.mockResolvedValue({});

    render(<FavoriteButton itemId="item123" />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(favoriteService.checkIsFavorite).toHaveBeenCalledWith('item123');
    });
    await waitFor(() => {
      expect(favoriteService.addToFavorites).toHaveBeenCalled();
    });
  });

  test('shows alert when item is already favorite (negative - client check)', async () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    localStorage.setItem('user', JSON.stringify({ username: 'test' }));
    favoriteService.checkIsFavorite.mockResolvedValue(true);

    render(<FavoriteButton itemId="item123" />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Item is already in your favorites');
    });
  });

  test('handles server 409 duplicate error (negative)', async () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    localStorage.setItem('user', JSON.stringify({ username: 'test' }));
    favoriteService.checkIsFavorite.mockResolvedValue(false);
    favoriteService.addToFavorites.mockRejectedValue({
      response: { status: 409 }
    });

    render(<FavoriteButton itemId="item123" />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Item is already in your favorites');
    });
  });

  test('handles unexpected addToFavorites error (negative)', async () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    localStorage.setItem('user', JSON.stringify({ username: 'test' }));
    favoriteService.checkIsFavorite.mockResolvedValue(false);
    favoriteService.addToFavorites.mockRejectedValue(new Error('Unknown Error'));

    render(<FavoriteButton itemId="item123" />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error adding to favorites. Please try again.');
    });
  });

  test('handles login success and stores userId from response (positive)', async () => {
    render(<FavoriteButton itemId="item456" />);
    fireEvent.click(screen.getByRole('button'));

    const loginBtn = await screen.findByText('Mock Login');
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('dummy.token.jwt');
    });
    await waitFor(() => {
      expect(localStorage.getItem('userId')).toBe('123');
    });
  });

  test('handles JWT token parsing failure (negative)', async () => {
    // Make sure checkIsFavorite returns a Promise here to avoid "then of undefined" error
    favoriteService.checkIsFavorite.mockResolvedValue(false);

    render(<FavoriteButton itemId="item123" />);
    fireEvent.click(screen.getByRole('button'));

    const loginBtn = await screen.findByText('Mock Login');
    fireEvent.click(loginBtn);

    // Set malformed token after login callback
    localStorage.setItem('token', 'bad.token.payload');

    // This test expects no throw and no unhandled errors during parsing
  });
});