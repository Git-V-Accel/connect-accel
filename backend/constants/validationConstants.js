/**
 * Validation Constants for Backend
 * Contains regex patterns and error messages for all input field validations
 */

// ============================================================================
// REGEX PATTERNS
// ============================================================================

const VALIDATION_REGEX = {
  // Name patterns
  FIRST_NAME: /^[A-Za-z\s'-]{2,30}$/,
  LAST_NAME: /^[A-Za-z\s'-]{1,30}$/,
  FULL_NAME: /^[A-Za-z\s'-]{3,60}$/,
  NAME_GENERAL: /^[A-Za-z\s'-]{2,50}$/,

  // Email patterns
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  EMAIL_STRICT: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Phone patterns (Indian format)
  PHONE_INDIA: /^[6-9]\d{9}$/,
  PHONE_INTERNATIONAL: /^\+?[1-9]\d{1,14}$/,
  PHONE_GENERAL: /^[0-9]{10}$/,

  // Password patterns
  PASSWORD_MIN_8: /^.{8,}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
  PASSWORD_MEDIUM: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#]{8,}$/,

  // Project related patterns
  PROJECT_TITLE: /^[A-Za-z0-9\s\-_.,!?()]{3,100}$/,
  PROJECT_DESCRIPTION_MIN_LENGTH: 20, // Minimum characters
  BUDGET: /^\d+(\.\d{1,2})?$/, // Positive number with optional 2 decimal places
  BUDGET_POSITIVE: /^[1-9]\d*(\.\d{1,2})?$/, // Positive number (1 or more) with optional 2 decimals
  DURATION_WEEKS: /^[1-9]\d*$/, // Positive integer (1 or more)
  DURATION_MONTHS: /^[1-9]\d*$/, // Positive integer (1 or more)

  // URL patterns
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  URL_STRICT: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,

  // User ID patterns
  USER_ID: /^[A-Z0-9]{3,20}$/, // e.g., CLIENT-0001, ADMIN-001
  USER_ID_PREFIX: /^(CLIENT|ADMIN|FREELANCER|AGENT|SUPERADMIN)-/i,

  // Company/Business patterns
  COMPANY_NAME: /^[A-Za-z0-9\s\-_.,&()]{2,100}$/,
  GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,

  // Address patterns
  PINCODE_INDIA: /^[1-9][0-9]{5}$/,
  CITY: /^[A-Za-z\s'-]{2,50}$/,
  STATE: /^[A-Za-z\s'-]{2,50}$/,
  ADDRESS: /^[A-Za-z0-9\s\-_.,#/()]{5,200}$/,

  // Date patterns
  DATE_YYYY_MM_DD: /^\d{4}-\d{2}-\d{2}$/,
  DATE_DD_MM_YYYY: /^\d{2}\/\d{2}\/\d{4}$/,

  // Time patterns
  TIME_24H: /^([01][0-9]|2[0-3]):[0-5][0-9]$/,
  TIME_12H: /^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM)$/i,

  // File patterns
  FILE_NAME: /^[A-Za-z0-9\s\-_.,()]+\.(pdf|doc|docx|xls|xlsx|jpg|jpeg|png|gif|zip|rar)$/i,
  FILE_EXTENSION_IMAGE: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
  FILE_EXTENSION_DOCUMENT: /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i,
  FILE_EXTENSION_ARCHIVE: /\.(zip|rar|7z|tar|gz)$/i,

  // Special characters (to check for presence/absence)
  HAS_SPECIAL_CHARS: /[!@#$%^&*(),.?":{}|<>]/,
  HAS_NUMBERS: /\d/,
  HAS_LOWERCASE: /[a-z]/,
  HAS_UPPERCASE: /[A-Z]/,

  // HTML content (basic check)
  HAS_HTML_TAGS: /<[^>]+>/,
};

// ============================================================================
// VALIDATION ERROR MESSAGES
// ============================================================================

const VALIDATION_MESSAGES = {
  // ========== Name Fields ==========
  FIRST_NAME: {
    REQUIRED: 'First name is required',
    MIN_LENGTH: 'First name must be at least 2 characters',
    MAX_LENGTH: 'First name cannot exceed 30 characters',
    INVALID: 'First name can only contain letters, spaces, hyphens, and apostrophes',
    INVALID_CHARACTERS: 'First name cannot contain numbers or special characters',
  },
  LAST_NAME: {
    REQUIRED: 'Last name is required',
    MIN_LENGTH: 'Last name must be at least 1 character',
    MAX_LENGTH: 'Last name cannot exceed 30 characters',
    INVALID: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
    INVALID_CHARACTERS: 'Last name cannot contain numbers or special characters',
  },
  FULL_NAME: {
    REQUIRED: 'Full name is required',
    MIN_LENGTH: 'Full name must be at least 3 characters',
    MAX_LENGTH: 'Full name cannot exceed 60 characters',
    INVALID: 'Full name can only contain letters, spaces, hyphens, and apostrophes',
  },
  NAME_GENERAL: {
    REQUIRED: 'Name is required',
    MIN_LENGTH: 'Name must be at least 2 characters',
    MAX_LENGTH: 'Name cannot exceed 50 characters',
    INVALID: 'Name contains invalid characters',
  },

  // ========== Email Fields ==========
  EMAIL: {
    REQUIRED: 'Email address is required',
    INVALID: 'Please enter a valid email address (e.g., example@domain.com)',
    INVALID_FORMAT: 'Email format is invalid',
    MAX_LENGTH: 'Email address cannot exceed 255 characters',
  },

  // ========== Phone Fields ==========
  PHONE: {
    REQUIRED: 'Phone number is required',
    INVALID: 'Please enter a valid 10-digit phone number',
    INVALID_INDIA: 'Please enter a valid Indian phone number (starts with 6-9, 10 digits)',
    INVALID_INTERNATIONAL: 'Please enter a valid international phone number',
    MIN_LENGTH: 'Phone number must be at least 10 digits',
    MAX_LENGTH: 'Phone number cannot exceed 15 digits',
  },

  // ========== Password Fields ==========
  PASSWORD: {
    REQUIRED: 'Password is required',
    MIN_LENGTH: 'Password must be at least 8 characters',
    MAX_LENGTH: 'Password cannot exceed 128 characters',
    WEAK: 'Password is too weak',
    STRONG_REQUIRED: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    NO_UPPERCASE: 'Password must contain at least one uppercase letter',
    NO_LOWERCASE: 'Password must contain at least one lowercase letter',
    NO_NUMBER: 'Password must contain at least one number',
    NO_SPECIAL_CHAR: 'Password must contain at least one special character (@$!%*?&#)',
    MISMATCH: 'Passwords do not match',
    REQUIREMENTS: 'Password does not meet the requirements',
    SAME_AS_CURRENT: 'New password must be different from current password',
  },
  CONFIRM_PASSWORD: {
    REQUIRED: 'Please confirm your password',
    MISMATCH: 'Passwords do not match',
  },
  CURRENT_PASSWORD: {
    REQUIRED: 'Current password is required',
    INCORRECT: 'Current password is incorrect',
  },

  // ========== Project Fields ==========
  PROJECT_TITLE: {
    REQUIRED: 'Project title is required',
    MIN_LENGTH: 'Project title must be at least 3 characters',
    MAX_LENGTH: 'Project title cannot exceed 100 characters',
    INVALID: 'Project title contains invalid characters',
  },
  PROJECT_DESCRIPTION: {
    REQUIRED: 'Project description is required',
    MIN_LENGTH: 'Project description must be at least 20 characters',
    MAX_LENGTH: 'Project description cannot exceed 5000 characters',
    TOO_SHORT: 'Please provide more details about your project (at least 20 characters)',
  },
  PROJECT_CATEGORY: {
    REQUIRED: 'Please select a project category',
    INVALID: 'Invalid project category selected',
  },
  PROJECT_TYPE: {
    REQUIRED: 'Please select a project type',
    INVALID: 'Invalid project type selected',
  },
  PROJECT_BUDGET: {
    REQUIRED: 'Project budget is required',
    INVALID: 'Please enter a valid budget amount',
    MIN: 'Budget must be at least ₹1',
    MAX: 'Budget cannot exceed ₹1,00,00,000',
    NEGATIVE: 'Budget cannot be negative',
    DECIMAL_PLACES: 'Budget can have maximum 2 decimal places',
  },
  PROJECT_DURATION: {
    REQUIRED: 'Project duration is required',
    INVALID: 'Please enter a valid duration (must be a positive number)',
    MIN: 'Duration must be at least 1 week',
    MAX: 'Duration cannot exceed 520 weeks (10 years)',
    MUST_BE_POSITIVE: 'Duration must be a positive number',
  },
  PROJECT_SKILLS: {
    REQUIRED: 'Please select at least one skill',
    MIN_COUNT: 'Please select at least one skill required for this project',
    MAX_COUNT: 'Maximum 20 skills can be selected',
  },
  PROJECT_PRIORITY: {
    REQUIRED: 'Please select a priority level',
    INVALID: 'Invalid priority level selected',
  },

  // ========== Bid Fields ==========
  BID_AMOUNT: {
    REQUIRED: 'Bid amount is required',
    INVALID: 'Please enter a valid bid amount',
    MIN: 'Bid amount must be at least ₹1',
    MAX: 'Bid amount cannot exceed ₹1,00,00,000',
    NEGATIVE: 'Bid amount cannot be negative',
    DECIMAL_PLACES: 'Bid amount can have maximum 2 decimal places',
  },
  BID_TIMELINE: {
    REQUIRED: 'Timeline is required',
    INVALID: 'Please enter a valid timeline',
    MIN: 'Timeline must be at least 1 week',
  },
  BID_DESCRIPTION: {
    REQUIRED: 'Bid description is required',
    MIN_LENGTH: 'Bid description must be at least 20 characters',
    MAX_LENGTH: 'Bid description cannot exceed 2000 characters',
  },

  // ========== Milestone Fields ==========
  MILESTONE_TITLE: {
    REQUIRED: 'Milestone title is required',
    MIN_LENGTH: 'Milestone title must be at least 3 characters',
    MAX_LENGTH: 'Milestone title cannot exceed 100 characters',
  },
  MILESTONE_DESCRIPTION: {
    REQUIRED: 'Milestone description is required',
    MIN_LENGTH: 'Milestone description must be at least 10 characters',
    MAX_LENGTH: 'Milestone description cannot exceed 500 characters',
  },
  MILESTONE_AMOUNT: {
    REQUIRED: 'Milestone amount is required',
    INVALID: 'Please enter a valid amount',
    MIN: 'Milestone amount must be at least ₹1',
    NEGATIVE: 'Milestone amount cannot be negative',
  },
  MILESTONE_DUE_DATE: {
    REQUIRED: 'Due date is required',
    INVALID: 'Please enter a valid date',
    PAST_DATE: 'Due date cannot be in the past',
    FUTURE_DATE: 'Due date must be in the future',
  },

  // ========== User/Account Fields ==========
  USER_ID: {
    REQUIRED: 'User ID is required',
    INVALID: 'User ID format is invalid (e.g., CLIENT-0001)',
    INVALID_PREFIX: 'User ID must start with CLIENT-, ADMIN-, FREELANCER-, AGENT-, or SUPERADMIN-',
  },
  COMPANY_NAME: {
    REQUIRED: 'Company name is required',
    MIN_LENGTH: 'Company name must be at least 2 characters',
    MAX_LENGTH: 'Company name cannot exceed 100 characters',
    INVALID: 'Company name contains invalid characters',
  },
  GSTIN: {
    REQUIRED: 'GSTIN is required',
    INVALID: 'Please enter a valid GSTIN (15 characters, format: 22AAAAA0000A1Z5)',
  },
  PAN: {
    REQUIRED: 'PAN is required',
    INVALID: 'Please enter a valid PAN (10 characters, format: ABCDE1234F)',
  },

  // ========== Address Fields ==========
  ADDRESS: {
    REQUIRED: 'Address is required',
    MIN_LENGTH: 'Address must be at least 5 characters',
    MAX_LENGTH: 'Address cannot exceed 200 characters',
    INVALID: 'Address contains invalid characters',
  },
  CITY: {
    REQUIRED: 'City is required',
    MIN_LENGTH: 'City name must be at least 2 characters',
    MAX_LENGTH: 'City name cannot exceed 50 characters',
    INVALID: 'City name contains invalid characters',
  },
  STATE: {
    REQUIRED: 'State is required',
    MIN_LENGTH: 'State name must be at least 2 characters',
    MAX_LENGTH: 'State name cannot exceed 50 characters',
    INVALID: 'State name contains invalid characters',
  },
  PINCODE: {
    REQUIRED: 'Pincode is required',
    INVALID: 'Please enter a valid 6-digit pincode',
    INVALID_INDIA: 'Please enter a valid Indian pincode (6 digits, cannot start with 0)',
  },

  // ========== File Upload Fields ==========
  FILE: {
    REQUIRED: 'Please select a file',
    INVALID_TYPE: 'File type is not allowed',
    TOO_LARGE: 'File size is too large',
    MAX_SIZE: 'File size cannot exceed 10MB',
    IMAGE_ONLY: 'Please upload an image file (JPG, PNG, GIF, etc.)',
    DOCUMENT_ONLY: 'Please upload a document file (PDF, DOC, DOCX, etc.)',
    INVALID_NAME: 'File name contains invalid characters',
  },

  // ========== URL Fields ==========
  URL: {
    REQUIRED: 'URL is required',
    INVALID: 'Please enter a valid URL (e.g., https://example.com)',
    INVALID_FORMAT: 'URL format is invalid',
  },

  // ========== Date/Time Fields ==========
  DATE: {
    REQUIRED: 'Date is required',
    INVALID: 'Please enter a valid date',
    INVALID_FORMAT: 'Date format is invalid (use YYYY-MM-DD)',
    PAST_DATE: 'Date cannot be in the past',
    FUTURE_DATE: 'Date must be in the future',
  },
  TIME: {
    REQUIRED: 'Time is required',
    INVALID: 'Please enter a valid time',
    INVALID_FORMAT: 'Time format is invalid (use HH:MM or HH:MM AM/PM)',
  },

  // ========== General Fields ==========
  REQUIRED: 'This field is required',
  INVALID: 'Invalid value',
  MIN_LENGTH: 'Minimum length requirement not met',
  MAX_LENGTH: 'Maximum length exceeded',
  MIN_VALUE: 'Value is too small',
  MAX_VALUE: 'Value is too large',
  NUMERIC_ONLY: 'Only numbers are allowed',
  ALPHANUMERIC: 'Only letters and numbers are allowed',
  NO_SPECIAL_CHARS: 'Special characters are not allowed',

  // ========== Terms & Conditions ==========
  TERMS: {
    REQUIRED: 'Please accept the terms and conditions',
    NOT_ACCEPTED: 'You must accept the terms and conditions to continue',
  },

  // ========== Remark/Reason Fields ==========
  REMARK: {
    REQUIRED: 'Please provide a reason or remark',
    MIN_LENGTH: 'Reason must be at least 10 characters',
    MAX_LENGTH: 'Reason cannot exceed 500 characters',
    TOO_SHORT: 'Please provide more details (at least 10 characters)',
  },
  REJECTION_REASON: {
    REQUIRED: 'Please provide a reason for rejection',
    MIN_LENGTH: 'Rejection reason must be at least 10 characters',
    MAX_LENGTH: 'Rejection reason cannot exceed 500 characters',
  },
  CANCELLATION_REASON: {
    REQUIRED: 'Please provide a reason for cancellation',
    MIN_LENGTH: 'Cancellation reason must be at least 10 characters',
    MAX_LENGTH: 'Cancellation reason cannot exceed 500 characters',
  },
};

// ============================================================================
// VALIDATION UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate first name
 */
const validateFirstName = (value) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.FIRST_NAME.REQUIRED };
  }
  const trimmed = value.trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: VALIDATION_MESSAGES.FIRST_NAME.MIN_LENGTH };
  }
  if (trimmed.length > 30) {
    return { isValid: false, error: VALIDATION_MESSAGES.FIRST_NAME.MAX_LENGTH };
  }
  if (!VALIDATION_REGEX.FIRST_NAME.test(trimmed)) {
    return { isValid: false, error: VALIDATION_MESSAGES.FIRST_NAME.INVALID };
  }
  return { isValid: true };
};

/**
 * Validate last name
 */
const validateLastName = (value) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.LAST_NAME.REQUIRED };
  }
  const trimmed = value.trim();
  if (trimmed.length < 1) {
    return { isValid: false, error: VALIDATION_MESSAGES.LAST_NAME.MIN_LENGTH };
  }
  if (trimmed.length > 30) {
    return { isValid: false, error: VALIDATION_MESSAGES.LAST_NAME.MAX_LENGTH };
  }
  if (!VALIDATION_REGEX.LAST_NAME.test(trimmed)) {
    return { isValid: false, error: VALIDATION_MESSAGES.LAST_NAME.INVALID };
  }
  return { isValid: true };
};

/**
 * Validate email
 */
const validateEmail = (value) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.EMAIL.REQUIRED };
  }
  const trimmed = value.trim();
  if (trimmed.length > 255) {
    return { isValid: false, error: VALIDATION_MESSAGES.EMAIL.MAX_LENGTH };
  }
  if (!VALIDATION_REGEX.EMAIL.test(trimmed)) {
    return { isValid: false, error: VALIDATION_MESSAGES.EMAIL.INVALID };
  }
  return { isValid: true };
};

/**
 * Validate phone number (Indian format)
 */
const validatePhone = (value, strict = true) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.PHONE.REQUIRED };
  }
  const trimmed = value.trim().replace(/[\s-()]/g, ''); // Remove spaces, hyphens, parentheses
  if (trimmed.length < 10) {
    return { isValid: false, error: VALIDATION_MESSAGES.PHONE.MIN_LENGTH };
  }
  if (trimmed.length > 15) {
    return { isValid: false, error: VALIDATION_MESSAGES.PHONE.MAX_LENGTH };
  }
  if (strict) {
    if (!VALIDATION_REGEX.PHONE_INDIA.test(trimmed)) {
      return { isValid: false, error: VALIDATION_MESSAGES.PHONE.INVALID_INDIA };
    }
  } else {
    if (!VALIDATION_REGEX.PHONE_GENERAL.test(trimmed)) {
      return { isValid: false, error: VALIDATION_MESSAGES.PHONE.INVALID };
    }
  }
  return { isValid: true };
};

/**
 * Validate password
 */
const validatePassword = (value, requireStrong = false) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.PASSWORD.REQUIRED };
  }
  if (value.length < 8) {
    return { isValid: false, error: VALIDATION_MESSAGES.PASSWORD.MIN_LENGTH };
  }
  if (value.length > 128) {
    return { isValid: false, error: VALIDATION_MESSAGES.PASSWORD.MAX_LENGTH };
  }
  if (requireStrong) {
    if (!VALIDATION_REGEX.PASSWORD_STRONG.test(value)) {
      return { isValid: false, error: VALIDATION_MESSAGES.PASSWORD.STRONG_REQUIRED };
    }
  }
  return { isValid: true };
};

/**
 * Validate project title
 */
const validateProjectTitle = (value) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_TITLE.REQUIRED };
  }
  const trimmed = value.trim();
  if (trimmed.length < 3) {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_TITLE.MIN_LENGTH };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_TITLE.MAX_LENGTH };
  }
  if (!VALIDATION_REGEX.PROJECT_TITLE.test(trimmed)) {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_TITLE.INVALID };
  }
  return { isValid: true };
};

/**
 * Validate project description (checks minimum length, strips HTML)
 */
const validateProjectDescription = (value) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_DESCRIPTION.REQUIRED };
  }
  // Strip HTML tags for length check (basic regex approach)
  const plainText = value.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  if (plainText.length < VALIDATION_REGEX.PROJECT_DESCRIPTION_MIN_LENGTH) {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_DESCRIPTION.TOO_SHORT };
  }
  if (plainText.length > 5000) {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_DESCRIPTION.MAX_LENGTH };
  }
  return { isValid: true };
};

/**
 * Validate budget
 */
const validateBudget = (value, min = 1, max = 10000000) => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_BUDGET.REQUIRED };
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_BUDGET.INVALID };
  }
  if (numValue < min) {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_BUDGET.MIN };
  }
  if (numValue > max) {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_BUDGET.MAX };
  }
  if (numValue < 0) {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_BUDGET.NEGATIVE };
  }
  return { isValid: true };
};

/**
 * Validate duration (weeks)
 */
const validateDuration = (value, min = 1, max = 520) => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_DURATION.REQUIRED };
  }
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
  if (isNaN(numValue) || numValue < 1) {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_DURATION.MUST_BE_POSITIVE };
  }
  if (numValue < min) {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_DURATION.MIN };
  }
  if (numValue > max) {
    return { isValid: false, error: VALIDATION_MESSAGES.PROJECT_DURATION.MAX };
  }
  return { isValid: true };
};

/**
 * Validate remark/reason (for hold, cancel, etc.)
 */
const validateRemark = (value, minLength = 10, maxLength = 500) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.REMARK.REQUIRED };
  }
  // Strip HTML tags for length check (basic regex approach)
  const plainText = value.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  if (plainText.length < minLength) {
    return { isValid: false, error: VALIDATION_MESSAGES.REMARK.TOO_SHORT };
  }
  if (plainText.length > maxLength) {
    return { isValid: false, error: VALIDATION_MESSAGES.REMARK.MAX_LENGTH };
  }
  return { isValid: true };
};

/**
 * Validate required field
 */
const validateRequired = (value) => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED };
  }
  if (typeof value === 'string' && !value.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED };
  }
  return { isValid: true };
};

/**
 * Validate minimum length
 */
const validateMinLength = (value, minLength, fieldName = 'Field') => {
  if (!value || value.trim().length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  return { isValid: true };
};

/**
 * Validate maximum length
 */
const validateMaxLength = (value, maxLength, fieldName = 'Field') => {
  if (value && value.length > maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  }
  return { isValid: true };
};

module.exports = {
  VALIDATION_REGEX,
  VALIDATION_MESSAGES,
  // Validation functions
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateProjectTitle,
  validateProjectDescription,
  validateBudget,
  validateDuration,
  validateRemark,
  validateRequired,
  validateMinLength,
  validateMaxLength,
};

