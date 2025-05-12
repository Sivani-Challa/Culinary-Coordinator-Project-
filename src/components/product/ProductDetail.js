import React, { useState, useEffect, useCallback } from 'react';
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
import { checkIsFavorite, getFavorites, normalizeProductId } from '../../api/favoriteService';
import axios from 'axios';
import LoginPopup from '../common/LoginPopup';
import { addToFavorites } from '../../api/favoriteService';

const ProductDetail = () => {
  const { id: rawProductId } = useParams(); // Keep the raw ID for debugging
  const productId = normalizeProductId(rawProductId); // Normalize it for use
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
  const [errorDetails, setErrorDetails] = useState(null);

  // Modified: Check if the user came from the favorites page - more reliable
  const fromFavorites = React.useMemo(() => {
    // Only consider explicit indicators, not product source
    return (
      location.state?.fromFavorites === true ||
      location.pathname.includes('/favorite') ||
      location.search?.includes('from=favorites')
    );
  }, [location]);

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('token');

  // Function to get user ID from token
  const getUserIdFromToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      return payload.userId || payload.id || payload.sub;
    } catch (error) {
      console.error("Error extracting user ID from token:", error);
      return null;
    }
  };

  const checkExistingFavorites = useCallback(async () => {
    if (!isLoggedIn || !productId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const userId = getUserIdFromToken(token);
    if (!userId) return;

    try {
      console.log(`Checking favorites directly for user: ${userId} and product: ${productId}`);

      const response = await axios.get(`http://localhost:8083/favorite/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && Array.isArray(response.data)) {
        const productIdStr = String(productId);
        console.log(`Checking if product ID ${productIdStr} exists in favorites list`);

        const found = response.data.some(favorite => {
          const favItemId = favorite.itemId ? String(favorite.itemId) : '';
          const favId = favorite.id ? String(favorite.id) : '';
          const favProductId = favorite.productId ? String(favorite.productId) : '';

          const isMatch = [favItemId, favId, favProductId].includes(productIdStr);
          if (isMatch) {
            console.log(`Match found for product ${productIdStr} in favorite:`, favorite);
          }

          return isMatch;
        });

        console.log(`Final match result: ${found}`);
        setIsFavorite(found);
      }
    } catch (error) {
      console.error('Error checking favorites directly:', error);
    }
  }, [productId, isLoggedIn]);


  // New function to find product in favorites
  const findProductInFavorites = async (id) => {
    try {
      const favorites = await getFavorites();
      console.log('Searching for product in favorites:', id);

      const matchingFavorite = favorites.find(fav =>
        normalizeProductId(fav.itemId) === normalizeProductId(id) ||
        normalizeProductId(fav.id) === normalizeProductId(id)
      );

      if (matchingFavorite) {
        console.log('Product found in favorites:', matchingFavorite);
        return matchingFavorite;
      }

      return null;
    } catch (error) {
      console.error('Error finding product in favorites:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchProductDetail = async (id) => {
      setLoading(true);

      try {
        console.log('Raw product ID:', rawProductId);
        console.log('Normalized product ID:', id);

        // Step 1: Fallback from location.state (favorites)
        if (location.state?.favoriteData) {
          const favoriteData = location.state.favoriteData;
          setProduct({
            id: favoriteData.itemId,
            name: favoriteData.name,
            brand: favoriteData.brand,
            manufacturer: favoriteData.manufacturer,
            _source: 'location_state'
          });
          setIsFavorite(true);
          setError(null);
          setErrorDetails(null);
          // ✅ Don't return - continue to fetch full data
        }

        // Step 2: Fallback from localStorage
        const lastViewedStr = localStorage.getItem('last_viewed_product');
        if (lastViewedStr) {
          const lastViewed = JSON.parse(lastViewedStr);
          if (normalizeProductId(lastViewed.id) === normalizeProductId(id)) {
            setProduct({
              id: lastViewed.id,
              name: lastViewed.name,
              brand: '',
              manufacturer: '',
              _source: 'localStorage'
            });
            setIsFavorite(true);
            setError(null);
            setErrorDetails(null);
            // ✅ Don't return
          }
        }

        // Step 3: Fallback from existing favorites
        const favoriteProduct = await findProductInFavorites(id);
        if (favoriteProduct) {
          setProduct({
            id: favoriteProduct.itemId,
            name: favoriteProduct.name,
            brand: favoriteProduct.brand || '',
            manufacturer: favoriteProduct.manufacturer || '',
            _source: 'favorites_search'
          });
          setIsFavorite(true);
          setError(null);
          setErrorDetails(null);
          // ✅ Don't return
        }

        // Step 4: Fetch full product from API
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8084/items/${id}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        setProduct(response.data);

        if (isLoggedIn) {
          const favoriteStatus = await checkIsFavorite(id);
          setIsFavorite(favoriteStatus);
          await checkExistingFavorites();
        }

        setError(null);
        setErrorDetails(null);
      } catch (err) {
        console.error('ERROR fetching product details:', err);

        const favoriteFallback = await findProductInFavorites(id);
        if (favoriteFallback) {
          setProduct({
            id: favoriteFallback.itemId,
            name: favoriteFallback.name,
            brand: favoriteFallback.brand || '',
            manufacturer: favoriteFallback.manufacturer || '',
            _source: 'favorites_fallback'
          });
          setIsFavorite(true);
          setError(null);
          setErrorDetails(null);
          return;
        }

        let detailedError = {
          message: err.message,
          code: err.code || 'UNKNOWN',
          status: err.response?.status || 'NO_RESPONSE',
          statusText: err.response?.statusText || '',
          url: err.config?.url || 'NO_URL',
          data: err.response?.data || {}
        };

        setErrorDetails(detailedError);
        if (err.response?.status === 401) {
          setError(`Authentication error (401). Please log in again or try viewing this product from your favorites.`);
        } else {
          setError(`Failed to load product details. ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetail(productId);
    } else {
      setError('Product ID is missing or invalid');
      setErrorDetails({ message: 'No product ID provided in URL' });
      setLoading(false);
    }
  }, [productId, isLoggedIn, checkExistingFavorites, location, rawProductId]);


  // Add this effect to log when route changes
  useEffect(() => {
    // Log when the component mounts or route params change
    console.log('ProductDetail component route update:');
    console.log('- Raw URL parameter:', rawProductId);
    console.log('- Normalized product ID:', productId);
    console.log('- From favorites:', fromFavorites);

  }, [rawProductId, productId, fromFavorites]);

  const handleAddToFavorites = async () => {
    if (!isLoggedIn) {
      setLoginPopupOpen(true);
      return;
    }

    if (isAddingToFavorites) return;
    setIsAddingToFavorites(true);

    try {
      // Extract the ID from the URL parameter if needed
      const urlProductId = productId || '';
      // Use a clear hierarchy of possible ID sources
      const currentProductId = (product?.itemId && String(product.itemId).trim()) ||
        (product?.id && String(product.id).trim()) ||
        urlProductId;
      console.log("Extracted product ID:", currentProductId);

      if (!currentProductId || currentProductId === 'null' || currentProductId === 'undefined' || currentProductId === '') {
        setSnackbarMessage('Cannot add to favorites: product ID is missing');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setIsAddingToFavorites(false);
        return;
      }

      const result = await addToFavorites(
        currentProductId,
        product.itemname || product.name || 'Product',
        product.brand || '',
        product.manufacturer || ''
      );

      if (result.success) {
        setIsFavorite(true);
        setSnackbarMessage(result.message);
        setSnackbarSeverity(result.isExisting ? 'info' : 'success');
      } else {
        setSnackbarMessage(result.message || 'Failed to add to favorites');
        setSnackbarSeverity('error');
      }
    } catch (err) {
      console.error('Error in addToFavorites:', err);
      setSnackbarMessage('Unexpected error adding to favorites');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
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
          <Typography color="error" variant="h6">{error}</Typography>

          {/* Show detailed error information for debugging */}
          <Box sx={{ mt: 2, mb: 3, textAlign: 'left', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Error Details:</Typography>
            <Typography variant="body2">Product ID: {rawProductId || 'None'}</Typography>
            {errorDetails && (
              <>
                <Typography variant="body2">Status: {errorDetails.status} {errorDetails.statusText}</Typography>
                <Typography variant="body2">URL: {errorDetails.url}</Typography>
                <Typography variant="body2">Message: {errorDetails.message}</Typography>
              </>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleBackClick}
            >
              {fromFavorites ? "Back to Favorites" : "Back to Products"}
            </Button>

            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5">Product not found</Typography>
        <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, display: 'inline-block', textAlign: 'left' }}>
          <Typography variant="body2">Product ID: {rawProductId || 'None'}</Typography>
          <Typography variant="body2">Normalized ID: {productId}</Typography>
          <Typography variant="body2">From favorites: {fromFavorites ? 'Yes' : 'No'}</Typography>
          <Typography variant="body2">Path: {location.pathname}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleBackClick}
          >
            {fromFavorites ? "Back to Favorites" : "Back to Products"}
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back button - Using the exact same approach as other pages */}
      <Box
        component="div"
        onClick={handleBackClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          color: 'primary.main',
          textDecoration: 'none',
          cursor: 'pointer'
        }}
      >
        <ArrowBack sx={{ mr: 1 }} />
        {fromFavorites ? "BACK TO FAVORITES" : "BACK TO PRODUCTS"}
      </Box>

      {/* Product Detail Section */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
                {product.itemname || product.name || "Product Details"}
              </Typography>
              {/* MODIFIED: Always show the favorite button regardless of source */}
              <IconButton
                onClick={handleAddToFavorites}
                disabled={isAddingToFavorites || isFavorite}
                sx={{
                  backgroundColor: isFavorite ? '#7b1fa2' : '#9c27b0',
                  '&:hover': {
                    backgroundColor: isFavorite ? '#7b1fa2' : '#7b1fa2'
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
            </Box>

            {/* MODIFIED: Product Details - Always display fields with empty strings as fallback */}
            <Typography variant="subtitle1">{`Brand: ${product.brand || ''}`}</Typography>
            <Typography variant="subtitle1">{`Manufacturer: ${product.manufacturer || ''}`}</Typography>

            {/* Only show these fields if they exist */}
            {product.asins && <Typography variant="subtitle1">{`ASIN: ${product.asins}`}</Typography>}
            {product.categories && <Typography variant="subtitle1">{`Categories: ${product.categories}`}</Typography>}
            {product.weight && <Typography variant="subtitle1">{`Weight: ${product.weight}`}</Typography>}
            {product.ean && <Typography variant="subtitle1">{`EAN: ${product.ean}`}</Typography>}
            <Divider sx={{ my: 2 }} />

            {/* MODIFIED: Always show ingredients section, even if empty */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6">Ingredients</Typography>
              <Typography variant="body1">{product.ingredients || 'No ingredients information available.'}</Typography>
            </Box>

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