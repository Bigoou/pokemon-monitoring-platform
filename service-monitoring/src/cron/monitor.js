const cron = require('node-cron');
const axios = require('axios');
const config = require('../config/config');
const discordAlert = require('../alerts/discordAlert');
const logger = require('../utils/logger');

class MonitoringService {
  constructor() {
    this.serviceStates = new Map();
  }

  /**
   * Starts the monitoring service
   */
  start() {
    cron.schedule(config.monitoring.interval, () => {
      config.monitoring.services.forEach((service) => this.checkService(service));
    });

    logger.info('Monitoring service started', {
      metadata: { type: 'service_start', interval: config.monitoring.interval },
    });
  }

  /**
   * Checks the status of a service
   * @param {Object} service Service configuration
   */
  async checkService(service) {
    const startTime = Date.now();
    let status = 'up';
    let responseTime = 0;
    let error = null;

    try {
      const response = await axios.get(service.url, {
        timeout: config.monitoring.timeout,
      });

      responseTime = Date.now() - startTime;
      status = response.status === service.expectedStatus ? 'up' : 'down';

      if (responseTime > service.responseTimeThreshold) {
        logger.warn('High response time detected', {
          metadata: {
            type: 'performance',
            responseTime,
            threshold: service.responseTimeThreshold,
          },
        });
      }
    } catch (err) {
      status = 'down';
      error = err.message;
      logger.error('Service check failed', {
        metadata: { type: 'error', error: err.message, service: service.name },
      });
    }

    const previousState = this.serviceStates.get(service.url);
    if (previousState !== status) {
      await discordAlert.sendStatusAlert({
        status,
        serviceName: service.name,
        url: service.url,
        responseTime,
        error,
      });
    }

    this.serviceStates.set(service.url, status);

    logger.info('Service status check completed', {
      metadata: {
        type: 'status_check',
        service: service.name,
        status,
        responseTime,
      },
    });
  }
}

module.exports = new MonitoringService();
