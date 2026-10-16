const mongoose = require('mongoose');

/**
 * Habit Schema
 * Defines a tracked habit, its target duration, category, and metadata.
 */
const habitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Habit title is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Habit unique code is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'General',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    targetMinutes: {
      type: Number,
      required: [true, 'Target duration in minutes is required'],
      min: [1, 'Target minutes must be at least 1 minute'],
      default: 45,
    },
    targetDurationText: {
      type: String,
      trim: true,
      default: '45 mins',
    },
    targetQuantityText: {
      type: String,
      trim: true,
      default: '1 session',
    },
    color: {
      type: String,
      trim: true,
      default: '#6366f1',
    },
    icon: {
      type: String,
      trim: true,
      default: 'CheckCircle',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes (code already has unique index defined on field)
habitSchema.index({ order: 1 });
habitSchema.index({ isActive: 1 });

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;
