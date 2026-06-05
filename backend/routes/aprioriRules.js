const express = require('express');
const router = express.Router();
const AprioriRule = require('../models/AprioriRule');
const { protect } = require('../middleware/authMiddleware');

// GET /api/apriori-rules?persona=...
router.get('/', protect, async (req, res) => {
  try {
    const { persona } = req.query;
    const query = persona ? { persona } : {};
    const rules = await AprioriRule.find(query).sort({ lift: -1 });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
