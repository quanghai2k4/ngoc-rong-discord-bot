import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisService } from './RedisService';
import { logger } from '../utils/logger';

/**
 * Rate Limiter Service - Anti-spam và fair usage
 */
class RateLimiterService {
  private commandLimiter: RateLimiterRedis;
  private strictLimiter: RateLimiterRedis;
  private globalLimiter: RateLimiterRedis;

  constructor() {
    const redisClient = redisService.getClient();

    // Normal commands: 10 per minute
    this.commandLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      points: 10, // 10 commands
      duration: 60, // per 60 seconds
      blockDuration: 30, // block for 30 seconds if exceeded
      keyPrefix: 'rl:cmd:',
    });

    // Strict limiter cho expensive operations (boss, shop): 3 per minute
    this.strictLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      points: 3,
      duration: 60,
      blockDuration: 60,
      keyPrefix: 'rl:strict:',
    });

    // Global rate limiter: 100 commands total per minute (prevent bot abuse)
    this.globalLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      points: 100,
      duration: 60,
      keyPrefix: 'rl:global:',
    });

    logger.info('Rate Limiter Service đã khởi tạo');
  }

  /**
   * Check if user can execute command
   */
  async checkCommandLimit(userId: string): Promise<{
    allowed: boolean;
    remainingPoints?: number;
    resetTime?: Date;
    message?: string;
  }> {
    try {
      // Check global rate limit first
      try {
        await this.globalLimiter.consume('all');
      } catch (globalError) {
        logger.warn('Global rate limit exceeded!');
        return {
          allowed: false,
          message: '⚠️ Server đang quá tải. Vui lòng thử lại sau!',
        };
      }

      // Check user rate limit
      const result = await this.commandLimiter.consume(userId);
      
      // Log nếu user gần đến limit
      if (result.remainingPoints <= 2) {
        logger.debug(`User ${userId} gần đạt rate limit: ${result.remainingPoints} commands còn lại`);
      }

      return {
        allowed: true,
        remainingPoints: result.remainingPoints,
        resetTime: new Date(Date.now() + result.msBeforeNext),
      };
    } catch (error: any) {
      // Rate limited
      if (error.remainingPoints !== undefined) {
        const waitTime = Math.ceil(error.msBeforeNext / 1000);
        logger.warn(`User ${userId} bị rate limited, phải đợi ${waitTime}s`);
        
        return {
          allowed: false,
          remainingPoints: 0,
          resetTime: new Date(Date.now() + error.msBeforeNext),
          message: `⏱️ Bạn đã sử dụng quá nhiều lệnh! Vui lòng đợi ${waitTime} giây.`,
        };
      }

      // Unexpected error - fail open (allow command)
      logger.error('Rate limiter unexpected error', error);
      return { allowed: true };
    }
  }

  /**
   * Check strict limit (for boss, shop, etc)
   */
  async checkStrictLimit(userId: string, commandName: string): Promise<{
    allowed: boolean;
    message?: string;
  }> {
    try {
      await this.strictLimiter.consume(userId);
      return { allowed: true };
    } catch (error: any) {
      if (error.remainingPoints !== undefined) {
        const waitTime = Math.ceil(error.msBeforeNext / 1000);
        logger.warn(`User ${userId} bị strict rate limited cho ${commandName}, đợi ${waitTime}s`);
        
        return {
          allowed: false,
          message: `⏱️ Lệnh \`${commandName}\` bị giới hạn! Vui lòng đợi ${waitTime} giây.`,
        };
      }

      logger.error('Strict rate limiter error', error);
      return { allowed: true }; // Fail open
    }
  }

  /**
   * Reward user (remove points) - dùng khi user complete quest, etc
   */
  async reward(userId: string, points: number = 1): Promise<void> {
    try {
      await this.commandLimiter.reward(userId, points);
      logger.debug(`Rewarded user ${userId} với ${points} points`);
    } catch (error) {
      logger.error('Rate limiter reward error', error);
    }
  }

  /**
   * Penalty user (add extra points) - dùng khi spam detected
   */
  async penalty(userId: string, points: number = 5): Promise<void> {
    try {
      await this.commandLimiter.penalty(userId, points);
      logger.warn(`Penalized user ${userId} với ${points} points (spam detected)`);
    } catch (error) {
      logger.error('Rate limiter penalty error', error);
    }
  }

  /**
   * Reset user's rate limit (admin only)
   */
  async resetUserLimit(userId: string): Promise<void> {
    try {
      await this.commandLimiter.delete(userId);
      await this.strictLimiter.delete(userId);
      logger.info(`Reset rate limit cho user ${userId}`);
    } catch (error) {
      logger.error('Rate limiter reset error', error);
    }
  }

  /**
   * Get remaining points for user
   */
  async getRemainingPoints(userId: string): Promise<number> {
    try {
      const res = await this.commandLimiter.get(userId);
      if (!res) return 10; // Full points available
      return res.remainingPoints;
    } catch (error) {
      logger.error('Rate limiter get points error', error);
      return 10;
    }
  }

  /**
   * Block user completely (admin only)
   */
  async blockUser(userId: string, durationSeconds: number = 3600): Promise<void> {
    try {
      // Consume all points + extra to block
      await this.commandLimiter.block(userId, durationSeconds);
      logger.warn(`Blocked user ${userId} for ${durationSeconds}s`);
    } catch (error) {
      logger.error('Rate limiter block error', error);
    }
  }
}

// Export singleton instance
export const rateLimiterService = new RateLimiterService();
