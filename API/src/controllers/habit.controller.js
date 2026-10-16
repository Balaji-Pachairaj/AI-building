const mongoose = require('mongoose');
const Habit = require('../models/habit.model');
const HabitDay = require('../models/habit-day.model');
const SleepEvent = require('../models/sleep-event.model');
const HabitHit = require('../models/habit-hit.model');
const SleepRecord = require('../models/sleep-record.model');

// =========================================================================
// Default 11 Habits (From user photo, nicely rephrased & categorized)
// =========================================================================
const DEFAULT_HABITS = [
  {
    title: 'AI Research Foundation Study',
    code: 'ai-research-foundation',
    category: 'Learning & AI',
    description: 'Read, break down, and synthesize 1 page of foundational AI research literature.',
    targetMinutes: 60,
    targetDurationText: '1 hour',
    targetQuantityText: '1 page deep analysis',
    color: '#8b5cf6',
    icon: 'Brain',
    order: 1,
  },
  {
    title: 'Mindful Series & Downtime',
    code: 'mindful-series-episode',
    category: 'Recharge & Media',
    description: 'Watch 1 episode of your chosen series to unwind and reset mental energy.',
    targetMinutes: 90,
    targetDurationText: '1.5 hours',
    targetQuantityText: '1 episode',
    color: '#ec4899',
    icon: 'Tv',
    order: 2,
  },
  {
    title: 'DSA Problem Solving & Analysis',
    code: 'dsa-problem-solving',
    category: 'Engineering & Code',
    description: 'Solve, test, and optimize 1 Data Structures & Algorithms challenge with time/space complexity analysis.',
    targetMinutes: 45,
    targetDurationText: '45 mins',
    targetQuantityText: '1 problem solved',
    color: '#06b6d4',
    icon: 'Code2',
    order: 3,
  },
  {
    title: 'Career Pipeline & Interview Acquisition',
    code: 'interview-calls-acquisition',
    category: 'Career Growth',
    description: 'Targeted company outreach, applications, portfolio updates, and recruiter follow-ups for interview calls.',
    targetMinutes: 45,
    targetDurationText: '45 mins',
    targetQuantityText: 'Targeted applications & outreach',
    color: '#3b82f6',
    icon: 'Briefcase',
    order: 4,
  },
  {
    title: 'Freelance Team Sync (with Gowtham)',
    code: 'freelance-gowtham-sync',
    category: 'Freelance & Team',
    description: 'Collaborative sprint alignment, architectural discussion, and project delivery sync with Gowtham.',
    targetMinutes: 45,
    targetDurationText: '45 mins',
    targetQuantityText: '1 sync session',
    color: '#10b981',
    icon: 'Users',
    order: 5,
  },
  {
    title: 'Freelance Deliverable Implementation',
    code: 'freelance-work-delivery',
    category: 'Freelance & Delivery',
    description: 'Execute hands-on implementation and deliver one concrete code module or milestone for client projects.',
    targetMinutes: 45,
    targetDurationText: '45 mins',
    targetQuantityText: '1 feature module',
    color: '#f59e0b',
    icon: 'Hammer',
    order: 6,
  },
  {
    title: 'Frontier Tech & Big Idea Research',
    code: 'frontier-big-tech-research',
    category: 'Learning & AI',
    description: 'Deep investigative research and conceptual design on one major emerging technology breakthrough.',
    targetMinutes: 45,
    targetDurationText: '45 mins',
    targetQuantityText: '1 big tech deep-dive',
    color: '#6366f1',
    icon: 'Compass',
    order: 7,
  },
  {
    title: 'Curated Tech Knowledge Video',
    code: 'tech-knowledge-video',
    category: 'Learning & Insights',
    description: 'Watch 1 high-value technical presentation, architecture lecture, or educational YouTube engineering breakdown.',
    targetMinutes: 30,
    targetDurationText: '30 mins',
    targetQuantityText: '1 tech video',
    color: '#ef4444',
    icon: 'Youtube',
    order: 8,
  },
  {
    title: 'Instagram Channel Maintenance',
    code: 'instagram-page-maintenance',
    category: 'Brand & Community',
    description: 'Curate content, interact with followers, and maintain consistency across Instagram.',
    targetMinutes: 45,
    targetDurationText: '45 mins',
    targetQuantityText: 'Post / story & engagement',
    color: '#e1306c',
    icon: 'Instagram',
    order: 9,
  },
  {
    title: 'Facebook Page Maintenance',
    code: 'facebook-page-maintenance',
    category: 'Brand & Community',
    description: 'Publish audience updates, monitor engagement metrics, and maintain Facebook page traction.',
    targetMinutes: 45,
    targetDurationText: '45 mins',
    targetQuantityText: 'Post & community updates',
    color: '#1877f2',
    icon: 'Facebook',
    order: 10,
  },
  {
    title: 'Deep Work Flow & Core Production',
    code: 'deep-work-movement',
    category: 'Core Work & Production',
    description: 'Sustained high-focus engineering and primary job movement sprint.',
    targetMinutes: 360,
    targetDurationText: '6 hours',
    targetQuantityText: 'Sustained deep work block',
    color: '#14b8a6',
    icon: 'Zap',
    order: 11,
  },
];

/**
 * Helper: Ensure default 11 habits exist in DB
 */
const ensureDefaultHabits = async () => {
  const count = await Habit.countDocuments();
  if (count === 0) {
    try {
      await Habit.insertMany(DEFAULT_HABITS, { ordered: false });
      console.log('✅ Seeded default 11 habits into database');
    } catch (err) {
      console.error('Error seeding default habits:', err.message);
    }
  }
};

// =========================================================================
// HABIT CRUD CONTROLLERS
// =========================================================================

/**
 * GET /api/habits
 * Returns list of all habits (auto-seeds defaults if empty)
 */
exports.getHabits = async (req, res, next) => {
  try {
    await ensureDefaultHabits();
    const habits = await Habit.find().sort({ order: 1, createdAt: 1 }).lean();

    res.status(200).json({
      success: true,
      count: habits.length,
      habits,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/habits
 * Create a new custom habit
 */
exports.createHabit = async (req, res, next) => {
  try {
    const {
      title,
      code,
      category,
      description,
      targetMinutes,
      targetDurationText,
      targetQuantityText,
      color,
      icon,
      order,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Habit title is required' });
    }

    const generatedCode =
      (code && code.trim().toLowerCase()) ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const existing = await Habit.findOne({ code: generatedCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Habit with code '${generatedCode}' already exists`,
      });
    }

    const maxOrderHabit = await Habit.findOne().sort({ order: -1 });
    const nextOrder = order !== undefined ? order : (maxOrderHabit?.order || 0) + 1;

    const habit = await Habit.create({
      title: title.trim(),
      code: generatedCode,
      category: category?.trim() || 'General',
      description: description?.trim() || '',
      targetMinutes: Number(targetMinutes) || 45,
      targetDurationText: targetDurationText?.trim() || `${targetMinutes || 45} mins`,
      targetQuantityText: targetQuantityText?.trim() || '1 session',
      color: color || '#6366f1',
      icon: icon || 'CheckCircle',
      order: nextOrder,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      habit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/habits/:id
 * Update an existing habit
 */
exports.updateHabit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const habit = await Habit.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Habit updated successfully',
      habit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/habits/:id
 * Delete a habit
 */
exports.deleteHabit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findByIdAndDelete(id);

    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    // Also clean up any hits associated with this habit
    await HabitHit.deleteMany({ habitId: id });

    res.status(200).json({
      success: true,
      message: 'Habit deleted successfully',
      deletedHabitId: id,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// TRACKING DAY & SLEEP BUTTON CONTROLLERS
// =========================================================================

/**
 * GET /api/habits/days/current
 * Returns current day status:
 * - isTrackerStarted: boolean (true if any day or sleep event exists)
 * - hasActiveDay: boolean (true if a day is currently open and running)
 * - activeDay: object (day info, startTime, elapsedMinutes, elapsedHours)
 * - hits: array of HabitHit records for today
 * - latestSleepEvent: most recent SleepEvent record
 */
exports.getCurrentDayStatus = async (req, res, next) => {
  try {
    await ensureDefaultHabits();

    const totalSleepEventsCount = await SleepEvent.countDocuments();
    const totalDaysCount = await HabitDay.countDocuments();
    const isTrackerStarted = totalSleepEventsCount > 0 || totalDaysCount > 0;

    // Check if there is an active day
    const activeDay = await HabitDay.findOne({ status: 'ACTIVE' }).sort({ dayNumber: -1 });

    const latestSleepEvent = await SleepEvent.findOne().sort({ timestamp: -1 });
    const lastCompletedDay = await HabitDay.findOne({ status: 'COMPLETED' }).sort({ dayNumber: -1 });

    // Sleep session queries
    const activeSleepRecord = await SleepRecord.findOne({ status: 'SLEEPING' }).sort({ sleepStartTime: -1 }).lean();
    const lastCompletedSleep = await SleepRecord.findOne({ status: 'COMPLETED' }).sort({ wakeUpTime: -1 }).lean();
    let currentSleepElapsedHours = 0;
    if (activeSleepRecord) {
      const now = new Date();
      const liveMins = Math.max(0, Math.round((now - new Date(activeSleepRecord.sleepStartTime)) / 60000));
      currentSleepElapsedHours = Number((liveMins / 60).toFixed(2));
    }

    if (activeDay) {
      // Calculate live elapsed duration
      const now = new Date();
      const elapsedMinutes = Math.max(0, Math.round((now - new Date(activeDay.startTime)) / (1000 * 60)));
      const elapsedHours = Number((elapsedMinutes / 60).toFixed(2));

      // Fetch all hits for this active day
      const hits = await HabitHit.find({ dayId: activeDay._id }).lean();
      const activeHabitsCount = await Habit.countDocuments({ isActive: true });

      return res.status(200).json({
        success: true,
        isTrackerStarted: true,
        hasActiveDay: true,
        activeDay: {
          ...activeDay.toObject(),
          elapsedMinutes,
          elapsedHours,
          totalHabitsCount: activeHabitsCount || 11,
        },
        hits,
        latestSleepEvent,
        lastCompletedDay,
        activeSleepRecord: activeSleepRecord
          ? { ...activeSleepRecord, elapsedHours: currentSleepElapsedHours }
          : null,
        lastCompletedSleep,
        isCurrentlySleeping: Boolean(activeSleepRecord),
      });
    }

    // No active day right now
    res.status(200).json({
      success: true,
      isTrackerStarted,
      hasActiveDay: false,
      activeDay: null,
      hits: [],
      latestSleepEvent,
      lastCompletedDay,
      nextDayNumber: (lastCompletedDay?.dayNumber || 0) + 1,
      activeSleepRecord: activeSleepRecord
        ? { ...activeSleepRecord, elapsedHours: currentSleepElapsedHours }
        : null,
      lastCompletedSleep,
      isCurrentlySleeping: Boolean(activeSleepRecord),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/habits/days/start
 * Starts the habit tracker / starts a new day
 * If sleep button press history is empty, this starts Day 1.
 * If day already active, returns current active day.
 */
exports.startDay = async (req, res, next) => {
  try {
    await ensureDefaultHabits();

    // Check if an active day already exists
    let activeDay = await HabitDay.findOne({ status: 'ACTIVE' });
    if (activeDay) {
      const hits = await HabitHit.find({ dayId: activeDay._id }).lean();
      return res.status(200).json({
        success: true,
        message: `Day ${activeDay.dayNumber} is already in progress`,
        day: activeDay,
        hits,
      });
    }

    // Determine next day number
    const lastDay = await HabitDay.findOne().sort({ dayNumber: -1 });
    const nextDayNumber = lastDay ? lastDay.dayNumber + 1 : 1;

    const startTime = req.body.startTime ? new Date(req.body.startTime) : new Date();
    const activeHabitsCount = await Habit.countDocuments({ isActive: true });

    // Create new Day
    activeDay = await HabitDay.create({
      dayNumber: nextDayNumber,
      startTime,
      status: 'ACTIVE',
      totalHabitsCount: activeHabitsCount || 11,
      completedHabitsCount: 0,
      completionRate: 0,
      notes: req.body.notes || '',
    });

    // Record the START event in SleepEvent log
    const startEvent = await SleepEvent.create({
      eventType: 'START',
      dayId: activeDay._id,
      dayNumber: nextDayNumber,
      timestamp: startTime,
      notes: req.body.notes || `Started Day ${nextDayNumber}`,
    });

    // Complete active Sleep session (from previous Day's sleep to this wake-up)
    let activeSleepRecord = await SleepRecord.findOne({ status: 'SLEEPING' }).sort({ sleepStartTime: -1 });

    // Fallback: If no SleepRecord was marked SLEEPING, but last completed day had an endTime
    if (!activeSleepRecord && lastDay && lastDay.endTime) {
      const alreadyLinked = await SleepRecord.findOne({ fromDayId: lastDay._id, toDayId: { $ne: null } });
      if (!alreadyLinked) {
        const sleepRecordsCount = await SleepRecord.countDocuments();
        activeSleepRecord = await SleepRecord.create({
          sleepSessionNumber: sleepRecordsCount + 1,
          fromDayNumber: lastDay.dayNumber,
          fromDayId: lastDay._id,
          sleepStartTime: lastDay.endTime,
          status: 'SLEEPING',
          quality: 'IN_PROGRESS',
        });
      }
    }

    let completedSleepRecord = null;
    if (activeSleepRecord) {
      const wakeUpTime = startTime;
      const durationMs = Math.max(0, wakeUpTime.getTime() - new Date(activeSleepRecord.sleepStartTime).getTime());
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      const durationHours = Number((durationMinutes / 60).toFixed(2));

      let quality = 'FAIR';
      if (durationHours >= 7 && durationHours <= 9) {
        quality = 'OPTIMAL';
      } else if (durationHours < 6) {
        quality = 'SHORT';
      } else if (durationHours > 9) {
        quality = 'LONG';
      }

      activeSleepRecord.toDayNumber = nextDayNumber;
      activeSleepRecord.toDayId = activeDay._id;
      activeSleepRecord.wakeUpTime = wakeUpTime;
      activeSleepRecord.durationMinutes = durationMinutes;
      activeSleepRecord.durationHours = durationHours;
      activeSleepRecord.status = 'COMPLETED';
      activeSleepRecord.quality = quality;
      await activeSleepRecord.save();
      completedSleepRecord = activeSleepRecord;
    }

    res.status(201).json({
      success: true,
      message: `Started Day ${nextDayNumber} successfully!`,
      day: activeDay,
      startEvent,
      completedSleepRecord,
      hits: [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/habits/days/sleep
 * User presses the "Sleep" button to close their day.
 * - Records SleepEvent timestamp
 * - Starts new SleepRecord tracking session from this sleep button press onwards
 * - Binds to active day
 * - Calculates totalHours between startTime and sleep time
 * - Calculates cycle time (hours since previous sleep)
 * - Marks day COMPLETED
 */
exports.pressSleep = async (req, res, next) => {
  try {
    const activeDay = await HabitDay.findOne({ status: 'ACTIVE' }).sort({ dayNumber: -1 });

    if (!activeDay) {
      return res.status(400).json({
        success: false,
        message: 'No active day currently running to sleep/close. Please start a day first.',
      });
    }

    const sleepTimestamp = req.body.timestamp ? new Date(req.body.timestamp) : new Date();
    const startTime = new Date(activeDay.startTime);

    // Calculate total hours of this day
    const durationMs = Math.max(0, sleepTimestamp.getTime() - startTime.getTime());
    const totalMinutes = Math.round(durationMs / (1000 * 60));
    const totalHours = Number((totalMinutes / 60).toFixed(2));

    // Find previous SLEEP event to calculate cycle time between sleep presses
    const previousSleep = await SleepEvent.findOne({ eventType: 'SLEEP' }).sort({ timestamp: -1 });
    let hoursSincePreviousSleep = null;
    if (previousSleep) {
      const cycleMs = Math.max(0, sleepTimestamp.getTime() - new Date(previousSleep.timestamp).getTime());
      hoursSincePreviousSleep = Number((cycleMs / (1000 * 60 * 60)).toFixed(2));
    }

    // Create SleepEvent
    const sleepEvent = await SleepEvent.create({
      eventType: 'SLEEP',
      dayId: activeDay._id,
      dayNumber: activeDay.dayNumber,
      timestamp: sleepTimestamp,
      hoursSincePreviousSleep,
      notes: req.body.notes || '',
    });

    // Start dedicated SleepRecord session: Day N sleep button onwards
    const sleepRecordsCount = await SleepRecord.countDocuments();
    const sleepRecord = await SleepRecord.create({
      sleepSessionNumber: sleepRecordsCount + 1,
      fromDayNumber: activeDay.dayNumber,
      fromDayId: activeDay._id,
      sleepStartTime: sleepTimestamp,
      status: 'SLEEPING',
      quality: 'IN_PROGRESS',
      notes: req.body.notes || '',
    });

    // Count habit hits for this day
    const completedHabitsCount = await HabitHit.countDocuments({
      dayId: activeDay._id,
      completed: true,
    });
    const totalHabitsCount = activeDay.totalHabitsCount || 11;
    const completionRate = Math.round((completedHabitsCount / totalHabitsCount) * 100);

    // Close the day
    activeDay.endTime = sleepTimestamp;
    activeDay.totalMinutes = totalMinutes;
    activeDay.totalHours = totalHours;
    activeDay.status = 'COMPLETED';
    activeDay.sleepEventId = sleepEvent._id;
    activeDay.completedHabitsCount = completedHabitsCount;
    activeDay.completionRate = completionRate;
    if (req.body.notes) {
      activeDay.notes = req.body.notes;
    }
    await activeDay.save();

    res.status(200).json({
      success: true,
      message: `Day ${activeDay.dayNumber} closed successfully. Good night!`,
      day: activeDay,
      sleepEvent,
      sleepRecord,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// HABIT HIT CONTROLLERS
// =========================================================================

/**
 * POST /api/habits/hits
 * Records a habit hit: habitId, timestamp, and active day reference
 * Auto-starts Day 1 if no day is active yet.
 */
exports.recordHit = async (req, res, next) => {
  try {
    const { habitId, timestamp, notes } = req.body;

    if (!habitId) {
      return res.status(400).json({ success: false, message: 'Habit ID is required' });
    }

    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    // Get current active day or auto-start Day 1
    let activeDay = await HabitDay.findOne({ status: 'ACTIVE' });
    if (!activeDay) {
      const lastDay = await HabitDay.findOne().sort({ dayNumber: -1 });
      const nextDayNumber = lastDay ? lastDay.dayNumber + 1 : 1;
      const now = new Date();

      activeDay = await HabitDay.create({
        dayNumber: nextDayNumber,
        startTime: now,
        status: 'ACTIVE',
        totalHabitsCount: (await Habit.countDocuments({ isActive: true })) || 11,
      });

      await SleepEvent.create({
        eventType: 'START',
        dayId: activeDay._id,
        dayNumber: nextDayNumber,
        timestamp: now,
        notes: `Auto-started Day ${nextDayNumber} via habit hit`,
      });
    }

    const hitTimestamp = timestamp ? new Date(timestamp) : new Date();

    // Upsert habit hit for this day
    const hit = await HabitHit.findOneAndUpdate(
      { dayId: activeDay._id, habitId },
      {
        habitId,
        dayId: activeDay._id,
        dayNumber: activeDay.dayNumber,
        timestamp: hitTimestamp,
        completed: true,
        notes: notes || '',
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    // Update active day count & completion rate
    const completedCount = await HabitHit.countDocuments({
      dayId: activeDay._id,
      completed: true,
    });
    const totalHabits = activeDay.totalHabitsCount || 11;
    activeDay.completedHabitsCount = completedCount;
    activeDay.completionRate = Math.round((completedCount / totalHabits) * 100);
    await activeDay.save();

    res.status(200).json({
      success: true,
      message: `Habit "${habit.title}" marked as hit!`,
      hit,
      habit,
      dayStats: {
        dayNumber: activeDay.dayNumber,
        completedHabitsCount: activeDay.completedHabitsCount,
        totalHabitsCount: activeDay.totalHabitsCount,
        completionRate: activeDay.completionRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/habits/hits/:habitId
 * Undo / remove a habit hit for the active day
 */
exports.undoHit = async (req, res, next) => {
  try {
    const { habitId } = req.params;

    const activeDay = await HabitDay.findOne({ status: 'ACTIVE' });
    if (!activeDay) {
      return res.status(400).json({
        success: false,
        message: 'No active day currently running to undo hit',
      });
    }

    const hit = await HabitHit.findOneAndDelete({
      dayId: activeDay._id,
      habitId,
    });

    if (!hit) {
      return res.status(404).json({
        success: false,
        message: 'Habit hit record not found for active day',
      });
    }

    // Update active day count & completion rate
    const completedCount = await HabitHit.countDocuments({
      dayId: activeDay._id,
      completed: true,
    });
    const totalHabits = activeDay.totalHabitsCount || 11;
    activeDay.completedHabitsCount = completedCount;
    activeDay.completionRate = Math.round((completedCount / totalHabits) * 100);
    await activeDay.save();

    res.status(200).json({
      success: true,
      message: 'Habit hit undone successfully',
      removedHabitId: habitId,
      dayStats: {
        dayNumber: activeDay.dayNumber,
        completedHabitsCount: activeDay.completedHabitsCount,
        totalHabitsCount: activeDay.totalHabitsCount,
        completionRate: activeDay.completionRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// DAYS LIST & HISTORY CONTROLLERS
// =========================================================================

/**
 * GET /api/habits/days
 * Returns list of tracked days with start time, end time, total hours, and completion metrics
 */
exports.getDays = async (req, res, next) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const parsedLimit = Math.max(1, Math.min(500, parseInt(limit, 10) || 100));
    const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * parsedLimit;

    const totalDays = await HabitDay.countDocuments();
    const days = await HabitDay.find()
      .sort({ dayNumber: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    // For active day, compute dynamic elapsed hours if endTime is null
    const now = new Date();
    const formattedDays = days.map((day) => {
      if (day.status === 'ACTIVE' && !day.endTime) {
        const liveMins = Math.max(0, Math.round((now - new Date(day.startTime)) / (1000 * 60)));
        return {
          ...day,
          totalMinutes: liveMins,
          totalHours: Number((liveMins / 60).toFixed(2)),
        };
      }
      return day;
    });

    res.status(200).json({
      success: true,
      count: formattedDays.length,
      totalDays,
      days: formattedDays,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/habits/days/:dayNumber
 * Returns specific day with all habit hits
 */
exports.getDayDetails = async (req, res, next) => {
  try {
    const { dayNumber } = req.params;

    const day = await HabitDay.findOne({
      $or: [{ dayNumber: Number(dayNumber) || 0 }, { _id: mongoose.isValidObjectId(dayNumber) ? dayNumber : null }],
    }).lean();

    if (!day) {
      return res.status(404).json({ success: false, message: 'Day not found' });
    }

    const hits = await HabitHit.find({ dayId: day._id }).populate('habitId').lean();

    res.status(200).json({
      success: true,
      day,
      hits,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/habits/sleep-logs
 * Returns sleep and start button press logs
 */
exports.getSleepLogs = async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    const logs = await SleepEvent.find()
      .sort({ timestamp: -1 })
      .limit(Math.min(500, parseInt(limit, 10) || 100))
      .lean();

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// DATA ANALYTICS & MOTIVATION CONTROLLERS
// =========================================================================

/**
 * GET /api/habits/analytics/overview
 * Comprehensive data analytics for dashboard and motivation:
 * - Line chart data: hours per day
 * - Completion trend: habits completed per day
 * - Streak, total hours, average day length
 * - Category breakdown
 */
exports.getOverviewAnalytics = async (req, res, next) => {
  try {
    await ensureDefaultHabits();

    const allDays = await HabitDay.find().sort({ dayNumber: 1 }).lean();
    const allHabits = await Habit.find({ isActive: true }).lean();
    const totalHitsCount = await HabitHit.countDocuments();

    // Summary calculations
    const totalDaysCount = allDays.length;
    const completedDaysCount = allDays.filter((d) => d.status === 'COMPLETED').length;

    let totalTrackedHours = 0;
    let totalCompletedHitsAcrossDays = 0;

    const now = new Date();
    const daysChartData = allDays.map((d) => {
      let hrs = d.totalHours;
      if (d.status === 'ACTIVE' && !d.endTime) {
        const liveMins = Math.max(0, Math.round((now - new Date(d.startTime)) / (1000 * 60)));
        hrs = Number((liveMins / 60).toFixed(2));
      }
      totalTrackedHours += hrs;
      totalCompletedHitsAcrossDays += d.completedHabitsCount || 0;

      return {
        dayNumber: d.dayNumber,
        label: `Day ${d.dayNumber}`,
        startTime: d.startTime,
        endTime: d.endTime,
        totalHours: hrs,
        completedHabitsCount: d.completedHabitsCount || 0,
        totalHabitsCount: d.totalHabitsCount || allHabits.length || 11,
        completionRate: d.completionRate || 0,
        status: d.status,
      };
    });

    const avgHoursPerDay = totalDaysCount > 0 ? Number((totalTrackedHours / totalDaysCount).toFixed(2)) : 0;
    const avgCompletionRate =
      totalDaysCount > 0
        ? Math.round(allDays.reduce((acc, curr) => acc + (curr.completionRate || 0), 0) / totalDaysCount)
        : 0;

    // Calculate current streak & best streak (days with completionRate >= 60%)
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < allDays.length; i++) {
      const d = allDays[i];
      if ((d.completionRate || 0) >= 50) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }
    // Current streak from the end
    for (let i = allDays.length - 1; i >= 0; i--) {
      if ((allDays[i].completionRate || 0) >= 50) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Category breakdown
    const categoryHitsAgg = await HabitHit.aggregate([
      {
        $lookup: {
          from: 'habits',
          localField: 'habitId',
          foreignField: '_id',
          as: 'habit',
        },
      },
      { $unwind: '$habit' },
      {
        $group: {
          _id: '$habit.category',
          hitsCount: { $sum: 1 },
          color: { $first: '$habit.color' },
        },
      },
      { $sort: { hitsCount: -1 } },
    ]);

    const categoryBreakdown = categoryHitsAgg.map((c) => ({
      name: c._id || 'General',
      value: c.hitsCount,
      color: c.color || '#6366f1',
    }));

    // Motivational milestones & progress
    const sixMonthsTargetDays = 180;
    const consistencyScore = Math.min(100, Math.round((totalDaysCount / sixMonthsTargetDays) * 100));

    res.status(200).json({
      success: true,
      metrics: {
        totalDays: totalDaysCount,
        completedDays: completedDaysCount,
        activeDays: allDays.filter((d) => d.status === 'ACTIVE').length,
        totalTrackedHours: Number(totalTrackedHours.toFixed(1)),
        avgHoursPerDay,
        avgCompletionRate,
        currentStreak,
        bestStreak,
        totalHabitHits: totalHitsCount,
        totalHabitsConfigured: allHabits.length,
        sixMonthsTargetDays,
        consistencyScore,
      },
      charts: {
        daysChartData,
        categoryBreakdown,
      },
      habitsList: allHabits,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/habits/analytics/habit/:habitId
 * Dedicated analytics for an individual habit:
 * - Total hits & completion percentage across all days
 * - Hourly distribution (12 AM to 11:59 PM)
 * - Day-by-day hit timeline
 * - Current and max streak for this specific habit
 */
exports.getSingleHabitAnalytics = async (req, res, next) => {
  try {
    const { habitId } = req.params;

    const habit = await Habit.findById(habitId).lean();
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    const allDays = await HabitDay.find().sort({ dayNumber: 1 }).lean();
    const habitHits = await HabitHit.find({ habitId }).sort({ timestamp: 1 }).lean();

    const hitDayIds = new Set(habitHits.map((h) => h.dayId.toString()));

    // Day-by-day status
    const dayTimeline = allDays.map((d) => {
      const isHit = hitDayIds.has(d._id.toString());
      const matchingHit = habitHits.find((h) => h.dayId.toString() === d._id.toString());

      return {
        dayNumber: d.dayNumber,
        label: `Day ${d.dayNumber}`,
        isHit,
        timestamp: matchingHit ? matchingHit.timestamp : null,
        dayStartTime: d.startTime,
        dayEndTime: d.endTime,
      };
    });

    // Hourly distribution (0 to 23 hours) for night owl tracker
    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, '0')}:00`,
      count: 0,
    }));

    habitHits.forEach((h) => {
      if (h.timestamp) {
        const hr = new Date(h.timestamp).getHours();
        if (hourlyDistribution[hr]) {
          hourlyDistribution[hr].count += 1;
        }
      }
    });

    // Calculate streaks for this single habit
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < dayTimeline.length; i++) {
      if (dayTimeline[i].isHit) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    for (let i = dayTimeline.length - 1; i >= 0; i--) {
      if (dayTimeline[i].isHit) {
        currentStreak++;
      } else {
        break;
      }
    }

    const totalDaysCount = allDays.length;
    const totalHitsCount = habitHits.length;
    const completionRate = totalDaysCount > 0 ? Math.round((totalHitsCount / totalDaysCount) * 100) : 0;

    res.status(200).json({
      success: true,
      habit,
      metrics: {
        totalHits: totalHitsCount,
        totalDays: totalDaysCount,
        completionRate,
        currentStreak,
        bestStreak,
        targetDurationMinutes: habit.targetMinutes,
        totalMinutesInvested: totalHitsCount * habit.targetMinutes,
        totalHoursInvested: Number(((totalHitsCount * habit.targetMinutes) / 60).toFixed(1)),
      },
      dayTimeline,
      hourlyDistribution,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// DEDICATED SLEEP TRACKING & ANALYTICS CONTROLLERS
// =========================================================================

/**
 * GET /api/habits/sleep-analytics
 * Computes comprehensive sleep analytics between Day N Sleep and Day N+1 Wake Up:
 * - Average, minimum, and maximum sleep duration
 * - Optimal sleep count and percentage (7-9 hours)
 * - Average Bedtime & Wake Time (formatted in 12h AM/PM for night owls)
 * - Sleep trends chart series (hours vs session)
 * - Sleep quality breakdown (Optimal, Fair, Short, Long)
 * - Current sleeping status & elapsed hours
 */
exports.getSleepAnalytics = async (req, res, next) => {
  try {
    const sleepRecords = await SleepRecord.find({ status: 'COMPLETED' })
      .sort({ sleepStartTime: 1 })
      .lean();

    const activeSleepSession = await SleepRecord.findOne({ status: 'SLEEPING' })
      .sort({ sleepStartTime: -1 })
      .lean();

    let currentlySleeping = false;
    let currentSleepElapsedHours = 0;
    if (activeSleepSession) {
      currentlySleeping = true;
      const liveMins = Math.max(0, Math.round((new Date() - new Date(activeSleepSession.sleepStartTime)) / 60000));
      currentSleepElapsedHours = Number((liveMins / 60).toFixed(2));
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
        label: `Day ${r.fromDayNumber} ➔ Day ${r.toDayNumber}`,
        fromDayNumber: r.fromDayNumber,
        toDayNumber: r.toDayNumber,
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

    // Helper to format decimal hour of the day into 12-hour AM/PM string
    const formatHourToTimeStr = (decimalHour) => {
      if (isNaN(decimalHour)) return 'N/A';
      const totalMinutes = Math.round(decimalHour * 60) % (24 * 60);
      const h24 = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      const period = h24 >= 12 ? 'PM' : 'AM';
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
    };

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
        currentlySleeping,
        currentSleepElapsedHours,
        activeSleepSession,
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
 * GET /api/habits/sleep-records
 * Returns all sleep records list
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
 * PUT /api/habits/sleep-records/:id
 * Update sleep record (e.g. adjust notes or hours)
 */
exports.updateSleepRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const record = await SleepRecord.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Sleep record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Sleep record updated successfully',
      record,
    });
  } catch (error) {
    next(error);
  }
};
