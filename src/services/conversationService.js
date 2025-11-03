const Lead = require('../models/Lead');
const INVOCK_INFO = require('../config/invockInfo');
const googleCalendarService = require('./googleCalendarService');
const groqService = require('./groqService');

class ConversationService {
  async processMessage(phoneNumber, messageText) {
    try {
      let lead = await Lead.findOne({ phoneNumber });
      
      if (!lead) {
        lead = new Lead({ phoneNumber });
        await lead.save();
      }

      lead.messages.push({ role: 'user', content: messageText, timestamp: new Date() });
      const response = await this.handleMessage(messageText, lead);
      lead.messages.push({ role: 'bot', content: response, timestamp: new Date() });
      await lead.save();

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return "I apologize for the technical difficulty. Please try again.";
    }
  }

  async handleMessage(messageText, lead) {
    const text = messageText.toLowerCase().trim();

    if (/^(hi|hello|hey|नमस्ते|નમસ્તે|namaste|reset|restart)$/i.test(text)) {
      lead.conversationState = null;
      lead.fullName = '';
      lead.email = '';
      lead.businessName = '';
      lead.preferredDate = '';
      lead.preferredTime = '';
      await lead.save();
    }

    if (lead.conversationState === 'collecting_name') {
      return await this.collectName(messageText, lead);
    }
    
    if (lead.conversationState === 'collecting_email') {
      return await this.collectEmail(messageText, lead);
    }
    
    if (lead.conversationState === 'collecting_business') {
      return await this.collectBusiness(messageText, lead);
    }

    if (lead.conversationState === 'collecting_date') {
      return await this.collectDate(messageText, lead);
    }

    if (lead.conversationState === 'collecting_time') {
      return await this.collectTime(messageText, lead);
    }

    try {
      const recentMessages = lead.messages.slice(-6);
      const aiResponse = await groqService.chat(messageText, recentMessages);

      if (aiResponse.trim() === 'SCHEDULE_DEMO' || aiResponse.includes('SCHEDULE_DEMO')) {
        return await this.startDemoScheduling(lead);
      }

      return aiResponse;
    } catch (error) {
      console.error('AI service error:', error.message);
      return this.getFallbackResponse(text, lead);
    }
  }

  async startDemoScheduling(lead) {
    lead.conversationState = 'collecting_name';
    lead.fullName = '';
    lead.email = '';
    lead.businessName = '';
    lead.preferredDate = '';
    lead.preferredTime = '';
    lead.demoScheduled = false;
    await lead.save();
    
    return "Excellent! I'd be happy to schedule a demo for you. 😊\n\nTo get started, may I have your *full name*?\n\n(Say 'cancel' anytime to stop)";
  }

  async collectName(messageText, lead) {
    const name = messageText.trim();

    const cancelKeywords = ['cancel', 'stop', 'back', 'nahi chahiye', 'exit', 'quit', 'बंद करो', 'रद्द करो'];
    if (cancelKeywords.some(keyword => name.toLowerCase() === keyword)) {
      lead.conversationState = null;
      lead.fullName = '';
      lead.email = '';
      lead.businessName = '';
      lead.preferredDate = '';
      lead.preferredTime = '';
      await lead.save();
      return "No problem! Demo scheduling cancelled. ✅\n\nHow else can I help you? 😊";
    }

    const questionIndicators = ['what', 'kya', 'क्या', 'how', 'kaise', 'कैसे', 'tell', 'batao', 'बताओ', 'explain', 'समझाओ', 'feature', 'price', 'pricing', 'cost', 'forecast', '?', 'कीमत', 'फीचर'];
    
    if (questionIndicators.some(indicator => name.toLowerCase().includes(indicator))) {
      try {
        const recentMessages = lead.messages.slice(-6);
        const aiResponse = await groqService.chat(messageText, recentMessages);
        return `${aiResponse}\n\n━━━━━━━━━━━━━━━━━\n\nTo continue scheduling your demo, please provide your *full name* 😊\n\n(Or say 'cancel' to stop)`;
      } catch (error) {
        return "I'd be happy to answer that! But first, let me get your demo scheduled.\n\nPlease provide your *full name* so we can proceed. 😊\n\n(Or say 'cancel' to stop)";
      }
    }

    const fillerWords = ['yes', 'haan', 'हाँ', 'ok', 'okay', 'sure', 'achha', 'theek', 'han', 'ठीक है', 'thanks', 'thank', 'thank you', 'thankyou', 'धन्यवाद', 'shukriya', 'शुक्रिया', 'good', 'great', 'nice', 'cool', 'awesome', 'बढ़िया', 'अच्छा'];
    
    if (fillerWords.some(word => name.toLowerCase() === word || name.toLowerCase().includes(word))) {
      return "Please provide your *actual full name* (First and Last name) 😊\n\nExample: Rajesh Kumar\n\n(Or say 'cancel' to stop)";
    }

    if (name.length < 3) {
      return "Please provide your *complete full name* (First and Last name).\n\nExample: Rajesh Kumar\n\n(Or say 'cancel' to stop)";
    }

    lead.fullName = name;
    lead.conversationState = 'collecting_email';
    await lead.save();
    
    return `Thank you, *${name}*! 👋\n\nWhat *email address* should we send the calendar invite to?\n\nExample: rajesh@company.com\n\n(Or say 'cancel' to stop)`;
  }

  async collectEmail(messageText, lead) {
    const text = messageText.trim();

    const cancelKeywords = ['cancel', 'stop', 'back', 'nahi chahiye', 'exit', 'quit', 'बंद करो', 'रद्द करो'];
    if (cancelKeywords.some(keyword => text.toLowerCase() === keyword)) {
      lead.conversationState = null;
      lead.fullName = '';
      lead.email = '';
      lead.businessName = '';
      lead.preferredDate = '';
      lead.preferredTime = '';
      await lead.save();
      return "No problem! Demo scheduling cancelled. ✅\n\nHow else can I help you? 😊";
    }

    const questionIndicators = ['what', 'kya', 'क्या', 'how', 'kaise', 'कैसे', 'tell', 'batao', 'बताओ', 'explain', 'समझाओ', 'feature', 'price', 'pricing', 'cost', 'forecast', '?', 'कीमत', 'फीचर'];
    
    if (questionIndicators.some(indicator => text.toLowerCase().includes(indicator))) {
      try {
        const recentMessages = lead.messages.slice(-6);
        const aiResponse = await groqService.chat(messageText, recentMessages);
        return `${aiResponse}\n\n━━━━━━━━━━━━━━━━━\n\nTo continue, please provide your *email address* 📧\n\nExample: rajesh@company.com\n\n(Or say 'cancel' to stop)`;
      } catch (error) {
        return "I'd be happy to answer that! But let's complete your demo booking first.\n\nPlease provide your *email address* 📧\n\n(Or say 'cancel' to stop)";
      }
    }

    const emailMatch = text.match(/\S+@\S+\.\S+/);
    
    if (!emailMatch) {
      return "Please provide a *valid email address* 📧\n\nExample: rajesh@company.com\n\nMake sure it includes @ and domain (.com, .in, etc.)\n\n(Or say 'cancel' to stop)";
    }

    lead.email = emailMatch[0];
    lead.conversationState = 'collecting_business';
    await lead.save();
    
    return "Perfect! 📧\n\nWhat's your *company or business name*?\n\n(Or say 'cancel' to stop)";
  }

  async collectBusiness(messageText, lead) {
    const business = messageText.trim();

    const cancelKeywords = ['cancel', 'stop', 'back', 'nahi chahiye', 'exit', 'quit', 'बंद करो', 'रद्द करो'];
    if (cancelKeywords.some(keyword => business.toLowerCase() === keyword)) {
      lead.conversationState = null;
      lead.fullName = '';
      lead.email = '';
      lead.businessName = '';
      lead.preferredDate = '';
      lead.preferredTime = '';
      await lead.save();
      return "No problem! Demo scheduling cancelled. ✅\n\nHow else can I help you? 😊";
    }

    const questionIndicators = ['what', 'kya', 'क्या', 'how', 'kaise', 'कैसे', 'tell', 'batao', 'बताओ', 'explain', 'समझाओ', 'feature', 'price', 'pricing', 'cost', 'forecast', '?', 'कीमत', 'फीचर'];
    
    if (questionIndicators.some(indicator => business.toLowerCase().includes(indicator))) {
      try {
        const recentMessages = lead.messages.slice(-6);
        const aiResponse = await groqService.chat(messageText, recentMessages);
        return `${aiResponse}\n\n━━━━━━━━━━━━━━━━━\n\nTo complete your demo booking, please provide your *company name* 🏢\n\n(Or say 'cancel' to stop)`;
      } catch (error) {
        return "I'd be happy to answer that! But let's finish booking your demo first.\n\nPlease provide your *company or business name* 🏢\n\n(Or say 'cancel' to stop)";
      }
    }
    
    if (business.length < 2) {
      return "Please provide your *company or business name* 🏢\n\nExample: TechCorp India\n\n(Or say 'cancel' to stop)";
    }

    lead.businessName = business;
    lead.conversationState = 'collecting_date';
    await lead.save();
    
    return "Excellent! 🏢\n\nWhen would you like to schedule the demo?\n\nPlease provide your *preferred date* 📅\n\nExamples:\n• Tomorrow\n• Monday\n• November 15\n• 15th Nov\n\n(Or say 'cancel' to stop)";
  }

  async collectDate(messageText, lead) {
    const dateInput = messageText.trim();

    const cancelKeywords = ['cancel', 'stop', 'back', 'nahi chahiye', 'exit', 'quit', 'बंद करो', 'रद्द करो'];
    if (cancelKeywords.some(keyword => dateInput.toLowerCase() === keyword)) {
      lead.conversationState = null;
      lead.fullName = '';
      lead.email = '';
      lead.businessName = '';
      lead.preferredDate = '';
      lead.preferredTime = '';
      await lead.save();
      return "No problem! Demo scheduling cancelled. ✅\n\nHow else can I help you? 😊";
    }

    if (dateInput.length < 3) {
      return "Please provide a valid date 📅\n\nExamples:\n• Tomorrow\n• Monday\n• November 15\n• 15th Nov\n\n(Or say 'cancel' to stop)";
    }

    lead.preferredDate = dateInput;
    lead.conversationState = 'collecting_time';
    await lead.save();
    
    return "Perfect! 📅\n\nWhat *time* works best for you? ⏰\n\n*Available slots: 9:00 AM - 6:00 PM*\n\nExamples:\n• 10:00 AM\n• 2:00 PM\n• 11:30 AM\n• 4:00 PM\n\n(Or say 'cancel' to stop)";
  }

  async collectTime(messageText, lead) {
    const timeInput = messageText.trim();

    const cancelKeywords = ['cancel', 'stop', 'back', 'nahi chahiye', 'exit', 'quit', 'बंद करो', 'रद्द करो'];
    if (cancelKeywords.some(keyword => timeInput.toLowerCase() === keyword)) {
      lead.conversationState = null;
      lead.fullName = '';
      lead.email = '';
      lead.businessName = '';
      lead.preferredDate = '';
      lead.preferredTime = '';
      await lead.save();
      return "No problem! Demo scheduling cancelled. ✅\n\nHow else can I help you? 😊";
    }

    const timeValidation = this.validateTime(timeInput);
    
    if (!timeValidation.valid) {
      return timeValidation.message;
    }

    lead.preferredTime = timeInput;
    lead.conversationState = null;
    lead.demoScheduled = true;
    await lead.save();
    
    const calendarResult = await this.scheduleCalendarEvent(lead);
    
    if (calendarResult.success) {
      return `🎉 Excellent! Your demo is scheduled!\n\n*Summary:*\n👤 *Name:* ${lead.fullName}\n📧 *Email:* ${lead.email}\n🏢 *Company:* ${lead.businessName}\n📅 *Date:* ${lead.preferredDate}\n⏰ *Time:* ${lead.preferredTime}\n\n✅ A calendar invite with Google Meet link has been sent to *${lead.email}*\n\nOur team is excited to show you how Invock can transform your inventory management!\n\nLooking forward to meeting you! 🚀`;
    } else {
      return `✅ Demo details recorded!\n\n*Summary:*\n👤 *Name:* ${lead.fullName}\n📧 *Email:* ${lead.email}\n🏢 *Company:* ${lead.businessName}\n📅 *Date:* ${lead.preferredDate}\n⏰ *Time:* ${lead.preferredTime}\n\nOur team will send you a calendar invite shortly with the Google Meet link.\n\nLooking forward to meeting you! 🚀`;
    }
  }

  validateTime(timeInput) {
    const input = timeInput.toLowerCase().trim();
    
    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(am|pm|a\.m\.|p\.m\.)/i,
      /(\d{1,2})\s*(am|pm|a\.m\.|p\.m\.)/i,
      /(\d{1,2}):(\d{2})/,
    ];

    let hour = null;
    let minute = 0;
    let isPM = false;

    for (const pattern of timePatterns) {
      const match = input.match(pattern);
      if (match) {
        hour = parseInt(match[1]);
        minute = match[2] ? parseInt(match[2]) : 0;
        
        if (match[3]) {
          const period = match[3].toLowerCase().replace(/\./g, '');
          isPM = period === 'pm';
          if (isPM && hour !== 12) hour += 12;
          if (!isPM && hour === 12) hour = 0;
        }
        break;
      }
    }

    if (hour === null) {
      return {
        valid: false,
        message: "Please provide a valid time ⏰\n\n*Available slots: 9:00 AM - 6:00 PM*\n\nExamples:\n• 10:00 AM\n• 2:00 PM\n• 11:30 AM\n\n(Or say 'cancel' to stop)"
      };
    }

    if (hour < 9 || hour >= 18) {
      return {
        valid: false,
        message: "⚠️ Please select a time between *9:00 AM and 6:00 PM*.\n\nExamples:\n• 10:00 AM\n• 2:00 PM\n• 11:30 AM\n• 5:00 PM\n\n(Or say 'cancel' to stop)"
      };
    }

    return { valid: true };
  }

  parseDateTime(dateInput, timeInput) {
    const now = new Date();
    let targetDate = new Date();

    const dateLower = dateInput.toLowerCase();
    
    if (dateLower.includes('tomorrow') || dateLower.includes('कल')) {
      targetDate.setDate(now.getDate() + 1);
    } else if (dateLower.includes('today') || dateLower.includes('आज')) {
      
    } else if (dateLower.includes('day after tomorrow')) {
      targetDate.setDate(now.getDate() + 2);
    } else {
      const dateMatch = dateInput.match(/(\d{1,2})/);
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        targetDate.setDate(day);
        if (targetDate < now) {
          targetDate.setMonth(targetDate.getMonth() + 1);
        }
      } else {
        targetDate.setDate(now.getDate() + 1);
      }
    }

    const input = timeInput.toLowerCase().trim();
    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(am|pm|a\.m\.|p\.m\.)/i,
      /(\d{1,2})\s*(am|pm|a\.m\.|p\.m\.)/i,
      /(\d{1,2}):(\d{2})/,
    ];

    let hour = 14;
    let minute = 0;

    for (const pattern of timePatterns) {
      const match = input.match(pattern);
      if (match) {
        hour = parseInt(match[1]);
        minute = match[2] ? parseInt(match[2]) : 0;
        
        if (match[3]) {
          const period = match[3].toLowerCase().replace(/\./g, '');
          const isPM = period === 'pm';
          if (isPM && hour !== 12) hour += 12;
          if (!isPM && hour === 12) hour = 0;
        }
        break;
      }
    }

    targetDate.setHours(hour, minute, 0, 0);
    
    return targetDate;
  }

  async scheduleCalendarEvent(lead) {
    try {
      const startTime = this.parseDateTime(lead.preferredDate, lead.preferredTime);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      const eventDetails = {
        summary: `Invock Product Demo - ${lead.businessName}`,
        description: `Product Demo for ${lead.businessName}

Attendee: ${lead.fullName}
Email: ${lead.email}
Phone: ${lead.phoneNumber}
Preferred Date: ${lead.preferredDate}
Preferred Time: ${lead.preferredTime}

We're excited to show you how Invock can streamline your inventory management!`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        attendees: [
          { email: lead.email, displayName: lead.fullName }
        ],
      };

      const result = await googleCalendarService.createEvent(eventDetails);
      
      if (result.success) {
        lead.calendarEventId = result.eventId;
        lead.calendarEventLink = result.htmlLink;
        lead.meetLink = result.meetLink;
        await lead.save();
        return { success: true };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Error scheduling calendar event:', error);
      return { success: false };
    }
  }

  getFallbackResponse(text, lead) {
    if (/^(hi|hello|hey|नमस्ते|નમસ્તે)/.test(text)) {
      return '👋 Welcome to Invock - Smart Inventory Management!\n\nI can help you with:\n• Learn about features\n• Pricing information\n• Schedule a demo\n\nHow can I assist you? 😊';
    }

    if (text.includes('feature') || text.includes('फीचर') || text.includes('what do')) {
      return '🚀 Invock has 5 core features:\n\n📊 Real-Time Stock Tracking\n📦 Automated Order Management\n🤖 Smart AI Forecasting\n🔗 Multi-Channel Integration\n📈 Reports & Analytics\n\nWould you like to schedule a demo? 😊';
    }

    if (text.includes('demo') || text.includes('schedule') || text.includes('डेमो') || text.includes('book')) {
      return this.startDemoScheduling(lead);
    }

    if (text.includes('price') || text.includes('pricing') || text.includes('cost') || text.includes('कीमत')) {
      return '💰 Our pricing plans:\n\n*Starter* - ₹2,999/month\n• 1,000 products, 2 users\n\n*Professional* - ₹7,999/month\n• 10,000 products, AI forecasting\n\n*Enterprise* - Custom\n• Unlimited everything\n\nWant to see which fits your business? Schedule a demo! 🚀';
    }

    return "I'm here to help! I can tell you about:\n• Features & capabilities\n• Pricing plans\n• Schedule a demo\n\nWhat would you like to know? 😊";
  }
}

module.exports = new ConversationService();