const { getRedis } = require('./db');

class CacheService {
  constructor() {
    this.redis = getRedis();
    this.defaultTTL = 3600; // 1 hour in seconds
  }

  async get(key) {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  // Cache key generators
  getProductKey(productId) {
    return `product:${productId}`;
  }

  getRecommendationsKey(userId) {
    return `recommendations:${userId}`;
  }

  getUserKey(userId) {
    return `user:${userId}`;
  }
}

module.exports = new CacheService();