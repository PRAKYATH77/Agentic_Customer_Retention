const express = require('express');
const router = express.Router();
const LLMMessage = require('../models/LLMMessage');
const { protect } = require('../middleware/authMiddleware');

// GET /api/messages?persona=...&channel=...
router.get('/', protect, async (req, res) => {
  try {
    const { persona, channel, tone } = req.query;
    const query = {};
    if (persona) query.persona = persona;
    if (channel) query.channel = channel;
    if (tone) query.sentimentTone = tone;
    const messages = await LLMMessage.find(query).sort({ effectiveness: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/messages/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const data = await LLMMessage.aggregate([
      { $group: { _id: '$persona', count: { $sum: 1 }, avgEffectiveness: { $avg: '$effectiveness' } } },
      { $sort: { avgEffectiveness: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
