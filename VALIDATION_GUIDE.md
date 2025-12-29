# Validation Constants & Utilities Guide

This document describes the comprehensive validation system implemented for all input fields across the application.

## Files Created

### Frontend
- **`frontend/src/constants/validationConstants.ts`** - Main validation constants, regex patterns, error messages, and validation functions
- **`frontend/src/utils/validation.ts`** - Validation utility helpers

### Backend
- **`backend/constants/validationConstants.js`** - Backend validation constants (mirrors frontend structure)

## Usage Examples

### Frontend Usage

#### Basic Validation
```typescript
import { validateEmail, validatePhone, VALIDATION_MESSAGES } from '../constants/validationConstants';

// Validate email
const emailResult = validateEmail(emailValue);
if (!emailResult.isValid) {
  console.error(emailResult.error); // Shows custom error message
}

// Validate phone
const phoneResult = validatePhone(phoneValue, true); // true = strict Indian format
if (!phoneResult.isValid) {
  console.error(phoneResult.error);
}
```

#### Using Validation Functions in Forms
```typescript
import { validateFirstName, validateLastName, validateEmail, validatePhone } from '../constants/validationConstants';

const validate = () => {
  const errors: Record<string, string> = {};

  // Use validation functions
  const firstNameResult = validateFirstName(firstName);
  if (!firstNameResult.isValid) {
    errors.firstName = firstNameResult.error || 'Invalid first name';
  }

  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error || 'Invalid email';
  }

  return errors;
};
```

#### Using Regex Patterns Directly
```typescript
import { VALIDATION_REGEX } from '../constants/validationConstants';

// Check if value matches pattern
if (VALIDATION_REGEX.EMAIL.test(emailValue)) {
  // Email is valid
}

if (VALIDATION_REGEX.PHONE_INDIA.test(phoneValue)) {
  // Phone is valid Indian format
}
```

#### Using Error Messages Directly
```typescript
import { VALIDATION_MESSAGES } from '../constants/validationConstants';

// Show error messages
setError(VALIDATION_MESSAGES.EMAIL.REQUIRED);
setError(VALIDATION_MESSAGES.PASSWORD.MIN_LENGTH);
setError(VALIDATION_MESSAGES.PROJECT_TITLE.REQUIRED);
```

### Backend Usage

```javascript
const { validateEmail, validatePhone, validateProjectTitle, VALIDATION_MESSAGES } = require('../constants/validationConstants');

// In controller
const emailResult = validateEmail(req.body.email);
if (!emailResult.isValid) {
  return res.status(400).json({
    success: false,
    message: emailResult.error
  });
}

// Using regex directly
const { VALIDATION_REGEX } = require('../constants/validationConstants');
if (!VALIDATION_REGEX.EMAIL.test(email)) {
  return res.status(400).json({
    success: false,
    message: VALIDATION_MESSAGES.EMAIL.INVALID
  });
}
```

## Available Validation Functions

### User Fields
- `validateFirstName(value: string)` - Validates first name (2-30 chars, letters only)
- `validateLastName(value: string)` - Validates last name (1-30 chars, letters only)
- `validateEmail(value: string)` - Validates email format
- `validatePhone(value: string, strict?: boolean)` - Validates phone (Indian format by default)
- `validatePassword(value: string, requireStrong?: boolean)` - Validates password (min 8 chars, optional strong validation)

### Project Fields
- `validateProjectTitle(value: string)` - Validates project title (3-100 chars)
- `validateProjectDescription(value: string)` - Validates description (min 20 chars, strips HTML)
- `validateBudget(value: string | number, min?: number, max?: number)` - Validates budget amount
- `validateDuration(value: string | number, min?: number, max?: number)` - Validates duration in weeks

### General Fields
- `validateRemark(value: string, minLength?: number, maxLength?: number)` - Validates remarks/reasons
- `validateRequired(value: any)` - Validates required field
- `validateMinLength(value: string, minLength: number, fieldName?: string)` - Validates minimum length
- `validateMaxLength(value: string, maxLength: number, fieldName?: string)` - Validates maximum length

## Available Regex Patterns

### User Patterns
- `VALIDATION_REGEX.FIRST_NAME` - `/^[A-Za-z\s'-]{2,30}$/`
- `VALIDATION_REGEX.LAST_NAME` - `/^[A-Za-z\s'-]{1,30}$/`
- `VALIDATION_REGEX.FULL_NAME` - `/^[A-Za-z\s'-]{3,60}$/`
- `VALIDATION_REGEX.EMAIL` - Email pattern
- `VALIDATION_REGEX.PHONE_INDIA` - Indian phone (starts with 6-9, 10 digits)
- `VALIDATION_REGEX.PHONE_GENERAL` - General 10-digit phone
- `VALIDATION_REGEX.PASSWORD_STRONG` - Strong password (uppercase, lowercase, number, special char)
- `VALIDATION_REGEX.PASSWORD_MEDIUM` - Medium password (uppercase, lowercase, number)

### Project Patterns
- `VALIDATION_REGEX.PROJECT_TITLE` - Project title pattern
- `VALIDATION_REGEX.BUDGET` - Budget number pattern
- `VALIDATION_REGEX.BUDGET_POSITIVE` - Positive budget (1 or more)
- `VALIDATION_REGEX.DURATION_WEEKS` - Duration weeks (positive integer)

### Other Patterns
- `VALIDATION_REGEX.URL` - URL pattern
- `VALIDATION_REGEX.URL_STRICT` - Strict URL pattern
- `VALIDATION_REGEX.USER_ID` - User ID pattern
- `VALIDATION_REGEX.COMPANY_NAME` - Company name pattern
- `VALIDATION_REGEX.GSTIN` - GSTIN pattern
- `VALIDATION_REGEX.PAN` - PAN pattern
- `VALIDATION_REGEX.PINCODE_INDIA` - Indian pincode (6 digits, not starting with 0)
- `VALIDATION_REGEX.CITY` - City name pattern
- `VALIDATION_REGEX.STATE` - State name pattern
- `VALIDATION_REGEX.ADDRESS` - Address pattern
- `VALIDATION_REGEX.DATE_YYYY_MM_DD` - Date format YYYY-MM-DD
- `VALIDATION_REGEX.TIME_24H` - 24-hour time format
- `VALIDATION_REGEX.FILE_EXTENSION_IMAGE` - Image file extensions
- `VALIDATION_REGEX.FILE_EXTENSION_DOCUMENT` - Document file extensions

## Error Message Categories

All error messages are organized by field type:

- `VALIDATION_MESSAGES.FIRST_NAME.*`
- `VALIDATION_MESSAGES.LAST_NAME.*`
- `VALIDATION_MESSAGES.EMAIL.*`
- `VALIDATION_MESSAGES.PHONE.*`
- `VALIDATION_MESSAGES.PASSWORD.*`
- `VALIDATION_MESSAGES.PROJECT_TITLE.*`
- `VALIDATION_MESSAGES.PROJECT_DESCRIPTION.*`
- `VALIDATION_MESSAGES.PROJECT_BUDGET.*`
- `VALIDATION_MESSAGES.PROJECT_DURATION.*`
- `VALIDATION_MESSAGES.PROJECT_SKILLS.*`
- `VALIDATION_MESSAGES.BID_AMOUNT.*`
- `VALIDATION_MESSAGES.MILESTONE_TITLE.*`
- `VALIDATION_MESSAGES.REMARK.*`
- `VALIDATION_MESSAGES.REQUIRED` - General required field message
- And many more...

## Best Practices

1. **Always use validation functions** instead of inline regex checks for consistency
2. **Use VALIDATION_MESSAGES** for all error messages to ensure consistency
3. **Validate on both frontend and backend** - Frontend for UX, backend for security
4. **Strip HTML tags** before validating text length for rich text editors
5. **Use strict phone validation** (true) for Indian phone numbers
6. **Provide clear, user-friendly error messages** using the predefined messages

## Integration with Forms

### React Hook Form Example
```typescript
import { useForm } from 'react-hook-form';
import { validateEmail, validatePhone } from '../constants/validationConstants';

const { register, formState: { errors } } = useForm({
  resolver: async (data) => {
    const errors: any = {};
    
    const emailResult = validateEmail(data.email);
    if (!emailResult.isValid) errors.email = { message: emailResult.error };
    
    const phoneResult = validatePhone(data.phone);
    if (!phoneResult.isValid) errors.phone = { message: phoneResult.error };
    
    return { values: data, errors };
  }
});
```

### Manual Validation Example
```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  const validationErrors: Record<string, string> = {};
  
  // Validate all fields
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) validationErrors.email = emailResult.error || '';
  
  const phoneResult = validatePhone(formData.phone);
  if (!phoneResult.isValid) validationErrors.phone = phoneResult.error || '';
  
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  // Proceed with submission
};
```

## Notes

- All validation functions return a `ValidationResult` object with `isValid: boolean` and optional `error: string`
- HTML tags are automatically stripped when validating rich text fields (descriptions, remarks)
- Phone validation defaults to strict Indian format (starts with 6-9, exactly 10 digits)
- Password validation can optionally require strong passwords (uppercase, lowercase, number, special char)
- All validation is case-sensitive where appropriate (emails are normalized to lowercase on backend)
- Budget and duration validations accept both string and number types

