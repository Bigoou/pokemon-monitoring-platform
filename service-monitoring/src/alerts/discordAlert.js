const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

class DiscordAlertService {
  constructor() {
    if (!config.discord.webhookUrl) {
      logger.warn('Initialisation du service Discord : URL du webhook manquante', {
        metadata: {
          type: 'initialization',
          service: 'discord',
          status: 'warning',
        },
      });
      return;
    }
    this.webhookUrl = config.discord.webhookUrl;
    logger.info('Service Discord initialisé avec succès', {
      metadata: {
        type: 'initialization',
        service: 'discord',
        status: 'success',
      },
    });
  }

  /**
   * Sends a service status alert to Discord
   * @param {Object} params Alert parameters
   * @param {string} params.status Current service status
   * @param {string} params.serviceName Name of the monitored service
   * @param {string} params.url Service URL
   * @param {number} params.responseTime Response time in ms
   * @param {string} [params.error] Error message if any
   */
  async sendStatusAlert({ status, serviceName, url, responseTime, error }) {
    // Log the attempt to send alert
    logger.info('Tentative d\'envoi d\'alerte Discord', {
      metadata: {
        type: 'alert_attempt',
        service: 'discord',
        targetService: serviceName,
        status: status,
      },
    });

    if (!this.webhookUrl) {
      logger.error('Échec de l\'envoi de l\'alerte : URL du webhook non configurée', {
        metadata: {
          type: 'alert_error',
          service: 'discord',
          reason: 'missing_webhook',
          targetService: serviceName,
        },
      });
      return;
    }

    const isDown = status === 'down';
    const payload = {
      username: 'Service Monitor',
      avatar_url: 'https://i.imgur.com/4M34hi2.png',
      embeds: [
        {
          title: isDown ? '🔴 Service Down' : '🟢 Service Up',
          description: `Service ${serviceName} est ${isDown ? 'injoignable' : 'rétabli'}`,
          color: isDown ? 0xff0000 : 0x00ff00,
          fields: [
            { name: 'URL', value: url },
            { name: 'Temps de réponse', value: `${responseTime}ms` },
            { name: 'Timestamp', value: new Date().toISOString() },
          ],
        },
      ],
    };

    if (error) {
      payload.embeds[0].fields.push({ name: 'Erreur', value: error });
    }

    try {
      await axios.post(this.webhookUrl, payload);
      logger.info('Alerte Discord envoyée avec succès', {
        metadata: {
          type: 'alert_success',
          service: 'discord',
          targetService: serviceName,
          status: status,
          responseTime: responseTime,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Échec de l\'envoi de l\'alerte Discord', {
        metadata: {
          type: 'alert_error',
          service: 'discord',
          targetService: serviceName,
          error: error.message,
          status: status,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}

module.exports = new DiscordAlertService();
