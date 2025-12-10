const crypto = require('crypto');

/**
 * Generate a random password with specified length and character sets
 * @param {number} length - Length of the password (default: 12)
 * @param {object} options - Options for password generation
 * @returns {string} Generated password
 */
const generateRandomPassword = (length = 12, options = {}) => {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = true
  } = options;

  let charset = '';
  
  if (includeLowercase) {
    charset += 'abcdefghijklmnopqrstuvwxyz';
  }
  
  if (includeUppercase) {
    charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  
  if (includeNumbers) {
    charset += '0123456789';
  }
  
  if (includeSymbols) {
    charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }
  
  // Remove similar characters if requested
  if (excludeSimilar) {
    charset = charset.replace(/[0O1lI]/g, '');
  }

  if (charset.length === 0) {
    throw new Error('At least one character set must be included');
  }

  let password = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
};

/**
 * Generate a secure temporary password for new users
 * @returns {string} Generated temporary password
 */
const generateTemporaryPassword = () => {
  return generateRandomPassword(12, {
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false, // Exclude symbols for easier typing
    excludeSimilar: true
  });
};

module.exports = {
  generateRandomPassword,
  generateTemporaryPassword
};
