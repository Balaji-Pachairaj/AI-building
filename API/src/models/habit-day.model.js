const mongoose = require('mongoose');

/**
 * HabitDay Schema
 * Represents a discrete tracked day bounded between start and sleep button press.
 * Holds start time, end time, total hours active, and aggregate completion stats.
 */
const habitDaySchema = new mongoose.Schema(
  {
    dayNumber: {
      type: Number,
      required: [true, 'Day number is required'],
      unique: true,
      min: [1, 'Day number must be at least 1'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null, // Set when user presses "Sleep"
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED'],
      default: 'ACTIVE',
    },
    totalHours: {
      type: Number,
      default: 0, // Calculated decimal hours between startTime and endTime (e.g. 14.25)
    },
    totalMinutes: {
      type: Number,
      default: 0,
    },
    sleepEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SleepEvent',
      default: null,
    },
    completedHabitsCount: {
      type: Number,
      default: 0,
    },
    totalHabitsCount: {
      type: Number,
      default: 11,
    },
    completionRate: {
      type: Number,
      default: 0, // percentage 0 - 100
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

// Indexes for fast chronological lookups and analytics
habitDaySchema.index({ dayNumber: -1 });
habitDaySchema.index({ startTime: -1 });
habitDaySchema.index({ status: 1 });

const HabitDay = mongoose.model('HabitDay', habitDaySchema);

module.exports = HabitDay;

