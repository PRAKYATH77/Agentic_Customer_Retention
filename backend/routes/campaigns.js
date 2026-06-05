const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const { protect } = require('../middleware/authMiddleware');

// GET /api/campaigns
router.get('/', protect, async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/campaigns
router.post('/', protect, async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/campaigns/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/campaigns/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await Campaign.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$revenueGenerated' },
        totalBudget: { $sum: '$budget' },
        avgOpenRate: { $avg: '$openRate' },
      }},
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
