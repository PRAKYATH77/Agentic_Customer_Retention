const mongoose = require('mongoose');

const personaSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true },
  count: { type: Number, default: 0 },
  avgRecency: { type: Number, default: 0 },
  avgFrequency: { type: Number, default: 0 },
  avgMonetary: { type: Number, default: 0 },
  avgReviewScore: { type: Number, default: 0 },
  churnRisk: { type: Number, default: 0 }, // 0-100
  clvScore: { type: Number, default: 0 },
  color: { type: String, default: '#6366F1' },
  icon: { type: String, default: 'users' },
  description: { type: String, default: '' },
  trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
  trendValue: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Persona', personaSchema);
