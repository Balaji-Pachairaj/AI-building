const express = require('express');
const router = express.Router();
const sleepController = require('../controllers/sleep.controller');

/**
 * Sleep Tracker API Routes
 * Clean, dedicated endpoints for Sleep & Wake-up tracking and analytics.
 */

// 1. Current tracking status (is user currently sleeping? active session details, stats)
router.get('/status', sleepController.getSleepStatus);

// 2. User presses "Sleep" today when going to bed
router.post('/sleep', sleepController.recordSleep);

// 3. User presses "Wake Up" tomorrow when waking up
router.post('/wake-up', sleepController.recordWakeUp);

// 4. Sleep Analytics & ECharts aggregated data
router.get('/analytics', sleepController.getSleepAnalytics);

// 5. Complete list of sleep records
router.get('/records', sleepController.getSleepRecords);

// 6. Update a sleep session (notes or manual duration adjustment)
router.put('/sessions/:id', sleepController.updateSleepSession);

// 7. Delete a sleep session
router.delete('/sessions/:id', sleepController.deleteSleepSession);

module.exports = router;

