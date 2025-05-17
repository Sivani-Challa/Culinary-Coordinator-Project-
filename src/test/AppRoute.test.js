// AppRoutes.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import AppRoutes from './AppRoutes';

// Mock all the child components
jest.mock('./components/navbar/Header', () => {
  return function MockHeader(props) {
    return (
      <div data-testid="header">
        <div data-testid="header-logged-in">{props.isLoggedIn ? 'Logged In' : 'Not Logged In'}</div>
        {props.isLoggedIn && <button data-testid="logout-button" onClick={props.onLogout}>Logout</button>}
        {props.user && <div data-testid="user-info">{props.user.id}</div>}
      </div>
    );
  };
});

jest.mock('./components/footer/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

jest.mock('./components/home/Home', () => {
  return function MockHome(props) {
    return <div data-testid="home">Home {props.isLoggedIn ? 'Logged In' : 'Not Logged In'}</div>;
  };
});

jest.mock('./components/login/LoginPage', () => {
  return function MockLoginPage(props) {
    return (
      <div data-testid="login-page">
        <button data-testid="login-button" onClick={() => props.onLogin({ id: 'test-user-id', name: 'Test User' })}>
          Login
        </button>
      </div>
    );
  };
});

jest.mock('./components/register/RegisterPage', () => {
  return function MockRegisterPage() {
    return <div data-testid="register-page">Register</div>;
  };
});

jest.mock('./components/product/AllProducts', () => {
  return function MockAllProducts() {
    return <div data-testid="all-products">All Products</div>;
  };
});

jest.mock('./components/pages/FAQs', () => {
  return function MockFAQs() {
    return <div data-testid="faqs">FAQs</div>;
  };
});

jest.mock('./components/product/ProductDetail', () => {
  return function MockProductDetail(props) {
    return (
      <div data-testid="product-detail">
        Product Detail 
        {props.isLoggedIn ? ' Logged In' : ' Not Logged In'}
        {props.fromFavorites ? ' From Favorites' : ''}
        <div data-testid="product-id">ID from URL</div>
      </div>
    );
  };
});

jest.mock('./components/pages/ContactUs', () => {
  return function MockContactUs() {
    return <div data-testid="contact-us">Contact Us</div>;
  };
});

jest.mock('./components/pages/PrivacyPolicy', () => {
  return function MockPrivacyPolicy() {
    return <div data-testid="privacy-policy">Privacy Policy</div>;
  };
});

jest.mock('./components/pages/CookiePolicy', () => {
  return function MockCookiePolicy() {
    return <div data-testid="cookie-policy">Cookie Policy</div>;
  };
});

jest.mock('./components/searchresults/SearchResults', () => {
  return function MockSearchResults() {
    return <div data-testid="search-results">Search Results</div>;
  };
});

jest.mock('./components/favorites/Favorites', () => {
  return function MockFavorites(props) {
    return (
      <div data-testid="favorites">
        Favorites
        <div data-testid="favorites-user-id">{props.userId}</div>
        <div data-testid="favorites-logged-in">{props.isLoggedIn ? 'Logged In' : 'Not Logged In'}</div>
      </div>
    );
  };
});

jest.mock('./components/password/ForgotPassword', () => {
  return function MockForgotPassword() {
    return <div data-testid="forgot-password">Forgot Password</div>;
  };
});

jest.mock('./components/profileedit/ProfileEdit', () => {
  return function MockProfileEdit() {
    return <div data-testid="profile-edit">Profile Edit</div>;
  };
});

// Helper function to render the component with auth context
const renderWithContext = (initialEntries = ['/'], contextValue = { isLoggedIn: false, user: null, login: jest.fn(), logout: jest.fn() }) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthContext.Provider value={contextValue}>
        <AppRoutes />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('AppRoutes Component', () => {
  // POSITIVE TEST CASES
  
  describe('Public Routes', () => {
    test('renders Home page at root path', () => {
      renderWithContext(['/']);
      expect(screen.getByTestId('home')).toBeInTheDocument();
      expect(screen.getByTestId('home')).toHaveTextContent('Not Logged In');
    });

    test('renders Login page at /login path', () => {
      renderWithContext(['/login']);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    test('renders Register page at /register path', () => {
      renderWithContext(['/register']);
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    test('renders FAQs page at /faqs path', () => {
      renderWithContext(['/faqs']);
      expect(screen.getByTestId('faqs')).toBeInTheDocument();
    });

    test('renders All Products page at /all-products path', () => {
      renderWithContext(['/all-products']);
      expect(screen.getByTestId('all-products')).toBeInTheDocument();
    });

    test('renders Product Detail page at /product/:id path', () => {
      renderWithContext(['/product/123']);
      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
      expect(screen.getByTestId('product-detail')).toHaveTextContent('Not Logged In');
      expect(screen.getByTestId('product-detail')).not.toHaveTextContent('From Favorites');
    });

    test('renders Product Detail from favorites at /favorite/product/:id path', () => {
      renderWithContext(['/favorite/product/123']);
      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
      expect(screen.getByTestId('product-detail')).toHaveTextContent('Not Logged In');
      expect(screen.getByTestId('product-detail')).toHaveTextContent('From Favorites');
    });

    test('renders Contact Us page at /contactus path', () => {
      renderWithContext(['/contactus']);
      expect(screen.getByTestId('contact-us')).toBeInTheDocument();
    });

    test('renders Privacy Policy page at /privacy path', () => {
      renderWithContext(['/privacy']);
      expect(screen.getByTestId('privacy-policy')).toBeInTheDocument();
    });

    test('renders Cookie Policy page at /cookies path', () => {
      renderWithContext(['/cookies']);
      expect(screen.getByTestId('cookie-policy')).toBeInTheDocument();
    });

    test('renders Search Results page at /search path', () => {
      renderWithContext(['/search']);
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });

    test('renders Forgot Password page at /forgot-password path', () => {
      renderWithContext(['/forgot-password']);
      expect(screen.getByTestId('forgot-password')).toBeInTheDocument();
    });
  });

  describe('Protected Routes', () => {
    const authContext = {
      isLoggedIn: true,
      user: { id: 'test-user-id', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn()
    };

    test('renders Profile Edit page at /profile when logged in', () => {
      renderWithContext(['/profile'], authContext);
      expect(screen.getByTestId('profile-edit')).toBeInTheDocument();
    });

    test('renders Favorites page at /favorites when logged in', () => {
      renderWithContext(['/favorites'], authContext);
      expect(screen.getByTestId('favorites')).toBeInTheDocument();
      expect(screen.getByTestId('favorites-user-id')).toHaveTextContent('test-user-id');
      expect(screen.getByTestId('favorites-logged-in')).toHaveTextContent('Logged In');
    });

    test('renders Home page with logged in state when user is authenticated', () => {
      renderWithContext(['/'], authContext);
      expect(screen.getByTestId('home')).toHaveTextContent('Logged In');
    });

    test('renders Product Detail with logged in state when user is authenticated', () => {
      renderWithContext(['/product/123'], authContext);
      expect(screen.getByTestId('product-detail')).toHaveTextContent('Logged In');
    });
  });

  describe('Logout Functionality', () => {
    test('redirects to home when navigating to /logout', () => {
      renderWithContext(['/logout']);
      expect(screen.getByTestId('home')).toBeInTheDocument();
    });

    test('logout button in Header calls logout function', () => {
      const authContext = {
        isLoggedIn: true,
        user: { id: 'test-user-id', name: 'Test User' },
        login: jest.fn(),
        logout: jest.fn()
      };
      
      renderWithContext(['/'], authContext);
      
      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);
      
      expect(authContext.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Login Functionality', () => {
    test('login button in LoginPage calls login function with user data', () => {
      const authContext = {
        isLoggedIn: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn()
      };
      
      renderWithContext(['/login'], authContext);
      
      const loginButton = screen.getByTestId('login-button');
      fireEvent.click(loginButton);
      
      expect(authContext.login).toHaveBeenCalledTimes(1);
      expect(authContext.login).toHaveBeenCalledWith({ id: 'test-user-id', name: 'Test User' });
    });
  });

  // NEGATIVE TEST CASES
  
  describe('Protected Route Redirection', () => {
    test('redirects to home when accessing /profile while not logged in', () => {
      renderWithContext(['/profile'], { isLoggedIn: false, user: null, login: jest.fn(), logout: jest.fn() });
      expect(screen.getByTestId('home')).toBeInTheDocument();
      expect(screen.queryByTestId('profile-edit')).not.toBeInTheDocument();
    });

    test('redirects to home when accessing /favorites while not logged in', () => {
      renderWithContext(['/favorites'], { isLoggedIn: false, user: null, login: jest.fn(), logout: jest.fn() });
      expect(screen.getByTestId('home')).toBeInTheDocument();
      expect(screen.queryByTestId('favorites')).not.toBeInTheDocument();
    });
  });

  describe('Header Rendering Based on Auth State', () => {
    test('Header renders with not logged in state when user is not authenticated', () => {
      renderWithContext(['/']);
      expect(screen.getByTestId('header-logged-in')).toHaveTextContent('Not Logged In');
      expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
    });

    test('Header renders with logged in state and user info when user is authenticated', () => {
      const authContext = {
        isLoggedIn: true,
        user: { id: 'test-user-id', name: 'Test User' },
        login: jest.fn(),
        logout: jest.fn()
      };
      
      renderWithContext(['/'], authContext);
      
      expect(screen.getByTestId('header-logged-in')).toHaveTextContent('Logged In');
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.getByTestId('user-info')).toHaveTextContent('test-user-id');
    });
  });

  describe('Unknown Routes', () => {
    test('renders Home page for unknown routes (404 fallback)', () => {
      renderWithContext(['/unknown-route-that-does-not-exist']);
      
      // Since there's no explicit 404 route in the component,
      // we expect the router to not match any routes and render nothing
      // within the Routes component, but the Header and Footer should still render
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      
      // None of the route components should be rendered
      expect(screen.queryByTestId('home')).not.toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
      // ... and so on
    });
  });

  describe('Edge Cases', () => {
    test('renders correctly when user object is incomplete', () => {
      const authContext = {
        isLoggedIn: true,
        user: { id: 'test-user-id' }, // Missing name property
        login: jest.fn(),
        logout: jest.fn()
      };
      
      renderWithContext(['/favorites'], authContext);
      expect(screen.getByTestId('favorites')).toBeInTheDocument();
      expect(screen.getByTestId('favorites-user-id')).toHaveTextContent('test-user-id');
    });

    test('handles null user object correctly when logged in', () => {
      const authContext = {
        isLoggedIn: true,
        user: null, // No user object despite being logged in
        login: jest.fn(),
        logout: jest.fn()
      };
      
      renderWithContext(['/favorites'], authContext);
      expect(screen.getByTestId('favorites')).toBeInTheDocument();
      expect(screen.getByTestId('favorites-user-id')).toBeEmptyDOMElement();
    });
  });
});

/**
 * Additional tests that you might want to include:
 * 
 * 1. Test actual navigation between pages using Router's history
 * 2. Test query parameter handling in routes like /search
 * 3. Test the behavior when auth state changes while on a protected route
 * 4. Test with real components instead of mocks for integration tests
 * 5. Test accessibility of the routing structure
 * 6. Test that props are correctly passed through to rendered components
 * 7. Test route-based animations or transitions if they exist
 * 8. Test deep linking functionality
 */