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
 * Payment management service
 */
const paymentService = {
  /**
   * Get all payments with pagination
   */
  async getPayments(page = 1, limit = 10) {
    try {
      const response = await api.get('/payments', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error.response?.data?.message || 'Failed to fetch payments';
    }
  },

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId) {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment ${paymentId}:`, error);
      throw error.response?.data?.message || 'Failed to fetch payment';
    }
  },

  /**
   * Get payments by user ID
   */
  async getPaymentsByUserId(userId) {
    try {
      const response = await api.get(`/payments/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payments for user ${userId}:`, error);
      throw error.response?.data?.message || 'Failed to fetch user payments';
    }
  },
  
  /**
   * Get payments by property ID
   */
  async getPaymentsByPropertyId(propertyId) {
    try {
      const response = await api.get(`/payments/property/${propertyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payments for property ${propertyId}:`, error);
      throw error.response?.data?.message || 'Failed to fetch property payments';
    }
  },

  /**
   * Create a new payment
   */
  async createPayment(paymentData) {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error.response?.data?.message || 'Failed to create payment';
    }
  },

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId, statusData) {
    try {
      const response = await api.patch(`/payments/${paymentId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error(`Error updating payment status ${paymentId}:`, error);
      throw error.response?.data?.message || 'Failed to update payment status';
    }
  },

  /**
   * Get payment statistics
   */
  async getPaymentStatistics() {
    try {
      const response = await api.get('/payments/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment statistics:', error);
      throw error.response?.data?.message || 'Failed to fetch payment statistics';
    }
  },

  /**
   * Search payments
   */
  async searchPayments(searchParams) {
    try {
      const response = await api.get('/payments/search', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching payments:', error);
      throw error.response?.data?.message || 'Failed to search payments';
    }
  }
};

export default paymentService;