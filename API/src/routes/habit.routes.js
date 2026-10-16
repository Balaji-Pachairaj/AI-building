const express = require('express');
const router = express.Router();

const {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  getCurrentDayStatus,
  startDay,
  pressSleep,
  recordHit,
  undoHit,
  getDays,
  getDayDetails,
  getSleepLogs,
  getOverviewAnalytics,
  getSingleHabitAnalytics,
  getSleepAnalytics,
  getSleepRecords,
  updateSleepRecord,
} = require('../controllers/habit.controller');

// ==========================================
// Daily Tracking & Sleep Actions
// ==========================================
router.get('/days/current', getCurrentDayStatus);
router.post('/days/start', startDay);
router.post('/days/sleep', pressSleep);
router.get('/days', getDays);
router.get('/days/:dayNumber', getDayDetails);

// ==========================================
// Sleep Tracking & Analytics (Day N Sleep ➔ Day N+1 Wake Up)
// ==========================================
router.get('/sleep-analytics', getSleepAnalytics);
router.get('/sleep-records', getSleepRecords);
router.put('/sleep-records/:id', updateSleepRecord);
router.get('/sleep-logs', getSleepLogs);

// ==========================================
// Habit Hit Actions
// ==========================================
router.post('/hits', recordHit);
router.delete('/hits/:habitId', undoHit);

// ==========================================
// Analytics Endpoints
// ==========================================
router.get('/analytics/overview', getOverviewAnalytics);
router.get('/analytics/habit/:habitId', getSingleHabitAnalytics);

// ==========================================
// Habit CRUD
// ==========================================
router.get('/', getHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

module.exports = router;

