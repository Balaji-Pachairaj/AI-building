const express = require('express');
const router = express.Router();
const { getModelsId } = require('../controllers/models.controller');

// GET /get-models-id - List available models with internal IDs ordered by cost
router.get('/get-models-id', getModelsId);

module.exports = router;
