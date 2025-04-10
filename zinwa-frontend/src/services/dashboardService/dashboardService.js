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
const dashboardService = {
  /**
   * Get all payments with pagination
   */
  async getAdminData() {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching details:', error);
      throw error.response?.data?.message || 'Failed to fetch details';
    }
  },

}

export default dashboardService;