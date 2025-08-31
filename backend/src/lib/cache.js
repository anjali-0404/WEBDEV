import { createClient } from 'redis';

export let redis;

export async function initRedis() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  redis = createClient({ url });
  redis.on('error', (err) => console.error('Redis error', err));
  await redis.connect();
  console.log('Connected to Redis');
}
