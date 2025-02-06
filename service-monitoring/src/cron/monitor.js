const axios = require('axios');
const cron = require('node-cron');
const config = require('../config/config');
const logger = require('../utils/logger');
const alertService = require('../alerts/alertService');

/**
 * Service state to track changes
 * @type {{isUp: boolean, lastCheck: null|Date, consecutiveErrors: number}}
 */
const serviceState = {
  isUp: true,
  lastCheck: null,
  consecutiveErrors: 0,
};

/**
 * Check the service status and collect metrics
 * @returns {Promise<void>}
 */
async function checkService() {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  let responseTime = 0;
  let error = null;
  let isStatusChange = false;
  let isHighLatency = false;

  try {
    const response = await axios.get(config.monitoring.serviceUrl, {
      timeout: config.monitoring.requestTimeout,
    });

    responseTime = Date.now() - startTime;
    const status = response.status === 200 ? 'up' : 'down';

    // Log the check
    logger.info('Service status check', {
      url: config.monitoring.serviceUrl,
      status: response.status,
      responseTime,
      type: 'status_check',
    });

    // Check for response time threshold
    if (responseTime > config.monitoring.thresholds.responseTime) {
      logger.warn('High latency detected', {
        type: 'alert',
        alertType: 'high_latency',
        details: {
          responseTime,
          threshold: config.monitoring.thresholds.responseTime,
        },
      });
      isHighLatency = true;
    }

    // Check for status changes
    if (!serviceState.isUp && status === 'up') {
      logger.info('Service recovered', {
        type: 'status_change',
        from: 'down',
        to: 'up',
      });
      isStatusChange = true;
    }

    serviceState.isUp = true;
    serviceState.consecutiveErrors = 0;
  } catch (error) {
    serviceState.consecutiveErrors++;
    responseTime = Date.now() - startTime;

    logger.error('Service check failed', {
      error: error.message,
      type: 'error',
    });

    if (serviceState.isUp || serviceState.consecutiveErrors >= config.monitoring.thresholds.errorCount) {
      serviceState.isUp = false;
      isStatusChange = true;
    }
  }

  // Send status report
  await alertService.sendStatusReport({
    isUp: serviceState.isUp,
    responseTime,
    error: error ? error.message : null,
    isHighLatency,
    isStatusChange
  });

  serviceState.lastCheck = new Date();
}

/**
 * Initialize the monitoring service
 */
function initMonitoring() {
  logger.info('Starting monitoring service', {
    interval: config.monitoring.interval,
    url: config.monitoring.serviceUrl,
  });

  // Effectuer une première vérification immédiatement
  checkService();

  // Planifier les vérifications suivantes
  cron.schedule(config.monitoring.interval, checkService);
}

module.exports = {
  initMonitoring,
  checkService, // Exported for testing purposes
};
