const cron = require("node-cron");
const { getNewTrending } = require("../controllers/axiomController");

/**
 * Function to fetch trending tokens and log their data
 */
const fetchAndLogTrendingTokens = async (timePeriod = '5m') => {
    try {
        console.log(`Fetching trending tokens for time period: ${timePeriod}`);

        const data = await getNewTrending(timePeriod);

        if (Array.isArray(data)) {
            console.log(`Found ${data.length} trending tokens`);

            data.forEach((token, index) => {
                console.log(`\n--- Token ${index + 1} ---`);
                console.log(`Token Address: ${token.tokenAddress}`);
                console.log(`Token Name: ${token.tokenName}`);
                console.log(`Token Ticker: ${token.tokenTicker}`);
            });
        } else {
            console.log('No trending tokens data received or data is not an array');
        }

    } catch (error) {
        console.error('Error fetching trending tokens:', error.message);
    }
};

/**
 * Initialize the Axiom trending cron job
 * Runs every 5 minutes by default
 */
const initializeAxiomTrendingCron = (schedule = '*/30 * * * * *') => {
    console.log(`Initializing Axiom trending cron job with schedule: ${schedule}`);

    cron.schedule(schedule, async () => {
        await fetchAndLogTrendingTokens();
    });

    // Run immediately on initialization
    fetchAndLogTrendingTokens();
};

module.exports = {
    initializeAxiomTrendingCron,
    fetchAndLogTrendingTokens
};
