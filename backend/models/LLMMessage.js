const mongoose = require('mongoose');

const llmMessageSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  persona: { type: String, required: true },
  message: { type: String, required: true },
  actionType: { type: String, default: 'engagement' },
  channel: { type: String, enum: ['email', 'sms', 'push', 'whatsapp'], default: 'email' },
  sentimentTone: { type: String, enum: ['positive', 'neutral', 'urgent'], default: 'positive' },
  isRead: { type: Boolean, default: false },
  effectiveness: { type: Number, default: 0 }, // simulated open rate
}, { timestamps: true });

module.exports = mongoose.model('LLMMessage', llmMessageSchema);
