const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const Redis = require('redis');

// PostgreSQL connection
const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// MongoDB connection
let mongoClient;
let mongoDb;

const connectMongo = async () => {
  mongoClient = new MongoClient(process.env.MONGODB_URL);
  await mongoClient.connect();
  mongoDb = mongoClient.db();
  console.log('Connected to MongoDB');
};

// Redis connection
let redisClient;

const connectRedis = async () => {
  redisClient = Redis.createClient({
    url: process.env.REDIS_URL,
  });
  
  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  
  await redisClient.connect();
  console.log('Connected to Redis');
};

module.exports = {
  pgPool,
  connectMongo,
  getMongoDb: () => mongoDb,
  connectRedis,
  getRedis: () => redisClient,
};