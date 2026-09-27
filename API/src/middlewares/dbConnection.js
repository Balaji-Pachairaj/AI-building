const mongoose = require('mongoose');
const connectDB = require('../config/db');

/**
 * Database Connection Middleware
 * Ensures MongoDB is connected before any route handlers execute.
 * Essential for Serverless environments (like Vercel) where server startup hooks
 * do not run persistently and instances can be cold-started.
 */
const dbConnectionMiddleware = async (req, res, next) => {
  try {
    // If readyState is 1 (connected), proceed immediately without overhead
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return next();
    }

    // Connect to MongoDB or wait for existing connection promise
    await connectDB();
    next();
  } catch (error) {
    console.error(`[dbConnectionMiddleware] Database connection error: ${error.message}`);
    return res.status(503).json({
      success: false,
      message: 'Database connection failed. Please verify MongoDB connection string or cluster status.',
      error: error.message,
    });
  }
};

module.exports = dbConnectionMiddleware;
