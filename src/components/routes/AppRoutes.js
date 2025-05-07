import React, { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthContext } from './context/AuthContext';
import Header from './components/navbar/Header';
import Footer from './components/footer/Footer';
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
import ForgotPassword from './components/password/ForgotPassword';
import ProfileEdit from './components/profileedit/ProfileEdit';

// Protected Route component that uses AuthContext
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);
  
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { isLoggedIn, user, login, logout } = useContext(AuthContext);
  
  // Fixed Header with context-based props
  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={logout} user={user} />
      <Box sx={{ padding: 2 }}>
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route path="/login" element={<LoginPage onLogin={login} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/product/:id" element={<ProductDetail isLoggedIn={isLoggedIn} />} />
          <Route path="/favorite/product/:id" element={<ProductDetail fromFavorites={true} isLoggedIn={isLoggedIn} />} />
          <Route path="/all-products" element={<AllProducts />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/logout" element={<Navigate to="/" replace />} />
          
          {/* Protected routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/favorites" 
            element={
              <ProtectedRoute>
                <Favorites userId={user?.id} isLoggedIn={isLoggedIn} />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect /logout to home */}
          <Route path="/logout" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
      <Footer />
    </>
  );
};

export default AppRoutes;