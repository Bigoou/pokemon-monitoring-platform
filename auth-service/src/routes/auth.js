const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { isAuthenticated } = require('../middleware/auth');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /auth/google
 * @desc    Authenticate with Google
 * @access  Public
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @route   GET /auth/google/callback
 * @desc    Google auth callback
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.DASHBOARD_URL}/login?error=auth_failed`,
    session: true
  }),
  (req, res) => {
    try {
      if (!req.user) {
        logger.error('No user found in request after authentication', {
          type: 'auth',
          action: 'callback',
          provider: 'google'
        });
        return res.redirect(`${process.env.DASHBOARD_URL}/login?error=no_user`);
      }

      logger.info('Authentication successful', {
        type: 'auth',
        action: 'callback',
        provider: 'google',
        userId: req.user.id
      });
      
      // Generate JWT token
      const token = generateToken(req.user);
      
      logger.info('Token generated successfully', {
        type: 'auth',
        action: 'token_generated',
        userId: req.user.id
      });
      
      // Redirect to success page with token
      res.redirect(`${process.env.DASHBOARD_URL}/auth-success?token=${token}`);
    } catch (error) {
      logger.error('Error in Google callback', {
        type: 'auth',
        action: 'callback_error',
        provider: 'google',
        error: error.message
      });
      res.redirect(`${process.env.DASHBOARD_URL}/login?error=callback_error`);
    }
  }
);

/**
 * @route   GET /auth/github
 * @desc    Authenticate with GitHub
 * @access  Public
 */
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

/**
 * @route   GET /auth/github/callback
 * @desc    GitHub auth callback
 * @access  Public
 */
router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: `${process.env.DASHBOARD_URL}/login?error=auth_failed`,
    session: true
  }),
  (req, res) => {
    try {
      if (!req.user) {
        logger.error('No user found in request after authentication', {
          type: 'auth',
          action: 'callback',
          provider: 'github'
        });
        return res.redirect(`${process.env.DASHBOARD_URL}/login?error=no_user`);
      }

      logger.info('Authentication successful', {
        type: 'auth',
        action: 'callback',
        provider: 'github',
        userId: req.user.id
      });
      
      // Generate JWT token
      const token = generateToken(req.user);
      
      logger.info('Token generated successfully', {
        type: 'auth',
        action: 'token_generated',
        userId: req.user.id
      });
      
      // Redirect to success page with token
      res.redirect(`${process.env.DASHBOARD_URL}/auth-success?token=${token}`);
    } catch (error) {
      logger.error('Error in GitHub callback', {
        type: 'auth',
        action: 'callback_error',
        provider: 'github',
        error: error.message
      });
      res.redirect(`${process.env.DASHBOARD_URL}/login?error=callback_error`);
    }
  }
);

/**
 * @route   GET /auth/user
 * @desc    Get current user info
 * @access  Private
 */
router.get('/user', isAuthenticated, (req, res) => {
  try {
    // Remove sensitive information
    const { _id, googleId, githubId, displayName, firstName, lastName, email, profilePicture, role, authProvider } = req.user;
    
    res.json({
      id: _id,
      googleId,
      githubId,
      displayName,
      firstName,
      lastName,
      email,
      profilePicture,
      role,
      authProvider
    });
  } catch (error) {
    logger.error('Error getting user info', {
      type: 'auth',
      action: 'get_user',
      error: error.message
    });
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

/**
 * @route   GET /auth/token
 * @desc    Get JWT token for authenticated user
 * @access  Private
 */
router.get('/token', isAuthenticated, (req, res) => {
  try {
    const token = generateToken(req.user);
    res.json({ token });
  } catch (error) {
    logger.error('Error generating token', {
      type: 'auth',
      action: 'generate_token',
      error: error.message
    });
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

/**
 * @route   POST /auth/validate
 * @desc    Validate JWT token
 * @access  Public
 */
router.post('/validate', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      logger.warn('Token validation failed: No token provided', {
        type: 'auth',
        action: 'validate_token'
      });
      return res.status(400).json({ valid: false, error: 'Token is required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info('Token validated successfully', {
      type: 'auth',
      action: 'validate_token',
      userId: decoded.id
    });
    res.json({ valid: true, user: decoded });
  } catch (error) {
    logger.error('Token validation failed', {
      error: error.message,
      type: 'auth',
      action: 'validate_token'
    });
    
    res.json({ valid: false, error: error.message });
  }
});

/**
 * @route   GET /auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.get('/logout', (req, res) => {
  if (req.user) {
    logger.info('User logged out', {
      type: 'auth',
      action: 'logout',
      userId: req.user.id
    });
    
    req.logout((err) => {
      if (err) {
        logger.error('Logout error', {
          type: 'auth',
          action: 'logout',
          error: err.message
        });
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.redirect(`${process.env.DASHBOARD_URL}/login?logout=success`);
    });
  } else {
    res.redirect(`${process.env.DASHBOARD_URL}/login`);
  }
});

module.exports = router; 