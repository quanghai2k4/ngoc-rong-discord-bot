import Redis from 'ioredis';
import { logger } from '../utils/logger';

/**
 * Redis Service - Distributed caching và session management
 */
class RedisService {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://:redispassword@localhost:6379';
    
    this.client = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis đang kết nối...');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      logger.success('Redis đã kết nối và sẵn sàng!');
    });

    this.client.on('error', (err) => {
      logger.error('Redis connection error', err);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection đã đóng');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis đang reconnect...');
    });
  }

  /**
   * Set key với TTL (in seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      logger.error(`Redis SET error for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get key và parse JSON
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Redis GET error for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Delete key
   */
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Redis DELETE error for key: ${key}`, error);
    }
  }

  /**
   * Delete nhiều keys theo pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      return await this.client.del(...keys);
    } catch (error) {
      logger.error(`Redis DELETE PATTERN error for: ${pattern}`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key: ${key}`, error);
      return false;
    }
  }

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`Redis INCR error for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Set expiry on existing key (in seconds)
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      logger.error(`Redis EXPIRE error for key: ${key}`, error);
    }
  }

  /**
   * Get TTL của key (seconds)
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Redis TTL error for key: ${key}`, error);
      return -1;
    }
  }

  /**
   * Get all keys matching pattern (use carefully!)
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error(`Redis KEYS error for pattern: ${pattern}`, error);
      return [];
    }
  }

  /**
   * Flush all data (DANGER! Use only in development)
   */
  async flushAll(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('FLUSHALL bị chặn trong production!');
      return;
    }
    try {
      await this.client.flushall();
      logger.warn('Redis: Tất cả data đã bị xóa (FLUSHALL)');
    } catch (error) {
      logger.error('Redis FLUSHALL error', error);
    }
  }

  /**
   * Get Redis client (cho advanced operations)
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * Close connection gracefully
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      logger.info('Redis connection đã đóng gracefully');
    } catch (error) {
      logger.error('Redis disconnect error', error);
    }
  }

  /**
   * Check connection status
   */
  isHealthy(): boolean {
    return this.isConnected;
  }

  /**
   * Ping Redis để check connectivity
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis PING error', error);
      return false;
    }
  }
}

// Export singleton instance
export const redisService = new RedisService();
