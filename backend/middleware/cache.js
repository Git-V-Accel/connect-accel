/**
 * Cache middleware for GET requests
 * Note: Caching is disabled (Redis removed)
 * @param {Number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 * @param {Function} keyGenerator - Optional function to generate cache key from request
 */
const cacheMiddleware = (ttl = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Caching disabled - pass through to next middleware
    return next();
  };
};

/**
 * Invalidate cache by pattern
 * Note: No-op since caching is disabled
 */
const invalidateCache = async (pattern) => {
  // No-op - caching disabled
};

/**
 * Invalidate cache for a specific key
 * Note: No-op since caching is disabled
 */
const invalidateCacheKey = async (key) => {
  // No-op - caching disabled
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  invalidateCacheKey,
};

