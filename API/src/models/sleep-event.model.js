const mongoose = require('mongoose');

/**
 * SleepEvent Schema
 * Tracks every Sleep button press (and Start tracking press).
 * Stores timestamp and calculates the exact duration between consecutive sleep events.
 */
const sleepEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ['START', 'SLEEP'],
      required: [true, 'Event type is required'],
      default: 'SLEEP',
    },
    dayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HabitDay',
      default: null,
    },
    dayNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      default: Date.now,
    },
    hoursSincePreviousSleep: {
      type: Number,
      default: null, // Time elapsed between this sleep press and the prior sleep press
    },
    notes: {
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

sleepEventSchema.index({ timestamp: -1 });
sleepEventSchema.index({ dayId: 1 });
sleepEventSchema.index({ eventType: 1 });

const SleepEvent = mongoose.model('SleepEvent', sleepEventSchema);

module.exports = SleepEvent;

