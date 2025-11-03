const whatsappService = require('../services/whatsappService');
const conversationService = require('../services/conversationService');

class WebhookController {
  async verifyWebhook(req, res) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully');
        res.status(200).send(challenge);
      } else {
        console.log('❌ Webhook verification failed');
        res.sendStatus(403);
      }
    } catch (error) {
      console.error('❌ Error in webhook verification:', error);
      res.sendStatus(500);
    }
  }

  async handleWebhook(req, res) {
    try {
      const messageData = whatsappService.parseWebhookMessage(req.body);

      if (!messageData) {
        return res.sendStatus(200);
      }

      res.sendStatus(200);

      this.processIncomingMessage(messageData);
    } catch (error) {
      console.error('❌ Error handling webhook:', error);
      res.sendStatus(500);
    }
  }

  async processIncomingMessage(messageData) {
    try {
      const { from, text } = messageData;

      const response = await conversationService.processMessage(from, text);

      await whatsappService.sendMessage(from, response);
    } catch (error) {
      console.error('❌ Error processing message:', error);
      
      try {
        await whatsappService.sendMessage(
          messageData.from,
          "I apologize, but I encountered an error. Please try again."
        );
      } catch (sendError) {
        console.error('❌ Error sending error message:', sendError);
      }
    }
  }
}

module.exports = new WebhookController();