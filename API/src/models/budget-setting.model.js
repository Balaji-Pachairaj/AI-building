const mongoose = require('mongoose');

/**
 * Budget Setting Schema
 * Stores customizable monthly budget for calculating Money Remaining
 */
const budgetSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'monthly_budget',
      unique: true,
      trim: true,
    },
    monthlyBudget: {
      type: Number,
      default: 50000,
      min: [0, 'Budget must be at least 0'],
    },
    currency: {
      type: String,
      default: '₹',
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const BudgetSetting = mongoose.model('BudgetSetting', budgetSettingSchema);

module.exports = BudgetSetting;
