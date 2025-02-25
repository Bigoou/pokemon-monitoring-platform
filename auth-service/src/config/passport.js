const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Configure Passport with Google OAuth 2.0 strategy
 */
function configurePassport() {
  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Configure Google strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Update last login time
            user.lastLogin = new Date();
            await user.save();
            
            logger.info('User logged in', {
              type: 'auth',
              action: 'login',
              userId: user.id,
              provider: 'google'
            });
            
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            email: profile.emails[0].value,
            profilePicture: profile.photos[0]?.value || ''
          });

          logger.info('New user registered', {
            type: 'auth',
            action: 'register',
            userId: user.id,
            provider: 'google'
          });

          return done(null, user);
        } catch (error) {
          logger.error('Authentication error', {
            type: 'auth',
            action: 'error',
            error: error.message,
            provider: 'google'
          });
          
          return done(error, null);
        }
      }
    )
  );
}

module.exports = { configurePassport }; 