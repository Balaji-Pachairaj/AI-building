// Load environment variables from .env file
require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

/**
 * Start Server: Connect to MongoDB first, then listen on PORT
 */
const startServer = async () => {
  try {
    // 1. Establish MongoDB connection before starting the HTTP server
    await connectDB();

    // 2. Start listening for incoming HTTP requests
    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Server is running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(` Listening on port:   http://localhost:${PORT}`);
      console.log(` Models List (GET):   http://localhost:${PORT}/get-models-id`);
      console.log(` Next Token (GET):    http://localhost:${PORT}/get-next-token`);
      console.log(` Token History (GET): http://localhost:${PORT}/get-next-token-history`);
      console.log(` Health check:        http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });

    // Handle termination signals
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed. Process terminated.');
      });
    });

    process.on('SIGINT', () => {
      console.log('\nSIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed. Process terminated.');
      });
    });

  } catch (error) {
    console.error(`\n❌ [Fatal Error] Could not connect to MongoDB.`);
    console.error(`Details: ${error.message}`);
    console.error(`Please verify your MONGODB_URI (or MONGO_URI) in the .env file:\n${process.env.MONGODB_URI || process.env.MONGO_URI || '(not set)'}\n`);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[UnhandledRejection] Error: ${err.message}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`[UncaughtException] Error: ${err.message}`);
  process.exit(1);
});

// Start the application
startServer();
