const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Middleware to check if user is authenticated via session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function isAuthenticated(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      logger.error('Token verification failed in middleware', {
        error: error.message,
        type: 'auth',
        action: 'verify_token'
      });
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
    }
  } catch (error) {
    logger.error('Authentication middleware error', {
      error: error.message,
      type: 'auth',
      action: 'auth_middleware'
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
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
function generateToken(user) {
  try {
    if (!user || !user._id) {
      logger.error('Cannot generate token: Invalid user object', {
        type: 'auth',
        action: 'generate_token'
      });
      throw new Error('Invalid user object');
    }

    const payload = { 
      id: user._id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      profilePicture: user.profilePicture
    };

    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );

    logger.debug('Token generated', {
      type: 'auth',
      action: 'generate_token',
      userId: user._id
    });

    return token;
  } catch (error) {
    logger.error('Error generating token', {
      error: error.message,
      type: 'auth',
      action: 'generate_token'
    });
    throw error;
  }
}

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed', {
      error: error.message,
      type: 'auth',
      action: 'verify_token'
    });
    
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
}

module.exports = {
  isAuthenticated,
  isAdmin,
  generateToken,
  verifyToken
}; 