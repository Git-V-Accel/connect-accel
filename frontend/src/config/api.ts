/**
 * API Configuration
 * Centralized configuration for API endpoints and base URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_PREFIX = '/api';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  API_URL: `${API_BASE_URL}${API_PREFIX}`,
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    REGISTER: `${API_PREFIX}/auth/register`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
    REFRESH_TOKEN: `${API_PREFIX}/auth/refresh`,
    FORGOT_PASSWORD: `${API_PREFIX}/auth/forgot-password`,
    RESET_PASSWORD: `${API_PREFIX}/auth/reset-password`,
    VERIFY_OTP: `${API_PREFIX}/auth/verify-otp`,
    RESEND_OTP: `${API_PREFIX}/auth/resend-otp`,
    CHANGE_PASSWORD: `${API_PREFIX}/auth/change-password`,
    SEND_PASSWORD_CHANGE_OTP: `${API_PREFIX}/auth/change-password/send-otp`,
  },
};

export default API_CONFIG;

