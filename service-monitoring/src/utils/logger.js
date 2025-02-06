const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), config.logging.dir);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

/**
 * Custom format for JSON logs
 */
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

/**
 * Create transport for specific log level
 * @param {string} filename Log file name
 * @param {string} level Log level
 * @returns {winston.transports.File} Winston file transport
 */
const createFileTransport = (filename, level) => {
  return new winston.transports.File({
    filename: path.join(config.logging.dir, filename),
    level,
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: config.logging.retentionDays,
    tailable: true,
  });
};

/**
 * Logger instance configuration
 */
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    // Error logs
    createFileTransport(config.logging.files.error, 'error'),
    // Combined logs
    createFileTransport(config.logging.files.combined, 'info'),
    // Alert logs
    createFileTransport(config.logging.files.alerts, 'warn'),
    // Console output for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

/**
 * Clean old log files
 */
function cleanOldLogs() {
  const maxAge = config.logging.retentionDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  
  fs.readdir(config.logging.dir, (err, files) => {
    if (err) {
      logger.error('Error reading logs directory', { error: err.message });
      return;
    }

    const now = Date.now();
    files.forEach(file => {
      const filePath = path.join(config.logging.dir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          logger.error('Error getting file stats', { error: err.message, file });
          return;
        }

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlink(filePath, err => {
            if (err) {
              logger.error('Error deleting old log file', { error: err.message, file });
            } else {
              logger.info('Deleted old log file', { file });
            }
          });
        }
      });
    });
  });
}

// Clean old logs daily
setInterval(cleanOldLogs, 24 * 60 * 60 * 1000);

// Initial cleanup
cleanOldLogs();

module.exports = logger;
