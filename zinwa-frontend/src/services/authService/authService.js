// src/services/authService.js
import axios from 'axios';

const API_BASE_URL = 'https://zinwa.onrender.com/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL
});

// Add a request interceptor to automatically add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

/**
 * Authentication service
 */
const authService = {
  /**
   * Login user
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      this.setToken(response.data.token);
      this.setUserData(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  /**
   * Verify email
   */
  async verifyEmail(verificationData) {
    try {
      const response = await api.post('/auth/verify-email', verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Email verification failed';
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Forgot password request failed';
    }
  },

  /**
   * Reset password
   */
  async resetPassword(resetData) {
    try {
      const response = await api.post('/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Password reset failed';
    }
  },

  /**
   * Change password
   */
  async changePassword(passwordData) {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Password change failed';
    }
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Get token
   */
  getToken() {
    return localStorage.getItem('auth_token');
  },

  /**
   * Set token
   */
  setToken(token) {
    localStorage.setItem('auth_token', token);
  },

  /**
   * Get user data
   */
  getUserData() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Set user data
   */
  setUserData(userData) {
    localStorage.setItem('user_data', JSON.stringify(userData));
  }
};

export default authService;