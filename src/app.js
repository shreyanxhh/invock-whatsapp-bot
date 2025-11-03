require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');
const webhookController = require('./controllers/webhookController');
const googleCalendarService = require('./services/googleCalendarService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to Database
connectDB();

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Invock WhatsApp Chatbot API',
    version: '1.0.0',
    endpoints: {
      webhook_verify: 'GET /webhook',
      webhook_receive: 'POST /webhook',
      google_auth: 'GET /auth/google'
    }
  });
});

// Google Calendar Authorization Routes
app.get('/auth/google', (req, res) => {
  const authUrl = googleCalendarService.getAuthUrl();
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const { tokens } = await googleCalendarService.oauth2Client.getToken(code);
    await googleCalendarService.saveTokens(tokens);
    res.send('✅ Google Calendar authorized successfully! You can close this window.');
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.send('❌ Authorization failed. Please try again.');
  }
});

// WhatsApp Webhook Routes
app.get('/webhook', webhookController.verifyWebhook.bind(webhookController));
app.post('/webhook', webhookController.handleWebhook.bind(webhookController));

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log('🚀 ================================');
  console.log('');
});

module.exports = app;