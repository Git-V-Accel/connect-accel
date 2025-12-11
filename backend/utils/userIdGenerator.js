const User = require('../models/User');
const { USER_ROLES } = require('../constants');

/**
 * Get user ID prefix based on role
 * @param {string} role - User role
 * @returns {string} - Prefix for user ID
 */
const getUserPrefix = (role) => {
  switch (role) {
    case USER_ROLES.SUPERADMIN:
    case USER_ROLES.ADMIN:
      return 'ADMIN';
    case USER_ROLES.FREELANCER:
      return 'USR';
    case USER_ROLES.CLIENT:
      return 'CLIENT';
    case USER_ROLES.AGENT:
      return 'AGENT';
    default:
      return 'USR';
  }
};

/**
 * Generate a unique user ID based on user role
 * @param {string} role - User role (superadmin, admin, freelancer, client, agent)
 * @returns {Promise<string>} - Generated user ID
 */
const generateUserId = async (role) => {
  try {
    const prefix = getUserPrefix(role);
    let count = 1;

    // Find the highest existing user ID for this prefix
    const existingUsers = await User.find({
      userID: { $regex: `^${prefix}-` }
    }).sort({ userID: -1 }).limit(1);

    if (existingUsers.length > 0) {
      // Extract the number from the last user ID
      const lastUserId = existingUsers[0].userID;
      const match = lastUserId.match(new RegExp(`^${prefix}-(\\d+)$`));
      if (match) {
        count = parseInt(match[1]) + 1;
      }
    }

    // Generate the new user ID
    const userId = `${prefix}-${count.toString().padStart(4, '0')}`;

    // Double-check that this ID doesn't exist (race condition protection)
    const existingUser = await User.findOne({ userID: userId });
    if (existingUser) {
      // If it exists, try again with incremented count
      return await generateUserId(role);
    }

    return userId;
  } catch (error) {
    console.error('Error generating user ID:', error);
    throw new Error('Failed to generate user ID');
  }
};

/**
 * Generate user ID for existing users (migration helper)
 * @param {string} role - User role
 * @param {number} customCount - Custom count to start from
 * @returns {string} - Generated user ID
 */
const generateUserIdWithCustomCount = (role, customCount = 1) => {
  const prefix = getUserPrefix(role);
  return `${prefix}-${customCount.toString().padStart(4, '0')}`;
};

module.exports = {
  generateUserId,
  generateUserIdWithCustomCount,
  getUserPrefix
};
