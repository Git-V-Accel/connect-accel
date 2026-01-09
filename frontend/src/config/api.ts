/**
 * API Configuration
 * Centralized configuration for API endpoints and base URLs
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL;

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  API_URL: API_BASE_URL,
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    CHANGE_PASSWORD: '/auth/change-password',
    SEND_PASSWORD_CHANGE_OTP: '/auth/change-password/send-otp',
    FIRST_LOGIN_CHANGE_PASSWORD: '/auth/first-login/change-password',
  },
  PROJECTS: {
    LIST: '/projects',
    GET: (id: string) => `/projects/${id}`,
    CREATE: '/projects',
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    MILESTONES: {
      ADD: (id: string) => `/projects/${id}/milestones`,
      UPDATE: (projectId: string, milestoneId: string) => `/projects/${projectId}/milestones/${milestoneId}`,
      RELEASE: (projectId: string, milestoneId: string) => `/projects/${projectId}/milestones/${milestoneId}/release`,
    },
    BIDDING: (id: string) => `/projects/${id}/bidding`,
    CONSULTATION: '/projects/consultation',
  },
  ACTIVITY_LOGS: {
    PROJECT: (projectId: string) => `/activity-logs/project/${projectId}`,
    CLIENT: (clientId: string) => `/activity-logs/client/${clientId}`,
    ALL: '/activity-logs',
    STATS: '/activity-logs/stats',
  },
  SETTINGS: {
    GET: '/settings',
    GET_BY_USER_ID: (userId: string) => `/settings/user/${userId}`,
    UPDATE: '/settings',
    UPDATE_SECTION: (section: string) => `/settings/${section}`,
    RESET: '/settings/reset',
  },
  BIDS: {
    CREATE: '/bids',
    LIST: '/bids',
    AVAILABLE: '/bids/available',
    GET: (id: string) => `/bids/${id}`,
    GET_BY_PROJECT: (projectId: string) => `/bids/project/${projectId}`,
    GET_BY_USER: (userId: string) => `/bids/user/${userId}`,
    UPDATE: (id: string) => `/bids/${id}`,
    UPDATE_STATUS: (id: string) => `/bids/${id}/status`,
    DELETE: (id: string) => `/bids/${id}`,
    SHORTLIST: (id: string) => `/bids/${id}/shortlist`,
    ACCEPT: (id: string) => `/bids/${id}/accept`,
    DECLINE: (id: string) => `/bids/${id}/decline`,
    GET_SHORTLISTED: (projectId: string) => `/bids/project/${projectId}/shortlisted`,
    STATS: '/bids/stats',
  },
  BIDDING: {
    CREATE: '/bidding',
    LIST: '/bidding',
    GET: (id: string) => `/bidding/${id}`,
    GET_BY_ADMIN_BID: (adminBidId: string) => `/bidding/admin-bid/${adminBidId}`,
    GET_BY_FREELANCER: (freelancerId: string) => `/bidding/freelancer/${freelancerId}`,
    UPDATE: (id: string) => `/bidding/${id}`,
    UPDATE_STATUS: (id: string) => `/bidding/${id}/status`,
    DELETE: (id: string) => `/bidding/${id}`,
    UNDO_WITHDRAWAL: (id: string) => `/bidding/${id}/undo-withdrawal`,
    SHORTLIST: (id: string) => `/bidding/${id}/shortlist`,
    ACCEPT: (id: string) => `/bidding/${id}/accept`,
    DECLINE: (id: string) => `/bidding/${id}/decline`,
    GET_SHORTLISTED: (projectId: string) => `/bidding/project/${projectId}/shortlisted`,
    STATS: '/bidding/stats',
  },
  CONSULTATIONS: {
    LIST: '/consultations',
    GET: (id: string) => `/consultations/${id}`,
    ASSIGN: (id: string) => `/consultations/${id}/assign`,
    COMPLETE: (id: string) => `/consultations/${id}/complete`,
    CANCEL: (id: string) => `/consultations/${id}/cancel`,
    UNDO_CANCEL: (id: string) => `/consultations/${id}/undo-cancel`,
  },
  SHORTLISTED_PROJECTS: {
    LIST: '/shortlisted-projects',
    ADD: '/shortlisted-projects',
    REMOVE: (projectId: string) => `/shortlisted-projects/${projectId}`,
    CHECK: (projectId: string) => `/shortlisted-projects/check/${projectId}`,
  },
  DASHBOARD: {
    SUPERADMIN: '/dashboard/superadmin',
    ADMIN: '/dashboard/admin',
    AGENT: '/dashboard/agent',
    CLIENT: '/dashboard/client',
    FREELANCER: '/dashboard/freelancer',
  },
};

export default API_CONFIG;