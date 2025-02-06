const express = require('express');
const http = require('http');
const cors = require('cors');
const { initSocketServer } = require('./websocket/socketServer');
const logger = require('./utils/logger');
const config = require('./config/config');

/**
 * Initialize Express server with Socket.IO
 * @returns {Promise<http.Server>}
 */
async function initServer() {
  const app = express();
  const server = http.createServer(app);

  // Middleware
  app.use(cors({
    origin: process.env.DASHBOARD_URL || 'http://localhost:5173'
  }));
  app.use(express.json());

  // Initialize Socket.IO
  initSocketServer(server);

  // Basic health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Configuration endpoint
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