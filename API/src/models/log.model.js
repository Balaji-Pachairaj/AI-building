const mongoose = require('mongoose');

/**
 * Log Schema
 * Stores hit timestamp, request body, and request metadata
 */
const logSchema = new mongoose.Schema(
  {
    hitTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    hitBody: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    endpoint: {
      type: String,
      trim: true,
    },
    method: {
      type: String,
      trim: true,
      uppercase: true,
    },
    ip: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index on hitTime for fast chronological queries
logSchema.index({ hitTime: -1 });

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
