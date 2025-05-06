import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box, CardMedia } from '@mui/material';
import { Favorite, FavoriteBorder, Visibility } from '@mui/icons-material';
import LoginPopup from '../common/LoginPopup'; 

const FavoriteCard = ({ item, onAddToFavorites, isLoggedIn }) => {
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);

  const handleAddToFavorites = () => {
    if (isLoggedIn) {
      onAddToFavorites(item);  // If logged in, add to favorites
    } else {
      setLoginPopupOpen(true);  // Otherwise, show the login popup
    }
  };

  const handleCloseLoginPopup = () => {
    setLoginPopupOpen(false);  // Close the login popup
  };

  return (
    <>
      <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {item.imageUrl && (
          <CardMedia
            component="img"
            height="140"
            image={item.imageUrl}
            alt={item.itemName}
          />
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div">
            {item.itemName}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            {item.brand}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.description}
          </Typography>
        </CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 1 }}>
          <IconButton aria-label="view item">
            <Visibility />
          </IconButton>
          <IconButton 
            onClick={handleAddToFavorites} 
            color="primary" 
            aria-label="add to favorites"
          >
            {isLoggedIn && item.isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
      </Card>

      {/* Show the Login Popup when not logged in */}
      <LoginPopup 
        open={loginPopupOpen} 
        onClose={handleCloseLoginPopup} 
        showLoginButton={true} // Display the login button in the popup
      />
    </>
  );
};

export default FavoriteCard;
