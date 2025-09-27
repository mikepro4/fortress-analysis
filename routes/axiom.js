const express = require('express');
const router = express.Router();
const axios = require("axios");
const { AXIOM_COOKIES } = require('./auth');

// BrightData Proxy Configuration
const proxyConfig = {
  host: "brd.superproxy.io",
  port: 33335,
  username: "brd-customer-hl_ab1ea610-zone-datacenter_proxy1",
  password: "oadmg57se1qi",
};

// Create axios instance with proxy
const axiosProxy = axios.create({
  proxy: {
    host: proxyConfig.host,
    port: proxyConfig.port,
    auth: {
      username: proxyConfig.username,
      password: proxyConfig.password
    }
  },
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; Fortress-API/1.0)'
  }
});

// Route 1: Token Info API
router.get('/api/token-info', async (req, res) => {
  try {
    const { pairAddress } = req.query;

    if (!pairAddress) {
      return res.status(400).json({ error: 'pairAddress parameter is required' });
    }

    const response = await axiosProxy.get('https://api9.axiom.trade/token-info', {
      params: { pairAddress },
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://axiom.trade',
        'Referer': 'https://axiom.trade/',
        'Cookie': AXIOM_COOKIES
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Token info API error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch token info',
      details: error.response?.data || error.message
    });
  }
});

// Route 2: New Trending API
router.get('/api/new-trending', async (req, res) => {
  try {
    const { timePeriod = '5m' } = req.query;

    const response = await axiosProxy.get('https://api3.axiom.trade/new-trending', {
      params: { timePeriod },
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        'Origin': 'https://axiom.trade',
        'Referer': 'https://axiom.trade/',
        'Cookie': AXIOM_COOKIES
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('New trending API error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch new trending data',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
