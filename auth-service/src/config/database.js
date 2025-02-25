const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    await mongoose.connect(mongoURI);
    
    logger.info('MongoDB connected successfully', {
      type: 'database',
      action: 'connect',
      status: 'success'
    });
  } catch (error) {
    logger.error('MongoDB connection failed', {
      type: 'database',
      action: 'connect',
      status: 'error',
      error: error.message
    });
    
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
}

module.exports = { connectDB }; 