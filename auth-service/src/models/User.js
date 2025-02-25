const mongoose = require('mongoose');

/**
 * User schema for MongoDB
 */
const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true
  },
  githubId: {
    type: String,
    sparse: true
  },
  displayName: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true
  },
  profilePicture: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  authProvider: {
    type: String,
    enum: ['google', 'github'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Ensure either googleId or githubId is present
userSchema.pre('save', function(next) {
  if (!this.googleId && !this.githubId) {
    return next(new Error('User must have either a Google ID or GitHub ID'));
  }
  next();
});

// Create compound index for email and authProvider to ensure uniqueness per provider
userSchema.index({ email: 1, authProvider: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema); 