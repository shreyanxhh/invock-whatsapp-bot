const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  businessName: {
    type: String,
    default: ''
  },
  preferredDate: {
    type: String,
    default: ''
  },
  preferredTime: {
    type: String,
    default: ''
  },
  conversationState: {
    type: String,
    default: null
  },
  demoScheduled: {
    type: Boolean,
    default: false
  },
  messages: [{
    role: String,
    content: String,
    timestamp: Date
  }],
  calendarEventId: {
    type: String,
    default: ''
  },
  calendarEventLink: {
    type: String,
    default: ''
  },
  meetLink: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);