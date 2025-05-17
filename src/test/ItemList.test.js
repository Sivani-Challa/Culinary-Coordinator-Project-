import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ItemList from '../components/items/ItemList';
import * as itemService from '../api/itemService';

// ✅ Move mockItems to top-level scope
const mockItems = [
  { id: '1', productName: 'Apple', itemName: 'Apple', brand: 'FruitCo', category: 'Fruit', description: 'Red apple' },
  { id: '2', productName: 'Banana', itemName: 'Banana', brand: 'TropiFruit', category: 'Fruit', description: 'Yellow banana' },
];

// Mock ItemCard to control interaction
jest.mock('../components/items/ItemCard', () => ({ item, onAddToFavorites }) => (
  <div data-testid="item-card">
    <span>{item.productName}</span>
    <button onClick={() => onAddToFavorites(item)}>Add to Favorites</button>
  </div>
));

describe('ItemList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders items fetched from API and displays favorites on add', async () => {
    itemService.getItems = jest.fn().mockResolvedValue(mockItems);

    render(<ItemList />);

    expect(screen.queryByText(/Apple/i)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByTestId('item-card')).toHaveLength(mockItems.length);
    });

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();

    const addButtons = screen.getAllByText('Add to Favorites');
    fireEvent.click(addButtons[0]);

    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  test('shows no favorites initially', async () => {
    itemService.getItems = jest.fn().mockResolvedValue(mockItems);
    render(<ItemList />);

    await waitFor(() => {
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  test('renders empty state if no items fetched', async () => {
    itemService.getItems = jest.fn().mockResolvedValue([]);

    render(<ItemList />);

    await waitFor(() => {
      expect(screen.queryAllByTestId('item-card')).toHaveLength(0);
    });

    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });

  test('handles API fetch failure gracefully', async () => {
    itemService.getItems = jest.fn().mockRejectedValue(new Error('Fetch failed'));

    render(<ItemList />);

    await waitFor(() => {
      expect(screen.queryAllByTestId('item-card')).toHaveLength(0);
    });

    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });
});
