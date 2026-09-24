const mongoose = require('mongoose');

/**
 * Token History Schema
 * Stores input sequence, requested token count, resolved model, and generated output
 */
const tokenHistorySchema = new mongoose.Schema(
  {
    input: {
      type: String,
      required: [true, 'Input text is required'],
      trim: true,
    },
    tokensRequested: {
      type: Number,
      required: [true, 'tokensRequested is required'],
      min: [1, 'tokensRequested must be at least 1'],
    },
    modelId: {
      type: Number,
      required: [true, 'modelId is required'],
    },
    modelName: {
      type: String,
      required: [true, 'modelName is required'],
      trim: true,
    },
    output: {
      type: String,
      required: [true, 'Output is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index on createdAt descending for fast history queries
tokenHistorySchema.index({ createdAt: -1 });

const TokenHistory = mongoose.model('TokenHistory', tokenHistorySchema);

module.exports = TokenHistory;
