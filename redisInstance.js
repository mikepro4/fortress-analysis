const Redis = require("ioredis");

// Use REDIS_URL from environment variables or fallback
// const redisUrl = process.env.REDIS_URL || "rediss://:pf3f26a7ce3c8e3222761e0f0cafa761cbd2d08fde10d8718f6150a9a727b2100@ec2-13-219-54-54.compute-1.amazonaws.com:27780";
// const redisUrl = process.env.REDIS_URL || "rediss://:pf3f26a7ce3c8e3222761e0f0cafa761cbd2d08fde10d8718f6150a9a727b2100@ec2-3-223-80-214.compute-1.amazonaws.com:30890";
// const redisUrl = process.env.REDIS_URL || "rediss://:pf3f26a7ce3c8e3222761e0f0cafa761cbd2d08fde10d8718f6150a9a727b2100@ec2-52-21-56-171.compute-1.amazonaws.com:20269";
const redisUrl = process.env.REDIS_URL || "rediss://:pf3f26a7ce3c8e3222761e0f0cafa761cbd2d08fde10d8718f6150a9a727b2100@ec2-3-228-79-161.compute-1.amazonaws.com:28809";

// Publisher instance
const redisPublisher = new Redis(redisUrl);

// Subscriber instance
const redisSubscriber = new Redis(redisUrl);

redisPublisher.on("connect", () => console.log("Redis Publisher connected!"));
redisPublisher.on("error", (err) => console.error("Redis Publisher error:", err));

redisSubscriber.on("connect", () => console.log("Redis Subscriber connected!"));
redisSubscriber.on("error", (err) => console.error("Redis Subscriber error:", err));

module.exports = {
  redisPublisher,
  redisSubscriber,
};
