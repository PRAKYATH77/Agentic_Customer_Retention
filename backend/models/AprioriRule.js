const mongoose = require('mongoose');

const aprioriRuleSchema = new mongoose.Schema({
  persona: { type: String, required: true },
  antecedents: { type: [String], default: [] },
  consequents: { type: [String], default: [] },
  support: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  lift: { type: Number, default: 0 },
  antecedentsRaw: { type: String, default: '' },
  consequentsRaw: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('AprioriRule', aprioriRuleSchema);
