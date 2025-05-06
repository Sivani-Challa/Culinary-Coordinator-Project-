import axios from 'axios';

const API_URL = 'http://localhost:8082/userprofile';  // Update with your user profile service URL

// Fetch user profile data
export const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/profile`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {};  // Return an empty object or handle accordingly
  }
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await axios.put(`${API_URL}/update/${userId}`, profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;  // Handle error appropriately in UI
  }
};
