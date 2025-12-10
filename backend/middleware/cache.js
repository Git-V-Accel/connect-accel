const { getRedisClient, isRedisAvailable } = require('../config/redis');

/**
 * Cache middleware for GET requests
 * @param {Number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 * @param {Function} keyGenerator - Optional function to generate cache key from request
 */
const cacheMiddleware = (ttl = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Check if Redis is available
      if (!isRedisAvailable()) {
        return next();
      }

      const redis = getRedisClient();
      
      // Generate cache key
      const cacheKey = keyGenerator
        ? keyGenerator(req)
        : `cache:${req.originalUrl}:${JSON.stringify(req.query)}:${req.user?.id || 'anonymous'}`;

      // Try to get from cache
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Store original json function
      const originalJson = res.json.bind(res);

      // Override json to cache the response
      res.json = function (data) {
        // Cache the response only if Redis is available
        if (isRedisAvailable()) {
          redis.setex(cacheKey, ttl, JSON.stringify(data)).catch(err => {
            // Silently fail - caching is optional
          });
        }
        
        // Call original json
        return originalJson(data);
      };

      next();
    } catch (error) {
      // If Redis fails, continue without caching
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Invalidate cache by pattern
 */
const invalidateCache = async (pattern) => {
  try {
    if (!isRedisAvailable()) return;
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    // Silently fail - caching is optional
  }
};

/**
 * Invalidate cache for a specific key
 */
const invalidateCacheKey = async (key) => {
  try {
    if (!isRedisAvailable()) return;
    const redis = getRedisClient();
    await redis.del(key);
  } catch (error) {
    // Silently fail - caching is optional
  }
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  invalidateCacheKey,
};

