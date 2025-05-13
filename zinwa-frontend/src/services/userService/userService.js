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
 * User management service
 */
const userService = {
  /**
   * Get all users
   */
  async getUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error.response?.data?.message || 'Failed to fetch users';
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error.response?.data?.message || 'Failed to fetch user';
    }
  },

  /**
   * Create a new user
   */
  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error.response?.data?.message || 'Failed to create user';
    }
  },

  /**
   * Update user
   */
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/users/deactivateUser${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error.response?.data?.message || 'Failed to update user';
    }
  },

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error.response?.data?.message || 'Failed to delete user';
    }
  },

  /**
   * Update user role
   */
  async updateUserRole(userId, role) {
    try {
      const response = await api.patch(`/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error(`Error updating role for user ${userId}:`, error);
      throw error.response?.data?.message || 'Failed to update user role';
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      throw error.response?.data?.message || 'Failed to fetch user profile';
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      // Update local storage if user data changes
      if (response.data && response.data.user) {
        authService.setUserData(response.data.user);
      }
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error.response?.data?.message || 'Failed to update profile';
    }
  },

  /**
   * Bulk operations
   */
  async bulkDeleteUsers(userIds) {
    try {
      const response = await api.post('/users/bulk-delete', { userIds });
      return response.data;
    } catch (error) {
      console.error('Error performing bulk delete:', error);
      throw error.response?.data?.message || 'Failed to delete users';
    }
  }
};

export default userService;