const express = require('express');
const router = express.Router();
const {
  getNextToken,
  getNextTokenHistory,
  predictNextToken,
} = require('../controllers/next-token.controller');

// GET /get-next-token - Generate next tokens using OpenAI
router.get('/get-next-token', getNextToken);

// GET /get-next-token-history - Retrieve generation history from MongoDB
router.get('/get-next-token-history', getNextTokenHistory);

// POST /api/predict-next-token & /predict-next-token - Next-token probability distribution
router.post('/api/predict-next-token', predictNextToken);
router.post('/predict-next-token', predictNextToken);
router.get('/api/predict-next-token', predictNextToken);
router.get('/predict-next-token', predictNextToken);

module.exports = router;
