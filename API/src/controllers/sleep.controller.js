const mongoose = require('mongoose');
const SleepRecord = require('../models/sleep-record.model');

/**
 * Format decimal hour (0-24) into a 12-hour AM/PM string in local time
 */
const formatHourToTimeStr = (decimalHour) => {
  if (isNaN(decimalHour) || decimalHour === null) return 'N/A';
  const totalMinutes = Math.round(decimalHour * 60) % (24 * 60);
  const h24 = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
};

/**
 * Classify sleep quality based on duration in decimal hours
 */
const classifySleepQuality = (hours) => {
  if (hours >= 7 && hours <= 9) return 'OPTIMAL';
  if (hours >= 6 && hours < 7) return 'FAIR';
  if (hours < 6) return 'SHORT';
  return 'LONG';
};

// =========================================================================
// SLEEP TRACKER CONTROLLERS
// =========================================================================

/**
 * GET /api/sleep/status
 * Returns current sleep tracking state:
 * - isCurrentlySleeping: boolean
 * - activeSession: object (with live elapsed hours/minutes if sleeping)
 * - lastCompletedSession: object
 * - totalSessionsCount: number
 * - nextSessionNumber: number
 */
exports.getSleepStatus = async (req, res, next) => {
  try {
    const activeSession = await SleepRecord.findOne({ status: 'SLEEPING' })
      .sort({ sleepStartTime: -1 })
      .lean();

    const lastCompletedSession = await SleepRecord.findOne({ status: 'COMPLETED' })
      .sort({ wakeUpTime: -1 })
      .lean();

    const totalSessionsCount = await SleepRecord.countDocuments({ status: 'COMPLETED' });

    if (activeSession) {
      const now = new Date();
      const liveMinutes = Math.max(0, Math.round((now - new Date(activeSession.sleepStartTime)) / 60000));
      const liveHours = Number((liveMinutes / 60).toFixed(2));

      return res.status(200).json({
        success: true,
        isCurrentlySleeping: true,
        activeSession: {
          ...activeSession,
          elapsedMinutes: liveMinutes,
          elapsedHours: liveHours,
        },
        lastCompletedSession,
        totalSessionsCount,
        nextSessionNumber: (activeSession.sleepSessionNumber || 1) + 1,
      });
    }

    res.status(200).json({
      success: true,
      isCurrentlySleeping: false,
      activeSession: null,
      lastCompletedSession,
      totalSessionsCount,
      nextSessionNumber: (lastCompletedSession?.sleepSessionNumber || 0) + 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/sleep/sleep
 * User presses "Sleep" today when going to bed.
 * Starts a new sleep session.
 */
exports.recordSleep = async (req, res, next) => {
  try {
    // Check if user is already recorded as sleeping
    let activeSession = await SleepRecord.findOne({ status: 'SLEEPING' });
    if (activeSession) {
      return res.status(200).json({
        success: true,
        message: 'A sleep session is already in progress.',
        session: activeSession,
      });
    }

    const sleepStartTime = req.body.timestamp ? new Date(req.body.timestamp) : new Date();
    const lastSession = await SleepRecord.findOne().sort({ sleepSessionNumber: -1 });
    const nextSessionNumber = lastSession ? (lastSession.sleepSessionNumber || 0) + 1 : 1;
    const fromDayNumber = lastSession?.toDayNumber || nextSessionNumber;

    const newSession = await SleepRecord.create({
      sleepSessionNumber: nextSessionNumber,
      fromDayNumber,
      sleepStartTime,
      status: 'SLEEPING',
      quality: 'IN_PROGRESS',
      notes: req.body.notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Sleep session started! Rest well and click Wake Up tomorrow.',
      session: newSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/sleep/wake-up
 * User presses "Wake Up" tomorrow when waking up.
 * Completes the active sleep session and calculates exact sleep duration.
 */
exports.recordWakeUp = async (req, res, next) => {
  try {
    let activeSession = await SleepRecord.findOne({ status: 'SLEEPING' }).sort({ sleepStartTime: -1 });

    if (!activeSession) {
      return res.status(400).json({
        success: false,
        message: 'No active sleep session found to wake up from. Please press Sleep first.',
      });
    }

    const wakeUpTime = req.body.timestamp ? new Date(req.body.timestamp) : new Date();
    const startTime = new Date(activeSession.sleepStartTime);

    const durationMs = Math.max(0, wakeUpTime.getTime() - startTime.getTime());
    const durationMinutes = Math.round(durationMs / 60000);
    const durationHours = Number((durationMinutes / 60).toFixed(2));
    const quality = classifySleepQuality(durationHours);
    const toDayNumber = (activeSession.fromDayNumber || 1) + 1;

    activeSession.wakeUpTime = wakeUpTime;
    activeSession.toDayNumber = toDayNumber;
    activeSession.durationMinutes = durationMinutes;
    activeSession.durationHours = durationHours;
    activeSession.quality = quality;
    activeSession.status = 'COMPLETED';
    if (req.body.notes) {
      activeSession.notes = activeSession.notes
        ? `${activeSession.notes} | ${req.body.notes}`
        : req.body.notes;
    }

    await activeSession.save();

    res.status(200).json({
      success: true,
      message: `Good morning! You slept for ${durationHours} hours (${quality} recovery).`,
      session: activeSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sleep/analytics
 * Comprehensive sleep analytics & charts:
 * - Average sleep duration, min, max
 * - Optimal recovery consistency percentage
 * - Average night owl bedtime & wake time
 * - Nightly sleep trend chart data
 * - Sleep quality distribution
 * - Complete history list
 */
exports.getSleepAnalytics = async (req, res, next) => {
  try {
    const sleepRecords = await SleepRecord.find({ status: 'COMPLETED' })
      .sort({ sleepStartTime: 1 })
      .lean();

    const activeSession = await SleepRecord.findOne({ status: 'SLEEPING' })
      .sort({ sleepStartTime: -1 })
      .lean();

    let isCurrentlySleeping = false;
    let liveElapsedHours = 0;
    if (activeSession) {
      isCurrentlySleeping = true;
      const liveMins = Math.max(0, Math.round((new Date() - new Date(activeSession.sleepStartTime)) / 60000));
      liveElapsedHours = Number((liveMins / 60).toFixed(2));
    }

    const totalSessions = sleepRecords.length;
    let totalSleepHours = 0;
    let minSleepHours = totalSessions > 0 ? sleepRecords[0].durationHours : 0;
    let maxSleepHours = 0;
    let optimalCount = 0;
    let bedtimeHourSum = 0;
    let wakeTimeHourSum = 0;

    const sleepQualityCounts = {
      OPTIMAL: 0,
      FAIR: 0,
      SHORT: 0,
      LONG: 0,
    };

    const sleepTrend = sleepRecords.map((r, index) => {
      totalSleepHours += r.durationHours;
      if (r.durationHours < minSleepHours) minSleepHours = r.durationHours;
      if (r.durationHours > maxSleepHours) maxSleepHours = r.durationHours;

      if (r.quality === 'OPTIMAL') optimalCount++;
      if (sleepQualityCounts[r.quality] !== undefined) {
        sleepQualityCounts[r.quality]++;
      }

      const bedD = new Date(r.sleepStartTime);
      const wakeD = new Date(r.wakeUpTime);
      bedtimeHourSum += bedD.getHours() + bedD.getMinutes() / 60;
      wakeTimeHourSum += wakeD.getHours() + wakeD.getMinutes() / 60;

      return {
        sessionNumber: r.sleepSessionNumber || index + 1,
        label: `Night #${r.sleepSessionNumber || index + 1}`,
        cycleLabel: `Day ${r.fromDayNumber} ➔ Day ${r.toDayNumber || r.fromDayNumber + 1}`,
        sleepStartTime: r.sleepStartTime,
        wakeUpTime: r.wakeUpTime,
        durationHours: r.durationHours,
        durationMinutes: r.durationMinutes,
        quality: r.quality,
        notes: r.notes || '',
      };
    });

    const avgSleepHours = totalSessions > 0 ? Number((totalSleepHours / totalSessions).toFixed(2)) : 0;
    const optimalSleepPercent = totalSessions > 0 ? Math.round((optimalCount / totalSessions) * 100) : 0;

    const avgBedtime = totalSessions > 0 ? formatHourToTimeStr(bedtimeHourSum / totalSessions) : 'N/A';
    const avgWakeTime = totalSessions > 0 ? formatHourToTimeStr(wakeTimeHourSum / totalSessions) : 'N/A';

    const qualityDistribution = [
      { name: 'Optimal (7-9h)', value: sleepQualityCounts.OPTIMAL, color: '#10b981' },
      { name: 'Fair (6-7h)', value: sleepQualityCounts.FAIR, color: '#38bdf8' },
      { name: 'Short (<6h)', value: sleepQualityCounts.SHORT, color: '#f59e0b' },
      { name: 'Long (>9h)', value: sleepQualityCounts.LONG, color: '#ec4899' },
    ];

    res.status(200).json({
      success: true,
      metrics: {
        totalSleepSessions: totalSessions,
        totalSleepHours: Number(totalSleepHours.toFixed(1)),
        avgSleepHours,
        minSleepHours,
        maxSleepHours,
        optimalCount,
        optimalSleepPercent,
        avgBedtime,
        avgWakeTime,
        isCurrentlySleeping,
        liveElapsedHours,
        activeSession,
      },
      charts: {
        sleepTrend,
        qualityDistribution,
      },
      records: [...sleepRecords].reverse(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sleep/records
 * Returns list of sleep records
 */
exports.getSleepRecords = async (req, res, next) => {
  try {
    const records = await SleepRecord.find().sort({ sleepStartTime: -1 }).lean();
    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/sleep/sessions/:id
 * Update sleep session details (notes or adjustments)
 */
exports.updateSleepSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.durationHours && !updates.quality) {
      updates.quality = classifySleepQuality(Number(updates.durationHours));
    }

    const session = await SleepRecord.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Sleep session not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Sleep session updated successfully',
      session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/sleep/sessions/:id
 * Delete a sleep session
 */
exports.deleteSleepSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await SleepRecord.findByIdAndDelete(id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Sleep session not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Sleep session deleted successfully',
      deletedId: id,
    });
  } catch (error) {
    next(error);
  }
};

