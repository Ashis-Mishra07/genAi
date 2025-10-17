import { Redis } from '@upstash/redis';

// Check if Redis configuration is available
const REDIS_ENABLED = process.env.REDIS_URL && process.env.REDIS_TOKEN;

// Create Redis instance with proper Upstash configuration (only if credentials are available)
export const redisClient = REDIS_ENABLED ? new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
}) : null;

// Test the connection on initialization
console.log('Redis: Configuration check:', {
  url: process.env.REDIS_URL ? 'Set' : 'Missing',
  token: process.env.REDIS_TOKEN ? 'Set' : 'Missing',
  enabled: REDIS_ENABLED
});

if (!REDIS_ENABLED) {
  console.log('Redis: Disabled - Missing configuration. Application will continue without caching.');
}

// Constants for handling large data
const MAX_VALUE_SIZE = 900000; // ~900KB limit for Redis values (conservative)
const CHUNK_SIZE = 800000; // ~800KB per chunk

// Cache utility functions
export class CacheService {
  private static instance: CacheService;
  private redis: Redis | null;
  private enabled: boolean;

  constructor() {
    this.redis = redisClient;
    this.enabled = Boolean(REDIS_ENABLED && redisClient !== null);
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Set data with expiration (in seconds) - simplified approach
  async set(key: string, value: any, expiration: number = 3600): Promise<void> {
    if (!this.enabled || !this.redis) {
      console.log(`Redis: Disabled - skipping set for key "${key}"`);
      return;
    }

    try {
      const serializedValue = JSON.stringify(value);
      const valueSize = Buffer.byteLength(serializedValue, 'utf8');
      
      console.log(`Redis: Setting key "${key}" with size ${valueSize} bytes`);
      
      // Skip caching if data is too large (> 1MB)
      if (valueSize > 1000000) {
        console.log(`Redis: Value too large (${valueSize} bytes), skipping cache`);
        return;
      }
      
      // Try to set normally, with error handling
      await this.redis.setex(key, expiration, serializedValue);
      console.log(`Redis: Successfully set key "${key}" with expiration ${expiration}s`);
    } catch (error) {
      console.error(`Redis SET error for key "${key}":`, error);
      console.log('Redis: Continuing without cache...');
      // Disable Redis for this instance if connection fails
      this.enabled = false;
    }
  }

  // Get data - simplified approach
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value === null) {
        console.log(`Redis: Key "${key}" not found`);
        return null;
      }
      
      const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
      console.log(`Redis: Retrieved key "${key}"`);
      return parsedValue;
    } catch (error) {
      console.error(`Redis GET error for key "${key}":`, error);
      console.log('Redis: Returning null due to error...');
      return null;
    }
  }

  // Delete data - simplified approach
  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      console.log(`Redis: Deleted key "${key}"`);
      return result > 0;
    } catch (error) {
      console.error(`Redis DELETE error for key "${key}":`, error);
      console.log('Redis: Continuing without delete...');
      return false;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result > 0;
    } catch (error) {
      console.error(`Redis EXISTS error for key "${key}":`, error);
      return false;
    }
  }

  // Set data with no expiration
  async setNoExpire(key: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.set(key, serializedValue);
      console.log(`Redis: Set key "${key}" with no expiration`);
    } catch (error) {
      console.error(`Redis SET (no expire) error for key "${key}":`, error);
      throw error;
    }
  }

  // Increment a counter
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      const result = await this.redis.incrby(key, amount);
      console.log(`Redis: Incremented key "${key}" by ${amount}, new value: ${result}`);
      return result;
    } catch (error) {
      console.error(`Redis INCREMENT error for key "${key}":`, error);
      throw error;
    }
  }

  // Set with TTL (time to live)
  async setWithTTL(key: string, value: any, ttlSeconds: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.setex(key, ttlSeconds, serializedValue);
      console.log(`Redis: Set key "${key}" with TTL ${ttlSeconds}s`);
    } catch (error) {
      console.error(`Redis SET with TTL error for key "${key}":`, error);
      throw error;
    }
  }

  // Get remaining TTL for a key
  async getTTL(key: string): Promise<number> {
    try {
      const ttl = await this.redis.ttl(key);
      return ttl;
    } catch (error) {
      console.error(`Redis TTL error for key "${key}":`, error);
      return -1;
    }
  }

  // Clear all keys (use with caution)
  async flushAll(): Promise<void> {
    try {
      await this.redis.flushall();
      console.log('Redis: Flushed all keys');
    } catch (error) {
      console.error('Redis FLUSHALL error:', error);
      throw error;
    }
  }

  // Get keys by pattern
  async getKeys(pattern: string = '*'): Promise<string[]> {
    try {
      const keys = await this.redis.keys(pattern);
      console.log(`Redis: Found ${keys.length} keys matching pattern "${pattern}"`);
      return keys;
    } catch (error) {
      console.error(`Redis KEYS error for pattern "${pattern}":`, error);
      console.log('Redis: Returning empty array due to error...');
      return [];
    }
  }

  // Add to list (LPUSH)
  async addToList(key: string, value: any): Promise<number> {
    try {
      const serializedValue = JSON.stringify(value);
      const result = await this.redis.lpush(key, serializedValue);
      console.log(`Redis: Added to list "${key}", new length: ${result}`);
      return result;
    } catch (error) {
      console.error(`Redis LPUSH error for key "${key}":`, error);
      throw error;
    }
  }

  // Get list items
  async getList(key: string, start: number = 0, end: number = -1): Promise<any[]> {
    try {
      const items = await this.redis.lrange(key, start, end);
      const parsedItems = items.map(item => 
        typeof item === 'string' ? JSON.parse(item) : item
      );
      console.log(`Redis: Retrieved ${parsedItems.length} items from list "${key}"`);
      return parsedItems;
    } catch (error) {
      console.error(`Redis LRANGE error for key "${key}":`, error);
      return [];
    }
  }
}

// Export the singleton instance
export const cache = CacheService.getInstance();

// Shorthand functions for common operations
export const setCache = (key: string, value: any, expiration?: number) => 
  cache.set(key, value, expiration);

export const getCache = <T = any>(key: string): Promise<T | null> => 
  cache.get<T>(key);

export const deleteCache = (key: string) => 
  cache.delete(key);

export const cacheExists = (key: string) => 
  cache.exists(key);

// Test Redis connection
export async function testRedisConnection(): Promise<boolean> {
  try {
    await cache.set('test_connection', 'ok', 10);
    const result = await cache.get('test_connection');
    await cache.delete('test_connection');
    
    console.log('Redis connection test:', result === 'ok' ? 'SUCCESS' : 'FAILED');
    return result === 'ok';
  } catch (error) {
    console.error('Redis connection test failed:', error);
    return false;
  }
}

export default cache;
