require('dotenv').config();
const axios = require('axios');

async function testDiscord() {
  try {
    console.log('Webhook URL:', process.env.DISCORD_WEBHOOK_URL);
    
    console.log('Sending test message...');
    const message = {
      username: 'Service Monitoring',
      embeds: [{
        title: '🧪 Test Message',
        description: 'Ceci est un message de test du service de monitoring',
        color: 0x00FF00,
        fields: [
          { name: 'Test', value: 'Message de test' }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    await axios.post(process.env.DISCORD_WEBHOOK_URL, message);
    console.log('Message sent successfully!');
  } catch (error) {
    console.error('Error sending message:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testDiscord(); 