const cron = require("node-cron");
const rp = require("request-promise");
const { getNewTrending } = require("../controllers/axiomController");

// SOL contract address for price fetching
const SOL_CONTRACT_ADDRESS = "So11111111111111111111111111111111111111112";

// Cached SOL price (updated every minute)
let cachedSolPrice = null;
let lastPriceUpdate = null;

// Accepted protocols for token analysis
const ACCEPTED_PROTOCOLS = ["Pump AMM", "Pump V1", "Raydium CLMM", "Meteora AMM V2", "Raydium CPMM"];

// Minimum volume in USD
const MIN_VOLUME_USD = 31000;

// Maximum bundlers hold percentage
const MAX_BUNDLERS_PERCENT = 30;

/**
 * Fetch SOL price in USD and cache it
 */
const fetchAndCacheSolPrice = async () => {
    try {
        const priceUrl = `https://fortress-price-cbf5bf822b15.herokuapp.com/price/${SOL_CONTRACT_ADDRESS}`;

        const response = await rp({
            uri: priceUrl,
            method: 'GET',
            json: true,
            timeout: 5000,
        });

        const solPrice = response.price;

        if (solPrice && typeof solPrice === 'number') {
            cachedSolPrice = solPrice;
            lastPriceUpdate = new Date();
            console.log(`💰 SOL price updated: $${solPrice.toFixed(2)} (${lastPriceUpdate.toISOString()})`);
            return solPrice;
        } else {
            console.error('Unable to extract SOL price from response:', response);
            return null;
        }
    } catch (error) {
        console.error('Error fetching SOL price:', error.message);
        return null;
    }
};

/**
 * Get cached SOL price (returns null if not available or too old)
 */
const getCachedSolPrice = () => {
    if (!cachedSolPrice || !lastPriceUpdate) {
        return null;
    }

    // Check if price is older than 2 minutes (as fallback)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    if (lastPriceUpdate < twoMinutesAgo) {
        console.warn('⚠️  Cached SOL price is older than 2 minutes, consider refreshing');
        return null;
    }

    return cachedSolPrice;
};

/**
 * Analyze a token to determine if it meets the criteria for adding
 */
const analyzeToken = async (token) => {
    try {
        // Check protocol
        if (!ACCEPTED_PROTOCOLS.includes(token.protocol)) {
            console.log(`❌ Token ${token.tokenName} (${token.tokenTicker}) rejected: Protocol '${token.protocol}' not accepted`);
            return false;
        }

        // Check bundlers hold percentage
        if (token.bundlersHoldPercent > MAX_BUNDLERS_PERCENT) {
            console.log(`❌ Token ${token.tokenName} (${token.tokenTicker}) rejected: Bundlers hold ${token.bundlersHoldPercent}% > ${MAX_BUNDLERS_PERCENT}%`);
            return false;
        }

        // Get cached SOL price for volume calculations
        const solPrice = getCachedSolPrice();
        if (!solPrice) {
            console.log(`❌ Token ${token.tokenName} (${token.tokenTicker}) rejected: SOL price not available for volume calculation`);
            return false;
        }

        const volumeUSD = token.volumeSol * solPrice;
        if (volumeUSD < MIN_VOLUME_USD) {
            console.log(`❌ Token ${token.tokenName} (${token.tokenTicker}) rejected: Volume $${volumeUSD.toFixed(2)} < $${MIN_VOLUME_USD}`);
            return false;
        }

        // Token passes all criteria
        console.log(`✅ Token ${token.tokenName} (${token.tokenTicker}) approved:`);
        console.log(`   Protocol: ${token.protocol}`);
        console.log(`   Bundlers: ${token.bundlersHoldPercent}%`);
        console.log(`   Volume: $${volumeUSD.toFixed(2)}`);
        console.log(`   Market Cap: $${(token.marketCapSol * solPrice).toFixed(2)}`);

        return true;
    } catch (error) {
        console.error(`Error analyzing token ${token.tokenName}:`, error.message);
        return false;
    }
};

/**
 * Function to fetch trending tokens, analyze them, and log approved tokens
 */
const fetchAndLogTrendingTokens = async (timePeriod = '5m') => {
    try {
        console.log(`\n🔍 Starting trending tokens analysis for time period: ${timePeriod}`);

        // Check if we have a cached SOL price
        const solPrice = getCachedSolPrice();
        if (!solPrice) {
            console.error('No cached SOL price available, skipping token analysis. Price updater may not be running.');
            return;
        }

        console.log(`💰 Using cached SOL price: $${solPrice.toFixed(2)}`);

        const data = await getNewTrending(timePeriod);

        if (Array.isArray(data)) {
            console.log(`📊 Found ${data.length} trending tokens to analyze\n`);

            let approvedCount = 0;

            for (const token of data) {
                const isApproved = await analyzeToken(token);
                if (isApproved) {
                    approvedCount++;
                }
                console.log(''); // Add spacing between tokens
            }

            console.log(`🎯 Analysis complete: ${approvedCount}/${data.length} tokens approved for addition\n`);

        } else {
            console.log('No trending tokens data received or data is not an array');
        }

    } catch (error) {
        console.error('Error fetching trending tokens:', error.message);
    }
};

/**
 * Initialize the Axiom trending analysis system
 * - Price updater: runs every minute
 * - Token analysis: runs every 5 minutes by default
 */
const initializeAxiomTrendingCron = (analysisSchedule = '*/5 * * * *') => {
    console.log('🚀 Initializing Axiom trending analysis system...');

    // Start SOL price updater (every minute)
    console.log('💰 Starting SOL price updater (every minute)');
    cron.schedule('* * * * *', async () => {
        await fetchAndCacheSolPrice();
    });

    // Start trending token analysis
    console.log(`🔍 Starting token analysis with schedule: ${analysisSchedule}`);
    cron.schedule(analysisSchedule, async () => {
        await fetchAndLogTrendingTokens();
    });

    // Initialize price cache and run analysis immediately
    console.log('🔄 Performing initial setup...');
    fetchAndCacheSolPrice().then(() => {
        fetchAndLogTrendingTokens();
    });
};

module.exports = {
    initializeAxiomTrendingCron,
    fetchAndLogTrendingTokens,
    analyzeToken,
    fetchAndCacheSolPrice,
    getCachedSolPrice
};
