import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Paper, Button, IconButton, Tooltip } from '@mui/material';
import { ArrowBack, Visibility, Delete } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getFavorites, removeFromFavorites, normalizeProductId } from '../../api/favoriteService';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await getFavorites();

      if (!data || data.length === 0) {
        setFavorites([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Normalize itemId before setting favorites
      const cleaned = data.map((item) => ({
        ...item,
        normalizedItemId: normalizeProductId(item.itemId || item.id)
      }));

      setFavorites(cleaned);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFromFavorites = async (favoriteId) => {
    if (!favoriteId) return;
    try {
      setLoading(true);
      await removeFromFavorites(favoriteId);
      await fetchFavorites();
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Failed to remove favorite. Please try again.');
    } finally {
      setLoading(false);
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
          {favorites.map((item) => (
            <Box
              key={item.favoriteId || `favorite-${item.normalizedItemId}`}
              sx={{
                width: 'calc(25% - 12px)',
                minWidth: '230px',
                '@media (max-width: 900px)': {
                  width: 'calc(50% - 8px)',
                },
                '@media (max-width: 600px)': {
                  width: '100%',
                },
              }}
            >
              <Box
                sx={{
                  height: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(230, 200, 180, 0.5)',
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 250, 240, 0.85)',
                  boxShadow: '0 2px 8px rgba(180, 140, 120, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: '1px solid rgba(210, 160, 130, 0.8)',
                    boxShadow: '0 4px 12px rgba(180, 140, 120, 0.25)',
                  }
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
                      sx={{
                        fontWeight: '600',
                        maxHeight: '3em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.5em',
                        wordBreak: 'break-word',
                        color: '#000000',
                      }}
                    >
                      {item.itemName || item.name || 'Unknown Product'}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        fontWeight: '500',
                        color: '#000000',
                      }}
                    >
                      {item.brand || item.manufacturer || 'Brand Not Available'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Tooltip title="View Product">
                      <IconButton
                        component={RouterLink}
                        to={`/product/${encodeURIComponent(item.normalizedItemId)}`}
                        state={{
                          fromFavorites: true,
                          favoriteData: item
                        }}
                        sx={{
                          color: 'white',
                          backgroundColor: 'blue',
                          '&:hover': {
                            backgroundColor: '#1565c0'
                          },
                          width: 36,
                          height: 36
                        }}
                        onClick={() => {
                          try {
                            localStorage.setItem('last_viewed_product', JSON.stringify({
                              id: item.normalizedItemId,
                              name: item.itemName || item.name,
                              brand: item.brand,
                              manufacturer: item.manufacturer,
                              source: 'favorites',
                              timestamp: new Date().toISOString()
                            }));
                          } catch (e) {
                            console.error('Failed to store product data in localStorage:', e);
                          }
                        }}
                      >
                        <Visibility sx={{ fontSize: '20px' }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Remove from Favorites">
                      <IconButton
                        onClick={() => handleRemoveFromFavorites(item.favoriteId)}
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
