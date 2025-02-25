const express = require('express');
const passport = require('passport');
const { isAuthenticated } = require('../auth/middleware');
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
    logger.info('Authentication successful', {
      type: 'auth',
      action: 'callback',
      provider: 'google',
      userId: req.user.id
    });
    res.redirect(`${process.env.DASHBOARD_URL}/auth-success`);
  }
);

/**
 * @route   GET /auth/user
 * @desc    Get current user info
 * @access  Private
 */
router.get('/user', isAuthenticated, (req, res) => {
  // Remove sensitive information
  const { _id, googleId, displayName, firstName, lastName, email, profilePicture, role } = req.user;
  
  res.json({
    id: _id,
    googleId,
    displayName,
    firstName,
    lastName,
    email,
    profilePicture,
    role
  });
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