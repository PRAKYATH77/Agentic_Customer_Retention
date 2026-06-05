const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { protect } = require('../middleware/authMiddleware');

// GET /api/customers?page=1&limit=20&persona=...&state=...&search=...
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, persona, state, search, sortBy = 'rfmScore', order = 'desc' } = req.query;
    const query = {};
    if (persona) query.persona = persona;
    if (state) query.state = state;
    if (search) query.$or = [
      { customerId: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
    ];

    const sort = { [sortBy]: order === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [customers, total] = await Promise.all([
      Customer.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Customer.countDocuments(query),
    ]);

    res.json({ customers, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/customers/analytics/rfm-distribution
router.get('/analytics/rfm-distribution', protect, async (req, res) => {
  try {
    const customers = await Customer.find().select('rfmR rfmF rfmM persona').limit(500);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/customers/analytics/state-distribution
router.get('/analytics/state-distribution', protect, async (req, res) => {
  try {
    const data = await Customer.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 }, avgSpend: { $avg: '$totalSpend' } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findOne({ customerId: req.params.id });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
