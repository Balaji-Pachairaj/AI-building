const express = require('express');
const router = express.Router();

const buildingStuffsRoutes = require('./buildingStuffs.routes');
const budgetRoutes = require('./budget.routes');
const logRoutes = require('./log.routes');
const nextTokenRoutes = require('./next-token.routes');
const modelsRoutes = require('./models.routes');
const habitRoutes = require('./habit.routes');
const sleepRoutes = require('./sleep.routes');
const { recordHit } = require('../controllers/log.controller');

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// Direct hit endpoint: /api/hit
router.post('/hit', recordHit);

// Feature routes
router.use('/sleep', sleepRoutes);
router.use('/habits', habitRoutes);
router.use('/budget', budgetRoutes);
router.use('/building-stuffs', buildingStuffsRoutes);
router.use('/logs', logRoutes);
router.use('/', nextTokenRoutes);
router.use('/', modelsRoutes);

module.exports = router;

