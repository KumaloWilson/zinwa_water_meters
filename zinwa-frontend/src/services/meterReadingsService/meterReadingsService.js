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
      console.log('Authentication error. You might need to log in again.');
    }
    return Promise.reject(error);
  }
);

/**
 * Meter readings management service
 */
const meterReadingService = {
  /**
   * Get all meter readings with pagination
   */
  async getMeterReadings(page = 1, limit = 10) {
    try {
      const response = await api.get('/meter-readings', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching meter readings:', error);
      throw error.response?.data?.message || 'Failed to fetch meter readings';
    }
  },

  /**
   * Get meter reading by ID
   */
  async getMeterReadingById(readingId) {
    try {
      const response = await api.get(`/meter-readings/${readingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching meter reading ${readingId}:`, error);
      throw error.response?.data?.message || 'Failed to fetch meter reading';
    }
  },

  /**
   * Get meter readings by property ID
   */
  async getMeterReadingsByPropertyId(propertyId) {
    try {
      const response = await api.get(`/meter-readings/property/${propertyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching meter readings for property ${propertyId}:`, error);
      throw error.response?.data?.message || 'Failed to fetch property meter readings';
    }
  },

  /**
   * Get latest meter reading by property ID
   */
  async getLatestMeterReadingByPropertyId(propertyId) {
    try {
      const response = await api.get(`/meter-readings/property/${propertyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching latest meter reading for property ${propertyId}:`, error);
      throw error.response?.data?.message || 'Failed to fetch latest property meter reading';
    }
  },

  /**
   * Create a new meter reading
   */
  async createMeterReading(readingData) {
    try {
      const response = await api.post('/meter-readings', readingData);
      return response.data;
    } catch (error) {
      console.error('Error creating meter reading:', error);
      throw error.response?.data?.message || 'Failed to create meter reading';
    }
  },

  /**
   * Update meter reading
   */
  async updateMeterReading(readingId, readingData) {
    try {
      const response = await api.put(`/meter-readings/${readingId}`, readingData);
      return response.data;
    } catch (error) {
      console.error(`Error updating meter reading ${readingId}:`, error);
      throw error.response?.data?.message || 'Failed to update meter reading';
    }
  },

  /**
   * Delete meter reading
   */
  async deleteMeterReading(readingId) {
    try {
      const response = await api.delete(`/meter-readings/${readingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting meter reading ${readingId}:`, error);
      throw error.response?.data?.message || 'Failed to delete meter reading';
    }
  },

  /**
   * Get meter reading statistics
   */
  async getMeterReadingStatistics() {
    try {
      const response = await api.get('/meter-readings/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching meter reading statistics:', error);
      throw error.response?.data?.message || 'Failed to fetch meter reading statistics';
    }
  },

  /**
   * Search meter readings
   */
  async searchMeterReadings(searchParams) {
    try {
      const response = await api.get('/meter-readings/search', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching meter readings:', error);
      throw error.response?.data?.message || 'Failed to search meter readings';
    }
  },

  /**
   * Get consumption history for a property
   */
  async getConsumptionHistory(propertyId, startDate, endDate) {
    try {
      const response = await api.get(`/meter-readings/property/${propertyId}/consumption`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching consumption history for property ${propertyId}:`, error);
      throw error.response?.data?.message || 'Failed to fetch consumption history';
    }
  }
};

export default meterReadingService;