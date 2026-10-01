const mongoose = require('mongoose');

/**
 * Tag Schema
 * Stores unique tags in lowercase for case-insensitive money management.
 */
const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    color: {
      type: String,
      default: '#e1306c',
      trim: true,
    },
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

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
