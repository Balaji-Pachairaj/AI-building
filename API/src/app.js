const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const apiRoutes = require('./routes');
const buildingStuffsRoutes = require('./routes/buildingStuffs.routes');
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
    message: 'Welcome to the Express Boilerplate API',
    endpoints: {
      health: '/api/health',
      hitLogger: '/api/hit (POST)',
      buildingStuffs: '/api/building-stuffs or /building-stuffs',
      logs: '/api/logs',
    },
  });
});

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
