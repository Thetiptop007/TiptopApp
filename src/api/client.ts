import axios, { AxiosInstance, AxiosError } from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../utils/storage';

// Use your local IP address for development
const BASE_URL = __DEV__ 
  ? 'https://tiptopapp-backend.onrender.com/api/v1'  // Deployed backend on Render
  : 'https://tiptopapp-backend.onrender.com/api/v1'; // Production URL

// Custom axios instance that returns data directly
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem('@auth:accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors gracefully  
apiClient.interceptors.response.use(
  (response): any => {
    // Return the data directly for cleaner code
    return response.data;
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data: any = error.response.data;
      
      console.error(`API Error ${status}:`, data?.message || error.message);
      
      // Handle specific status codes
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        storage.removeItem('authToken');
      } else if (status === 403) {
        // Forbidden - user doesn't have permission
        console.error('Access forbidden');
      } else if (status === 404) {
        // Not found
        console.error('Resource not found');
      } else if (status >= 500) {
        // Server error
        console.error('Server error - please try again later');
      }
      
      return Promise.reject(data || error);
    } else if (error.request) {
      // Network error - no response received
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      });
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      });
    }
  }
);

export default apiClient;
export { BASE_URL };
