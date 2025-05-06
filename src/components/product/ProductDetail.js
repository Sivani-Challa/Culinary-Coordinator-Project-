// ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Favorite as FavoriteIcon } from '@mui/icons-material';
// Remove Footer import if it's already included in your main layout

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:8084/items/${id}`);
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          const data = await response.json();
          console.log("Fetched product data:", data);
          setProduct(data);
          setError(null);
        } catch (error) {
          console.error('Error fetching product details:', error);
          setError('Failed to load product details. Please try again later.');
        } finally {
          setLoading(false);
        }
      } else {
        setError('Product ID is missing. Please select a product from the home page.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToFavorites = () => {
    console.log('Adding to favorites:', id);
    // Add to favorites logic here
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 3, maxWidth: '1200px', mx: 'auto' }}>
        {/* Back to Products Link */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#1976d2', mb: 3 }}>
            <ArrowBackIcon sx={{ mr: 1 }} />
            <Typography variant="body1">BACK TO PRODUCTS</Typography>
          </Box>
        </Link>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', color: 'error.main', p: 4, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="h6">{error}</Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Please check that your server is running at http://localhost:8084 and that the product exists.
            </Typography>
          </Box>
        ) : product ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden',
              maxWidth: '1200px',
              margin: '0 auto'
            }}
          >
            {/* Product Image */}
            <Box 
              sx={{ 
                width: { xs: '100%', md: '40%' },
                height: { xs: '250px', md: '400px' },
                bgcolor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.itemname || 'Product'} 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No image available
                </Typography>
              )}
            </Box>

            {/* Product Details */}
            <Box 
              sx={{ 
                width: { xs: '100%', md: '60%' },
                p: 3,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Product Name */}
              <Typography 
                variant="h5" 
                component="h1" 
                sx={{ mb: 1, fontWeight: 'bold', color: 'text.primary' }}
              >
                {product.itemname || 'Unnamed Product'}
                {product.weight && ` ${product.weight}`}
              </Typography>

              {/* Product Brand */}
              <Typography 
                variant="subtitle1" 
                color="text.secondary" 
                sx={{ mb: 3 }}
              >
                {product.brand || ''}
              </Typography>

              {/* Product Description */}
              <Typography variant="body1" sx={{ mb: 4 }}>
                {product.description || 'No description available for this product.'}
              </Typography>

              {/* Product Details Section */}
              <Box sx={{ mb: 3 }}>
                {product.categories && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Categories:</strong> {product.categories}
                  </Typography>
                )}
                
                {product.ingredients && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Ingredients:</strong> {product.ingredients}
                  </Typography>
                )}
                
                {product.manufacturer && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Manufacturer:</strong> {product.manufacturer}
                  </Typography>
                )}
                
                {product.asins && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>ASINS:</strong> {product.asins}
                  </Typography>
                )}
                
                {product.ean && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>EAN:</strong> {product.ean}
                  </Typography>
                )}
                
                {product.dateUpdated && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Date Updated:</strong> {new Date(product.dateUpdated).toLocaleDateString()}
                  </Typography>
                )}
              </Box>

              {/* Favorite Button */}
              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton 
                  onClick={handleAddToFavorites} 
                  sx={{ 
                    color: 'white',
                    backgroundColor: 'purple',
                    '&:hover': {
                      backgroundColor: '#9c27b0'
                    },
                    width: 48,
                    height: 48
                  }}
                >
                  <FavoriteIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography>Product not found</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ProductDetail;