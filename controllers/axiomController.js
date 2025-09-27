const axios = require("axios");
const { AXIOM_COOKIES } = require('../routes/auth');

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

/**
 * Fetches token information from Axiom API
 * @param {string} pairAddress - The pair address to query
 * @returns {Promise<Object>} Token information data
 */
const getTokenInfo = async (pairAddress) => {
  if (!pairAddress) {
    throw new Error('pairAddress parameter is required');
  }

  try {
    const response = await axiosProxy.get('https://api9.axiom.trade/token-info', {
      params: { pairAddress },
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://axiom.trade',
        'Referer': 'https://axiom.trade/',
        'Cookie': AXIOM_COOKIES
      }
    });

    return response.data;
  } catch (error) {
    console.error('Token info API error:', error.message);
    throw new Error(`Failed to fetch token info: ${error.response?.data || error.message}`);
  }
};

/**
 * Fetches new trending data from Axiom API
 * @param {string} timePeriod - The time period for trending data (default: '5m')
 * @returns {Promise<Object>} Trending data
 */
const getNewTrending = async (timePeriod = '5m') => {
  try {
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

    return response.data;
  } catch (error) {
    console.error('New trending API error:', error.message);
    throw new Error(`Failed to fetch new trending data: ${error.response?.data || error.message}`);
  }
};

module.exports = {
  getTokenInfo,
  getNewTrending
};
