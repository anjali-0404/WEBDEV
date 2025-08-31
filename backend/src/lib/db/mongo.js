import { MongoClient } from 'mongodb';

export let mongo;
export let mongoDb;

export async function initMongo() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  mongo = new MongoClient(uri);
  await mongo.connect();
  mongoDb = mongo.db('ai_ecommerce');
  console.log('Connected to MongoDB');
}
