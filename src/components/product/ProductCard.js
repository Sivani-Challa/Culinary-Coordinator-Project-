// ProductCard.js
import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box, CardMedia } from '@mui/material';
import { Favorite, FavoriteBorder, Visibility } from '@mui/icons-material';
import LoginPopup from './LoginPopup';

const ProductCard = ({ product, onAddToFavorites, isLoggedIn, onLogin }) => {
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);

  const handleAddToFavorites = () => {
    if (isLoggedIn) {
      onAddToFavorites(product);
    } else {
      setLoginPopupOpen(true);
    }
  };

  const handleCloseLoginPopup = () => {
    setLoginPopupOpen(false);
  };

  const handleLogin = () => {
    setLoginPopupOpen(false);
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
          >
            <Visibility />
          </IconButton>
          <IconButton 
            onClick={handleAddToFavorites} 
            sx={{ color: product.isFavorite && isLoggedIn ? 'secondary.main' : 'inherit' }}
            aria-label="add to favorites"
          >
            {product.isFavorite && isLoggedIn ? <Favorite /> : <FavoriteBorder />}
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