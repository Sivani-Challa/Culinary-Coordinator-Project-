// src/components/products/AllProducts.js
import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, CircularProgress, Pagination, IconButton } from '@mui/material';
import { Favorite as FavoriteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AllProducts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12; // Show more items per page here
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all items from the JSON server
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
        setError('Failed to load products. Please try again later.');
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

  const handleAddToFavorites = (id) => {
    console.log('Adding to favorites:', id);
    // Add to favorites logic here
  };

  const handleViewProduct = (id) => {
    console.log('Viewing product:', id);
    navigate(`/product/${id}`);
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
          All Products
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
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {item.weight || '$0.00'}
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
      
    </>
  );
};

export default AllProducts;