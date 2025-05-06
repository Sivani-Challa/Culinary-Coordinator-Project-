import axios from 'axios';

const API_URL = 'http://localhost:8083/favorites';  // Update with your favorite service URL

// Add item to favorites
export const addToFavorites = async (itemId, userId) => {
  try {
    const response = await axios.post(`${API_URL}/add`, { itemId, userId });
    return response.data;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;  // Handle error appropriately in UI
  }
};

// Get all favorites for a user
export const getFavorites = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];  // Handle error appropriately in UI
  }
};

