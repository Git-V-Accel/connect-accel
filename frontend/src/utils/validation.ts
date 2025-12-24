/**
 * Validation Utilities
 * Helper functions for form validation using validation constants
 */

import {
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
  VALIDATION_REGEX,
  VALIDATION_MESSAGES,
  type ValidationResult,
} from '../constants/validationConstants';

/**
 * Validate form fields and return errors object
 */
export const validateForm = (fields: Record<string, any>, rules: Record<string, (value: any) => ValidationResult>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.keys(rules).forEach((fieldName) => {
    const validator = rules[fieldName];
    const value = fields[fieldName];
    const result = validator(value);
    
    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
    }
  });
  
  return errors;
};

/**
 * Strip HTML tags from text for validation
 */
export const stripHtmlTags = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Get plain text length from HTML content
 */
export const getPlainTextLength = (html: string): number => {
  return stripHtmlTags(html).trim().length;
};

// Re-export validation functions and constants for convenience
export {
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
  VALIDATION_REGEX,
  VALIDATION_MESSAGES,
};

export type { ValidationResult };

