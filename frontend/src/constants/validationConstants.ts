export const VALIDATION_MESSAGES = {
    FIRST_NAME: {
        REQUIRED: 'First name is required',
        MIN_LENGTH: 'First name must be at least 3 characters',
        MAX_LENGTH: 'First name cannot exceed 30 characters',
        INVALID_CHARACTERS: 'First name can only contain letters (no numbers or special characters)',
    },
    LAST_NAME: {
        REQUIRED: 'Last name is required',
        MIN_LENGTH: 'Last name must be at least 1 character',
        MAX_LENGTH: 'Last name cannot exceed 30 characters',
        INVALID_CHARACTERS: 'Last name can only contain letters (no numbers or special characters)',
    },
    EMAIL: {
        REQUIRED: 'Email address is required',
        INVALID: 'Please enter a valid email address',
    },
    PHONE: {
        REQUIRED: 'Phone number is required',
        INVALID: 'Please enter a valid phone number (10 digits)',
    },
    PASSWORD: {
        REQUIRED: 'Password is required',
        MIN_LENGTH: 'Password must be at least 8 characters',
        MISMATCH: 'Passwords do not match',
        REQUIREMENTS: 'Password does not meet the requirements',
    },
    TERMS: {
        REQUIRED: 'Please accept the terms and conditions',
    },
};

export const NAME_REGEX = /^[A-Za-z]+$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[0-9]{10}$/;
