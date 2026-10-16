const mongoose = require('mongoose');

/**
 * HabitHit Schema
 * Records the timestamp and day linkage every time the user hits a habit button.
 * Enforces habitId, timestamp, and dayId linkage.
 */
const habitHitSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: [true, 'Habit reference ID is required'],
    },
    dayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HabitDay',
      required: [true, 'Day reference ID is required'],
    },
    dayNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    timestamp: {
      type: Date,
      required: [true, 'Hit timestamp is required'],
      default: Date.now,
    },
    completed: {
      type: Boolean,
      default: true,
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

// Indexes
habitHitSchema.index({ dayId: 1, habitId: 1 }, { unique: true });
habitHitSchema.index({ habitId: 1, timestamp: -1 });
habitHitSchema.index({ timestamp: -1 });

const HabitHit = mongoose.model('HabitHit', habitHitSchema);

module.exports = HabitHit;

