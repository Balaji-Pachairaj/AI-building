const Log = require('../models/log.model');

// In-memory sample data store (can easily be replaced with a MongoDB model)
let sampleStuffs = [
  { id: 1, name: 'Express Server', category: 'Backend', status: 'Ready' },
  { id: 2, name: 'MongoDB with Mongoose', category: 'Database', status: 'Connected' },
  { id: 3, name: 'Hit Logger', category: 'Analytics', status: 'Active' },
];

/**
 * @desc    Get all building stuffs
 * @route   GET /api/building-stuffs
 * @access  Public
 */
const getBuildingStuffs = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Building stuffs fetched successfully',
      count: sampleStuffs.length,
      data: sampleStuffs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single building stuff by id
 * @route   GET /api/building-stuffs/:id
 * @access  Public
 */
const getBuildingStuffById = async (req, res, next) => {
  try {
    const item = sampleStuffs.find((s) => s.id === parseInt(req.params.id, 10));

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Building stuff with ID ${req.params.id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new building stuff
 * @route   POST /api/building-stuffs
 * @access  Public
 */
const createBuildingStuff = async (req, res, next) => {
  try {
    const { name, category, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required to create building stuff',
      });
    }

    const newStuff = {
      id: sampleStuffs.length ? sampleStuffs[sampleStuffs.length - 1].id + 1 : 1,
      name,
      category: category || 'General',
      status: status || 'In Progress',
      createdAt: new Date(),
    };

    sampleStuffs.push(newStuff);

    return res.status(201).json({
      success: true,
      message: 'Building stuff created successfully',
      data: newStuff,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Hit building stuffs and log hit time & hit body into Log model
 * @route   POST /api/building-stuffs/hit
 * @access  Public
 */
const hitBuildingStuff = async (req, res, next) => {
  try {
    const hitTime = req.body?.hitTime ? new Date(req.body.hitTime) : new Date();
    const hitBody = req.body?.hitBody !== undefined ? req.body.hitBody : req.body;

    const logEntry = await Log.create({
      hitTime,
      hitBody,
      endpoint: req.originalUrl || '/api/building-stuffs/hit',
      method: req.method,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      userAgent: req.get('user-agent'),
    });

    return res.status(201).json({
      success: true,
      message: 'Building stuff hit registered and logged to database successfully',
      log: logEntry,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBuildingStuffs,
  getBuildingStuffById,
  createBuildingStuff,
  hitBuildingStuff,
};
