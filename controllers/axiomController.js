const axios = require("axios");
const { fetchDataThroughProxy } = require('../utils/proxy');
const { AXIOM_COOKIES } = require('../routes/auth');

// Create regular axios instance without proxy
const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible;)'
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
    const url = `https://api9.axiom.trade/token-info?pairAddress=${encodeURIComponent(pairAddress)}`;
    const response = await fetchDataThroughProxy(url, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://axiom.trade',
        'Referer': 'https://axiom.trade/',
        'Cookie': AXIOM_COOKIES
      }
    });

    return response;
  } catch (error) {
    console.error('Token info API error:', error.message);
    throw new Error(`Failed to fetch token info: ${error.message}`);
  }
};

/**
 * Fetches new trending data from Axiom API
 * @param {string} timePeriod - The time period for trending data (default: '5m')
 * @returns {Promise<Object>} Trending data
 */
const getNewTrending = async (timePeriod = '5m') => {
  try {
    const response = await axiosInstance.get('https://api3.axiom.trade/new-trending', {
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
