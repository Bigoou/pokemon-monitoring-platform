const axios = require('axios');
const logger = require('../utils/logger');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

/**
 * Middleware to check if user is authenticated via JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function isAuthenticated(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Validate token with auth service
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/validate`, { token });
    
    if (response.data.valid) {
      // Attach user info to request
      req.user = response.data.user;
      return next();
    } else {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
    }
  } catch (error) {
    logger.error('Authentication error', {
      error: error.message,
      type: 'auth',
      action: 'validate_token'
    });
    
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication failed' });
  }
}

/**
 * Middleware to check if user is an admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Forbidden', message: 'Admin privileges required' });
}

/**
 * Middleware to attach user info to socket connection
 * @param {Object} socket - Socket.IO socket
 * @param {Function} next - Socket.IO next function
 */
async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    // Validate token with auth service
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/validate`, { token });
    
    if (response.data.valid) {
      socket.user = response.data.user;
      return next();
    } else {
      return next(new Error('Invalid token'));
    }
  } catch (error) {
    logger.error('Socket authentication error', {
      error: error.message,
      type: 'socket_auth',
      action: 'validate_token'
    });
    
    return next(new Error('Authentication failed'));
  }
}

module.exports = {
  isAuthenticated,
  isAdmin,
  socketAuth
}; 