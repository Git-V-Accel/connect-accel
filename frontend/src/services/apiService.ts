/**
 * API Service
 * Centralized HTTP client for making API requests
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/api';
import { toast } from '../utils/toast';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
  withCredentials: true, // Important for cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = sessionStorage.getItem('refresh_token') || 
                            document.cookie.split('; ').find(row => row.startsWith('refreshToken='))?.split('=')[1];
        
        if (refreshToken) {
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.REFRESH_TOKEN}`,
            { refreshToken },
            { withCredentials: true }
          );

          const { token } = response.data;
          if (token) {
            sessionStorage.setItem('auth_token', token);
            
            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('connect_accel_user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle rate limit errors (429) with retry logic
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after'] || '15', 10);
      const retryCount = (originalRequest as any)._retryCount || 0;
      const maxRetries = 2; // Maximum 2 retries
      
      if (retryCount < maxRetries) {
        // Exponential backoff: wait 2^retryCount * retryAfter seconds
        const delay = Math.min(1000 * retryAfter * Math.pow(2, retryCount), 30000); // Max 30 seconds
        
        (originalRequest as any)._retryCount = retryCount + 1;
        (originalRequest as any)._retry = true;
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the request
        return apiClient(originalRequest);
      }
      
      // Max retries reached
      const errorMessage = `Too many requests. Please wait ${retryAfter} seconds before trying again.`;
      toast.error(errorMessage);
      return Promise.reject(error);
    }

    // Handle other errors
    const errorMessage = 
      (error.response?.data as any)?.message || 
      error.message || 
      'An error occurred';

    // Don't show toast for 401 errors (handled above) or if it's a network error
    if (error.response?.status !== 401 && error.code !== 'ERR_NETWORK') {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

