const mongoose = require('mongoose');

// Cache connection in global scope to reuse across warm serverless function invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using Mongoose ORM with connection caching for serverless environments (Vercel)
 */
const connectDB = async () => {
  // If already connected, reuse existing connection immediately
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cached.conn) {
    return cached.conn;
  }

  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/express_boilerplate_db';

  if (!cached.promise) {
    console.log('[MongoDB] Connecting to database...');
    cached.promise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => {
        console.log(`[MongoDB] Connected successfully: ${m.connection.host}/${m.connection.name}`);
        return m.connection;
      })
      .catch((error) => {
        cached.promise = null; // Clear promise on error so subsequent requests can retry
        console.error(`[MongoDB] Connection failed: ${error.message}`);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

// Event listeners for Mongoose connection lifecycle
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection lost.');
  cached.conn = null;
  cached.promise = null;
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Runtime error: ${err.message}`);
});

module.exports = connectDB;
