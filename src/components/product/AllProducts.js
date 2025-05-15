// src/components/products/AllProducts.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Pagination, IconButton } from '@mui/material';
import { Favorite as FavoriteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '../pages/PageTemplate';

const AllProducts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 40; // 10 rows with 4 items per row - same as Home page
  const navigate = useNavigate();

  // Add global styles to handle the background properly
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    style.textContent = `
      html, body, #root {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow-x: hidden;
      }
      body {
        background-image: url('/homebg.jpeg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
      }
    `;
    // Append style to head
    document.head.appendChild(style);

    // Clean up function
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

  // Add a ref for the top element
  const topRef = React.useRef(null);

  const handleChangePage = (event, value) => {
    // Store the previous scroll position
    const prevScrollPos = window.pageYOffset;
    console.log('Previous scroll position:', prevScrollPos);
    
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    
    // Then update the page state
    setPage(value);
    
    // Schedule multiple scroll attempts with increasing delays
    const scrollAttempts = [0, 50, 100, 250, 500];
    scrollAttempts.forEach(delay => {
      setTimeout(() => {
        console.log(`Attempting to scroll to top after ${delay}ms`);
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        
        // Also try to scroll to the ref element
        if (topRef.current) {
          console.log('Scrolling to ref element');
          topRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }, delay);
    });
  };
  
  // Use useEffect to handle scrolling when page changes
  useEffect(() => {
    console.log('Page changed to:', page);
    // Force a hard scroll to the very top with a more aggressive approach
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Try to scroll to the ref element
    if (topRef.current) {
      console.log('Scrolling to ref element');
      topRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
    
    // Attempt again after a short delay to ensure it happens after any potential renders
    setTimeout(() => {
      console.log('Delayed scroll attempt');
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }, 100);
  }, [page]);

  const handleAddToFavorites = (id) => {
    console.log('Adding to favorites:', id);
    // Add to favorites logic here
  };

  const handleViewProduct = (id) => {
    console.log('Viewing product:', id);
    navigate(`/product/${id}`);
  };

  const content = (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Add a reference point at the very top */}
      <div ref={topRef} style={{ height: 0, overflow: 'hidden' }} id="top-of-products"></div>
      
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
                    border: '1px solid rgba(230, 200, 180, 0.5)',
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 250, 240, 0.85)',
                    boxShadow: '0 2px 8px rgba(180, 140, 120, 0.15)',
                    overflow: 'hidden',
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
                        {item.itemname || 'No Name Available'}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mt: 1,
                          fontWeight: '500',
                          color: '#000000',
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
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#000000',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(3, 54, 105, 0.8)',
                    color: 'white',
                  },
                },
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );

  return <PageTemplate title="All Products" content={content} />;
};

export default AllProducts;