const express = require('express');
const router = express.Router();
const axios = require('axios');

// Proxy to Python FastAPI service running on port 8000
router.post('/explain', async (req, res) => {
  try {
    const { persona, actionType } = req.body;
    
    // Attempt to call the Python API
    const pythonApiUrl = 'http://127.0.0.1:8000/api/explain';
    const response = await axios.post(pythonApiUrl, {
      persona,
      actionType
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error calling XAI API:', error.message);
    res.status(500).json({ 
      error: 'Failed to communicate with the Explainable AI (XAI) service. Is the Python server running on port 8000?' 
    });
  }
});

module.exports = router;
