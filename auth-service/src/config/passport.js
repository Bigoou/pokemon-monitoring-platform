const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Configure Passport with OAuth strategies
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
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Update last login time
            user.lastLogin = new Date();
            await user.save();
            
            logger.info('User logged in with Google', {
              type: 'auth',
              action: 'login',
              userId: user.id,
              provider: 'google'
            });
            
            return done(null, user);
          }

          // Check if user exists with same email but different provider
          const existingUser = await User.findOne({ 
            email: profile.emails[0].value,
            authProvider: { $ne: 'google' }
          });

          if (existingUser) {
            logger.info('User already exists with different provider', {
              type: 'auth',
              action: 'login_attempt',
              email: profile.emails[0].value,
              existingProvider: existingUser.authProvider,
              attemptedProvider: 'google'
            });
            
            return done(null, false, { 
              message: `Account already exists with ${existingUser.authProvider}. Please use that provider to login.` 
            });
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            email: profile.emails[0].value,
            profilePicture: profile.photos[0]?.value || '',
            authProvider: 'google'
          });

          logger.info('New user registered with Google', {
            type: 'auth',
            action: 'register',
            userId: user.id,
            provider: 'google'
          });

          return done(null, user);
        } catch (error) {
          logger.error('Google authentication error', {
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

  // Configure GitHub strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Get primary email from GitHub profile
          const primaryEmail = profile.emails && profile.emails[0]?.value;
          
          if (!primaryEmail) {
            logger.error('GitHub authentication error: No email provided', {
              type: 'auth',
              action: 'error',
              provider: 'github'
            });
            
            return done(null, false, { 
              message: 'Email access is required for authentication' 
            });
          }

          // Check if user already exists with this GitHub ID
          let user = await User.findOne({ githubId: profile.id });

          if (user) {
            // Update last login time
            user.lastLogin = new Date();
            await user.save();
            
            logger.info('User logged in with GitHub', {
              type: 'auth',
              action: 'login',
              userId: user.id,
              provider: 'github'
            });
            
            return done(null, user);
          }

          // Check if user exists with same email but different provider
          const existingUser = await User.findOne({ 
            email: primaryEmail,
            authProvider: { $ne: 'github' }
          });

          if (existingUser) {
            logger.info('User already exists with different provider', {
              type: 'auth',
              action: 'login_attempt',
              email: primaryEmail,
              existingProvider: existingUser.authProvider,
              attemptedProvider: 'github'
            });
            
            return done(null, false, { 
              message: `Account already exists with ${existingUser.authProvider}. Please use that provider to login.` 
            });
          }

          // Create new user
          user = await User.create({
            githubId: profile.id,
            displayName: profile.displayName || profile.username,
            firstName: profile.displayName ? profile.displayName.split(' ')[0] : '',
            lastName: profile.displayName ? profile.displayName.split(' ').slice(1).join(' ') : '',
            email: primaryEmail,
            profilePicture: profile.photos[0]?.value || '',
            authProvider: 'github'
          });

          logger.info('New user registered with GitHub', {
            type: 'auth',
            action: 'register',
            userId: user.id,
            provider: 'github'
          });

          return done(null, user);
        } catch (error) {
          logger.error('GitHub authentication error', {
            type: 'auth',
            action: 'error',
            error: error.message,
            provider: 'github'
          });
          
          return done(error, null);
        }
      }
    )
  );
}

module.exports = { configurePassport }; 