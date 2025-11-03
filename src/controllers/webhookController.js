const conversationService = require('../services/conversationService');
const whatsappService = require('../services/whatsappService');

class WebhookController {
  constructor() {
    this.processedMessages = new Set();
  }

  async verifyWebhook(req, res) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
        console.log('Webhook verified successfully');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    } catch (error) {
      console.error('Webhook verification error:', error);
      res.sendStatus(500);
    }
  }

  async handleWebhook(req, res) {
    try {
      const entry = req.body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;

      if (value.messages && value.messages[0]) {
        const message = value.messages[0];
        const messageId = message.id;
        
        if (this.processedMessages.has(messageId)) {
          console.log('Duplicate message, skipping');
          return res.sendStatus(200);
        }
        
        this.processedMessages.add(messageId);
        
        if (this.processedMessages.size > 1000) {
          const firstId = this.processedMessages.values().next().value;
          this.processedMessages.delete(firstId);
        }

        const from = message.from;
        const messageBody = message.text?.body;

        if (messageBody) {
          const response = await conversationService.processMessage(from, messageBody);
          await whatsappService.sendMessage(from, response);
          console.log('Message sent successfully');
        }
      }

      res.sendStatus(200);
    } catch (error) {
      console.error('Error processing message:', error);
      res.sendStatus(500);
    }
  }
}

module.exports = new WebhookController();