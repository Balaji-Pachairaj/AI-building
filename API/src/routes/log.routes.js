const express = require('express');
const router = express.Router();
const {
  recordHit,
  getAllLogs,
  getLogById,
  clearAllLogs,
} = require('../controllers/log.controller');

// Hit endpoint: records hit time and hit body to MongoDB
router.post('/hit', recordHit);

// Get all logs & Delete all logs
router.route('/')
  .get(getAllLogs)
  .delete(clearAllLogs);

// Get single log by ID
router.get('/:id', getLogById);

module.exports = router;
