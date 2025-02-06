require('dotenv').config();
const { initServer } = require('./src/server');
const { initMonitoring } = require('./src/cron/monitor');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 8080;

async function start() {
  try {
    // Initialize server
    const server = await initServer();

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`, {
        type: 'server_start',
        port: PORT
      });
    });

    // Initialize monitoring
    initMonitoring();
  } catch (error) {
    logger.error('Failed to start application', {
      error: error.message,
      type: 'startup_error'
    });
    process.exit(1);
  }
}

start();
