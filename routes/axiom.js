const express = require('express');
const router = express.Router();
const { getTokenInfo, getNewTrending, getTokenStats } = require('../controllers/axiomController');

// Route 1: Token Info API
router.get('/api/token-info', async (req, res) => {
  try {
    const { pairAddress } = req.query;

    const data = await getTokenInfo(pairAddress);
    res.json(data);
  } catch (error) {
    console.error('Token info route error:', error.message);
    res.status(400).json({
      error: error.message
    });
  }
});

// Route 2: New Trending API
router.get('/api/new-trending', async (req, res) => {
  try {
    const { timePeriod = '5m' } = req.query;

    const data = await getNewTrending(timePeriod);
    res.json(data);
  } catch (error) {
    console.error('New trending route error:', error.message);
    res.status(500).json({
      error: error.message
    });
  }
});

router.get('/api/token-stats', async (req, res) => {
  try {
    const { pairAddress } = req.query;

    const data = await getTokenStats(pairAddress);
    res.json(data);
  } catch (error) {
    console.error('Token info route error:', error.message);
    res.status(400).json({
      error: error.message
    });
  }
});

module.exports = router;
