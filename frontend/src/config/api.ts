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
    FIRST_LOGIN_CHANGE_PASSWORD: `${API_PREFIX}/auth/first-login/change-password`,
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
  ACTIVITY_LOGS: {
    PROJECT: (projectId: string) => `${API_PREFIX}/activity-logs/project/${projectId}`,
    CLIENT: (clientId: string) => `${API_PREFIX}/activity-logs/client/${clientId}`,
    ALL: `${API_PREFIX}/activity-logs`,
    STATS: `${API_PREFIX}/activity-logs/stats`,
  },
  SETTINGS: {
    GET: `${API_PREFIX}/settings`,
    GET_BY_USER_ID: (userId: string) => `${API_PREFIX}/settings/user/${userId}`,
    UPDATE: `${API_PREFIX}/settings`,
    UPDATE_SECTION: (section: string) => `${API_PREFIX}/settings/${section}`,
    RESET: `${API_PREFIX}/settings/reset`,
  },
  BIDS: {
    CREATE: `${API_PREFIX}/bids`,
    LIST: `${API_PREFIX}/bids`,
    AVAILABLE: `${API_PREFIX}/bids/available`,
    GET: (id: string) => `${API_PREFIX}/bids/${id}`,
    GET_BY_PROJECT: (projectId: string) => `${API_PREFIX}/bids/project/${projectId}`,
    GET_BY_USER: (userId: string) => `${API_PREFIX}/bids/user/${userId}`,
    UPDATE: (id: string) => `${API_PREFIX}/bids/${id}`,
    UPDATE_STATUS: (id: string) => `${API_PREFIX}/bids/${id}/status`,
    DELETE: (id: string) => `${API_PREFIX}/bids/${id}`,
    SHORTLIST: (id: string) => `${API_PREFIX}/bids/${id}/shortlist`,
    ACCEPT: (id: string) => `${API_PREFIX}/bids/${id}/accept`,
    DECLINE: (id: string) => `${API_PREFIX}/bids/${id}/decline`,
    GET_SHORTLISTED: (projectId: string) => `${API_PREFIX}/bids/project/${projectId}/shortlisted`,
    STATS: `${API_PREFIX}/bids/stats`,
  },
  BIDDING: {
    CREATE: `${API_PREFIX}/bidding`,
    LIST: `${API_PREFIX}/bidding`,
    GET: (id: string) => `${API_PREFIX}/bidding/${id}`,
    GET_BY_ADMIN_BID: (adminBidId: string) => `${API_PREFIX}/bidding/admin-bid/${adminBidId}`,
    GET_BY_FREELANCER: (freelancerId: string) => `${API_PREFIX}/bidding/freelancer/${freelancerId}`,
    UPDATE: (id: string) => `${API_PREFIX}/bidding/${id}`,
    UPDATE_STATUS: (id: string) => `${API_PREFIX}/bidding/${id}/status`,
    DELETE: (id: string) => `${API_PREFIX}/bidding/${id}`,
    SHORTLIST: (id: string) => `${API_PREFIX}/bidding/${id}/shortlist`,
    ACCEPT: (id: string) => `${API_PREFIX}/bidding/${id}/accept`,
    DECLINE: (id: string) => `${API_PREFIX}/bidding/${id}/decline`,
    GET_SHORTLISTED: (projectId: string) => `${API_PREFIX}/bidding/project/${projectId}/shortlisted`,
    STATS: `${API_PREFIX}/bidding/stats`,
  },
};

export default API_CONFIG;

