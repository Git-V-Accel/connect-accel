// Validation Messages
const VALIDATION = {
  // User Model
  USER: {
    USER_ID_REQUIRED: 'User ID is required',
    NAME_REQUIRED: 'Please provide a name',
    NAME_MAX_LENGTH: 'Name cannot be more than 50 characters',
    EMAIL_REQUIRED: 'Please provide an email',
    EMAIL_INVALID: 'Please provide a valid email',
    PASSWORD_REQUIRED: 'Please provide a password',
    PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters'
  },
  
  // ActivityLog Model
  ACTIVITY_LOG: {
    USER_REQUIRED: 'Please provide the user who performed the action',
    ACTIVITY_TYPE_REQUIRED: 'Please provide the activity type',
    TITLE_REQUIRED: 'Please provide the activity title',
    TITLE_MAX_LENGTH: 'Title cannot be more than 200 characters',
    DESCRIPTION_REQUIRED: 'Please provide the activity description',
    DESCRIPTION_MAX_LENGTH: 'Description cannot be more than 1000 characters'
  },
  
  // Project Model
  PROJECT: {
    TITLE_REQUIRED: 'Please provide a project title',
    TITLE_MAX_LENGTH: 'Title cannot be more than 100 characters',
    DESCRIPTION_REQUIRED: 'Please provide a project description',
    BUDGET_REQUIRED: 'Please provide a project budget',
    BUDGET_MIN: 'Budget cannot be negative',
    TIMELINE_REQUIRED: 'Please provide a project timeline',
    CATEGORY_REQUIRED: 'Please provide a project category',
    CLIENT_REQUIRED: 'Please provide a client'
  },
  
  // Milestone Model
  MILESTONE: {
    TITLE_REQUIRED: 'Please provide a milestone title',
    TITLE_MAX_LENGTH: 'Title cannot be more than 100 characters',
    DESCRIPTION_REQUIRED: 'Please provide a milestone description',
    DUE_DATE_REQUIRED: 'Please provide a due date',
    AMOUNT_REQUIRED: 'Please provide milestone amount',
    AMOUNT_MIN: 'Amount cannot be negative'
  },
  
  // Notification Model
  NOTIFICATION: {
    USER_REQUIRED: 'Please provide a user',
    TYPE_REQUIRED: 'Please provide a notification type',
    TITLE_REQUIRED: 'Please provide a notification title',
    TITLE_MAX_LENGTH: 'Title cannot be more than 100 characters',
    MESSAGE_REQUIRED: 'Please provide a notification message',
    MESSAGE_MAX_LENGTH: 'Message cannot be more than 500 characters'
  },
  
  // Bidding Model
  BIDDING: {
    ADMIN_BID_ID_REQUIRED: 'Admin bid ID is required',
    PROJECT_ID_REQUIRED: 'Project ID is required',
    PROJECT_TITLE_REQUIRED: 'Project title is required',
    FREELANCER_ID_REQUIRED: 'Freelancer ID is required',
    FREELANCER_NAME_REQUIRED: 'Freelancer name is required',
    FREELANCER_EMAIL_REQUIRED: 'Freelancer email is required',
    BID_AMOUNT_REQUIRED: 'Bid amount is required',
    TIMELINE_REQUIRED: 'Timeline is required',
    DESCRIPTION_REQUIRED: 'Description is required',
    ADMIN_ID_REQUIRED: 'Admin ID is required',
    ADMIN_NAME_REQUIRED: 'Admin name is required',
    CLIENT_ID_REQUIRED: 'Client ID is required',
    CLIENT_NAME_REQUIRED: 'Client name is required'
  },
  
  // Bid Model
  BID: {
    PROJECT_ID_REQUIRED: 'Project ID is required',
    PROJECT_TITLE_REQUIRED: 'Project title is required',
    BIDDER_ID_REQUIRED: 'Bidder ID is required',
    BIDDER_NAME_REQUIRED: 'Bidder name is required',
    BIDDER_EMAIL_REQUIRED: 'Bidder email is required',
    BID_AMOUNT_REQUIRED: 'Bid amount is required',
    TIMELINE_REQUIRED: 'Timeline is required',
    DESCRIPTION_REQUIRED: 'Description is required',
    ATTACHMENT_NAME_REQUIRED: 'Attachment name is required',
    ATTACHMENT_URL_REQUIRED: 'Attachment URL is required',
    ATTACHMENT_SIZE_REQUIRED: 'Attachment size is required',
    ATTACHMENT_TYPE_REQUIRED: 'Attachment type is required'
  }
};

// API Response Messages
const MESSAGES = {
  // Success Messages
  USER_REGISTERED: 'User registered successfully',
  OTP_SENT: 'OTP sent to your email. Please verify your email to activate your account.',
  OTP_VERIFIED: 'Email verified successfully. Your account is now active.',
  OTP_RESENT: 'OTP resent to your email. Please check your inbox.',
  LOGIN_SUCCESS: 'Login successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent successfully',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  ACCOUNT_DELETED: 'Account deleted successfully',
  USER_ROLE_UPDATED: 'User role updated successfully',
  USER_DELETED: 'User deleted successfully',
  
  // Error Messages
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_EXISTS: 'User already exists with this email',
  USER_NOT_FOUND: 'User not found',
  EMAIL_NOT_FOUND: 'User not found with this email address',
  INVALID_TOKEN: 'Invalid or expired reset token',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  EMAIL_EXISTS: 'Email already exists',
  EMAIL_SEND_FAILED: 'Email could not be sent',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in. Check your inbox for the OTP.',
  INVALID_OTP: 'Invalid OTP code. Please try again.',
  OTP_EXPIRED: 'OTP has expired. Please request a new OTP.',
  OTP_REQUIRED: 'Please provide an OTP code',
  PROVIDE_OTP: 'Please provide an OTP code',
  
  // Validation Messages (Legacy - use VALIDATION object instead)
  PROVIDE_NAME_EMAIL_PASSWORD: 'Please provide name, email and password',
  PROVIDE_EMAIL_PASSWORD: 'Please provide email and password',
  PROVIDE_EMAIL: 'Please provide an email address',
  PROVIDE_CURRENT_NEW_PASSWORD: 'Please provide current password and new password',
  PROVIDE_VALID_ROLE: 'Please provide a valid role (Superadmin, Client, or Guest)',
  
  // Authorization Messages
  NOT_AUTHORIZED: 'Not authorized',
  NO_TOKEN: 'Not authorized, no token',
  TOKEN_FAILED: 'Not authorized, token failed',
  USER_NOT_FOUND_AUTH: 'Not authorized, user not found',
  SUPERADMIN_REQUIRED: 'Access denied. Superadmin privileges required.',
  CLIENT_SUPERADMIN_REQUIRED: 'Access denied. Client or Superadmin privileges required.',
  
  // Server Messages
  SERVER_ERROR: 'Server error',
  SERVER_ERROR_REGISTRATION: 'Server error during registration',
  SERVER_ERROR_LOGIN: 'Server error during login',
  SERVER_ERROR_PASSWORD_RESET: 'Server error during password reset',
  SERVER_ERROR_EMAIL_SENDING: 'Server error during email sending'
};

module.exports = {
  ...MESSAGES,
  VALIDATION
};
