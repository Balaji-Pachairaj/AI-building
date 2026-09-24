const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const apiRoutes = require('./routes');
const buildingStuffsRoutes = require('./routes/buildingStuffs.routes');
const nextTokenRoutes = require('./routes/next-token.routes');
const modelsRoutes = require('./routes/models.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

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

// Root welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Next Token Prediction & Boilerplate API',
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
