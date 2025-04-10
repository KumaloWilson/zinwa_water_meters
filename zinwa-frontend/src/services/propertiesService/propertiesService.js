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
 * Property management service
 */
const propertyService = {
  /**
   * Get all properties with pagination
   */
  async getProperties(page = 1, limit = 10) {
    try {
      const response = await api.get('/properties', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error.response?.data?.message || 'Failed to fetch properties';
    }
  },

  /**
   * Get property by ID
   */
  async getPropertyById(propertyId) {
    try {
      const response = await api.get(`/properties/${propertyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching property ${propertyId}:`, error);
      throw error.response?.data?.message || 'Failed to fetch property';
    }
  },

  /**
   * Get properties by user ID
   */
  async getPropertiesByUserId(userId) {
    try {
      const response = await api.get(`/properties/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching properties for user ${userId}:`, error);
      throw error.response?.data?.message || 'Failed to fetch user properties';
    }
  },

  /**
   * Register a new property
   */
  async registerProperty(propertyData) {
    try {
      const response = await api.post('/properties', propertyData);
      return response.data;
    } catch (error) {
      console.error('Error registering property:', error);
      throw error.response?.data?.message || 'Failed to register property';
    }
  },

  /**
   * Update property
   */
  async updateProperty(propertyId, propertyData) {
    try {
      const response = await api.put(`/properties/${propertyId}`, propertyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating property ${propertyId}:`, error);
      throw error.response?.data?.message || 'Failed to update property';
    }
  },

  /**
   * Delete property
   */
  async deleteProperty(propertyId) {
    try {
      const response = await api.delete(`/properties/${propertyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting property ${propertyId}:`, error);
      throw error.response?.data?.message || 'Failed to delete property';
    }
  },

  /**
   * Change property owner
   */
  async changePropertyOwner(propertyId, ownerData) {
    try {
      const response = await api.patch(`/properties/${propertyId}/owner`, ownerData); 
      return response.data;
    } catch (error) {
      console.error(`Error changing owner for property ${propertyId}:`, error);
      throw error.response?.data?.message || 'Failed to change property owner';
    }
  },

  /**
   * Get property statistics
   */
  async getPropertyStatistics() {
    try {
      const response = await api.get('/properties/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching property statistics:', error);
      throw error.response?.data?.message || 'Failed to fetch property statistics';
    }
  },

  /**
   * Bulk operations
   */
  async bulkDeleteProperties(propertyIds) {
    try {
      const response = await api.post('/properties/bulk-delete', { propertyIds });
      return response.data;
    } catch (error) {
      console.error('Error performing bulk delete:', error);
      throw error.response?.data?.message || 'Failed to delete properties';
    }
  },

  /**
   * Search properties
   */
  async searchProperties(searchParams) {
    try {
      const response = await api.get('/properties/search', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error.response?.data?.message || 'Failed to search properties';
    }
  }
};

export default propertyService;