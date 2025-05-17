import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemCard from '../components/items/ItemCard';  // Adjust path as needed
import { BrowserRouter } from 'react-router-dom';

// Helper to render component with Router (for Link)
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ItemCard Component', () => {
  const mockItem = {
    id: 'item123',
    productName: 'Test Product',
    brand: 'Test Brand',
    category: 'Test Category',
    description: 'This is a test product',
  };

  const onAddToFavoritesMock = jest.fn();

  beforeEach(() => {
    onAddToFavoritesMock.mockClear();
  });

  // Positive tests
  test('renders product details correctly', () => {
    renderWithRouter(<ItemCard item={mockItem} onAddToFavorites={onAddToFavoritesMock} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/Test Brand - Test Category/i)).toBeInTheDocument();
    expect(screen.getByText('This is a test product')).toBeInTheDocument();
  });

  test('calls onAddToFavorites when favorite button is clicked', () => {
    renderWithRouter(<ItemCard item={mockItem} onAddToFavorites={onAddToFavoritesMock} />);

    // Since IconButton has no accessible name, find by role button and click first button
    const buttons = screen.getAllByRole('button');
    const favButton = buttons[0]; // Assuming favorite is first button in the card

    fireEvent.click(favButton);

    expect(onAddToFavoritesMock).toHaveBeenCalledTimes(1);
    expect(onAddToFavoritesMock).toHaveBeenCalledWith(mockItem);
  });

  test('renders product detail link with correct href', () => {
    renderWithRouter(<ItemCard item={mockItem} onAddToFavorites={onAddToFavoritesMock} />);

    const productLink = screen.getByRole('link');
    expect(productLink).toHaveAttribute('href', `/product/${mockItem.id}`);
  });

  test('renders view product logo image with correct alt and src', () => {
    renderWithRouter(<ItemCard item={mockItem} onAddToFavorites={onAddToFavoritesMock} />);

    const logoImage = screen.getByAltText('View Product');
    expect(logoImage).toHaveAttribute('src', '/assets/view-product-logo.png');
  });

  // Negative / Edge case tests

test('does not fail if onAddToFavorites is not passed', () => {
  // Pass noop function because component calls onAddToFavorites unconditionally
  const noop = () => {};
  renderWithRouter(<ItemCard item={mockItem} onAddToFavorites={noop} />);
  const buttons = screen.getAllByRole('button');
  const favButton = buttons[0];
  expect(() => fireEvent.click(favButton)).not.toThrow();
});

  test('throws error if item prop is null or undefined', () => {
    // Expect the component to throw if item is null or undefined
    expect(() =>
      renderWithRouter(<ItemCard item={null} onAddToFavorites={onAddToFavoritesMock} />)
    ).toThrow();

    expect(() =>
      renderWithRouter(<ItemCard onAddToFavorites={onAddToFavoritesMock} />)
    ).toThrow();
  });
});