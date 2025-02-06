const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * Send message to Discord with error handling
 * @param {Object} params Message parameters
 * @returns {Promise<void>}
 */
async function sendDiscordMessage(params) {
  try {
    const message = {
      username: 'Service Monitoring',
      embeds: [{
        title: params.title,
        description: params.description,
        color: params.color,
        fields: params.fields,
        timestamp: new Date().toISOString()
      }]
    };

    await axios.post(config.discord.webhookUrl, message);
    logger.info('Discord alert sent successfully', {
      type: 'discord_alert',
      status: 'success',
    });
  } catch (error) {
    logger.error('Failed to send Discord alert', {
      type: 'discord_alert',
      status: 'error',
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Alert service for sending notifications to Discord
 */
class AlertService {
  /**
   * Send a status report
   * @param {Object} status Status information
   * @param {boolean} status.isUp Whether the service is up
   * @param {number} status.responseTime Response time in milliseconds
   * @param {string} [status.error] Error message if any
   * @param {boolean} [status.isHighLatency] Whether the service has high latency
   * @param {boolean} [status.isStatusChange] Whether this is a status change notification
   * @returns {Promise<void>}
   */
  async sendStatusReport(status) {
    const statusEmoji = status.isUp ? '🟢' : '🔴';
    const statusText = status.isUp ? 'Opérationnel' : 'Hors service';
    let color = status.isUp ? config.discord.colors.success : config.discord.colors.error;

    // Si la latence est élevée mais le service est up, utiliser la couleur warning
    if (status.isHighLatency && status.isUp) {
      color = config.discord.colors.warning;
    }

    const fields = [
      { name: 'URL', value: config.monitoring.serviceUrl },
      { name: 'État', value: statusText },
      { name: 'Temps de réponse', value: status.isUp ? `${status.responseTime}ms` : 'N/A' }
    ];

    if (status.error) {
      fields.push({ name: 'Erreur', value: status.error });
    }

    if (status.isHighLatency) {
      fields.push({ name: 'Seuil de latence', value: `${config.monitoring.thresholds.responseTime}ms` });
    }

    let description = 'État actuel du service Pokemon API';
    if (status.isStatusChange) {
      description = status.isUp 
        ? '✨ Le service est de nouveau opérationnel'
        : '❌ Le service est devenu injoignable';
    } else if (status.isHighLatency) {
      description = '⚠️ Le service répond avec une latence élevée';
    }

    await sendDiscordMessage({
      title: `${statusEmoji} Rapport d'état`,
      description,
      color,
      fields
    });
  }
}

module.exports = new AlertService(); 