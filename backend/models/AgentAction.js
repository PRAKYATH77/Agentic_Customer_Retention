const mongoose = require('mongoose');

const agentActionSchema = new mongoose.Schema({
  persona: { type: String, required: true },
  actionType: { type: String, required: true },
  expectedNetReward: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  episodesRun: { type: Number, default: 0 },
  convergenceRate: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('AgentAction', agentActionSchema);
