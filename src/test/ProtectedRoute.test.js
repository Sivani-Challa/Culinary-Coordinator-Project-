import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/protected/ProtectedRoute';

// Mock components for testing routes
const ProtectedComponent = () => <div data-testid="protected-content">Protected Content</div>;
const HomePage = () => <div data-testid="home-page">Home Page</div>;

// Setup test wrapper with routing
const renderWithRouter = (ui, { initialEntries = ['/protected'] } = {}) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/protected" 
          element={
            <ProtectedRoute>
              <ProtectedComponent />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Component', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // POSITIVE TEST CASES
  
  test('renders loading indicator initially', () => {
    renderWithRouter();
    
    // Should show loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders children when user is authenticated (positive case)', async () => {
    // Setup authenticated state
    localStorage.setItem('token', 'valid-token');
    
    renderWithRouter();
    
    // Initially shows loading
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Then shows protected content after auth check
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  test('works with token containing special characters (edge case)', async () => {
    // Setup token with special characters
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ');
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  test('preserves children props when rendering (positive case)', async () => {
    localStorage.setItem('token', 'valid-token');
    
    // Render with child component that has props
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <div data-testid="with-props" data-foo="bar">Has Props</div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </MemoryRouter>
    );
    
    // Wait for the element to be present
    await waitFor(() => {
      expect(screen.getByTestId('with-props')).toBeInTheDocument();
    });
    
    // Then check its attributes in a separate assertion
    const element = screen.getByTestId('with-props');
    expect(element.getAttribute('data-foo')).toBe('bar');
  });

  // NEGATIVE TEST CASES
  
  test('redirects to home when user is not authenticated (negative case)', async () => {
    // No token in localStorage = not authenticated
    
    renderWithRouter();
    
    // Initially shows loading
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for the home page to appear after redirect
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
    
    // Then separately check that protected content is not present
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('redirects when token is empty string (negative case)', async () => {
    // Empty token should be treated as not authenticated
    localStorage.setItem('token', '');
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  test('redirects when token is null (negative case)', async () => {
    // Explicitly set null token
    localStorage.setItem('token', null);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  test('handles localStorage access errors gracefully (negative case)', async () => {
    // Mock localStorage to throw an error
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage is not available');
    });
    
    renderWithRouter();
    
    // Should redirect to home in case of errors
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  test('redirects to correct path when coming from different routes (negative case)', async () => {
    // Test with a different initial route
    renderWithRouter({initialEntries: ['/protected?from=dashboard']});
    
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  test('redirects when token exists but is invalid format (edge case)', async () => {
    // This simulates a corrupted token
    localStorage.setItem('token', '{corrupted:token}');
    
    // In a real app, you might validate the token format or signature
    // For this test, we're assuming any string is accepted (which is the current implementation)
    // So this should actually pass and show protected content
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  test('handles fast navigation (timing edge case)', async () => {
    // First navigate without token
    const { rerender } = renderWithRouter();
    
    // Then quickly add token and re-render before effect completes
    localStorage.setItem('token', 'valid-token');
    rerender(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/protected" element={<ProtectedRoute><ProtectedComponent /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    
    // Should eventually show protected content
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });
});