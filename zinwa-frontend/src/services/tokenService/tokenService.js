import axios from 'axios';
import authService from '../authService/authService';

const API_BASE_URL = 'https://zinwa.onrender.com/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL
});

// Add a request interceptor to automatically add auth token
api.interceptors.request.use(
  config => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {
      // Token might be expired or invalid
      console.log('Authentication error. You might need to log in again.');
      // Optionally, you could redirect to login or trigger a refresh token flow
      // authService.logout();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Tokens management service
 */
const tokenService = {
  /**
   * Get all tokens with pagination
   */
  async getTokens(page = 1, limit = 10) {
    try {
      const response = await api.get('/tokens', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tokens:', error);
      throw error.response?.data?.message || 'Failed to fetch tokens';
    }
  },

  /**
   * Get token by ID
   */
  async getTokenById(tokenId) {
    try {
      const response = await api.get(`/tokens/${tokenId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching token ${tokenId}:`, error);
      throw error.response?.data?.message || 'Failed to fetch token';
    }
  },

  /**
   * Get tokens by user ID
   */
  async getTokensByUserId(userId) {
    try {
      const response = await api.get(`/tokens/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tokens for user ${userId}:`, error);
      throw error.response?.data?.message || 'Failed to fetch user tokens';
    }
  },

  /**
   * Get tokens by property ID
   */
  async getTokensByPropertyId(propertyId) {
    try {
      const response = await api.get(`/tokens/property/${propertyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tokens for property ${propertyId}:`, error);
      throw error.response?.data?.message || 'Failed to fetch property tokens';
    }
  },

  /**
   * Create a new token
   */
  async createToken(tokenData) {
    try {
      const response = await api.post('/tokens', tokenData);
      return response.data;
    } catch (error) {
      console.error('Error creating token:', error);
      throw error.response?.data?.message || 'Failed to create token';
    }
  },

  /**
   * Update token (e.g., mark as used)
   */
  async updateToken(tokenId, tokenData) {
    try {
      const response = await api.put(`/tokens/${tokenId}`, tokenData);
      return response.data;
    } catch (error) {
      console.error(`Error updating token ${tokenId}:`, error);
      throw error.response?.data?.message || 'Failed to update token';
    }
  },

  /**
   * Delete token
   */
  async deleteToken(tokenId) {
    try {
      const response = await api.delete(`/tokens/${tokenId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting token ${tokenId}:`, error);
      throw error.response?.data?.message || 'Failed to delete token';
    }
  },

  /**
   * Get token statistics
   */
  async getTokenStatistics() {
    try {
      const response = await api.get('/tokens/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching token statistics:', error);
      throw error.response?.data?.message || 'Failed to fetch token statistics';
    }
  },

  /**
   * Search tokens
   */
  async searchTokens(searchParams) {
    try {
      const response = await api.get('/tokens/search', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching tokens:', error);
      throw error.response?.data?.message || 'Failed to search tokens';
    }
  }
};

export default tokenService;