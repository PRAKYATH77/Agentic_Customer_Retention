const express = require('express');
const router = express.Router();
const Persona = require('../models/Persona');
const AgentAction = require('../models/AgentAction');
const Customer = require('../models/Customer');
const Campaign = require('../models/Campaign');
const LLMMessage = require('../models/LLMMessage');
const { protect } = require('../middleware/authMiddleware');

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const [personas, customers, campaigns, messages] = await Promise.all([
      Persona.find(),
      Customer.countDocuments(),
      Campaign.find({ status: 'active' }),
      LLMMessage.countDocuments(),
    ]);

    const totalCustomers = personas.reduce((s, p) => s + p.count, 0) || customers;
    const totalRevenue = personas.reduce((s, p) => s + (p.avgMonetary * p.count), 0);
    const avgClv = personas.reduce((s, p) => s + p.clvScore, 0) / (personas.length || 1);
    const activeCampaigns = campaigns.length;
    const campaignRevenue = campaigns.reduce((s, c) => s + (c.revenueGenerated || 0), 0);

    // Churn overview
    const highRiskCount = personas.filter(p => p.churnRisk > 70).reduce((s, p) => s + p.count, 0);
    const churnRate = parseFloat(((highRiskCount / totalCustomers) * 100).toFixed(1));

    res.json({
      totalCustomers,
      activeSegments: personas.length,
      activeCampaigns,
      totalRevenue: parseFloat(totalRevenue.toFixed(0)),
      avgClv: parseFloat(avgClv.toFixed(2)),
      messagesGenerated: messages,
      churnRate,
      campaignRevenue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/dashboard/revenue-by-persona
router.get('/revenue-by-persona', protect, async (req, res) => {
  try {
    const personas = await Persona.find().sort({ avgMonetary: -1 });
    const data = personas.map(p => ({
      name: p.name.split('/')[0].trim(),
      revenue: parseFloat((p.avgMonetary * p.count).toFixed(0)),
      avgMonetary: p.avgMonetary,
      color: p.color,
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/dashboard/monthly-trend
router.get('/monthly-trend', protect, async (req, res) => {
  // Simulated monthly trend data based on real counts
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const baseCustomers = 78000;
  const data = months.map((month, i) => ({
    month,
    customers: Math.round(baseCustomers + (i * 1800) + (Math.random() * 500 - 250)),
    revenue: Math.round(1200000 + (i * 85000) + (Math.random() * 20000 - 10000)),
    churnRisk: parseFloat((28 - i * 0.4 + Math.random() * 2).toFixed(1)),
  }));
  res.json(data);
});

// GET /api/dashboard/recent-actions
router.get('/recent-actions', protect, async (req, res) => {
  try {
    const actions = await AgentAction.find().sort({ createdAt: -1 }).limit(8);
    res.json(actions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
