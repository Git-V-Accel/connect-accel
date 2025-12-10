const mongoose = require('mongoose');

/**
 * Health check endpoint handler
 */
const healthCheck = async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {},
  };

  // Check MongoDB
  try {
    const mongoState = mongoose.connection.readyState;
    const mongoStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    health.services.mongodb = {
      status: mongoState === 1 ? 'OK' : 'ERROR',
      state: mongoStates[mongoState] || 'unknown',
    };
  } catch (error) {
    health.services.mongodb = {
      status: 'ERROR',
      error: error.message,
    };
  }

  // Determine overall status
  const allServicesHealthy = Object.values(health.services).every(
    (service) => service.status === 'OK'
  );

  if (!allServicesHealthy) {
    health.status = 'DEGRADED';
  }

  const statusCode = allServicesHealthy ? 200 : 503;
  res.status(statusCode).json(health);
};

module.exports = healthCheck;

