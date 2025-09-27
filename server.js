require("dotenv").config();
const fs = require("fs");
const https = require("https");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { redisSubscriber } = require("./redisInstance");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Import routes
const axiomRoutes = require("./routes/axiom");
const { initializeAxiomTrendingCron } = require("./services/axiomTrendingCron");

const PORT = process.env.PORT || 2233;

// Initialize Signature Monitor

// Middleware
const app = express();
app.use(cors());
app.use(express.json());

// Routes - Use the modular route handlers
app.use('/', axiomRoutes);

function setupRedis() {
  // Subscribe to Redis channels
  const channels = [
    "tradeExecution_transactionStatusUpdate",
    "ws_transaction_error", // WebSocket transaction errors
  ];

  channels.forEach((channel) => {
    redisSubscriber.subscribe(channel, (err, count) => {
      if (err) {
        console.error(`Failed to subscribe to ${channel}:`, err);
      } else {
        console.log(`Subscribed to ${channel}. Total subscriptions: ${count}`);
      }
    });
  });

  // Handle incoming Redis messages
  redisSubscriber.on("message", (channel, message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Message received on ${channel}:`, data);

      if (channel === "tradeExecution_transactionStatusUpdate") {
        if(process.env.RESPOND_TO_REDIS == "true") {
          // handleTradeExecutionTransactionStatusUpdate(data);
        }
      }

      if (channel === "ws_transaction_error") {
        if(process.env.RESPOND_TO_REDIS == "true") {
          // handleWebSocketTransactionError(data);
        }
      }

    } catch (error) {
      console.error("Error parsing Redis message:", error);
    }
  });
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Start the monitors
    // gradMon.start();

    // Initialize settings-based cron job logic
    if(process.env.RESPOND_TO_REDIS == "true") {
      // startPositionSynchronizationJob()
    }

    // Initialize Axiom trending cron job
    initializeAxiomTrendingCron();

    const server = setupServer(app);
    setupRedis();


    server.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
      );
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

/**
 * Function to set up the server (HTTP or HTTPS based on environment).
 */
function setupServer(app) {
  if (process.env.NODE_ENV === "production") {
    // Heroku: Use HTTP (Heroku handles HTTPS termination)
    return require("http").createServer(app);
  } else {
    // Development: Enable HTTPS with self-signed certificates
    const sslOptions = {
      key: fs.readFileSync("./192.168.1.171-key.pem"),
      cert: fs.readFileSync("./192.168.1.171.pem"),
    };
    return https.createServer(sslOptions, app);
  }
}

