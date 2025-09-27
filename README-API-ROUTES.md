# API Routes Documentation

## Setup
```bash
nvm install 21.1.0 && nvm use 21.1.0
yarn install
yarn start
```

## Features
- **Proxy Support**: All requests are routed through BrightData proxy for enhanced privacy and reliability
- **Embedded Authentication**: Cookies are securely embedded in the server code
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Transaction Re-triggering**: Automatically re-triggers failed transactions for recoverable errors

## Routes

### 1. GET /api/token-info
Proxies requests to axiom.trade token-info API.

**Authentication:** Cookies are embedded in the server code - no client authentication required.

**Parameters:**
- `pairAddress` (required): The token pair address

**Example:**
```bash
curl -k "https://localhost:2233/api/token-info?pairAddress=DA3Sahnb2vurW6hix5atGduPsxVqN2v7Ur1XhhJPQLER"
```

### 2. GET /api/new-trending
Proxies requests to axiom.trade new-trending API.

**Authentication:** Cookies are embedded in the server code - no client authentication required.

**Parameters:**
- `timePeriod` (optional, default: '5m'): Time period for trending data

**Example:**
```bash
curl -k "https://localhost:2233/api/new-trending?timePeriod=5m"
```

## Testing
Run the test script to verify the routes work:
```bash
node test-routes.js
```

## Transaction Error Handling & Re-triggering

The system automatically retries **ALL** failed transactions through the WebSocket signature monitor. Failed transactions are re-published to the appropriate DEX channel for re-execution.

### Redis Channels
- `tradeExecution_transactionStatusUpdate`: Handles transaction status updates from trade execution
- `ws_transaction_error`: Handles WebSocket transaction errors

### Error Classification & Retry Logic

The system **retries ALL transaction failures** automatically:

**Automatic Retry for ALL Errors:**
- **WebSocket Errors**: InstructionError [4, {Custom: 6004}], etc.
- **Polling Errors**: Any transaction status errors detected via polling
- **Timeout Errors**: Transactions that don't finalize within 30 seconds
- **Network Errors**: Connection issues, RPC failures

**Retry Limits:**
- **Infinite retries** until transaction succeeds
- DEX-appropriate channel routing (Raydium, PumpSwap, etc.)
- Exponential backoff and intelligent re-queuing
- Only stops when transaction finalizes successfully

**Pump AMM Fallback:**
- **WORKER-BASED APPROACH**: PumpSwap service signals worker when Raydium fallback is available
- Worker automatically switches to Raydium execution when Pump.fun pools unavailable
- Clean separation of concerns: Service detects, Worker executes fallback

### Re-triggering Logic
When a recoverable error is detected:
1. Waits 2 seconds to avoid immediate retry
2. Creates a new transaction ID with retry metadata
3. Publishes to `tradeExecution_executeTransaction` Redis channel for re-execution
4. Logs the retry attempt

### Raydium Fallback Logic
When Pump AMM pool is not found:
1. Waits 1 second before fallback
2. Creates new transaction ID with fallback metadata
3. Publishes to `raydiumTransactionChannel` channel
4. Includes original transaction details and fallback reason
5. Raydium service handles the trade execution

### WebSocket Error Format
WebSocket errors should be published to the `ws_transaction_error` channel with format:
```json
{
  "signature": "transaction_signature_here",
  "error": {
    "InstructionError": [1, {"Custom": 38}]
  }
}
```

## API Error Handling
Both routes return JSON error responses with appropriate HTTP status codes if:
- Required parameters are missing
- Cookies are not provided
- External API calls fail

## Security Notes
- The server runs with `NODE_TLS_REJECT_UNAUTHORIZED = "0"` for development
- In production, ensure proper SSL certificate validation
- Cookies should be kept secure and not logged
