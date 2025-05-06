import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/navbar/Header';
import LoginPage from './components/login/LoginPage';
import RegisterPage from './components/register/RegisterPage';
import Home from './components/home/Home';
import AllProducts from './components/product/AllProducts';
import FAQs from './components/pages/FAQs';
import ProductDetail from './components/product/ProductDetail';
import ContactUs from './components/pages/ContactUs';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import CookiePolicy from './components/pages/CookiePolicy';
import SearchResults from './components/searchresults/SearchResults';
import Favorites from './components/favorites/Favorites';
import ProtectedRoute from './components/protected/ProtectedRoute';
import { Box, CssBaseline, CircularProgress } from '@mui/material';
import Footer from './components/footer/Footer';
import ForgotPassword from './components/password/ForgotPassword';
import ProfileEdit from './components/profileedit/ProfileEdit';



const App = () => {
  // Authentication state management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        
        setIsLoggedIn(true);
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }
      }
      
      setAuthLoading(false);
    };

    checkLoginStatus();
  }, []);

  // Login function
  const login = (userData, token) => {
    console.log("Login function called with:", userData); 
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  // Update ProtectedRoute to accept auth props
  const ProtectedRouteWithAuth = ({ children }) => {
    // Show loading indicator while checking auth status
    if (authLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return (
      <ProtectedRoute isLoggedIn={isLoggedIn}>
        {children}
      </ProtectedRoute>
    );
  };

  return (
    <>
      <CssBaseline />
      <Router>
        <Header isLoggedIn={isLoggedIn} onLogout={logout} user={user} />
        <Box sx={{ padding: 2 }}>
          <Routes>
            <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
            <Route path="/login" element={<LoginPage onLogin={login} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/product/:id" element={<ProductDetail isLoggedIn={isLoggedIn} />} />
            <Route path="/all-products" element={<AllProducts />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/logout" element={<LoginPage onLogin={login} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<ProtectedRouteWithAuth>
                  <ProfileEdit/>
                </ProtectedRouteWithAuth>
              }
            />
            <Route 
              path="/favorites" 
              element={
                <ProtectedRouteWithAuth>
                  <Favorites userId={user?.id} isLoggedIn={isLoggedIn} />
                </ProtectedRouteWithAuth>
              } 
            />
          </Routes>
        </Box>
        <Footer />
      </Router>
    </>
  );
};

export default App;