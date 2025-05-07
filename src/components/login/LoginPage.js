// LoginPage.jsx
import React, { useEffect, useContext } from 'react';
import { Box } from '@mui/material';
import LoginForm from './LoginForm';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Adjust the import path as necessary


const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

   // Pass login function to LoginForm
   const handleLoginSuccess = (userData, token) => {
    console.log('Login handler in LoginPage called with:', userData, token);
    login(userData, token);
    navigate('/');
  };

  // Effect to hide scrollbar on mount and restore on unmount
  useEffect(() => {
  
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // If already logged in, redirect to home
      navigate('/');
    }
    
    // Save original styles
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // Hide scrollbar on body
    document.body.style.overflow = 'hidden';
    
    // Cleanup function - restore original style when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: 'calc(100vh - 64px)',
        width: '100%',
        margin: 0,
        padding: 0,
        backgroundImage: `url(${process.env.PUBLIC_URL + '/loginlogo.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
        position: 'fixed', // Use fixed positioning
        top: '64px', // Position right below header
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Login form component */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1, 
          width: { xs: '100%', sm: '450px' },
          mr: { xs: 1, sm: 4, md: 8 },
          p: { xs: 2, sm: 0 }
        }}
      >
        <LoginForm onLogin={handleLoginSuccess} />
      </Box>
    </Box>
  );
};

export default LoginPage;