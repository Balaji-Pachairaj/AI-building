const express = require('express');
const router = express.Router();
const {
  getTags,
  createTag,
  deleteTag,
  createTransaction,
  getTransactions,
  deleteTransaction,
  getDashboardSummary,
  getTagAnalysis,
  getBudgetSettings,
  updateBudgetSettings,
} = require('../controllers/budget.controller');

// Dashboard Overview
router.get('/dashboard', getDashboardSummary);

// Tags
router.route('/tags')
  .get(getTags)
  .post(createTag);

router.delete('/tags/:id', deleteTag);

// Tag Analysis
router.get('/tags/:tagName/analysis', getTagAnalysis);

// Transactions
router.route('/transactions')
  .get(getTransactions)
  .post(createTransaction);

router.delete('/transactions/:id', deleteTransaction);

// Budget Settings
router.route('/settings')
  .get(getBudgetSettings)
  .put(updateBudgetSettings);

module.exports = router;
