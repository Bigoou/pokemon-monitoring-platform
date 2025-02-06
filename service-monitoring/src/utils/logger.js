const winston = require('winston');
const path = require('path');
const config = require('../config/config');

/**
 * Creates a Winston logger instance with JSON formatting
 */
const logger = winston.createLogger({
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    // Log everything to combined.json
    new winston.transports.File({
      filename: path.join(config.logging.directory, 'combined.json'),
    }),
    // Log errors to error.json
    new winston.transports.File({
      filename: path.join(config.logging.directory, 'error.json'),
      level: 'error',
    }),
    // Log alerts to alerts.json
    new winston.transports.File({
      filename: path.join(config.logging.directory, 'alerts.json'),
      level: 'warn',
    }),
  ],
});

module.exports = logger;
