const express = require('express');
const router = express.Router();
const AgentAction = require('../models/AgentAction');
const { protect } = require('../middleware/authMiddleware');

// GET /api/agent-actions
router.get('/', protect, async (req, res) => {
  try {
    const actions = await AgentAction.find().sort({ expectedNetReward: -1 });
    res.json(actions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/agent-actions/simulate
router.get('/simulate', protect, async (req, res) => {
  const { persona, budget = 100 } = req.query;
  try {
    const actions = await AgentAction.find(persona ? { persona } : {});
    const simulation = actions.map(a => ({
      ...a.toObject(),
      simulatedROI: parseFloat(((a.expectedNetReward * parseFloat(budget)) / (a.cost || 1)).toFixed(2)),
      feasible: a.cost <= parseFloat(budget),
    }));
    res.json(simulation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/agent-actions/learning-curve
router.get('/learning-curve', protect, async (req, res) => {
  // Return simulated Q-learning convergence data
  const episodes = Array.from({ length: 20 }, (_, i) => ({
    episode: (i + 1) * 50,
    reward: parseFloat((-0.8 + (i * 0.06) + (Math.random() * 0.05 - 0.025)).toFixed(3)),
    exploration: parseFloat((1 - i * 0.045).toFixed(3)),
  }));
  res.json(episodes);
});

module.exports = router;
