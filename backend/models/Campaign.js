const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  targetPersona: { type: String, required: true },
  actionType: { type: String, required: true },
  channel: { type: String, enum: ['email', 'sms', 'push', 'whatsapp'], default: 'email' },
  status: { type: String, enum: ['draft', 'active', 'paused', 'completed'], default: 'draft' },
  startDate: { type: Date },
  endDate: { type: Date },
  budget: { type: Number, default: 0 },
  targetCount: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  openRate: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  revenueGenerated: { type: Number, default: 0 },
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
