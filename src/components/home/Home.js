// Updated Home.jsx with fixed login popup
import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, CircularProgress, Pagination, IconButton } from '@mui/material';
import { Favorite as FavoriteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LoginPopup from '../common/LoginPopup';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 40; // 10 rows with 4 items per row
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);

  // Use effect to check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token); // Convert to boolean
    };

    checkLoginStatus();

    // Listen for storage changes (in case user logs in from another tab)
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  useEffect(() => {
    // Fetch items from the JSON server
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8084/items/all');
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        setItems(data);
        // Calculate total pages
        setTotalPages(Math.ceil(data.length / itemsPerPage));
        setError(null);
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Failed to load items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Get current page items
  const getCurrentItems = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const handleChangePage = (event, value) => {
    setPage(value);
    // Scroll to top when changing page
    window.scrollTo(0, 0);
  };

  const handleAddToFavorites = async (id)  => {
     // Check if the user is logged in
  if (isLoggedIn) {
    console.log('Adding to favorites:', id);
    
    const item = items.find((item) => item.id === id);  // Find the item clicked
    if (!item) {
      console.error('Item not found');
      return;
    }

    try {
      // Get the auth token from localStorage
      const authToken = localStorage.getItem('token');
      
      if (!authToken) {
        console.error('No auth token found');
        return;
      }
      
      // Make the API request to add the item to favorites
      setLoading(true);  // Set loading to true while the request is being processed
      const response = await fetch('http://localhost:8083/favorite/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,  // Pass the token in the header
        //'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(item),  // Send the item in the request body
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Item added to favorites:', data);
      
      // Optionally, you can update your items or the UI
      // For example: setItems(data.items); or update the state

      // Reset error
      setError(null);
      
    } catch (error) {
      console.error('Error adding item to favorites:', error);
      setError('Failed to add item to favorites. Please try again.');
    } finally {
      setLoading(false);  // Set loading to false after the request is completed
    }
  } else {
    console.log('User not logged in, showing popup');
    
    // Force dialog to reopen by first closing then opening
    setLoginPopupOpen(true);
    
    // // Use setTimeout to ensure the state update completes before reopening
    // setTimeout(() => {
    //   setLoginPopupOpen(true);
    // }, 50);
  }
};

  const handleViewProduct = (id) => {
    console.log('Viewing product:', id);
    navigate(`/product/${id}`);
  };

  const handleCloseLoginPopup = () => {
    console.log('Closing login popup');
    setLoginPopupOpen(false);
  };

  const handleLogin = () => {
    console.log('Login successful');
    // setIsLoggedIn(true);
    setLoginPopupOpen(false);
     // Redirect to the login page
  navigate('/login');
  };

  return (
    <>
      <Container maxWidth="lg">
        {/* Welcome message */}
        <Box sx={{ textAlign: 'center', marginBottom: '20px', mt: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              marginBottom: '10px',
              fontWeight: 'bold'
            }}
          >
            Welcome to Culinary Mart!
          </Typography>
          <Typography
            variant="h6"
            sx={{
              marginBottom: '20px'
            }}
          >
            Discover a wide variety of items available at Culinary Mart. Browse through the best offers and manage your favorites.
          </Typography>
        </Box>

        <Typography
          variant="h5"
          component="h2"
          sx={{
            marginBottom: '16px',
            fontWeight: 'bold'
          }}
        >
          Featured Items
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', color: 'error.main', p: 2 }}>
            <Typography>{error}</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-start' }}>
              {getCurrentItems().map((item, index) => (
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

            {/* Pagination */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 4,
              mb: 4
            }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handleChangePage}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          </>
        )}
      </Container>

      {/* Login Popup - without key prop */}
      <LoginPopup
        open={loginPopupOpen}
        onClose={handleCloseLoginPopup}
        onLogin={handleLogin}
        showLoginButton={true}
      />

    </>
  );
};

export default Home;