const mongoose = require('mongoose');

/**
 * Transaction Schema
 * Stores expense transactions with amount, timestamp, and array of lowercase tags.
 */
const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0, 'Transaction amount must be greater than or equal to 0'],
    },
    time: {
      type: Date,
      required: [true, 'Transaction time is required'],
      default: Date.now,
    },
    tags: [
      {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    ],
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for high performance date-range queries & tag aggregations
transactionSchema.index({ time: -1 });
transactionSchema.index({ tags: 1, time: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
