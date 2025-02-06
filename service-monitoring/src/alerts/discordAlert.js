const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * Send alert to Discord webhook
 * @param {object} alert - Alert information
 * @param {string} alert.type - Alert type ('error' or 'warning')
 * @param {string} alert.message - Alert message
 * @param {object} alert.details - Additional alert details
 */
async function sendDiscordAlert(alert) {
  try {
    const color = alert.type === 'error' 
      ? config.discord.colors.error 
      : config.discord.colors.warning;

    const message = {
      username: 'Service Monitoring',
      embeds: [{
        title: `${alert.type === 'error' ? '🔴' : '⚠️'} Alerte de Service`,
        description: alert.message,
        color,
        fields: [
          {
            name: 'Type',
            value: alert.type === 'error' ? 'Erreur' : 'Avertissement',
            inline: true
          },
          {
            name: 'Service',
            value: config.monitoring.serviceUrl,
            inline: true
          }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    // Ajouter des détails supplémentaires si disponibles
    if (alert.details?.responseTime) {
      message.embeds[0].fields.push({
        name: 'Temps de réponse',
        value: `${alert.details.responseTime}ms`,
        inline: true
      });
    }

    await axios.post(config.discord.webhookUrl, message);
    
    logger.info('Discord alert sent', {
      type: 'discord_alert',
      alertType: alert.type,
      message: alert.message
    });
  } catch (error) {
    logger.error('Failed to send Discord alert', {
      error: error.message,
      type: 'discord_alert_error'
    });
  }
}

module.exports = {
  sendDiscordAlert
}; 