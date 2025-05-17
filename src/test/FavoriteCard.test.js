import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FavoriteCard from '../components/favorites/FavoriteCard';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ to, children }) => <a href={to}>{children}</a>
}));

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (typeof msg === 'string' && msg.includes('React Router Future Flag Warning')) {
      // ignore React Router future flag warnings
      return;
    }
    // keep other warnings visible
    console.warn(msg);
  });
});

describe('FavoriteCard Component', () => {
  const defaultItem = {
    id: '123',
    name: 'Test Product',
    brand: 'Test Brand',
    favoriteId: 'fav123'
  };

  const renderComponent = (item = defaultItem, onRemove = jest.fn()) => {
    const view = render(
      <MemoryRouter>
        <FavoriteCard item={item} onRemoveFromFavorites={onRemove} />
      </MemoryRouter>
    );
    return {view, utils: {onRemove} };
  };

  // POSITIVE
  test('renders product name and brand', () => {
    renderComponent();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
  });

  // POSITIVE
  test('calls onRemoveFromFavorites when delete icon clicked', () => {
    const { utils } = renderComponent();
    const deleteBtn = screen.getByRole('button', { name: /remove from favorites/i });
    fireEvent.click(deleteBtn);
    expect(utils.onRemove).toHaveBeenCalledWith('fav123');
  });

  // POSITIVE
  test('renders link to product detail with correct route', () => {
    renderComponent();
    const viewLink = screen.getByRole('link');
    expect(viewLink).toHaveAttribute('href', '/products/123');
  });

  // NEGATIVE
  test('falls back to itemname and manufacturer if name/brand are missing', () => {
    const fallbackItem = {
      id: '999',
      itemname: 'Fallback Product',
      manufacturer: 'Fallback Brand',
    };
    renderComponent(fallbackItem);
    expect(screen.getByText('Fallback Product')).toBeInTheDocument();
    expect(screen.getByText('Fallback Brand')).toBeInTheDocument();
  });

  // NEGATIVE
  test('shows "Unknown Product" if name/itemname missing', () => {
    const noNameItem = { id: '456' };
    renderComponent(noNameItem);
    expect(screen.getByText('Unknown Product')).toBeInTheDocument();
  });

  // NEGATIVE
  test('does not throw error if onRemoveFromFavorites is not provided', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderComponent(defaultItem, undefined)).not.toThrow();
    consoleError.mockRestore();
  });
});
