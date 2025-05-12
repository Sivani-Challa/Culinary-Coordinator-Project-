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

// Check if an item with the same ID already exists in favorites
const checkIfItemExistsInFavorites = async (itemId) => {
  try {
    return await checkIsFavorite(itemId);
  } catch (error) {
    console.error("Error checking if item exists in favorites:", error);
    return false;
  }
};

// Add item to favorites - completely fixed version
const addToFavorites = async (productId, productName, brand, manufacturer) => {
  try {
    console.log(`Starting addToFavorites for product ${productId}`);

    // Ensure productId is not null or undefined
    if (!productId || productId === 'null' || productId === 'undefined') {
      console.error("Cannot add to favorites: productId is missing");
      return {
        success: false,
        message: "Cannot add to favorites: product ID is missing",
      };
    }

    // Validate other required fields
    if (!productName || productName.trim() === '') {
      console.error("Cannot add to favorites: product name is missing");
      return {
        success: false,
        message: "Cannot add to favorites: product name is missing",
      };
    }

    // Get JWT token for authentication
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No auth token found');
    }

    // Extract userId from token or use it from localStorage
    const userId = getUserIdFromToken(token) || localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }

    // First check if this item is already in favorites
    const exists = await checkIsFavorite(productId);

    if (exists) {
      console.log(`Item ${productId} already exists in favorites`);
      return {
        success: true,
        message: "Item is already in your favorites",
        isExisting: true
      };
    }

    // Generate a descriptive name if productName is missing
    let itemName = productName;
    if (!itemName || itemName.trim() === '') {
      if (brand && manufacturer && brand !== manufacturer) {
        itemName = `${brand} - ${manufacturer}`;
      } else if (brand) {
        itemName = `${brand} Product`;
      } else if (manufacturer) {
        itemName = `${manufacturer} Product`;
      } else {
        itemName = `Product ${productId}`;
      }
    }

    // IMPORTANT: Use field names that match the server's expected JSON structure
    const favoriteData = {
      userId: Number(userId),
      id: String(productId).trim(),         // Use 'id' instead of 'itemId'
      itemname: String(productName).trim(),    // Use 'itemname' instead of 'itemName'
      brand: brand ? String(brand).trim() : '',
      manufacturer: manufacturer ? String(manufacturer).trim() : '',
    };

    console.log('Sending favorite data:', favoriteData);

    // Send the request
    const response = await api.post('/favorite/add', favoriteData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Add to favorites response:', response);

    return {
      success: true,
      message: "Successfully added to favorites",
      data: response.data
    };
  } catch (error) {
    console.error("Error adding to favorites:", error);
    console.error("Error details:", error.response ? error.response.data : "No response data");

    // Error handling logic remains the same
    if (error.response) {
      if (error.response.status === 409) {
        return {
          success: true,
          message: "Item is already in your favorites",
          isExisting: true
        };
      } else if (error.response.status === 400) {
        return {
          success: false,
          message: "Invalid data: " + (error.response.data?.message || "Please ensure all required fields are provided"),
        };
      } else if (error.response.status === 401 || error.response.status === 403) {
        return {
          success: false,
          message: "Authentication error. Please log in again.",
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      message: "Error adding to favorites: " + (error.message || "Unknown error"),
    };
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

    // Call the API to get favorites for the user with the correct endpoint
    const response = await api.get(`/favorite/user/${userId}`);
    console.log('Fetching favorites response:', response);

    if (!response.data) {
      console.warn("No data returned from favorites API");
      return [];
    }

    // Ensure we have an array to work with
    const favoritesData = Array.isArray(response.data) ? response.data :
      (response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];

    // Normalize the data structure to ensure consistency across the app
    const normalizedFavorites = favoritesData.map(item => {
      // Generate a descriptive name based on available fields when itemName is null
      let displayName = item.itemName;

      if (!displayName || displayName === null) {
        if (item.brand && item.manufacturer) {
          if (item.brand !== item.manufacturer) {
            displayName = `${item.brand} - ${item.manufacturer}`;
          } else {
            displayName = item.brand;
          }
        } else if (item.brand) {
          displayName = `${item.brand} Product`;
        } else if (item.manufacturer) {
          displayName = `${item.manufacturer} Product`;
        } else if (item.itemId) {
          displayName = `Product ${item.itemId}`;
        } else {
          displayName = 'Product';
        }
      }

      return {
        favoriteId: item.favoriteId,
        id: item.itemId || item.id,
        productId: item.itemId || item.id,
        itemId: item.itemId || item.id,
        name: displayName, // Use our generated display name
        brand: item.brand || '',
        manufacturer: item.manufacturer || '',
      };
    });

    console.log('Normalized favorites to return:', normalizedFavorites);
    return normalizedFavorites;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
};

// Remove item from favorites
const removeFromFavorites = async (favoriteId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No auth token found');
    }

    console.log(`Deleting favorite with ID ${favoriteId}`);
    const response = await api.delete(`/favorite/delete/${favoriteId}`);
    console.log('Remove favorite response:', response);

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

// Check if an item is in favorites - Fixed and improved
const checkIsFavorite = async (productId) => {
  try {
    // Convert productId to string for consistent comparison
    const productIdStr = String(productId);
    console.log(`Checking if product ${productIdStr} is in favorites`);

    // Get all favorites
    const favorites = await getFavorites();
    console.log('Retrieved favorites for checking:', favorites.length);

    // No favorites means this item can't be in favorites
    if (!favorites || favorites.length === 0) {
      console.log('No favorites found, so product is not in favorites');
      return false;
    }

    // Carefully check each favorite with detailed logging
    const found = favorites.some(favorite => {
      // Get all possible ID fields from the favorite
      const favItemId = favorite.itemId ? String(favorite.itemId) : null;
      const favId = favorite.id ? String(favorite.id) : null;
      const favProductId = favorite.productId ? String(favorite.productId) : null;

      // Check against all possible ID fields
      const isMatch = (favItemId === productIdStr) ||
        (favId === productIdStr) ||
        (favProductId === productIdStr);

      if (isMatch) {
        console.log(`Match found! Product ${productIdStr} matches favorite with IDs: itemId=${favItemId}, id=${favId}, productId=${favProductId}`);
      }

      return isMatch;
    });

    console.log(`Product ${productIdStr} in favorites: ${found}`);
    return found;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};

// Add this function to normalize product IDs
export const normalizeProductId = (id) => {
  if (id === null || id === undefined) return '';

  // Convert to string and trim
  let strId = String(id).trim();

  // Log what we're doing for debugging
  console.log(`NORMALIZE_ID: Converting ${id} (${typeof id}) to ${strId}`);

  return strId;
};

// Create a named object to export as default
const favoriteService = {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
  checkIsFavorite,
  getUserIdFromToken,
  checkIfItemExistsInFavorites
};

// Export individual functions for named imports
export {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
  checkIsFavorite,
  getUserIdFromToken,
  checkIfItemExistsInFavorites
};

// Export the whole service as default
export default favoriteService;