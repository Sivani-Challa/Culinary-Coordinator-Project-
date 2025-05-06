import axios from 'axios';

const API_URL = 'http://localhost:8084/items';  // URL of the backend API

// Fetch all items
export const getItems = async () => {
  try {
    const response = await axios.get(API_URL);
    if (response.data.length === 0) {
      console.log('No items found');
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
};

// Search items by name
export const searchByName = async (name) => {
  try {
    const response = await axios.get(`${API_URL}?name_like=${name}`);
    return response.data;
  } catch (error) {
    console.error("Error searching by name:", error);
    return [];
  }
};
