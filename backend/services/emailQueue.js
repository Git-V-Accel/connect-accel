const { Queue } = require('bullmq');
const { getRedisClient, isRedisAvailable } = require('../config/redis');
const { EMAIL_QUEUE_NAME } = require('../workers/emailWorker');
const { REDIS_CONFIG } = require('../constants');

let emailQueue = null;

/**
 * Get or create email queue
 */
const getEmailQueue = () => {
  if (emailQueue) {
    return emailQueue;
  }

  // Return null if Redis is not available
  if (!isRedisAvailable()) {
    return null;
  }

  const connection = {
    host: REDIS_CONFIG.HOST,
    port: REDIS_CONFIG.PORT,
    password: REDIS_CONFIG.PASSWORD,
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
  };

  emailQueue = new Queue(EMAIL_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
        count: 1000,
      },
      removeOnFail: {
        age: 24 * 3600, // Keep failed jobs for 24 hours
      },
    },
  });

  return emailQueue;
};

/**
 * Add email job to queue
 */
const addEmailJob = async (type, data, options = {}) => {
  try {
    const queue = getEmailQueue();
    if (!queue) {
      // If queue is not available, return null (emailService will handle fallback)
      return null;
    }
    const job = await queue.add(type, { type, data }, options);
    return job;
  } catch (error) {
    console.error('Error adding email job to queue:', error);
    // Return null instead of throwing - emailService will handle fallback
    return null;
  }
};

module.exports = {
  getEmailQueue,
  addEmailJob,
};

