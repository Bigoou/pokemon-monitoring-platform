/**
 * Configuration file for the monitoring service
 */
require('dotenv').config();

const config = {
  // Monitoring configuration
  monitoring: {
    interval: process.env.MONITORING_INTERVAL || '*/1 * * * *', // Every minute by default
    timeout: parseInt(process.env.REQUEST_TIMEOUT) || 5000, // 5 seconds timeout
    services: [
      {
        name: 'Pokemon Cards API',
        url: 'http://localhost:3000/cards',
        expectedStatus: 200,
        responseTimeThreshold: 1000, // ms
      },
    ],
  },

  // Discord webhook configuration
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL,
    enabled: true,
  },

  // Logging configuration
  logging: {
    retentionDays: 7,
    directory: './logs',
  },
};

module.exports = config;
