const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  customerUniqueId: { type: String },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  persona: { type: String, default: '' },
  rfmR: { type: Number, default: 0 },
  rfmF: { type: Number, default: 0 },
  rfmM: { type: Number, default: 0 },
  rfmScore: { type: Number, default: 0 },
  totalSpend: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  avgReviewScore: { type: Number, default: 0 },
  sentimentScore: { type: Number, default: 0 },
  churnRisk: { type: Number, default: 0 },
  clv: { type: Number, default: 0 },
  lastOrderDate: { type: Date },
  topCategory: { type: String, default: '' },
}, { timestamps: true });

customerSchema.index({ persona: 1 });
customerSchema.index({ state: 1 });
customerSchema.index({ rfmScore: -1 });

module.exports = mongoose.model('Customer', customerSchema);
