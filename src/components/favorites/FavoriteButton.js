// src/components/common/FavoriteButton.js
import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import LoginPopup from '../common/LoginPopup';
import { addToFavorites } from '../../api/favoriteService';

const FavoriteButton = ({ itemId, isFavorite: initialIsFavorite = false, onSuccess }) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const user = localStorage.getItem('user');
      setIsLoggedIn(!!user);
    };
    
    checkLoginStatus();
    
    // Listen for storage changes (in case user logs in from another tab)
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleFavoriteClick = async () => {
    // If user is logged in, add to favorites
    if (isLoggedIn) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id || user?.userId || '1'; // Use appropriate ID from your user object
        await addToFavorites(itemId, userId);
        setIsFavorite(true);
        if (onSuccess) onSuccess(itemId);
      } catch (error) {
        console.error('Error adding to favorites:', error);
      }
    } else {
      // If not logged in, show login popup
      console.log('User not logged in, showing login popup');
      setShowLoginPopup(true);
    }
  };

  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
  };

  const handleLoginSuccess = () => {
    // Update login state
    setIsLoggedIn(true);
    // Close popup
    setShowLoginPopup(false);
    // Now try to add to favorites again since user is logged in
    setTimeout(() => handleFavoriteClick(), 500); // Add a small delay to ensure localStorage is updated
  };

  return (
    <>
      <IconButton 
        onClick={handleFavoriteClick} 
        sx={{ 
          color: 'white',
          backgroundColor: 'purple',
          '&:hover': {
            backgroundColor: '#9c27b0'
          },
          width: 36,
          height: 36
        }}
      >
        {isFavorite ? (
          <FavoriteIcon sx={{ fontSize: '20px' }} />
        ) : (
          <FavoriteBorderIcon sx={{ fontSize: '20px' }} />
        )}
      </IconButton>

      {/* Conditionally render the LoginPopup */}
      {showLoginPopup && (
        <LoginPopup
          open={showLoginPopup}
          onClose={handleCloseLoginPopup}
          onLogin={handleLoginSuccess}
          showLoginButton={true}
        />
      )}
    </>
  );
};

export default FavoriteButton;