/**
 * Configuration file for the monitoring service
 */
require('dotenv').config();

module.exports = {
  // Monitoring configuration
  monitoring: {
    interval: process.env.MONITORING_INTERVAL || '*/5 * * * *',
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 5000,
    serviceUrl: process.env.SERVICE_URL || 'http://localhost:3000/cards',
    thresholds: {
      responseTime: 1000, // Reduced to 1 second for testing
      errorCount: 2, // Reduced to 2 consecutive errors for testing
    },
  },

  // Discord webhook configuration
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL,
    colors: {
      error: 0xFF0000,
      warning: 0xFFA500,
      success: 0x00FF00,
      info: 0x0000FF,
    },
  },

  // Logging configuration
  logging: {
    dir: 'logs',
    retentionDays: 7,
    files: {
      error: 'error.json',
      combined: 'combined.json',
      alerts: 'alerts.json',
    },
  },
};
