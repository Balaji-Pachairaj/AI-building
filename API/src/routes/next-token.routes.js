const express = require('express');
const router = express.Router();
const {
  getNextToken,
  getNextTokenHistory,
} = require('../controllers/next-token.controller');

// GET /get-next-token - Generate next tokens using OpenAI
router.get('/get-next-token', getNextToken);

// GET /get-next-token-history - Retrieve generation history from MongoDB
router.get('/get-next-token-history', getNextTokenHistory);

module.exports = router;
