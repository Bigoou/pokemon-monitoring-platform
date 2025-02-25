const { Server } = require('socket.io');
const logger = require('../utils/logger');
const { socketAuth } = require('../auth/middleware');
const User = require('../models/User');

let io;
let connectedClients = new Set();

/**
 * Initialize Socket.IO server
 * @param {object} httpServer - HTTP server instance
 * @param {object} sessionMiddleware - Express session middleware
 */
function initSocketServer(httpServer, sessionMiddleware) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.DASHBOARD_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Use session middleware with Socket.IO
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  // Optional: Use authentication middleware
  // io.use(socketAuth);

  io.on('connection', async (socket) => {
    // Get user info if authenticated
    let userInfo = 'Anonymous';
    if (socket.request.session.passport && socket.request.session.passport.user) {
      try {
        const user = await User.findById(socket.request.session.passport.user);
        if (user) {
          userInfo = user.displayName;
          socket.user = user;
        }
      } catch (error) {
        logger.error('Error fetching user for socket', {
          error: error.message,
          type: 'websocket_error'
        });
      }
    }

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