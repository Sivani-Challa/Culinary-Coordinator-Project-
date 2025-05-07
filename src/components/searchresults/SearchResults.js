// SearchResults.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, IconButton, Snackbar, Alert } from '@mui/material';
import { Visibility as VisibilityIcon, Favorite as FavoriteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Footer from '../footer/Footer';
import { addToFavorites, checkIsFavorite } from '../../api/favoriteService';
import LoginPopup from '../common/LoginPopup';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('query') || '';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Use the correct search API endpoint
        const response = await fetch(`http://localhost:8084/items/search?searchTerm=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Search results:', data);
        setResults(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('Failed to load search results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  const handleViewProduct = (id) => {
    navigate(`/product/${id}`);
  };

  const handleAddToFavorites = async (id) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      setLoginPopupOpen(true);
      return;
    }
    
    // Prevent multiple clicks
    if (isAddingToFavorites) return;
    
    setIsAddingToFavorites(true);

    try {
      // Get the item from search results
      const item = results.find(item => item.id === id);
      if (!item) {
        console.error('Item not found in search results');
        setSnackbarMessage('Error: Item not found');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Check if it's already in favorites
      const isAlreadyFavorite = await checkIsFavorite(id);
      if (isAlreadyFavorite) {
        setSnackbarMessage('Item is already in your favorites');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
        return;
      }

      // Add to favorites
      const productName = item.itemname || 'Product';
      const brand = item.brand || '';
      const manufacturer = item.manufacturer || '';
      
      await addToFavorites(id, productName, brand, manufacturer);
      
      setSnackbarMessage('Successfully added to favorites');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
    } catch (error) {
      console.error('Error adding to favorites:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('already in your favorites')) {
        setSnackbarMessage('Item is already in your favorites');
        setSnackbarSeverity('info');
      } else if (error.response && error.response.status === 409) {
        setSnackbarMessage('Item is already in your favorites');
        setSnackbarSeverity('info');
      } else {
        setSnackbarMessage('Error updating favorites. Please try again.');
        setSnackbarSeverity('error');
      }
      setSnackbarOpen(true);
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  const handleCloseLoginPopup = () => {
    setLoginPopupOpen(false);
  };
  
  const handleLoginSuccess = () => {
    setLoginPopupOpen(false);
    // You might want to refresh the page or just set isLoggedIn to true
    setIsLoggedIn(true);
  };

  return (
    <>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          {/* Back Button */}
          <Box 
            onClick={() => navigate('/')}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: '#1976d2', 
              mb: 3, 
              cursor: 'pointer' 
            }}
          >
            <ArrowBackIcon sx={{ mr: 1 }} />
            <Typography variant="body1">BACK TO HOME</Typography>
          </Box>

          {/* Search Results Title */}
          <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
            Search Results for "{searchQuery}"
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', color: 'error.main', p: 2 }}>
              <Typography>{error}</Typography>
            </Box>
          ) : results.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="h6">No results found for "{searchQuery}"</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Try different keywords or check your spelling.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Display number of results */}
              <Typography variant="body2" sx={{ mb: 2 }}>
                Found {results.length} {results.length === 1 ? 'item' : 'items'}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-start' }}>
                {results.map((item, index) => (
                  <Box 
                    key={item.id || index}
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
                            sx={{ 
                              fontWeight: 'medium',
                              maxHeight: '80px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              wordBreak: 'break-word'
                            }}
                          >
                            {item.itemname || 'No Name Available'}
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              mt: 1,
                              color: 'text.secondary'
                            }}
                          >
                            {item.brand || 'Brand Not Available'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mt: 'auto'
                        }}>
                          <IconButton 
                            onClick={() => handleViewProduct(item.id)} 
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
                            <VisibilityIcon sx={{ fontSize: '20px' }} />
                          </IconButton>
                          
                          <IconButton 
                            onClick={() => handleAddToFavorites(item.id)} 
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
                            <FavoriteIcon sx={{ fontSize: '20px' }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
        {/* Add Snackbar for messages */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        
        {/* Login Popup */}
        <LoginPopup
          open={loginPopupOpen}
          onClose={handleCloseLoginPopup}
          onLogin={handleLoginSuccess}
          showLoginButton={true}
        />
      </Container>
      <Footer />
    </>
  );
};

export default SearchResults;