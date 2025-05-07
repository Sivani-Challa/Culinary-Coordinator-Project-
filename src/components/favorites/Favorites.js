import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Paper, Button, IconButton, Tooltip } from '@mui/material';
import { ArrowBack, Visibility, Delete } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getFavorites, removeFromFavorites } from '../../api/favoriteService';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      console.log('Complete unfiltered favorites data:', data);
      
      // Make sure we're handling the data structure correctly
      let favoriteItems = [];
      if (Array.isArray(data)) {
        favoriteItems = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        favoriteItems = data.data;
      } else {
        favoriteItems = [];
      }

      // Filter out duplicates based on product ID
      const uniqueFavorites = [];
      const seenKeys = new Set();
      
      favoriteItems.forEach(item => {
        // Use product name as fallback if ID is not available
        const key = item.productId || (item.id ? String(item.id) : item.name);
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueFavorites.push(item);
        }
      });
      
      console.log('Filtered favorites data:', uniqueFavorites);
      setFavorites(uniqueFavorites);
      setError(null);
    } catch (err) {
      console.error('Error in component while fetching favorites:', err);
      setError('Failed to load favorites. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFromFavorites = async (favoriteId) => {
    console.log('Attempting to remove favorite with ID:', favoriteId);
    try {
      await removeFromFavorites(favoriteId);
      console.log('Successfully removed favorite');
      
      // Refresh the favorites list after removal
      fetchFavorites();
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box 
        component={RouterLink}
        to="/" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          color: 'primary.main',
          textDecoration: 'none'
        }}
      >
        <ArrowBack sx={{ mr: 1 }} />
        BACK TO PRODUCTS
      </Box>

      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'medium' }}>
        Your Favorite Items
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button variant="outlined" onClick={fetchFavorites} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Paper>
      ) : favorites.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">You haven't added any favorites yet</Typography>
          <Button variant="contained" color="primary" component={RouterLink} to="/" sx={{ mt: 2 }}>
            Browse Products
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-start' }}>
          {favorites.map((item, index) => (
            <Box
              key={item.favoriteId || `favorite-${index}`}
              sx={{
                width: 'calc(25% - 12px)', // 4 cards per row with gap
                minWidth: '230px',
                '@media (max-width: 900px)': {
                  width: 'calc(50% - 8px)', // 2 cards per row on medium screens
                },
                '@media (max-width: 600px)': {
                  width: '100%', // 1 card per row on small screens
                },
              }}
            >
              <Box
                sx={{
                  height: '180px', // Fixed height for all cards
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: 'white',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{
                  padding: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      component="h2" 
                      sx={{ 
                        fontWeight: 'medium',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.2,
                        mb: 0.5,
                        wordBreak: 'break-word',
                        hyphens: 'auto'
                      }}
                    >
                      {item.name || item.itemname || 'Unknown Product'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.brand || item.manufacturer || ''}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                    <Tooltip title="View Product">
                    <IconButton 
                      component={RouterLink} 
                      to={`/product/${item.productId || item.id}`}
                      state={{ fromFavorites: true }}
                      sx={{
                        color: 'white',
                        backgroundColor: 'blue',
                        '&:hover': {
                          backgroundColor: '#1565c0'
                        },
                        width: 36,
                        height: 36
                      }}
                    >
                      <Visibility sx={{ fontSize: '20px' }} />
                    </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Remove from Favorites">
                    <IconButton 
                      onClick={() => handleRemoveFromFavorites(item.favoriteId || item.id)}
                      sx={{
                        color: 'white',
                        backgroundColor: 'error.main',
                        '&:hover': {
                          backgroundColor: 'error.dark'
                        },
                        width: 36,
                        height: 36
                      }}
                    >
                      <Delete sx={{ fontSize: '20px' }} />
                    </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Favorites;