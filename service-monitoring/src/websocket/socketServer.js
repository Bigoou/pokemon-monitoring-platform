const { Server } = require('socket.io');
const logger = require('../utils/logger');
const { socketAuth } = require('../auth/middleware');
const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

let io;
let connectedClients = new Set();

/**
 * Initialize Socket.IO server
 * @param {object} httpServer - HTTP server instance
 */
function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.DASHBOARD_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Use authentication middleware
  io.use(socketAuth);

  io.on('connection', async (socket) => {
    // User info is now available from JWT validation
    const userInfo = socket.user ? socket.user.email : 'Anonymous';

    logger.info('New client connected', {
      clientId: socket.id,
      user: userInfo,
      type: 'websocket',
      event: 'connection'
    });

    connectedClients.add(socket);

    socket.on('disconnect', () => {
      logger.info('Client disconnected', {
        clientId: socket.id,
        user: userInfo,
        type: 'websocket',
        event: 'disconnect'
      });
      connectedClients.delete(socket);
    });
  });

  logger.info('WebSocket server initialized');
  return io;
}

/**
 * Broadcast status update to all connected clients
 * @param {object} status - Service status information
 */
function broadcastStatus(status) {
  if (io) {
    io.emit('statusUpdate', {
      isUp: status.isUp,
      responseTime: status.responseTime,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Broadcast alert to all connected clients
 * @param {object} alert - Alert information
 */
function broadcastAlert(alert) {
  if (io) {
    io.emit('alert', {
      type: alert.type === 'error' ? 'error' : 'warning',
      message: alert.message || alert.details?.message || 'Service alert',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  initSocketServer,
  broadcastStatus,
  broadcastAlert
}; 