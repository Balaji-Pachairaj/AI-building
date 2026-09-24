const Log = require('../models/log.model');

/**
 * @desc    Record an API hit (hit time, hit body, endpoint metadata)
 * @route   POST /api/hit, POST /api/logs/hit
 * @access  Public
 */
const recordHit = async (req, res, next) => {
  try {
    const hitTime = req.body?.hitTime ? new Date(req.body.hitTime) : new Date();
    // Allow either the entire body or nested hitBody field if specified
    const hitBody = req.body?.hitBody !== undefined ? req.body.hitBody : req.body;

    const logEntry = await Log.create({
      hitTime,
      hitBody,
      endpoint: req.originalUrl || req.url,
      method: req.method,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      userAgent: req.get('user-agent'),
    });

    return res.status(201).json({
      success: true,
      message: 'Hit logged successfully',
      data: logEntry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all recorded hits/logs (with optional pagination)
 * @route   GET /api/logs
 * @access  Public
 */
const getAllLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      Log.find().sort({ hitTime: -1 }).skip(skip).limit(limit).lean(),
      Log.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single log by ID
 * @route   GET /api/logs/:id
 * @access  Public
 */
const getLogById = async (req, res, next) => {
  try {
    const log = await Log.findById(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: `Log not found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete all logs (useful for testing/reset)
 * @route   DELETE /api/logs
 * @access  Public
 */
const clearAllLogs = async (req, res, next) => {
  try {
    const result = await Log.deleteMany({});
    return res.status(200).json({
      success: true,
      message: 'All logs cleared successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordHit,
  getAllLogs,
  getLogById,
  clearAllLogs,
};
