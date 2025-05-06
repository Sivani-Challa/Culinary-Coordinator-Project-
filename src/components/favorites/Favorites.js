import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Button, Box } from '@mui/material';
import FavoriteCard from './FavoriteCard'; // Importing FavoriteCard component
import { getFavorites } from '../../api/favoriteService'; // Assuming you have a favorite service to fetch data

const Favorites = ({ isLoggedIn, userId }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      // Fetch the favorites if the user is logged in
      const fetchFavorites = async () => {
        const favoritesData = await getFavorites(userId);
        setFavorites(favoritesData);
      };
      fetchFavorites();
    }
  }, [isLoggedIn, userId]);

  if (!isLoggedIn) {
    return (
      <Box sx={{ textAlign: 'center', padding: 4 }}>
        <Typography variant="h5" gutterBottom>
          You must be logged in to view your favorites
        </Typography>
        <Button variant="contained" color="primary" href="/login">
          Login to Continue
        </Button>
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Your Favorite Items
      </Typography>

      <Grid container spacing={3}>
        {favorites.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <FavoriteCard item={item} isLoggedIn={isLoggedIn} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Favorites;
