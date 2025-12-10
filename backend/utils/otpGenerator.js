/**
 * Generate a random 6-digit OTP code
 * @returns {string} 6-digit OTP code
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate OTP with expiration time
 * @param {number} expiryMinutes - OTP expiration time in minutes (default: 10)
 * @returns {Object} Object containing otpCode and otpExpire timestamp
 */
const generateOTPWithExpiry = (expiryMinutes = 10) => {
  const otpCode = generateOTP();
  const otpExpire = Date.now() + (expiryMinutes * 60 * 1000); // Convert minutes to milliseconds

  return {
    otpCode,
    otpExpire: new Date(otpExpire)
  };
};

module.exports = {
  generateOTP,
  generateOTPWithExpiry
};

