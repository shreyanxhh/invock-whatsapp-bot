# Invock WhatsApp Chatbot Assignment

## Overview
This project is a WhatsApp chatbot built as part of the Invock internship assignment.  
It is designed to handle user interactions on WhatsApp, collect lead information (name, email, business), and schedule demo meetings with calendar integration.  
The bot follows a state machine approach to guide users through the flow.

## Features
- WhatsApp Webhook integration
- MongoDB for session and lead storage
- State machine-based flow handling
- Lead collection (Name, Email, Business)
- Date and time parsing for scheduling
- Calendar event creation
- Error handling and fallback replies

## Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB (Mongoose)**
- **WhatsApp Business Cloud API**
- **Chrono-node** (date parsing)
- **LocalTunnel** (for public webhook URL)

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/invock-whatsapp-bot.git
   cd invock-whatsapp-bot

2. Install dependencies:
bash
npm install

3. Create a .env file in the project root with the following values:
ini
MONGO_URI=your_mongodb_connection_string
VERIFY_TOKEN=choose-any-string
WHATSAPP_TOKEN=your_whatsapp_api_token
CALENDAR_CREDENTIALS=your_calendar_credentials

4. Run the development server:
bash
npm run dev

5. Expose the server using LocalTunnel:
bash
npx localtunnel --port 8080
Use the generated HTTPS URL to configure your WhatsApp webhook.

Current Status
The chatbot works end-to-end:
Connects to MongoDB
Handles webhook events
Stores sessions and leads
Guides users through the demo booking flow

Known Issue
At the final confirmation step, an error occurs related to date parsing (when.startISO).
Despite multiple debugging attempts (adjusting the date parsing logic and session handling), the error persists when confirming scheduled times.

This does not affect the earlier lead collection flow, which works correctly.
The repository demonstrates the main assignment requirements and the full implementation of the chatbot.