require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const { connectDB } = require('./src/config/database');
const { configurePassport } = require('./src/config/passport');
const authRoutes = require('./src/routes/auth');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    const app = express();
    const server = http.createServer(app);

    // Middleware
    app.use(cors({
      origin: [process.env.DASHBOARD_URL, process.env.MONITORING_SERVICE_URL],
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

    // Routes
    app.use('/auth', authRoutes);

    // Basic health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'auth-service' });
    });

    // Error handling
    app.use((err, req, res, next) => {
      logger.error('Server error', {
        error: err.message,
        type: 'server_error'
      });
      res.status(500).json({ error: 'Internal server error' });
    });

    // Start server
    server.listen(PORT, () => {
      logger.info(`Auth service started on port ${PORT}`, {
        type: 'server_start',
        port: PORT
      });
    });

    return server;
  } catch (error) {
    logger.error('Failed to start auth service', {
      error: error.message,
      type: 'startup_error'
    });
    process.exit(1);
  }
}

startServer(); 