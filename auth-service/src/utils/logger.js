const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'auth-service' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File transports
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.json'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.json') 
    })
  ]
});

// Clean up old log files (older than 7 days)
function cleanupOldLogs() {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
  fs.readdir(logsDir, (err, files) => {
    if (err) {
      logger.error('Error reading logs directory', { error: err.message });
      return;
    }
    
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      
      fs.stat(filePath, (err, stats) => {
        if (err) {
          logger.error('Error getting file stats', { file, error: err.message });
          return;
        }
        
        const fileAge = now - stats.mtime.getTime();
        
        if (fileAge > maxAge) {
          fs.unlink(filePath, err => {
            if (err) {
              logger.error('Error deleting old log file', { file, error: err.message });
              return;
            }
            
            logger.info('Deleted old log file', { file });
          });
        }
      });
    });
  });
}

// Run cleanup on startup and then daily
cleanupOldLogs();
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);

module.exports = logger; 