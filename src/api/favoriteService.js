import axios from 'axios';

const API_URL = 'http://localhost:8083';  // Base URL of your backend service

// Configure axios with default headers
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add request interceptor to include token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to extract userId from JWT token
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

// Add item to favorites - refactored to better handle errors
const addToFavorites = async (productId, productName, brand, manufacturer) => {
  try {
    console.log(`Starting addToFavorites for product ${productId}`);
    
    // Get JWT token for authentication
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No auth token found');
    }
    
    // Convert productId to string to ensure consistent comparison
    const productIdStr = String(productId);
    
    // First, check thoroughly if the item is already in favorites
    const favorites = await getFavorites();
    console.log(`Retrieved ${favorites.length} favorites for comparison`);
    
    // Check for existing favorites by comparing as strings
    const existingFavorite = favorites.find(favorite => {
      const favItemId = String(favorite.itemId || favorite.productId || '');
      return favItemId === productIdStr;
    });

    if (existingFavorite) {
      console.log('Item already exists in favorites:', existingFavorite);
      // Instead of throwing an error, we'll just return the existing favorite
      return existingFavorite; 
    }
    
    // Extract userId from token or use it from localStorage
    const userId = getUserIdFromToken(token) || localStorage.getItem('userId');
    
    // Prepare data in the format your backend expects
    const favoriteData = {
      userId: userId,
      itemId: productId,
      itemName: productName || 'Product', // Fallback if no name
      brand: brand || '',
      manufacturer: manufacturer || '',
      // Don't need to set dateAdded - backend sets it automatically
    };
    
    console.log('Sending favorite data:', favoriteData);
    
    const response = await api.post('/favorite/add', favoriteData);
    console.log('Add to favorites response:', response);
    
    return response.data;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    
    // Check if it's a 409 Conflict error (already exists)
    if (error.response && error.response.status === 409) {
      console.log("Server returned 409 Conflict - item already in favorites");
      // Instead of throwing an error, we'll just return a success object
      return { success: true, message: "Item is already in your favorites" };
    }
    
    throw error;
  }
};

// Get all favorites for the logged-in user
const getFavorites = async () => {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error("No token found in localStorage");
      return [];
    }
    
    // Get user ID from token
    const userId = getUserIdFromToken(token);
    console.log("User ID for favorites:", userId);
    
    if (!userId) {
      console.error("Could not extract user ID from token");
      return [];
    }
    
    // Call the API to get favorites for the user
    const response = await api.get('/favorite/user/' + userId);
    console.log('Fetched favorites response:', response);
    
    if (!response.data) {
      console.warn("No data returned from favorites API");
      return [];
    }
    
    // Ensure we have an array to work with
    const favoritesData = Array.isArray(response.data) ? response.data : 
                         (response.data.data && Array.isArray(response.data.data)) ? response.data.data : 
                         [];
    
    console.log(`Processed ${favoritesData.length} favorites`);
    return favoritesData;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
};

// Remove item from favorites - optimized to handle multiple instances
const removeFromFavorites = async (favoriteId, productId) => {
  try {
    const token = localStorage.getItem('token');
    console.log(`Starting removeFromFavorites with favoriteId=${favoriteId}, productId=${productId}`);
    
    // If we have a productId, try to get all favorites and find all instances
    if (productId) {
      const favorites = await getFavorites();
      const productIdStr = String(productId);
      
      // Find all instances of this product in favorites
      const matchingFavorites = favorites.filter(favorite => {
        const favItemId = String(favorite.itemId || favorite.productId || '');
        return favItemId === productIdStr;
      });
      
      console.log(`Found ${matchingFavorites.length} instances of product ${productId} in favorites`);
      
      // Delete all matching favorites
      if (matchingFavorites.length > 0) {
        const deletePromises = matchingFavorites.map(favorite => 
          axios.delete(`${API_URL}/favorite/delete/${favorite.favoriteId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        );
        
        const results = await Promise.allSettled(deletePromises);
        console.log(`Deletion results for ${matchingFavorites.length} favorites:`, results);
        
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        console.log(`Successfully deleted ${successCount} of ${matchingFavorites.length} instances`);
        
        return { success: true, deletedCount: successCount };
      }
    }
    
    // If no productId or no matches found, just delete the single favoriteId
    if (!favoriteId) {
      console.error("No favoriteId provided for deletion");
      return { success: false, error: "No favorite ID provided" };
    }
    
    console.log(`Deleting single favorite with ID ${favoriteId}`);
    const response = await axios.delete(`${API_URL}/favorite/delete/${favoriteId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Remove favorite response:', response);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

// Check if an item is in favorites - improved to handle string comparison
const checkIsFavorite = async (productId) => {
  try {
    console.log(`Checking if product ${productId} is in favorites`);
    const favorites = await getFavorites();
    
    // Ensure valid data formats for comparison
    const itemIdStr = String(productId);
    
    // Check if the product is in favorites by comparing as strings
    const isFavorite = favorites.some(favorite => {
      const favItemId = String(favorite.itemId || favorite.productId || '');
      const isMatch = favItemId === itemIdStr;
      if (isMatch) {
        console.log(`Found match for ${productId}: ${JSON.stringify(favorite)}`);
      }
      return isMatch;
    });
    
    console.log(`Is item ${productId} in favorites: ${isFavorite}`);
    return isFavorite;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};

// Create a named object to export as default
const favoriteService = {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
  checkIsFavorite
};

// Export individual functions for named imports
export { addToFavorites, getFavorites, removeFromFavorites, checkIsFavorite };

// Export the whole service as default
export default favoriteService;