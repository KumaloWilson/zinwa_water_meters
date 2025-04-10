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
 * Rates management service
 */
const rateService = {
  /**
   * Get all rates with pagination
   */
  async getRates(page = 1, limit = 10) {
    try {
      const response = await api.get('/rates', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching rates:', error);
      throw error.response?.data?.message || 'Failed to fetch rates';
    }
  },

  /**
   * Get rate by ID
   */
  async getRateById(rateId) {
    try {
      const response = await api.get(`/rates/${rateId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching rate ${rateId}:`, error);
      throw error.response?.data?.message || 'Failed to fetch rate';
    }
  },

  /**
   * Get rates by property type
   */
  async getRatesByPropertyType(propertyType) {
    try {
      const response = await api.get(`/rates/property-type/${propertyType}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching rates for property type ${propertyType}:`, error);
      throw error.response?.data?.message || 'Failed to fetch property type rates';
    }
  },

  /**
   * Create a new rate
   */
  async createRate(rateData) {
    try {
      const response = await api.post('/rates', rateData);
      return response.data;
    } catch (error) {
      console.error('Error creating rate:', error);
      throw error.response?.data?.message || 'Failed to create rate';
    }
  },

  /**
   * Update rate
   */
  async updateRate(rateId, rateData) {
    try {
      const response = await api.put(`/rates/${rateId}`, rateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating rate ${rateId}:`, error);
      throw error.response?.data?.message || 'Failed to update rate';
    }
  },

  /**
   * Delete rate
   */
  async deleteRate(rateId) {
    try {
      const response = await api.delete(`/rates/${rateId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting rate ${rateId}:`, error);
      throw error.response?.data?.message || 'Failed to delete rate';
    }
  },

  /**
   * Get active rates
   */
  async getActiveRates() {
    try {
      const response = await api.get('/rates/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active rates:', error);
      throw error.response?.data?.message || 'Failed to fetch active rates';
    }
  }
};

export default rateService;