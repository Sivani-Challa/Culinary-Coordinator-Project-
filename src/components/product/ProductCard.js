import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, IconButton, Box, CardMedia } from '@mui/material';
import { Favorite, FavoriteBorder, Visibility } from '@mui/icons-material';
import LoginPopup from './LoginPopup';
import { addToFavorites, checkIsFavorite } from '../../api/favoriteService';

const ProductCard = ({ product, isLoggedIn, onLogin }) => {
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);

  // Check if product is in favorites when component mounts or isLoggedIn changes
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (isLoggedIn && product?.id) {
        try {
          const favoriteStatus = await checkIsFavorite(product.id);
          setIsFavorite(favoriteStatus);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };
    
    checkFavoriteStatus();
  }, [isLoggedIn, product?.id]);

  const handleAddToFavorites = async () => {
    if (isLoggedIn) {
      if (isAddingToFavorites) return; // Prevent multiple clicks
      
      setIsAddingToFavorites(true);
      try {
        // Extract required data from product
        const productId = product.id;
        const productName = product.name || product.title;
        const brand = product.brand || '';
        const manufacturer = product.manufacturer || '';
        
        console.log('Adding to favorites:', {
          productId, productName, brand, manufacturer
        });
        
        // Call the service with the correct parameters
        await addToFavorites(productId, productName, brand, manufacturer);
        
        // Update local state
        setIsFavorite(true);
        console.log('Successfully added to favorites');
      } catch (error) {
        console.error('Failed to add to favorites:', error);
      } finally {
        setIsAddingToFavorites(false);
      }
    } else {
      setLoginPopupOpen(true);
    }
  };

  const handleCloseLoginPopup = () => {
    setLoginPopupOpen(false);
  };

  const handleLogin = () => {
    setLoginPopupOpen(false);
    if (onLogin) {
      onLogin();
    }
    // No redirection, just close the popup
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {product.imageUrl && (
          <CardMedia
            component="img"
            height="160"
            image={product.imageUrl}
            alt={product.name}
          />
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div" sx={{ mb: 1 }}>
            {product.name}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            {product.brand}
          </Typography>
        </CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 1 }}>
          <IconButton 
            aria-label="view product" 
            sx={{ color: 'primary.main' }}
            onClick={() => window.location.href = `/product/${product.id}`}
          >
            <Visibility />
          </IconButton>
          <IconButton 
            onClick={handleAddToFavorites} 
            sx={{ color: isFavorite ? 'secondary.main' : 'inherit' }}
            aria-label="add to favorites"
            disabled={isAddingToFavorites}
          >
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
      </Card>

      <LoginPopup 
        open={loginPopupOpen} 
        onClose={handleCloseLoginPopup} 
        onLogin={handleLogin} 
      />
    </>
  );
};

export default ProductCard;