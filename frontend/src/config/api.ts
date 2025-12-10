/**
 * API Configuration
 * Centralized configuration for API endpoints and base URLs
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';
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
  PROJECTS: {
    LIST: `${API_PREFIX}/projects`,
    GET: (id: string) => `${API_PREFIX}/projects/${id}`,
    CREATE: `${API_PREFIX}/projects`,
    UPDATE: (id: string) => `${API_PREFIX}/projects/${id}`,
    DELETE: (id: string) => `${API_PREFIX}/projects/${id}`,
    MILESTONES: {
      ADD: (id: string) => `${API_PREFIX}/projects/${id}/milestones`,
      UPDATE: (projectId: string, milestoneId: string) => `${API_PREFIX}/projects/${projectId}/milestones/${milestoneId}`,
      RELEASE: (projectId: string, milestoneId: string) => `${API_PREFIX}/projects/${projectId}/milestones/${milestoneId}/release`,
    },
    BIDDING: (id: string) => `${API_PREFIX}/projects/${id}/bidding`,
    CONSULTATION: `${API_PREFIX}/projects/consultation`,
  },
};

export default API_CONFIG;

