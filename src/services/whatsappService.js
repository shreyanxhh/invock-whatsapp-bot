const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.token = process.env.WHATSAPP_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.baseURL = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
  }

  async sendMessage(to, message) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Message sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending message:', error.response?.data || error.message);
      throw error;
    }
  }

  parseWebhookMessage(body) {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (!messages || messages.length === 0) return null;

      const message = messages[0];
      return {
        from: message.from,
        messageId: message.id,
        text: message.text?.body || '',
        type: message.type
      };
    } catch (error) {
      console.error('❌ Error parsing webhook:', error);
      return null;
    }
  }
}

module.exports = new WhatsAppService();