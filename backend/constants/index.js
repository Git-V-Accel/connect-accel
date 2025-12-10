require('dotenv').config();
// User Roles
const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  FREELANCER: 'freelancer',
  CLIENT: 'client',
  AGENT: 'agent',
};
const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME;
const EMAIL_FROM_EMAIL = process.env.EMAIL_FROM_EMAIL;
const BACKEND_URL = process.env.BACKEND_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

// User Role Array (for validation)
const USER_ROLE_ARRAY = Object.values(USER_ROLES);

// JWT Configuration
const JWT_CONFIG = {
  EXPIRES_IN: '1d', // Access token: 1 day
  REFRESH_EXPIRES_IN: '7d', // Refresh token: 7 days
  SECRET_KEY: JWT_SECRET,
  REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh',
};
const MONGODB_URI = process.env.MONGODB_URI;

// Email Configuration
const EMAIL_CONFIG = {
  HOST: EMAIL_HOST,
  PORT: EMAIL_PORT,
  USER: EMAIL_USER,
  PASS: EMAIL_PASS,
  FROM_NAME: EMAIL_FROM_NAME,
  FROM_EMAIL: EMAIL_FROM_EMAIL
};
// Password Reset Configuration
const PASSWORD_RESET_CONFIG = {
  TOKEN_EXPIRE_TIME: 10 * 60 * 1000, // 10 minutes in milliseconds
  TOKEN_LENGTH: 20
};

// Server Configuration
const SERVER_CONFIG = {
  PORT: process.env.PORT ,
  NODE_ENV: process.env.NODE_ENV 
};

// Rate Limiting Configuration
const RATE_LIMIT_CONFIG = {
  // General API rate limit
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '15', 10) * 60 * 1000, // Default: 15 minutes
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10), // Default: 1000 requests per window
  
  // Auth endpoints rate limit (stricter)
  AUTH_WINDOW_MS: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '15', 10) * 60 * 1000, // Default: 15 minutes
  AUTH_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '20', 10), // Default: 20 requests per window
};

// Database Configuration
const DATABASE_CONFIG = {
  URI: MONGODB_URI
};

// Frontend Configuration
const FRONTEND_CONFIG = {
  URL: FRONTEND_URL 
};


// Import messages from separate file
const MESSAGES = require('./messages');

// HTTP Status Codes
const STATUS_CODES = {
  SUCCESS: 200,
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  NOT_IMPLEMENTED: 501,
  INTERNAL_SERVER_ERROR: 500
};

// Activity Types
const ACTIVITY_TYPES = {
  // Project activities
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_DELETED: 'project_deleted',
  PROJECT_STATUS_CHANGED: 'project_status_changed',
  
  // Description activities
  DESCRIPTION_ADDED: 'description_added',
  DESCRIPTION_DELETED: 'description_deleted',
  DESCRIPTION_UPDATED: 'description_updated',
  
  // Project Note activities
  PROJECT_NOTE_ADDED: 'project_note_added',
  PROJECT_NOTE_DELETED: 'project_note_deleted',
  PROJECT_NOTE_UPDATED: 'project_note_updated',
  
  // File activities
  FILE_UPLOADED: 'file_uploaded',
  FILE_DELETED: 'file_deleted',
  FILE_DOWNLOADED: 'file_downloaded',
  FILE_VIEWED: 'file_viewed',
  
  // Payment activities
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_CANCELLED: 'payment_cancelled',
  PAYMENT_PROCESSING: 'payment_processing',
  MILESTONE_CREATED: 'milestone_created',
  MILESTONE_COMPLETED: 'milestone_completed',
  MILESTONE_STATUS_UPDATED: 'milestone_status_updated',
  
  // User activities
  USER_REGISTERED: 'user_registered',
  USER_UPDATED: 'user_updated',
  USER_LOGGED_IN: 'user_logged_in',
  
  // Admin activities
  ADMIN_ASSIGNED_FREELANCER: 'admin_assigned_freelancer',
  ADMIN_UPDATED_PROJECT: 'admin_updated_project',
  ADMIN_APPROVED_PAYMENT: 'admin_approved_payment',
  ADMIN_REJECTED_PAYMENT: 'admin_rejected_payment',
  
  // Communication activities
  MESSAGE_SENT: 'message_sent',
  NOTIFICATION_SENT: 'notification_sent',
  CONSULTATION_REQUESTED: 'consultation_requested',
  
  // System activities
  SYSTEM_GENERATED: 'system_generated',
  AUTOMATED_TASK: 'automated_task'
};

// Activity Types Array (for validation)
const ACTIVITY_TYPES_ARRAY = Object.values(ACTIVITY_TYPES);

// Notification Types
const NOTIFICATION_TYPES = {
  // Milestone notifications
  MILESTONE_COMPLETED: 'milestone_completed',
  MILESTONE_ADDED: 'milestone_added',
  MILESTONE_UPDATED: 'milestone_updated',
  
  // Payment notifications
  PAYMENT_DUE: 'payment_due',
  PAYMENT_REQUESTED: 'payment_requested',
  PAYMENT_PROCESSING: 'payment_processing',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_CANCELLED: 'payment_cancelled',
  
  // Project notifications
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_DELETED: 'project_deleted',
  PROJECT_CLOSED: 'project_closed',
  DESCRIPTION_ADDED: 'description_added',
  
  // Assignment notifications
  FREELANCER_ASSIGNED: 'freelancer_assigned',
  
  // Bid notifications
  BID_ACCEPTED: 'bid_accepted',
  BID_DECLINED: 'bid_declined',
  BIDDING_ACCEPTED: 'bidding_accepted',
  BIDDING_DECLINED: 'bidding_declined',
  
  // System notifications
  SYSTEM: 'system',
  
  // Consultation notifications
  CONSULTATION_REQUESTED: 'consultation_requested'
};

// Notification Types Array (for validation)
const NOTIFICATION_TYPES_ARRAY = Object.values(NOTIFICATION_TYPES);

// Project Status
const PROJECT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ACTIVE: 'active',
  HOLD: 'hold',
  CLOSED: 'closed',
  BIDDING: 'bidding'
};
const PROJECT_STATUS_ARRAY = Object.values(PROJECT_STATUS);

// Project Priority
const PROJECT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};
const PROJECT_PRIORITY_ARRAY = Object.values(PROJECT_PRIORITY);

// Milestone Status
const MILESTONE_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ACTIVE: 'active',
  HOLD: 'hold',
  CLOSED: 'closed'
};
const MILESTONE_STATUS_ARRAY = Object.values(MILESTONE_STATUS);

// Payment Status
const PAYMENT_STATUS = {
  NOT_REQUESTED: 'not_requested',
  PAYMENT_REQUESTED: 'payment_requested',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};
const PAYMENT_STATUS_ARRAY = Object.values(PAYMENT_STATUS);

// Bid/Bidding Status
const BID_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};
const BID_STATUS_ARRAY = Object.values(BID_STATUS);

// User Status
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};
const USER_STATUS_ARRAY = Object.values(USER_STATUS);

// Admin Role
const ADMIN_ROLE = {
  superadmin: 'superadmin',
  ADMIN: 'admin',
};
const ADMIN_ROLE_ARRAY = Object.values(ADMIN_ROLE);

// Permissions
const PERMISSIONS = {
  USER_MANAGEMENT: 'user_management',
  PROJECT_MANAGEMENT: 'project_management',
  BILLING_MANAGEMENT: 'billing_management',
  SYSTEM_SETTINGS: 'system_settings'
};
const PERMISSIONS_ARRAY = Object.values(PERMISSIONS);

// Experience Level
const EXPERIENCE_LEVEL = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
};
const EXPERIENCE_LEVEL_ARRAY = Object.values(EXPERIENCE_LEVEL);

// Severity Level
const SEVERITY_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};
const SEVERITY_LEVEL_ARRAY = Object.values(SEVERITY_LEVEL);

// Source Type
const SOURCE_TYPE = {
  WEB: 'web',
  MOBILE: 'mobile',
  API: 'api'
};
const SOURCE_TYPE_ARRAY = Object.values(SOURCE_TYPE);

// Export all constants
module.exports = {
  USER_ROLES,
  USER_ROLE_ARRAY,
  JWT_CONFIG,
  EMAIL_CONFIG,
  PASSWORD_RESET_CONFIG,
  SERVER_CONFIG,
  RATE_LIMIT_CONFIG,
  DATABASE_CONFIG,
  FRONTEND_CONFIG,
  MESSAGES,
  STATUS_CODES,
  ACTIVITY_TYPES,
  ACTIVITY_TYPES_ARRAY,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPES_ARRAY,
  PROJECT_STATUS,
  PROJECT_STATUS_ARRAY,
  PROJECT_PRIORITY,
  PROJECT_PRIORITY_ARRAY,
  MILESTONE_STATUS,
  MILESTONE_STATUS_ARRAY,
  PAYMENT_STATUS,
  PAYMENT_STATUS_ARRAY,
  BID_STATUS,
  BID_STATUS_ARRAY,
  USER_STATUS,
  USER_STATUS_ARRAY,
  ADMIN_ROLE,
  ADMIN_ROLE_ARRAY,
  PERMISSIONS,
  PERMISSIONS_ARRAY,
  EXPERIENCE_LEVEL,
  EXPERIENCE_LEVEL_ARRAY,
  SEVERITY_LEVEL,
  SEVERITY_LEVEL_ARRAY,
  SOURCE_TYPE,
  SOURCE_TYPE_ARRAY
};
