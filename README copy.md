# Fortress Position Manager

A microservice for managing trading positions, orders, and portfolio values with real-time updates.

## 🏗️ Architecture

The service follows a modular controller-based architecture:

```
fortress-position/
├── controllers/
│   ├── positionController.js           # Main controller (imports modules)
│   └── modules/
│       ├── positionCrudController.js   # CRUD operations
│       ├── orderController.js          # Order management
│       ├── valueController.js          # Value management
│       └── statusController.js         # Status management
├── routes/
│   └── position.js                     # API endpoints
├── models/                             # Local models (copied from fortress-api)
│   ├── Position.js                     # Position model
│   ├── User.js                         # User model
│   ├── Token.js                        # Token model
│   └── Wallet.js                       # Wallet model
├── middleware/
│   └── authMiddleware.js               # Authentication middleware
├── redisInstance.js                   # Redis configuration
├── server.js                          # Main server setup
└── package.json
```

## 🚀 Features

### Position Management
- ✅ Create, read, update, delete positions
- ✅ Search and filter positions
- ✅ Position value tracking (`valueNative`)
- ✅ Automatic status updates based on open orders

### Order Management
- ✅ Add, edit, delete orders (Buy/Sell/Stop Loss)
- ✅ Fill orders with price and amount tracking
- ✅ Order status management (open, submitted, filled, cancelled)

### Real-time Updates
- ✅ Redis pub/sub for live position updates
- ✅ Event-driven architecture
- ✅ Position value change notifications

### API Integration
- ✅ RESTful API endpoints
- ✅ JWT authentication
- ✅ Error handling and validation

## 📡 API Endpoints

### Position CRUD
```http
POST   /api/position/create          # Create position
POST   /api/position/search          # Search positions
POST   /api/position/item            # Get position by ID
POST   /api/position/updateItem      # Update position
POST   /api/position/delete          # Delete position
POST   /api/position/getByToken      # Get position by token
```

### Order Management
```http
POST   /api/position/addOrder        # Add order to position
POST   /api/position/editOrder       # Edit existing order
POST   /api/position/deleteOrder     # Delete order
POST   /api/position/fillOrder       # Fill/mark order as complete
```

### Value Management
```http
POST   /api/position/updateValueNative  # Update position value
```

### Status Management
```http
POST   /api/position/checkAndUpdateStatus     # Update position status
POST   /api/position/batchUpdateStatuses      # Batch update multiple positions
```

## 💻 Usage Examples

### Using the Controller (Internal)

```javascript
const PositionController = require('./controllers/positionController');

// Create a position
const position = await PositionController.createPosition(userId, tokenId);

// Add an order
const result = await PositionController.addOrder(userId, positionId, 'buy', {
  amountUsd: 1000,
  targetPrice: 1.25,
  amountNative: 800
});

// Update position value
const update = await PositionController.adjustValueNative(userId, positionId, 50);

// Get positions summary
const summary = await PositionController.getValueSummary(userId, positionId);
```

### Using the API

```bash
# Create position
curl -X POST http://localhost:4444/api/position/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tokenId": "token123"}'

# Add buy order
curl -X POST http://localhost:4444/api/position/addOrder \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "positionId": "pos123",
    "side": "buy",
    "orderData": {
      "amountUsd": 1000,
      "targetPrice": 1.25,
      "amountNative": 800
    }
  }'

# Update position value
curl -X POST http://localhost:4444/api/position/updateValueNative \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "positionId": "pos123",
    "valueNative": 850
  }'
```

## 🔄 Redis Events

The service publishes events to Redis for real-time updates:

```javascript
// Position created
{
  "_id": "pos123",
  "action": "created",
  "author": "user456",
  "token": "token789"
}

// Order filled
{
  "_id": "pos123",
  "action": "orderFilled",
  "orderId": "ord789",
  "side": "buy",
  "filledData": {
    "filledAt": "2024-01-01T12:00:00Z",
    "filledPrice": 1.25,
    "filledAmountNative": 800
  }
}

// Value updated
{
  "_id": "pos123",
  "action": "valueNativeUpdated",
  "oldValueNative": 800,
  "newValueNative": 850
}
```

## 🏃‍♂️ Running the Service

```bash
# Install dependencies
npm install

# Start the service
npm start

# Development with auto-reload
npm run dev
```

## 🔧 Configuration

Environment variables:
```env
NODE_ENV=development
PORT=4444
MONGO_URI=mongodb://localhost:27017/fortress
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
```

## 📊 Controller Interface

The `PositionController` provides a clean interface for all operations:

```javascript
// Position operations
PositionController.createPosition(userId, tokenId)
PositionController.getPositionItem(userId, positionId)
PositionController.updatePositionItem(userId, positionId, data)
PositionController.deletePosition(userId, positionId)
PositionController.searchPositions(userId, criteria, sort, offset, limit, order)

// Order operations
PositionController.addOrder(userId, positionId, side, orderData)
PositionController.editOrder(userId, positionId, side, orderId, orderData)
PositionController.deleteOrder(userId, positionId, side, orderId)
PositionController.fillOrder(userId, positionId, side, orderId, price, amount, slippage)

// Value operations
PositionController.updateValueNative(userId, positionId, value)
PositionController.adjustValueNative(userId, positionId, amount) // + or -
PositionController.getValueSummary(userId, positionId)

// Status operations
PositionController.checkAndUpdateStatus(positionId)
PositionController.batchUpdateStatuses(userId, positionIds)
```

## 🎯 Key Benefits

1. **🧹 Clean Architecture**: Separated concerns with controller/service layers
2. **🔄 Reusable**: Functions can be called internally or via API
3. **⚡ Real-time**: Redis-powered live updates
4. **🛡️ Robust**: Comprehensive error handling and validation
5. **📊 Scalable**: Microservice architecture ready for growth
6. **🧪 Testable**: Modular design for easy testing
7. **📦 Maintainable**: Organized into focused modules by functionality

## 🔗 Integration

This service integrates with:
- **Redis**: Real-time event publishing
- **MongoDB**: Position and order data storage
- **JWT**: Authentication and authorization

**Note**: This service is self-contained with local copies of models and middleware, making it independent of the fortress-api service.

The service can be called from other microservices or used as a standalone position management system.