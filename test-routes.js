const axios = require('axios');

// Test script for the new API routes (cookies are now embedded in the server)
async function testRoutes() {
  const baseURL = 'https://localhost:2233'; // Adjust if needed

  try {
    console.log('Testing /api/token-info route...');
    const tokenInfoResponse = await axios.get(`${baseURL}/api/token-info`, {
      params: {
        pairAddress: 'DA3Sahnb2vurW6hix5atGduPsxVqN2v7Ur1XhhJPQLER'
      },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });
    console.log('Token info response:', JSON.stringify(tokenInfoResponse.data, null, 2));

    console.log('\nTesting /api/new-trending route...');
    const trendingResponse = await axios.get(`${baseURL}/api/new-trending`, {
      params: {
        timePeriod: '5m'
      },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });
    console.log('New trending response received with', trendingResponse.data.length, 'items');

  } catch (error) {
    console.error('Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack
    });
  }
}

// Run the test
testRoutes();
