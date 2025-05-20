import axios from 'axios';

const API_URL = 'http://localhost:8081/auth';  // Authentication API URL

// Handle user login
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;  // Expecting user data or token on successful login
  } catch (error) {
    console.error("Login error:", error);
    throw error;  // Handle error appropriately in UI
  }
};

// Handle user registration
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;  // Expecting success or user data
  } catch (error) {
    console.error("Registration error:", error);
    throw error;  // Handle error appropriately in UI
  }
};
