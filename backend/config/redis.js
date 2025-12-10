const Redis = require('ioredis');
const { REDIS_CONFIG } = require('../constants');

let redisClient = null;
let redisAvailable = false;

const getRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  const redisConfig = {
    host: REDIS_CONFIG.HOST,
    port: REDIS_CONFIG.PORT,
    password: REDIS_CONFIG.PASSWORD,
    retryStrategy: (times) => {
      // Stop retrying after 5 attempts
      if (times > 5) {
        console.warn('Redis: Max retry attempts reached. Redis features will be disabled.');
        redisAvailable = false;
        return null; // Stop retrying
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: null, // Disable max retries for lazy connections
    enableReadyCheck: true,
    lazyConnect: true,
    enableOfflineQueue: false, // Don't queue commands when offline
    connectTimeout: 5000,
  };

  redisClient = new Redis(redisConfig);

  redisClient.on('connect', () => {
    console.log('Redis client connected');
    redisAvailable = true;
  });

  redisClient.on('ready', () => {
    console.log('Redis client ready');
    redisAvailable = true;
  });

  redisClient.on('error', (err) => {
    // Suppress connection errors when Redis is not available
    const isConnectionError = 
      err.code === 'ECONNREFUSED' || 
      err.message?.includes('ECONNREFUSED') ||
      err.message?.includes('Connection is closed') ||
      err.code === 'ENOTFOUND' ||
      err.code === 'ETIMEDOUT';
    
    // Only log non-connection errors or if we were previously connected
    if (!isConnectionError || redisAvailable) {
      if (!isConnectionError) {
        console.error('Redis client error:', err.message || err);
      }
    }
    redisAvailable = false;
  });

  redisClient.on('close', () => {
    if (redisAvailable) {
      console.log('Redis client connection closed');
    }
    redisAvailable = false;
  });

  redisClient.on('reconnecting', (delay) => {
    console.log(`Redis client reconnecting in ${delay}ms...`);
  });

  // Try to connect, but don't fail if it doesn't work
  redisClient.connect().catch(() => {
    // Silently fail - Redis is optional
    redisAvailable = false;
  });

  return redisClient;
};

// Check if Redis is available
const isRedisAvailable = () => {
  return redisAvailable && redisClient && redisClient.status === 'ready';
};

const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

module.exports = {
  getRedisClient,
  closeRedisConnection,
  isRedisAvailable,
};

