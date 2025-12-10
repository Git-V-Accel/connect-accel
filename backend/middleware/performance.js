/**
 * Performance monitoring middleware
 * Logs slow endpoints and response times
 */

const SLOW_ENDPOINT_THRESHOLD = 1000; // 1 second in milliseconds

const performanceLogger = (req, res, next) => {
  const startTime = Date.now();

  // Override res.end to measure response time
  const originalEnd = res.end.bind(res);

  res.end = function (chunk, encoding) {
    const duration = Date.now() - startTime;
    const isSlow = duration > SLOW_ENDPOINT_THRESHOLD;

    if (isSlow) {
      console.warn(`[SLOW ENDPOINT] ${req.method} ${req.originalUrl} - ${duration}ms`, {
        method: req.method,
        path: req.originalUrl,
        duration,
        user: req.user?.id || 'anonymous',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString(),
      });
    }

    // Log all requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${req.method}] ${req.originalUrl} - ${duration}ms`);
    }

    // Call original end
    return originalEnd(chunk, encoding);
  };

  next();
};

module.exports = performanceLogger;

