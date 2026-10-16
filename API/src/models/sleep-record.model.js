const mongoose = require('mongoose');

/**
 * SleepRecord Schema
 * Dedicated model to track nightly sleep sessions between Day N Sleep and Day N+1 Wake Up.
 * Starts when user clicks the Sleep button (e.g. Day 1 sleep onwards)
 * Completes when user clicks Wake Up on the following day.
 */
const sleepRecordSchema = new mongoose.Schema(
  {
    sleepSessionNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    fromDayNumber: {
      type: Number,
      required: [true, 'From Day Number is required'],
      default: 1,
    },
    toDayNumber: {
      type: Number,
      default: null, // Set when next day is started with Wake Up
    },
    fromDayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HabitDay',
      default: null,
    },
    toDayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HabitDay',
      default: null,
    },
    sleepStartTime: {
      type: Date,
      required: [true, 'Sleep start time is required'],
      default: Date.now,
    },
    wakeUpTime: {
      type: Date,
      default: null, // Set when Wake Up button is pressed
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
    durationHours: {
      type: Number,
      default: 0, // Decimal hours (e.g. 7.50)
    },
    status: {
      type: String,
      enum: ['SLEEPING', 'COMPLETED'],
      default: 'SLEEPING',
    },
    quality: {
      type: String,
      enum: ['OPTIMAL', 'FAIR', 'SHORT', 'LONG', 'IN_PROGRESS'],
      default: 'IN_PROGRESS',
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

// Indexes for fast chronological lookups and metrics
sleepRecordSchema.index({ sleepStartTime: -1 });
sleepRecordSchema.index({ status: 1 });
sleepRecordSchema.index({ fromDayNumber: -1 });
sleepRecordSchema.index({ toDayNumber: -1 });

const SleepRecord = mongoose.model('SleepRecord', sleepRecordSchema);

module.exports = SleepRecord;

