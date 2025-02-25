const express = require('express');
const http = require('http');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const { initSocketServer } = require('./websocket/socketServer');
const logger = require('./utils/logger');
const config = require('./config/config');
const { configurePassport } = require('./auth/passport');
const authRoutes = require('./routes/auth');
const { connectDB } = require('./config/database');

/**
 * Initialize Express server with Socket.IO
 * @returns {Promise<http.Server>}
 */
async function initServer() {
  // Connect to MongoDB
  await connectDB();

  const app = express();
  const server = http.createServer(app);

  // Middleware
  app.use(cors({
    origin: process.env.DASHBOARD_URL || 'http://localhost:5173',
    credentials: true
  }));
  app.use(express.json());

  // Session configuration
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions'
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  });

  app.use(sessionMiddleware);

  // Initialize Passport
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  // Initialize Socket.IO with session
  initSocketServer(server, sessionMiddleware);

  // Routes
  app.use('/auth', authRoutes);

  // Basic health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Configuration endpoint - protected by authentication
  app.get('/config', (req, res) => {
    res.json(config.monitoring);
  });

  app.post('/config', (req, res) => {
    try {
      // Mise à jour de la configuration
      Object.assign(config.monitoring, req.body);
      logger.info('Configuration updated', {
        type: 'config_update',
        newConfig: config.monitoring
      });
      res.json(config.monitoring);
    } catch (error) {
      logger.error('Error updating configuration', {
        error: error.message,
        type: 'config_update_error'
      });
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  });

  // Error handling
  app.use((err, req, res, next) => {
    logger.error('Server error', {
      error: err.message,
      type: 'server_error'
    });
    res.status(500).json({ error: 'Internal server error' });
  });

  return server;
}

module.exports = {
  initServer
}; 