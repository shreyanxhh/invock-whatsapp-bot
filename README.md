# Invock WhatsApp Chatbot

An intelligent WhatsApp chatbot for Invock's inventory management platform. The bot handles customer inquiries, provides product information, and schedules product demos automatically.

## Features

- **Multi-language Support**: Responds in user's language (English, Hindi, Tamil, Telugu, Gujarati, and more)
- **AI-Powered Conversations**: Natural language understanding using Groq AI
- **Demo Scheduling**: Automated demo booking with Google Calendar integration
- **Lead Management**: Stores customer interactions in MongoDB
- **WhatsApp Business API**: Seamless integration with Meta's WhatsApp Business Platform

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **AI**: Groq (Llama 3.3 70B)
- **APIs**: WhatsApp Business API, Google Calendar API
- **Tunneling**: Cloudflare Tunnel (for development webhooks)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- WhatsApp Business Account
- Google Cloud Project with Calendar API enabled
- Groq API Account
- Cloudflare account (free)

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/shreyanxhh/invock-whatsapp-bot.git
cd invock-whatsapp-bot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Install Cloudflare Tunnel
```bash
# macOS/Linux
brew install cloudflare/cloudflare/cloudflared

# Windows
# Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### 4. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 5. Configure WhatsApp Webhook

1. Start your server:
```bash
npm run dev
```

2. In a separate terminal, start Cloudflare tunnel:
```bash
cloudflared tunnel --url http://localhost:3001
```

3. Copy the generated URL (e.g., `https://xxxx-xxxx-xxxx.trycloudflare.com`)

4. Go to [Meta Developer Console](https://developers.facebook.com/apps)

5. Navigate to: WhatsApp > Configuration

6. Set Webhook URL: `https://your-tunnel-url.trycloudflare.com/webhook`

7. Set Verify Token: (same as `WEBHOOK_VERIFY_TOKEN` in your `.env`)

8. Subscribe to webhook fields: `messages`

## Environment Variables

Create a `.env` file based on `.env.example`:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/invock-bot

# WhatsApp Business API
WHATSAPP_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WEBHOOK_VERIFY_TOKEN=your_custom_verify_token

# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key

# Google Calendar API
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Getting API Credentials

#### WhatsApp Business API
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create app > Business > WhatsApp
3. Get temporary token from WhatsApp > API Setup
4. Copy Phone Number ID from same page
5. Note: Temporary tokens expire every 24 hours in development

#### Groq API
1. Sign up at [Groq Console](https://console.groq.com/)
2. Navigate to API Keys
3. Create new API key
4. Copy and save securely

#### Google Calendar API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Generate refresh token using OAuth Playground

## Running the Application

### Development Mode

You need **TWO terminal windows** running simultaneously:

**Terminal 1 - Application Server:**
```bash
npm run dev
```

**Terminal 2 - Cloudflare Tunnel:**
```bash
cloudflared tunnel --url http://localhost:3001
```

The server will start on `http://localhost:3001` and Cloudflare will create a public URL for WhatsApp webhooks.

### Production Mode
```bash
npm start
```

For production, deploy to a cloud platform with a public HTTPS URL instead of using Cloudflare tunnel.

## Project Structure
```
invock-bot/
├── src/
│   ├── config/
│   │   └── invockInfo.js      # Product information
│   ├── controllers/
│   │   └── webhookController.js  # Webhook handling
│   ├── models/
│   │   └── Lead.js            # Lead data model
│   ├── routes/
│   │   └── webhook.js         # Webhook routes
│   ├── services/
│   │   ├── conversationService.js  # Main conversation logic
│   │   ├── groqService.js     # AI service integration
│   │   ├── googleCalendarService.js  # Calendar integration
│   │   └── whatsappService.js  # WhatsApp API calls
│   └── app.js                 # Main application entry
├── .env.example               # Environment template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies
└── README.md                 # Documentation
```

## API Endpoints

- `GET /webhook` - Webhook verification endpoint
- `POST /webhook` - Receive incoming WhatsApp messages
- `GET /health` - Health check endpoint

## Features in Detail

### Multi-language Conversational AI
The bot automatically detects the user's language and responds accordingly. It uses Groq's Llama 3.3 70B model for natural language understanding and generation.

Supported languages include:
- English
- Hindi
- Tamil
- Telugu
- Kannada
- Malayalam
- Bengali
- Marathi
- Gujarati
- Punjabi
- And many more...

### Intelligent Demo Scheduling
The bot guides users through a conversational flow to schedule product demos:

1. **Name Collection**: Validates and collects full name
2. **Email Collection**: Validates email format
3. **Company Collection**: Collects business/company name
4. **Calendar Creation**: Automatically creates Google Calendar event with Meet link
5. **Confirmation**: Sends calendar invite to user's email

Users can:
- Ask questions during the booking process
- Cancel booking at any time by saying "cancel"
- Restart the conversation by greeting again

### Lead Management
All conversations are stored in MongoDB with:
- Customer phone number
- Full conversation history
- Demo scheduling status
- Calendar event details
- Timestamps for all interactions

### Smart Conversation Handling
The bot can:
- Answer questions about features, pricing, and functionality
- Handle follow-up questions
- Maintain context across conversations
- Detect and respond to various intents
- Gracefully handle errors with fallback responses

## Troubleshooting

### WhatsApp Token Expired
**Error**: `401 Unauthorized`

**Solution**: Temporary tokens expire every 24 hours. Get a new token from Meta Developer Console:
1. Go to WhatsApp > API Setup
2. Copy the new temporary access token
3. Update `WHATSAPP_TOKEN` in `.env`
4. Restart the server

### Webhook Not Receiving Messages
**Error**: Messages sent to WhatsApp but bot doesn't respond

**Solution**: 
1. Ensure Cloudflare tunnel is running
2. Copy the tunnel URL and update in Meta Developer Console
3. Verify webhook subscription is active
4. Check server logs for incoming requests

### MongoDB Connection Failed
**Error**: `MongooseError: Connection failed`

**Solution**:
1. Ensure MongoDB is running: `mongod` (or check your cloud MongoDB)
2. Verify `MONGODB_URI` in `.env` is correct
3. Check network connectivity

### Groq API Rate Limit
**Error**: `429 Rate limit exceeded`

**Solution**:
- Free tier has daily limits
- Wait for rate limit to reset
- Consider upgrading Groq plan for production

## Deployment

### Recommended Platforms
- **Heroku**: Easy deployment with add-ons for MongoDB
- **Railway**: Modern platform with good free tier
- **AWS EC2**: Full control, requires more setup
- **DigitalOcean**: Simple droplets with good pricing

### Deployment Steps (Generic)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables in platform dashboard
4. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)
5. Update WhatsApp webhook URL to production URL
6. Deploy and monitor logs

## Security Notes

- Never commit `.env` file to version control
- Rotate API keys regularly
- Use environment variables for all sensitive data
- Enable HTTPS in production (required by WhatsApp)
- Implement rate limiting for production
- Monitor API usage and costs

## Performance Optimization

- Connection pooling for MongoDB
- Caching frequently accessed data
- Async/await for non-blocking operations
- Limited conversation history (last 6 messages) to reduce token usage
- Error handling with graceful fallbacks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Testing

### Manual Testing
Send messages to your WhatsApp test number:
- Greetings in different languages
- Feature inquiries
- Pricing questions
- Demo scheduling flow
- Cancellation scenarios

### Test Cases
- ✅ English conversation
- ✅ Hindi conversation
- ✅ Complete demo booking
- ✅ Cancel during booking
- ✅ Ask questions during booking
- ✅ Invalid email handling
- ✅ Filler word rejection

## Roadmap

- [ ] Add support for voice messages
- [ ] Implement analytics dashboard
- [ ] Add automated follow-up messages
- [ ] Support for multiple languages simultaneously
- [ ] Integration with CRM systems
- [ ] Rich media support (images, videos)
- [ ] Payment integration for demos