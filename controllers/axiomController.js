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

const getTokenStats = async (pairAddress) => {
  if (!pairAddress) {
    throw new Error('pairAddress parameter is required');
  }

  try {
    const url = `https://api9.axiom.trade/pair-stats?pairAddress=${encodeURIComponent(pairAddress)}`;
    const response = await fetchDataThroughProxy(url, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://axiom.trade',
        'Referer': 'https://axiom.trade/',
        'Cookie': AXIOM_COOKIES
      }
    });

    // Calculate last 5 minutes stats
    const last5Min = response.slice(0, 5);

    const totalBuyTransactions = last5Min.reduce((sum, item) => sum + item.buyCount, 0);
    const totalSellTransactions = last5Min.reduce((sum, item) => sum + item.sellCount, 0);
    const totalBuyVolume = last5Min.reduce((sum, item) => sum + item.buyVolumeSol, 0);
    const totalSellVolume = last5Min.reduce((sum, item) => sum + item.sellVolumeSol, 0);

    const netTransactionDiff = totalBuyTransactions - totalSellTransactions;
    const netVolumeDiff = totalBuyVolume - totalSellVolume;

    const calculatedStats = {
      last5MinStats: {
        totalBuyTransactions,
        totalSellTransactions,
        totalBuyVolume,
        totalSellVolume,
        netTransactionDiff,
        netVolumeDiff,
        activity: netTransactionDiff > 0 ? 'more_buys' : netTransactionDiff < 0 ? 'more_sells' : 'balanced'
      }
    };

    return {
      // rawData: response,
      ...calculatedStats
    };
  } catch (error) {
    console.error('Token stats API error:', error.message);
    throw new Error(`Failed to fetch token stats: ${error.message}`);
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
  getNewTrending,
  getTokenStats
};
