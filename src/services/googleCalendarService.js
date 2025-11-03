const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    this.tokenPath = path.join(__dirname, '../../google-token.json');
  }

  // Generate auth URL for user to authorize
  getAuthUrl() {
    const scopes = ['https://www.googleapis.com/auth/calendar.events'];
    
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  // Save tokens after authorization
  async saveTokens(tokens) {
    this.oauth2Client.setCredentials(tokens);
    await fs.writeFile(this.tokenPath, JSON.stringify(tokens));
  }

  // Load saved tokens
  async loadTokens() {
    try {
      const content = await fs.readFile(this.tokenPath);
      const tokens = JSON.parse(content);
      this.oauth2Client.setCredentials(tokens);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Create calendar event
  async createEvent(eventDetails) {
    try {
      await this.loadTokens();

      const event = {
        summary: eventDetails.summary || 'Demo Meeting',
        description: eventDetails.description || 'Product demo scheduled via WhatsApp bot',
        start: {
          dateTime: eventDetails.startTime,
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: eventDetails.endTime,
          timeZone: 'Asia/Kolkata',
        },
        attendees: eventDetails.attendees || [],
        conferenceData: {
          createRequest: {
            requestId: `demo-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all',
      });

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        meetLink: response.data.hangoutLink,
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get available time slots
  async getAvailableSlots(date) {
    try {
      await this.loadTokens();

      const timeMin = new Date(date);
      timeMin.setHours(9, 0, 0, 0);
      
      const timeMax = new Date(date);
      timeMax.setHours(18, 0, 0, 0);

      const response = await this.calendar.freebusy.query({
        resource: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          items: [{ id: 'primary' }],
        },
      });

      const busy = response.data.calendars.primary.busy;
      const slots = this.generateTimeSlots(timeMin, timeMax, busy);

      return slots;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  }

  // Generate available time slots
  generateTimeSlots(start, end, busyPeriods) {
    const slots = [];
    const slotDuration = 60; // 1 hour in minutes
    
    let currentTime = new Date(start);
    
    while (currentTime < end) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
      
      // Check if slot overlaps with busy periods
      const isBusy = busyPeriods.some(busy => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return currentTime < busyEnd && slotEnd > busyStart;
      });
      
      if (!isBusy) {
        slots.push({
          start: currentTime.toISOString(),
          end: slotEnd.toISOString(),
          display: currentTime.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
          }),
        });
      }
      
      currentTime = slotEnd;
    }
    
    return slots;
  }
}

module.exports = new GoogleCalendarService();