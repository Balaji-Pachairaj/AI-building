const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const apiRoutes = require('./routes');
const buildingStuffsRoutes = require('./routes/buildingStuffs.routes');
const nextTokenRoutes = require('./routes/next-token.routes');
const modelsRoutes = require('./routes/models.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const mongoose = require('mongoose');
const TokenHistory = require('./models/token-history.model');

const app = express();

// ==========================================
// Middleware Configuration
// ==========================================

// HTTP Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS Configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'x-client-timestamp', '*'],
  })
);

// Body Parser Middleware (JSON & URL-Encoded)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Built-in Express JSON Parser (for redundancy and standard express compatibility)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Base Routes
// ==========================================

// Root welcome endpoint with Database call as proof of connectivity
app.get('/', async (req, res, next) => {
  try {
    const isConnected = mongoose.connection && mongoose.connection.readyState === 1;

    let dbDataProof = null;
    let collectionsList = [];

    if (isConnected && mongoose.connection.db) {
      // 1. Fetch available collections in database
      const collections = await mongoose.connection.db.listCollections().toArray();
      collectionsList = collections.map((c) => c.name);

      // 2. Fetch total count of records
      const totalRecords = await TokenHistory.countDocuments();

      // 3. Fetch latest record from the database as data proof
      const latestRecord = await TokenHistory.findOne().sort({ createdAt: -1 }).lean();

      dbDataProof = {
        totalRecords,
        latestRecord: latestRecord || 'No records found in database',
      };
    }

    res.status(200).json({
      success: true,
      message: 'Welcome to the Next Token Prediction & Boilerplate API',
      database: {
        connected: isConnected,
        databaseName: mongoose.connection.name || null,
        host: mongoose.connection.host || null,
        collections: collectionsList,
        proofOfData: dbDataProof,
        connectionString1: process.env.MONGO_URI,
        connectionString2: process.env.MONGODB_URI
      },
      endpoints: {
        health: '/api/health',
        getNextToken: '/get-next-token?input=The%20weather%20today%20is&tokens=2&model_id=1',
        getModelsId: '/get-models-id',
        getNextTokenHistory: '/get-next-token-history',
        hitLogger: '/api/hit (POST)',
        buildingStuffs: '/api/building-stuffs or /building-stuffs',
        logs: '/api/logs',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Direct next-token prediction routes (API 1, API 2, API 3)
app.use('/', nextTokenRoutes);
app.use('/', modelsRoutes);

// Direct "/building-stuffs" route (as requested in requirement #3)
app.use('/building-stuffs', buildingStuffsRoutes);

// Modular API routes mounted under /api
app.use('/api', apiRoutes);

// ==========================================
// Error Handling Middleware
// ==========================================

// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
