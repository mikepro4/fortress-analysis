const request = require("request-promise");

// BrightData Proxy Configuration
const proxyConfig = {
  host: "brd.superproxy.io",
  port: 33335,
  username: "brd-customer-hl_ab1ea610-zone-datacenter_proxy1",
  password: "oadmg57se1qi",
};

// Construct the proxy URL
const proxyUrl = `http://${proxyConfig.username}:${proxyConfig.password}@${proxyConfig.host}:${proxyConfig.port}`;

// Function to fetch data through the proxy
const fetchDataThroughProxy = async (url, options = {}) => {
  try {
    const defaultOptions = {
      uri: url,
      proxy: proxyUrl, // Use the BrightData proxy
      json: true, // Automatically parse the JSON response
      timeout: 10000, // 10 seconds timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible;)'
      }
    };

    const requestOptions = { ...defaultOptions, ...options };

    // Make the request through the proxy
    return await request(requestOptions);
  } catch (error) {
    throw new Error(`Error fetching data through proxy: ${error.message}`);
  }
};


module.exports = {
    fetchDataThroughProxy,
};
