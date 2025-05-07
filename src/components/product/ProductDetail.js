import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  Divider,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  FavoriteBorder,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { checkIsFavorite, getFavorites } from '../../api/favoriteService';
import axios from 'axios';
import LoginPopup from '../common/LoginPopup';

const ProductDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Check if the user came from the favorites page
  const fromFavorites =
    location.state?.fromFavorites ||
    location.pathname.includes('/favorite/') ||
    location.search?.includes('from=favorites') ||
    document.referrer.includes('/favorites');

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('token');

  // Function to get user ID from token
  const getUserIdFromToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      return payload.userId || payload.id || payload.sub;
    } catch (error) {
      console.error("Error extracting user ID from token:", error);
      return null;
    }
  };

  // Direct check for favorites from the API
  const checkExistingFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const userId = getUserIdFromToken(token);
    if (!userId) return;
    
    try {
      console.log(`Checking favorites directly for user: ${userId}`);
      const response = await axios.get(`http://localhost:8083/favorite/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Direct API favorites check:', response.data);
      
      // Check if current product is in favorites
      if (response.data && Array.isArray(response.data)) {
        const productIdStr = String(id);
        const found = response.data.some(favorite => {
          const favItemId = String(favorite.itemId || favorite.productId || '');
          return favItemId === productIdStr;
        });
        
        console.log(`Product ${id} found in favorites directly: ${found}`);
        setIsFavorite(found);
      }
    } catch (error) {
      console.error('Error checking favorites directly:', error);
    }
  };

  useEffect(() => {
    const fetchProductDetail = async (productId) => {
      setLoading(true);
      try {
        console.log('Fetching product details for ID:', productId);
        // API endpoint to fetch product details
        const response = await axios.get(`http://localhost:8084/items/${productId}`);
        console.log('Product data received:', response.data);
        setProduct(response.data);

        // Check if the product is in favorites
        if (isLoggedIn) {
          // Try both methods to check favorites
          const favoriteStatus = await checkIsFavorite(productId);
          console.log(`checkIsFavorite result for ${productId}:`, favoriteStatus);
          setIsFavorite(favoriteStatus);
          
          // Also do a direct check
          checkExistingFavorites();
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetail(id);
    } else {
      setError('Product ID is missing');
      setLoading(false);
    }
  }, [id, isLoggedIn]);

  const handleAddToFavorites = async () => {
    if (!isLoggedIn) {
      setLoginPopupOpen(true);
      return;
    }

    if (isAddingToFavorites) return;
    setIsAddingToFavorites(true);

    try {
      console.log("Starting add to favorites process for product:", id);
      
      // Get all current favorites first to double-check
      const allFavorites = await getFavorites();
      console.log("Current favorites:", allFavorites);
      
      const productId = String(id);
      const productName = product.itemname || product.name || 'Product';
      const brand = product.brand || '';
      const manufacturer = product.manufacturer || '';

      // Do a thorough client-side check first
      const existingFavorite = allFavorites.find(fav => 
        String(fav.itemId) === productId || String(fav.productId) === productId
      );
      
      if (existingFavorite) {
        console.log("Item already exists in favorites (client check):", existingFavorite);
        setIsFavorite(true);
        setSnackbarMessage('Item is already in your favorites');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
        setIsAddingToFavorites(false);
        return;
      }

      console.log("Adding to favorites with data:", {
        productId, productName, brand, manufacturer
      });

      // Make direct API call to add favorite
      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken(token);
      
      const favoriteData = {
        userId: userId,
        itemId: productId,
        itemName: productName,
        brand: brand,
        manufacturer: manufacturer
      };
      
      console.log("Sending favorite data directly:", favoriteData);
      
      try {
        const response = await axios.post('http://localhost:8083/favorite/add', favoriteData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Add to favorites response:', response);
        
        // Success - update state
        setIsFavorite(true);
        setSnackbarMessage('Successfully added to favorites');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (axiosError) {
        // Handle the axios error
        console.error('Axios error adding to favorites:', axiosError);
        
        if (axiosError.response && axiosError.response.status === 409) {
          console.log("Server says item is already a favorite (409 Conflict)");
          setIsFavorite(true);
          setSnackbarMessage('Item is already in your favorites');
          setSnackbarSeverity('info');
          setSnackbarOpen(true);
          
          // Refresh favorites list
          checkExistingFavorites();
        } else {
          throw axiosError; // Re-throw to be caught by the outer catch
        }
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      setSnackbarMessage('Error updating favorites. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  const handleBackClick = () => {
    if (fromFavorites) {
      navigate('/favorites');
    } else {
      navigate('/');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Snackbar close handler
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleBackClick}
          >
            {fromFavorites ? "Back to Favorites" : "Back to Products"}
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5">Product not found</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleBackClick}
        >
          {fromFavorites ? "Back to Favorites" : "Back to Products"}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          onClick={handleBackClick}
          startIcon={<ArrowBack />}
          sx={{
            textTransform: 'none',
            color: 'primary.main',
            fontWeight: 'medium'
          }}
        >
          {fromFavorites ? "BACK TO FAVORITES" : "BACK TO PRODUCTS"}
        </Button>
      </Box>

      {/* Product Detail Section */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
                {product.itemname || product.name || "Product Details"}
              </Typography>
              {/* Only show the favorite button if NOT coming from favorites page */}
              {!fromFavorites && (
                <IconButton
                  onClick={handleAddToFavorites}
                  disabled={isAddingToFavorites}
                  sx={{
                    backgroundColor: '#9c27b0',
                    '&:hover': {
                      backgroundColor: '#7b1fa2'
                    },
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                  }}
                >
                  {isFavorite ? 
                    <FavoriteIcon sx={{ color: 'white' }} /> : 
                    <FavoriteBorder sx={{ color: 'white' }} />
                  }
                </IconButton>
              )}
            </Box>

            {/* Product Details */}
            {product.brand && <Typography variant="subtitle1">{`Brand: ${product.brand}`}</Typography>}
            {product.manufacturer && <Typography variant="subtitle1">{`Manufacturer: ${product.manufacturer}`}</Typography>}
            {product.asins && <Typography variant="subtitle1">{`ASIN: ${product.asins}`}</Typography>}
            {product.categories && <Typography variant="subtitle1">{`Categories: ${product.categories}`}</Typography>}
            {product.weight && <Typography variant="subtitle1">{`Weight: ${product.weight}`}</Typography>}
            {product.ean && <Typography variant="subtitle1">{`EAN: ${product.ean}`}</Typography>}
            <Divider sx={{ my: 2 }} />

            {product.ingredients && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6">Ingredients</Typography>
                <Typography variant="body1">{product.ingredients}</Typography>
              </Box>
            )}

            {/* Last Updated */}
            <Box sx={{ mt: 2 }}>
              {product.dateUpdated && (
                <Typography variant="body2" color="text.secondary">
                  Last Updated: {formatDate(product.dateUpdated)}
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Login Popup */}
      <LoginPopup
        open={loginPopupOpen}
        onClose={() => setLoginPopupOpen(false)}
        onLogin={() => setLoginPopupOpen(false)}
        showLoginButton={true}
      />
    </Container>
  );
};

export default ProductDetail;