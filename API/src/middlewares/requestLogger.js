const Log = require('../models/log.model');

/**
 * Middleware that automatically logs incoming requests into MongoDB Log model
 * Can be plugged into any route to automatically record hits
 */
const autoHitLogger = async (req, res, next) => {
  // Capture start time
  const hitTime = new Date();

  // Attach listener on finish to log after request completes
  res.on('finish', async () => {
    try {
      // Don't auto-log static files or health checks to prevent spam
      if (req.originalUrl === '/api/health' || req.originalUrl === '/favicon.ico') {
        return;
      }

      await Log.create({
        hitTime,
        hitBody: req.body || {},
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
        userAgent: req.get('user-agent'),
      });
    } catch (err) {
      console.error(`[AutoHitLogger] Failed to save log: ${err.message}`);
    }
  });

  next();
};

module.exports = {
  autoHitLogger,
};
