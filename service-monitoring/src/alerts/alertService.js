const { sendDiscordAlert } = require('./discordAlert');
const logger = require('../utils/logger');
const { broadcastStatus, broadcastAlert } = require('../websocket/socketServer');

/**
 * Send a status report to all notification channels
 * @param {object} status - Service status information
 */
async function sendStatusReport(status) {
  try {
    // Broadcast to WebSocket clients
    broadcastStatus(status);

    // Send alerts if needed
    if (!status.isUp || status.isHighLatency || status.isStatusChange) {
      const alertType = !status.isUp ? 'error' : 'warning';
      const message = getAlertMessage(status);

      // Send to Discord
      await sendDiscordAlert({
        type: alertType,
        message,
        details: status
      });

      // Broadcast alert to WebSocket clients
      broadcastAlert({
        type: alertType,
        message,
        details: status
      });

      // Log the alert
      logger.warn('Alert sent', {
        type: 'alert',
        alertType,
        message,
        status
      });
    }
  } catch (error) {
    logger.error('Error sending status report', {
      error: error.message,
      type: 'error',
      status
    });
  }
}

/**
 * Get appropriate alert message based on status
 * @param {object} status - Service status information
 * @returns {string} Alert message
 */
function getAlertMessage(status) {
  if (!status.isUp) {
    return `⚠️ Service is DOWN! ${status.error || 'No response from service'}`;
  }
  if (status.isHighLatency) {
    return `⚠️ High latency detected: ${status.responseTime}ms`;
  }
  if (status.isStatusChange) {
    return '✅ Service is back online!';
  }
  return 'Service status changed';
}

module.exports = {
  sendStatusReport
}; 