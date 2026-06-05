const express = require('express');
const router = express.Router();
const Persona = require('../models/Persona');
const { protect } = require('../middleware/authMiddleware');

// GET /api/personas
router.get('/', protect, async (req, res) => {
  try {
    const personas = await Persona.find().sort({ avgMonetary: -1 });
    res.json(personas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/personas/:slug
router.get('/:slug', protect, async (req, res) => {
  try {
    const persona = await Persona.findOne({ slug: req.params.slug });
    if (!persona) return res.status(404).json({ message: 'Persona not found' });
    res.json(persona);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
