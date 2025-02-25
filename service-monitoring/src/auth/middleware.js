/**
 * Middleware to check if user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
}

/**
 * Middleware to check if user is an admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Forbidden', message: 'Admin privileges required' });
}

/**
 * Middleware to attach user info to socket connection
 * @param {Object} socket - Socket.IO socket
 * @param {Function} next - Socket.IO next function
 */
function socketAuth(socket, next) {
  const session = socket.request.session;
  if (session && session.passport && session.passport.user) {
    socket.user = session.passport.user;
    return next();
  }
  next(new Error('Authentication required'));
}

module.exports = {
  isAuthenticated,
  isAdmin,
  socketAuth
}; 