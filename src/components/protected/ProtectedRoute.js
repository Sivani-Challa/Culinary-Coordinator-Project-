// src/components/protected/ProtectedRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  useEffect(() => {
    // Simple check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    setAuthLoading(false);
  }, []);
  
  // Show loading indicator while checking auth status
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Redirect to login if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/" replace/>;
  }
  
  // Render children if logged in
  return children;
};

export default ProtectedRoute;