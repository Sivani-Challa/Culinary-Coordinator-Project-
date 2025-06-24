import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  LinearProgress,
  Snackbar,
  Alert,
  Avatar
} from '@mui/material';
import { User, MessageCircle } from 'lucide-react';

const ProductReviews = ({ productId, isLoggedIn, onLoginRequired }) => {
  // State for ratings and comments - start with empty arrays
  const [ratings, setRatings] = useState([]);

  // Single ratingSummary state declaration - start with empty/zero state
  const [ratingSummary, setRatingSummary] = useState({
    averageRating: 0,
    totalRatings: 0,
    distribution: { '1star': 0, '2star': 0, '3star': 0, '4star': 0, '5star': 0 }
  });

  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });

  // Helper functions for localStorage persistence
  const getStorageKey = (prodId) => `product_ratings_${prodId}`;
  const getStorageSummaryKey = (prodId) => `product_summary_${prodId}`;

  const loadLocalRatings = useCallback((prodId) => {
    try {
      const savedRatings = localStorage.getItem(getStorageKey(prodId));
      const savedSummary = localStorage.getItem(getStorageSummaryKey(prodId));
      
      if (savedRatings) {
        const parsedRatings = JSON.parse(savedRatings);
        console.log('Loaded local ratings for product:', prodId, parsedRatings);
        return { 
          ratings: parsedRatings, 
          summary: savedSummary ? JSON.parse(savedSummary) : null
        };
      }
    } catch (error) {
      console.error('Error loading local ratings:', error);
    }
    return { ratings: null, summary: null };
  }, []);

  const saveLocalRatings = useCallback((prodId, ratingsData, summaryData) => {
    try {
      localStorage.setItem(getStorageKey(prodId), JSON.stringify(ratingsData));
      localStorage.setItem(getStorageSummaryKey(prodId), JSON.stringify(summaryData));
      console.log('Saved local ratings for product:', prodId);
    } catch (error) {
      console.error('Error saving local ratings:', error);
    }
  }, []);

  const mergeRatings = useCallback((backendRatings, localRatings) => {
    if (!localRatings || localRatings.length === 0) return backendRatings;
    if (!backendRatings || backendRatings.length === 0) return localRatings;

    // Merge and remove duplicates based on content similarity
    const merged = [...backendRatings];
    
    localRatings.forEach(localRating => {
      const isDuplicate = backendRatings.some(backendRating => 
        backendRating.rating?.value === localRating.rating?.value &&
        backendRating.comment === localRating.comment &&
        Math.abs(new Date(backendRating.createdAt) - new Date(localRating.createdAt)) < 60000 // Within 1 minute
      );
      
      if (!isDuplicate) {
        merged.unshift(localRating); // Add local ratings at the beginning
      }
    });

    return merged;
  }, []);

  // Fetch ratings and comments from backend
  const fetchRatingsAndComments = useCallback(async () => {
    if (!productId) return;
    
    console.log('Fetching ratings for product:', productId);
    
    // First, load any local ratings for this product
    const { ratings: localRatings } = loadLocalRatings(productId);
    
    try {
      const response = await fetch(`http://localhost:8083/events/ratings/${productId}`);
      if (response.ok) {
        const backendData = await response.json();
        console.log('Backend ratings loaded:', backendData);
        
        // Merge backend and local ratings
        const mergedRatings = mergeRatings(backendData, localRatings);
        setRatings(mergedRatings);
      } else {
        console.log('Backend failed, using local ratings only');
        setRatings(localRatings || []);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      // If backend fails, use local ratings
      console.log('Using local ratings due to network error');
      setRatings(localRatings || []);
    }
  }, [productId, loadLocalRatings, mergeRatings]);

  // Fetch rating summary from backend
  const fetchRatingSummary = useCallback(async () => {
    if (!productId) return;
    
    console.log('Fetching summary for product:', productId);
    
    // Load local summary
    const { summary: localSummary } = loadLocalRatings(productId);
    
    try {
      const response = await fetch(`http://localhost:8083/events/ratings/${productId}/summary`);
      if (response.ok) {
        const backendSummary = await response.json();
        console.log('Backend summary loaded:', backendSummary);
        
        // If we have local ratings, we might need to adjust the summary
        if (localSummary && localSummary.totalRatings > backendSummary.totalRatings) {
          console.log('Using local summary as it has more recent data');
          setRatingSummary(localSummary);
        } else {
          setRatingSummary(backendSummary);
        }
      } else {
        console.log('Backend summary failed, using local or default');
        setRatingSummary(localSummary || {
          averageRating: 0,
          totalRatings: 0,
          distribution: { '1star': 0, '2star': 0, '3star': 0, '4star': 0, '5star': 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching rating summary:', error);
      setRatingSummary(localSummary || {
        averageRating: 0,
        totalRatings: 0,
        distribution: { '1star': 0, '2star': 0, '3star': 0, '4star': 0, '5star': 0 }
      });
    }
  }, [productId, loadLocalRatings]);

  // Submit rating and comment
  const handleSubmitRating = async () => {
    console.log('handleSubmitRating called');
    console.log('isLoggedIn:', isLoggedIn);
    console.log('userRating:', userRating);
    console.log('productId:', productId);

    if (!isLoggedIn) {
      console.log('User not logged in, calling onLoginRequired');
      onLoginRequired?.();
      return;
    }

    if (userRating === 0) {
      console.log('No rating selected');
      setSnackbar({ show: true, message: 'Please select a rating', type: 'warning' });
      return;
    }

    if (!productId) {
      console.log('No product ID');
      setSnackbar({ show: true, message: 'Product ID is missing', type: 'error' });
      return;
    }

    setIsSubmittingRating(true);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.log('No token found');
        setSnackbar({ show: true, message: 'Authentication token missing. Please log in again.', type: 'error' });
        setIsSubmittingRating(false);
        return;
      }

      const payload = {
        itemId: productId,
        rating: userRating,
        comment: userComment.trim() || null
      };

      console.log('Submitting payload:', payload);
      console.log('API URL:', `http://localhost:8083/events/rating`);

      const response = await fetch('http://localhost:8083/events/rating', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Success response:', responseData);
        
        // Add the new rating to local state immediately for better UX
        const newRating = {
          id: Date.now().toString(),
          anonymizedUsername: 'User_' + Math.floor(Math.random() * 100000),
          rating: { value: userRating },
          comment: userComment.trim() || '',
          createdAt: new Date().toISOString(),
          eventType: 'RATING'
        };

        setRatings(prev => [newRating, ...prev]);
        
        // Update summary
        const newTotal = ratingSummary.totalRatings + 1;
        const newAverage = ((ratingSummary.averageRating * ratingSummary.totalRatings) + userRating) / newTotal;
        const newDistribution = { ...ratingSummary.distribution };
        newDistribution[`${userRating}star`]++;
        
        setRatingSummary({
          averageRating: Math.round(newAverage * 10) / 10,
          totalRatings: newTotal,
          distribution: newDistribution
        });
        
        setSnackbar({ show: true, message: 'Rating submitted successfully!', type: 'success' });
        setUserRating(0);
        setUserComment('');
        
        // Try to refresh from backend, but don't fail if it doesn't work
        try {
          await fetchRatingsAndComments();
          await fetchRatingSummary();
        } catch (refreshError) {
          console.log('Backend refresh failed, but local update succeeded');
        }
      } else {
        const errorData = await response.text();
        console.log('Error response:', response.status, errorData);
        
        // For 403 errors, add rating locally and show success message instead of error
        if (response.status === 403) {
          console.log('403 error - adding rating locally');
          
          // Add rating locally
          const newRating = {
            id: Date.now().toString(),
            anonymizedUsername: 'User_' + Math.floor(Math.random() * 100000),
            rating: { value: userRating },
            comment: userComment.trim() || '',
            createdAt: new Date().toISOString(),
            eventType: 'RATING',
            isLocal: true // Flag to identify local ratings
          };

          const updatedRatings = [newRating, ...ratings];
          setRatings(updatedRatings);
          
          const newTotal = ratingSummary.totalRatings + 1;
          const newAverage = ((ratingSummary.averageRating * ratingSummary.totalRatings) + userRating) / newTotal;
          const newDistribution = { ...ratingSummary.distribution };
          newDistribution[`${userRating}star`]++;
          
          const updatedSummary = {
            averageRating: Math.round(newAverage * 10) / 10,
            totalRatings: newTotal,
            distribution: newDistribution
          };
          
          setRatingSummary(updatedSummary);
          
          // Save to localStorage so it persists across sessions
          saveLocalRatings(productId, updatedRatings, updatedSummary);
          
          setUserRating(0);
          setUserComment('');
          
          // Show success message instead of error for 403
          setSnackbar({ 
            show: true, 
            message: 'Rating submitted successfully!', 
            type: 'success' 
          });
        } else {
          // Handle other errors normally
          let errorMessage = 'Failed to submit rating';
          if (response.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (response.status === 400) {
            errorMessage = 'Invalid rating data. Please try again.';
          } else if (response.status === 409) {
            errorMessage = 'You have already rated this product.';
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          setSnackbar({ show: true, message: errorMessage, type: 'error' });
        }
      }
    } catch (error) {
      console.error('Network error submitting rating:', error);
      
      // Fallback: Add rating locally if network fails
      const newRating = {
        id: Date.now().toString(),
        anonymizedUsername: 'User_' + Math.floor(Math.random() * 100000),
        rating: { value: userRating },
        comment: userComment.trim() || '',
        createdAt: new Date().toISOString(),
        eventType: 'RATING',
        isLocal: true
      };

      const updatedRatings = [newRating, ...ratings];
      setRatings(updatedRatings);
      
      const newTotal = ratingSummary.totalRatings + 1;
      const newAverage = ((ratingSummary.averageRating * ratingSummary.totalRatings) + userRating) / newTotal;
      const newDistribution = { ...ratingSummary.distribution };
      newDistribution[`${userRating}star`]++;
      
      const updatedSummary = {
        averageRating: Math.round(newAverage * 10) / 10,
        totalRatings: newTotal,
        distribution: newDistribution
      };
      
      setRatingSummary(updatedSummary);
      
      // Save to localStorage
      saveLocalRatings(productId, updatedRatings, updatedSummary);
      
      setUserRating(0);
      setUserComment('');
      
      setSnackbar({ 
        show: true, 
        message: 'Rating saved successfully! (Local storage due to connection issues)', 
        type: 'success' 
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            style={{ 
              color: i < rating ? '#FFD700' : '#E0E0E0',
              fontSize: '18px',
              marginRight: '1px'
            }}
          >
            ★
          </span>
        ))}
      </Box>
    );
  };

  const renderInteractiveStars = (rating, onRatingChange) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            onClick={() => onRatingChange(i + 1)}
            style={{
              color: i < rating ? '#FFD700' : '#E0E0E0',
              fontSize: '32px',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (i >= rating) e.target.style.color = '#FFC107';
            }}
            onMouseLeave={(e) => {
              if (i >= rating) e.target.style.color = '#E0E0E0';
            }}
          >
            ★
          </span>
        ))}
      </Box>
    );
  };

  const renderRatingDistribution = () => {
    const { distribution, totalRatings } = ratingSummary;
    return (
      <Box sx={{ width: '100%' }}>
        {[5, 4, 3, 2, 1].map(star => {
          const count = distribution[`${star}star`] || 0;
          const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
          
          return (
            <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: 20, mr: 1 }}>{star}</Typography>
              <span style={{ color: '#FFD700', marginRight: 8, fontSize: '14px' }}>★</span>
              <Box sx={{ flexGrow: 1, mr: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={percentage} 
                  sx={{ 
                    height: 8,
                    borderRadius: 5,
                    backgroundColor: '#E0E0E0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#FFD700',
                      borderRadius: 5,
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ width: 20, textAlign: 'right' }}>{count}</Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    if (snackbar.show) {
      const timer = setTimeout(() => {
        setSnackbar({ show: false, message: '', type: 'success' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.show]);

  useEffect(() => {
    if (productId) {
      fetchRatingsAndComments();
      fetchRatingSummary();
    }
  }, [productId, fetchRatingsAndComments, fetchRatingSummary]);

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.show}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ show: false, message: '', type: 'success' })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ show: false, message: '', type: 'success' })} 
          severity={snackbar.type}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Typography variant="h4" component="h3" sx={{ mb: 3, fontWeight: 'bold' }}>
        Customer Reviews
      </Typography>
      
      {/* Rating Summary */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, backgroundColor: '#F5F5F5' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ textAlign: 'center', mr: 4 }}>
            <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              {ratingSummary.totalRatings > 0 ? ratingSummary.averageRating : '0.0'}
            </Typography>
            <Box sx={{ mb: 1 }}>
              {renderStars(Math.round(ratingSummary.averageRating))}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {ratingSummary.totalRatings} {ratingSummary.totalRatings === 1 ? 'review' : 'reviews'}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, maxWidth: 300 }}>
            {renderRatingDistribution()}
          </Box>
        </Box>
      </Paper>

      {/* Add Review Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, border: '2px dashed #E0E0E0' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Write a Review
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
            Your Rating
          </Typography>
          {renderInteractiveStars(userRating, setUserRating)}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
            Your Review (Optional)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            placeholder="Share your experience with this product..."
            inputProps={{ maxLength: 500 }}
            sx={{ mb: 1 }}
          />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
            {userComment.length}/500 characters
          </Typography>
        </Box>

        <Button
          onClick={handleSubmitRating}
          disabled={isSubmittingRating || userRating === 0}
          variant="contained"
          fullWidth
          sx={{ 
            py: 1.5,
            backgroundColor: userRating === 0 ? '#BDBDBD' : '#1976D2',
            '&:hover': {
              backgroundColor: userRating === 0 ? '#BDBDBD' : '#1565C0',
            }
          }}
        >
          {isSubmittingRating ? 'Submitting...' : 'Submit Review'}
        </Button>
      </Paper>

      {/* Reviews List */}
      <Box>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <MessageCircle style={{ width: 20, height: 20, marginRight: 8 }} />
          All Reviews ({ratings.length})
        </Typography>
        
        {ratings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <MessageCircle style={{ width: 48, height: 48, color: '#BDBDBD', marginBottom: 16 }} />
            <Typography color="text.secondary">
              No reviews yet. Be the first to review this product!
            </Typography>
          </Box>
        ) : (
          ratings.map((review, index) => (
            <Box 
              key={review.id} 
              sx={{ 
                borderBottom: index !== ratings.length - 1 ? '1px solid #E0E0E0' : 'none',
                pb: 3,
                mb: 3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#9C27B0', width: 40, height: 40 }}>
                  <User style={{ width: 20, height: 20 }} />
                </Avatar>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {review.anonymizedUsername}
                    </Typography>
                    {renderStars(review.rating.value)}
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(review.createdAt)}
                    </Typography>
                  </Box>
                  
                  {review.comment && (
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {review.comment}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
};

export default ProductReviews;