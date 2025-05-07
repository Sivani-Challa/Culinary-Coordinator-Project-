import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import LoginPopup from '../common/LoginPopup';
import { addToFavorites, checkIsFavorite } from '../../api/favoriteService';

const FavoriteButton = ({ itemId, isFavorite: initialIsFavorite = false, onSuccess }) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);

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
        setIsAddingToFavorites(true); // Set loading state to true
        
        // Get product details
        const productName = document.querySelector('h1')?.textContent || 'Product'; // Try to get product name from page
        const brand = ''; // Add logic to get brand if available
        const manufacturer = ''; // Add logic to get manufacturer if available
        
        // Check if the product is already in favorites
        const favoriteStatus = await checkIsFavorite(itemId);
        if (favoriteStatus) {
          // If it's already in favorites, show the message
          alert('Item is already in your favorites');
          setIsAddingToFavorites(false); // Reset loading state
          return;
        }
    
        // If not already in favorites, add it to favorites
        await addToFavorites(itemId, productName, brand, manufacturer);
        setIsFavorite(true);
        if (onSuccess) onSuccess(itemId);
    
      } catch (error) {
        console.error('Error adding to favorites:', error);
        
        // Check for different types of duplicate errors
        if (error.message && error.message.includes('already in your favorites')) {
          // Client-side duplicate check
          alert(error.message);
          setIsFavorite(true); // Set as favorite anyway since it exists
        } else if (error.response && error.response.status === 409) {
          // Server-side duplicate check (409 Conflict)
          alert('Item is already in your favorites');
          setIsFavorite(true); // Set as favorite anyway since it exists
        } else {
          alert('Error adding to favorites. Please try again.');
        }
      } finally {
        setIsAddingToFavorites(false); // Reset loading state whether succeeded or failed
      }
    } else {
      // If not logged in, show login popup
      setShowLoginPopup(true);
    }
  };
  

  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
  };

  // handle login success
  const handleLoginSuccess = (response) => {
    localStorage.setItem('token', response.data.token);
    if (response.data.userId || response.data.id) {
      localStorage.setItem('userId', response.data.userId || response.data.id);
      console.log("Stored user ID:", response.data.userId || response.data.id);
    } else {
      try {
        const token = response.data.token;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        if (payload.id || payload.userId || payload.sub) {
          const extractedId = payload.id || payload.userId || payload.sub;
          localStorage.setItem('userId', extractedId);
          console.log("Stored user ID extracted from token:", extractedId);
        }
      } catch (error) {
        console.error("Error extracting user ID from token:", error);
      }
    }

    // Recheck favorite status after login
    checkIsFavorite(itemId).then((status) => {
      setIsFavorite(status);
    });
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
        disabled={isAddingToFavorites} // Disable button while adding
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
