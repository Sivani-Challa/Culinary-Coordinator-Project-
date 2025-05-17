import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Favorites from '../components/favorites/Favorites';
import * as favoriteService from '../api/favoriteService';
import { BrowserRouter } from 'react-router-dom';

// Mock service methods
jest.mock('../api/favoriteService');

const mockFavorites = [
    {
        favoriteId: 'fav123',
        itemId: 'item123',
        itemName: 'Delicious Apple',
        brand: 'FruitCo',
    },
    {
        favoriteId: 'fav456',
        id: 'item456',
        name: 'Tasty Banana',
        manufacturer: 'TropiFruit',
    }
];

const setup = () => {
    render(
        <BrowserRouter>
            <Favorites />
        </BrowserRouter>
    );
};

beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
});

describe('Favorites Component', () => {
    // Positive
    test('renders favorite items', async () => {
        favoriteService.getFavorites.mockResolvedValueOnce(mockFavorites);
        favoriteService.normalizeProductId.mockImplementation((id) => id);

        setup();

        expect(screen.getByRole('progressbar')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/Delicious Apple/i)).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText(/Tasty Banana/i)).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText(/FruitCo/i)).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText(/TropiFruit/i)).toBeInTheDocument();
        });
    });

    // Positive
    test('shows empty state when no favorites', async () => {
        favoriteService.getFavorites.mockResolvedValueOnce([]);
        setup();

        await waitFor(() => {
            expect(screen.getByText(/You haven't added any favorites/i)).toBeInTheDocument();
        });
        await waitFor(() => {
            const browseLink = screen.getAllByRole('link').find(el => el.textContent?.match(/browse products/i));
            expect(browseLink).toBeInTheDocument();

        });
    });

    // Negative
    test('shows error when fetch fails', async () => {
        favoriteService.getFavorites.mockRejectedValueOnce(new Error('Fetch failed'));
        setup();

        await waitFor(() => {
            expect(screen.getByText(/Failed to load favorites/i)).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
        });
    });

    // Positive
    test('removes item from favorites', async () => {
        favoriteService.getFavorites.mockResolvedValue(mockFavorites);
        favoriteService.removeFromFavorites.mockResolvedValue({});
        favoriteService.normalizeProductId.mockImplementation((id) => id);

        setup();

        await waitFor(() => {
            expect(screen.getByText(/Delicious Apple/i)).toBeInTheDocument();
        });

        const deleteButton = screen.getAllByRole('button', { name: /Remove from Favorites/i })[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(favoriteService.removeFromFavorites).toHaveBeenCalledWith('fav123');
        });
    });

    //  Negative
    test('handles error on remove failure', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
        favoriteService.getFavorites.mockResolvedValue(mockFavorites);
        favoriteService.removeFromFavorites.mockRejectedValue(new Error('Delete failed'));
        favoriteService.normalizeProductId.mockImplementation((id) => id);

        setup();

        const deleteButton = await screen.findAllByRole('button', { name: /Remove from Favorites/i });
        fireEvent.click(deleteButton[0]);

        await waitFor(() => {
            expect(screen.getByText(/Failed to remove favorite/i)).toBeInTheDocument();
        });

        console.error.mockRestore();
    });

    // Positive
    test('stores view data to localStorage', async () => {
        favoriteService.getFavorites.mockResolvedValue([mockFavorites[0]]);
        favoriteService.normalizeProductId.mockImplementation((id) => id);

        setup();

        // With either:
        const viewBtn = await screen.findByLabelText(/View Product/i);
        fireEvent.click(viewBtn);

        const stored = JSON.parse(localStorage.getItem('last_viewed_product'));
        expect(stored).toMatchObject({
            id: 'item123',
            name: 'Delicious Apple',
            brand: 'FruitCo',
            source: 'favorites'
        });
    });

    // Negative
    test('renders fallback for missing name and brand', async () => {
        favoriteService.getFavorites.mockResolvedValue([
            { favoriteId: 'f1', id: 'p1' }
        ]);
        favoriteService.normalizeProductId.mockImplementation((id) => id);

        setup();

        expect(await screen.findByText(/Unknown Product/i)).toBeInTheDocument();
        expect(screen.getByText(/Brand Not Available/i)).toBeInTheDocument();
    });
});
