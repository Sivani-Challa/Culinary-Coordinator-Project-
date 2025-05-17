import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Removed unused userEvent import
import { BrowserRouter } from 'react-router-dom';
import Home from '../components/home/Home';
import { checkIsFavorite } from '../api/favoriteService';

// Mock the react-router-dom useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the favorite service
jest.mock('../api/favoriteService', () => ({
  checkIsFavorite: jest.fn()
}));

// Mock the LoginPopup component
jest.mock('../components/common/LoginPopup', () => {
  return function MockLoginPopup({ open, onClose, onLogin }) {
    return open ? (
      <div data-testid="login-popup">
        <button onClick={onClose} data-testid="close-login-button">Close</button>
        <button onClick={onLogin} data-testid="login-button">Login</button>
      </div>
    ) : null;
  };
});

// Global mocks and setup
const mockNavigate = jest.fn();
global.fetch = jest.fn();
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
global.window.addEventListener = jest.fn();
global.window.removeEventListener = jest.fn();

// Helper to setup fetch mocks for common API calls
const setupFetchMocks = (options = {}) => {
  const {
    isLoggedIn = false, 
    itemsResponse = [], 
    filtersResponse = { filters: [] },
    profileResponse = { name: 'Test User' },
    searchResponse = []
  } = options;
  
  // Reset fetch mock
  global.fetch.mockReset();
  
  // Mock localStorage for token
  global.localStorage.getItem.mockImplementation((key) => {
    if (key === 'token' && isLoggedIn) return 'test-token';
    return null;
  });
  
  // Mock fetch for getting items
  global.fetch.mockImplementation((url) => {
    if (url === 'http://localhost:8084/items/all') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(itemsResponse)
      });
    }
    
    if (url === 'http://localhost:8084/items/filters') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(filtersResponse)
      });
    }
    
    if (url === 'http://localhost:8083/profile') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(profileResponse)
      });
    }
    
    if (url.startsWith('http://localhost:8084/items/search') || 
        url.startsWith('http://localhost:8084/items/searchForGuest')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(searchResponse)
      });
    }
    
    if (url === 'http://localhost:8083/favorite/add') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Added to favorites' })
      });
    }
    
    return Promise.reject(new Error(`Unhandled fetch request to ${url}`));
  });
};

// Wrapper component for routing
const HomeWithRouter = () => (
  <BrowserRouter>
    <Home />
  </BrowserRouter>
);

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupFetchMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  /***********************************
   * POSITIVE TEST CASES
   ***********************************/
  
  // Initial Rendering Tests
  describe('Initial Rendering', () => {
    test('renders welcome message without crashing', async () => {
      render(<HomeWithRouter />);
      
      expect(screen.getByText('Welcome to Culinary Mart!')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search for items...')).toBeInTheDocument();
    });
    
    test('shows loading state while fetching items', () => {
      render(<HomeWithRouter />);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
    
    test('renders items after successful fetch', async () => {
      const itemsResponse = [
        { id: 1, itemname: 'Item 1', brand: 'Brand 1' },
        { id: 2, itemname: 'Item 2', brand: 'Brand 2' }
      ];
      
      setupFetchMocks({ itemsResponse });
      
      render(<HomeWithRouter />);
      
      // Separate each assertion into its own waitFor
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Item 2')).toBeInTheDocument();
      });
    });
    
    test('displays user profile name when logged in', async () => {
      setupFetchMocks({ 
        isLoggedIn: true, 
        profileResponse: { name: 'John Doe' },
        itemsResponse: []
      });
      
      render(<HomeWithRouter />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome, John Doe!')).toBeInTheDocument();
      });
    });
  });
  
  // Search Functionality Tests
  describe('Search Functionality', () => {
    test('updates search term on input change', async () => {
      render(<HomeWithRouter />);
      
      const searchInput = screen.getByPlaceholderText('Search for items...');
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      
      expect(searchInput.value).toBe('test search');
    });
    
    test('performs search when search button is clicked', async () => {
      const searchResponse = [
        { id: 3, itemname: 'Search Result', brand: 'Brand X' }
      ];
      
      setupFetchMocks({ 
        itemsResponse: [{ id: 1, itemname: 'Original Item', brand: 'Brand 1' }],
        searchResponse
      });
      
      render(<HomeWithRouter />);
      
      // Wait for initial items to load
      await waitFor(() => {
        expect(screen.getByText('Original Item')).toBeInTheDocument();
      });
      
      // Perform search
      const searchInput = screen.getByPlaceholderText('Search for items...');
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      
      const searchButton = screen.getByLabelText('Search');
      fireEvent.click(searchButton);
      
      // Check that search results are displayed - separate waitFor calls
      await waitFor(() => {
        expect(screen.getByText('Search Results for "test search"')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Search Result')).toBeInTheDocument();
      });
      await waitFor(() => {
        // Use findByText for absence checks to ensure async behavior
        expect(screen.queryByText('Original Item')).not.toBeInTheDocument();
      });
    });
    
    test('performs search on Enter key press', async () => {
      const searchResponse = [
        { id: 3, itemname: 'Keyboard Search Result', brand: 'Brand Y' }
      ];
      
      setupFetchMocks({ 
        itemsResponse: [{ id: 1, itemname: 'Original Item', brand: 'Brand 1' }],
        searchResponse
      });
      
      render(<HomeWithRouter />);
      
      // Wait for initial items to load
      await waitFor(() => {
        expect(screen.getByText('Original Item')).toBeInTheDocument();
      });
      
      // Perform search using Enter key
      const searchInput = screen.getByPlaceholderText('Search for items...');
      fireEvent.change(searchInput, { target: { value: 'keyboard search' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 13, charCode: 13 });
      
      // Separate waitFor calls for each assertion
      await waitFor(() => {
        expect(screen.getByText('Search Results for "keyboard search"')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Keyboard Search Result')).toBeInTheDocument();
      });
    });
  });
  
  // Filter Functionality Tests (for logged-in users)
  describe('Filter Functionality', () => {
    test('renders filter button when user is logged in', async () => {
      setupFetchMocks({ 
        isLoggedIn: true,
        itemsResponse: [],
        filtersResponse: { filters: [] }
      });
      
      render(<HomeWithRouter />);
      
      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });
    });
    
    test('opens filter drawer when filter button is clicked', async () => {
      setupFetchMocks({ 
        isLoggedIn: true,
        itemsResponse: [],
        filtersResponse: { 
          filters: [
            { filterType: 'BRAND', filters: ['Brand A', 'Brand B'] },
            { filterType: 'CATEGORY', filters: ['Category X', 'Category Y'] }
          ]
        }
      });
      
      render(<HomeWithRouter />);
      
      // Wait for the filter button to appear
      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });
      
      // Click the filter button
      fireEvent.click(screen.getByText('Filters'));
      
      // Check that filter drawer opens - separate waitFor calls
      await waitFor(() => {
        expect(screen.getByText('Reset Filters')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Brands')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Categories')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Brand A')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Category X')).toBeInTheDocument();
      });
    });
    
    test('applies filters when Apply Filters button is clicked', async () => {
      const filteredResponse = [
        { id: 5, itemname: 'Filtered Item', brand: 'Brand A' }
      ];
      
      setupFetchMocks({ 
        isLoggedIn: true,
        itemsResponse: [{ id: 1, itemname: 'Original Item', brand: 'Brand Z' }],
        filtersResponse: { 
          filters: [
            { filterType: 'BRAND', filters: ['Brand A', 'Brand B'] }
          ]
        },
        searchResponse: filteredResponse
      });
      
      render(<HomeWithRouter />);
      
      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Original Item')).toBeInTheDocument();
      });
      
      // Open filter drawer
      fireEvent.click(screen.getByText('Filters'));
      
      // Select a filter checkbox
      await waitFor(() => {
        expect(screen.getByText('Brand A')).toBeInTheDocument();
      });
      
      const brandACheckbox = screen.getByLabelText('Brand A');
      fireEvent.click(brandACheckbox);
      
      // Apply filters
      fireEvent.click(screen.getByText('Apply Filters'));
      
      // Verify filtered results - separate waitFor calls
      await waitFor(() => {
        expect(screen.queryByText('Original Item')).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Filtered Item')).toBeInTheDocument();
      });
    });
    
    test('resets filters when Reset Filters button is clicked', async () => {
      setupFetchMocks({ 
        isLoggedIn: true,
        itemsResponse: [],
        filtersResponse: { 
          filters: [
            { filterType: 'BRAND', filters: ['Brand A', 'Brand B'] }
          ]
        }
      });
      
      render(<HomeWithRouter />);
      
      // Open filter drawer
      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Filters'));
      
      // Select a filter
      await waitFor(() => {
        expect(screen.getByText('Brand A')).toBeInTheDocument();
      });
      
      const brandACheckbox = screen.getByLabelText('Brand A');
      fireEvent.click(brandACheckbox);
      
      // Verify checkbox is checked
      expect(brandACheckbox).toBeChecked();
      
      // Reset filters
      fireEvent.click(screen.getByText('Reset Filters'));
      
      // Verify checkbox is unchecked
      expect(brandACheckbox).not.toBeChecked();
    });
  });
  
  // Pagination Tests
  describe('Pagination', () => {
    test('renders pagination when there are multiple pages', async () => {
      // Create 50 items (more than itemsPerPage which is 40)
      const manyItems = Array(50).fill().map((_, i) => ({
        id: i + 1,
        itemname: `Item ${i + 1}`,
        brand: `Brand ${i % 5 + 1}`
      }));
      
      setupFetchMocks({ itemsResponse: manyItems });
      
      render(<HomeWithRouter />);
      
      // Check that pagination is rendered - separate waitFor calls
      await waitFor(() => {
        // Look for pagination navigation
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });
      await waitFor(() => {
        // Should have 2 pages (50 items with 40 per page)
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
    
    test('changes page when pagination button is clicked', async () => {
      // Create 50 items (more than itemsPerPage which is 40)
      const manyItems = Array(50).fill().map((_, i) => ({
        id: i + 1,
        itemname: `Item ${i + 1}`,
        brand: `Brand ${i % 5 + 1}`
      }));
      
      setupFetchMocks({ itemsResponse: manyItems });
      
      render(<HomeWithRouter />);
      
      // First page should show Item 1
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
      
      // Click on page 2
      const page2Button = await screen.findByText('2');
      fireEvent.click(page2Button);
      
      // Page 2 should show Item 41 and not Item 1
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      expect(screen.getByText('Item 41')).toBeInTheDocument();
    });
  });
  
  // Product Actions Tests
  describe('Product Actions', () => {
    test('navigates to product page when view button is clicked', async () => {
      setupFetchMocks({ 
        itemsResponse: [{ id: 1, itemname: 'Test Product', brand: 'Test Brand' }]
      });
      
      render(<HomeWithRouter />);
      
      // Wait for items to load
      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
      });
      
      // Find and click view button using better Testing Library approach
      const viewButton = screen.getByRole('button', { name: /visibility/i });
      fireEvent.click(viewButton);
      
      // Check that navigate was called with the correct path
      expect(mockNavigate).toHaveBeenCalledWith('/product/1');
    });
    
    test('adds product to favorites when favorite button is clicked by logged in user', async () => {
      checkIsFavorite.mockResolvedValue(false); // Item is not already a favorite
      
      setupFetchMocks({ 
        isLoggedIn: true,
        itemsResponse: [{ id: 1, itemname: 'Favorite Test', brand: 'Test Brand' }]
      });
      
      render(<HomeWithRouter />);
      
      // Wait for items to load
      await waitFor(() => {
        expect(screen.getByText('Favorite Test')).toBeInTheDocument();
      });
      
      // Find and click the favorite button using better Testing Library approach
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      fireEvent.click(favoriteButton);
      
      // Check that success message is shown
      await waitFor(() => {
        expect(screen.getByText('Successfully added to favorites')).toBeInTheDocument();
      });
    });
    
    test('shows login popup when favorite button is clicked by guest user', async () => {
      setupFetchMocks({ 
        isLoggedIn: false,
        itemsResponse: [{ id: 1, itemname: 'Login Test', brand: 'Test Brand' }]
      });
      
      render(<HomeWithRouter />);
      
      // Wait for items to load
      await waitFor(() => {
        expect(screen.getByText('Login Test')).toBeInTheDocument();
      });
      
      // Find and click the favorite button using better Testing Library approach
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      fireEvent.click(favoriteButton);
      
      // Check that login popup is shown
      await waitFor(() => {
        expect(screen.getByTestId('login-popup')).toBeInTheDocument();
      });
    });
    
    test('navigates to login page when login button in popup is clicked', async () => {
      setupFetchMocks({ 
        isLoggedIn: false,
        itemsResponse: [{ id: 1, itemname: 'Login Nav Test', brand: 'Test Brand' }]
      });
      
      render(<HomeWithRouter />);
      
      // Wait for items to load
      await waitFor(() => {
        expect(screen.getByText('Login Nav Test')).toBeInTheDocument();
      });
      
      // Find and click the favorite button to open login popup
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      fireEvent.click(favoriteButton);
      
      // Click login button in popup
      await waitFor(() => {
        expect(screen.getByTestId('login-button')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('login-button'));
      
      // Check navigation to login page
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
  
  /***********************************
   * NEGATIVE TEST CASES
   ***********************************/
  
  // Error Handling Tests
  describe('Error Handling', () => {
    test('displays error message when items fetch fails', async () => {
      // Mock a failed fetch
      global.fetch.mockImplementation((url) => {
        if (url === 'http://localhost:8084/items/all') {
          return Promise.resolve({
            ok: false,
            status: 500
          });
        }
        return Promise.reject(new Error('Unhandled fetch'));
      });
      
      render(<HomeWithRouter />);
      
      // Check that error message is shown
      await waitFor(() => {
        expect(screen.getByText('Failed to load items. Please try again later.')).toBeInTheDocument();
      });
    });
    
    test('displays no items found message when search returns empty results', async () => {
      setupFetchMocks({ 
        itemsResponse: [{ id: 1, itemname: 'Original Item', brand: 'Brand 1' }],
        searchResponse: [] // Empty search results
      });
      
      render(<HomeWithRouter />);
      
      // Wait for initial items to load
      await waitFor(() => {
        expect(screen.getByText('Original Item')).toBeInTheDocument();
      });
      
      // Perform search
      const searchInput = screen.getByPlaceholderText('Search for items...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent item' } });
      
      const searchButton = screen.getByLabelText('Search');
      fireEvent.click(searchButton);
      
      // Check that no items found message is displayed
      await waitFor(() => {
        expect(screen.getByText('No items found matching your criteria.')).toBeInTheDocument();
      });
    });
    
    test('displays appropriate message when adding already favorited item', async () => {
      // Mock item already being a favorite
      checkIsFavorite.mockResolvedValue(true);
      
      setupFetchMocks({ 
        isLoggedIn: true,
        itemsResponse: [{ id: 1, itemname: 'Already Favorite', brand: 'Test Brand' }]
      });
      
      render(<HomeWithRouter />);
      
      // Wait for items to load
      await waitFor(() => {
        expect(screen.getByText('Already Favorite')).toBeInTheDocument();
      });
      
      // Find and click the favorite button using better Testing Library approach
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      fireEvent.click(favoriteButton);
      
      // Check for appropriate message
      await waitFor(() => {
        expect(screen.getByText('Already available in favorites')).toBeInTheDocument();
      });
    });
    
    test('displays error when adding to favorites fails', async () => {
      checkIsFavorite.mockResolvedValue(false);
      
      // Setup fetch to succeed for items but fail for adding to favorites
      setupFetchMocks({ 
        isLoggedIn: true,
        itemsResponse: [{ id: 1, itemname: 'Favorite Error Test', brand: 'Test Brand' }]
      });
      
      // Override favorite add endpoint with error
      global.fetch.mockImplementation((url, options) => {
        if (url === 'http://localhost:8083/favorite/add') {
          return Promise.resolve({
            ok: false,
            status: 500
          });
        }
        
        // Use default implementation for other URLs
        if (url === 'http://localhost:8084/items/all') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([{ id: 1, itemname: 'Favorite Error Test', brand: 'Test Brand' }])
          });
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      });
      
      render(<HomeWithRouter />);
      
      // Wait for items to load
      await waitFor(() => {
        expect(screen.getByText('Favorite Error Test')).toBeInTheDocument();
      });
      
      // Find and click the favorite button using better Testing Library approach
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      fireEvent.click(favoriteButton);
      
      // Check for error message
      await waitFor(() => {
        expect(screen.getByText('Error adding to favorites')).toBeInTheDocument();
      });
    });
  });
  
  // Edge Cases Tests
  describe('Edge Cases', () => {
    test('handles items with missing properties gracefully', async () => {
      setupFetchMocks({ 
        itemsResponse: [
          { id: 1 }, // Missing itemname and brand
          { id: 2, itemname: 'Only Name' }, // Missing brand
          { id: 3, brand: 'Only Brand' } // Missing itemname
        ]
      });
      
      render(<HomeWithRouter />);
      
      // Check that items are rendered with fallback text - separate waitFor calls
      await waitFor(() => {
        expect(screen.getByText('No Name Available')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Only Name')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Only Brand')).toBeInTheDocument();
      });
      await waitFor(() => {
        // Check for exact number of brand not available elements
        const brandNotAvailableElements = screen.getAllByText('Brand Not Available');
        expect(brandNotAvailableElements).toHaveLength(2);
      });
    });
    
    test('handles search with empty term but active filters', async () => {
      const filteredResponse = [
        { id: 5, itemname: 'Filtered Only', brand: 'Brand A' }
      ];
      
      setupFetchMocks({ 
        isLoggedIn: true,
        itemsResponse: [{ id: 1, itemname: 'Original Item', brand: 'Brand Z' }],
        filtersResponse: { 
          filters: [
            { filterType: 'BRAND', filters: ['Brand A'] }
          ]
        },
        searchResponse: filteredResponse
      });
      
      render(<HomeWithRouter />);
      
      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Original Item')).toBeInTheDocument();
      });
      
      // Open filter drawer and select a filter
      fireEvent.click(screen.getByText('Filters'));
      
      await waitFor(() => {
        expect(screen.getByText('Brand A')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByLabelText('Brand A'));
      
      // Apply filters with empty search term
      fireEvent.click(screen.getByText('Apply Filters'));
      
      // Verify filtered results are still applied - separate waitFor calls
      await waitFor(() => {
        expect(screen.queryByText('Original Item')).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Filtered Only')).toBeInTheDocument();
      });
    });
    
    test('disables search button when search term is empty with no filters', async () => {
      setupFetchMocks({ 
        itemsResponse: [{ id: 1, itemname: 'Test Item', brand: 'Brand' }]
      });
      
      render(<HomeWithRouter />);
      
      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Test Item')).toBeInTheDocument();
      });
      
      // Try to search with empty term
      const searchInput = screen.getByPlaceholderText('Search for items...');
      const searchButton = screen.getByLabelText('Search');
      
      fireEvent.click(searchButton);
      
      // Placeholder should change to indicate error
      expect(searchInput.placeholder).toBe('Enter text to search for items');
      
      // Should stay on current items
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
    
    test('clears search results when clear search button is clicked', async () => {
      setupFetchMocks({ 
        itemsResponse: [{ id: 1, itemname: 'Original Item', brand: 'Brand 1' }],
        searchResponse: [] // Empty search results
      });
      
      render(<HomeWithRouter />);
      
      // Wait for initial items to load
      await waitFor(() => {
        expect(screen.getByText('Original Item')).toBeInTheDocument();
      });
      
      // Perform search that returns no results
      const searchInput = screen.getByPlaceholderText('Search for items...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      const searchButton = screen.getByLabelText('Search');
      fireEvent.click(searchButton);
      
      // Wait for no items found message
      await waitFor(() => {
        expect(screen.getByText('No items found matching your criteria.')).toBeInTheDocument();
      });
      
      // Click clear search button
      fireEvent.click(screen.getByText('Clear Search'));
      
      // Should return to original items
      await waitFor(() => {
        expect(screen.getByText('Original Item')).toBeInTheDocument();
      });
    });
  });
});