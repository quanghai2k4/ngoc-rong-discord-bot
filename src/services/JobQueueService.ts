import { Queue, QueueEvents } from 'bullmq';
import { redisService } from './RedisService';
import { logger } from '../utils/logger';

/**
 * Job Types
 */
export enum JobType {
  DAILY_QUEST_RESET = 'daily-quest-reset',
  LEADERBOARD_UPDATE = 'leaderboard-update',
  BATTLE_LOG_CLEANUP = 'battle-log-cleanup',
  CACHE_WARMUP = 'cache-warmup',
}

/**
 * Job Data Interfaces
 */
export interface DailyQuestResetJobData {
  date: string;
}

export interface LeaderboardUpdateJobData {
  type: 'level' | 'gold' | 'battles';
}

export interface BattleLogCleanupJobData {
  olderThanDays: number;
}

export interface CacheWarmupJobData {
  cacheKeys: string[];
}

/**
 * JobQueue Service - Quản lý background jobs với BullMQ
 */
class JobQueueService {
  private queues: Map<JobType, Queue> = new Map();
  private queueEvents: Map<JobType, QueueEvents> = new Map();
  private redisConnection: any;

  constructor() {
    // Shared Redis connection cho BullMQ
    this.redisConnection = {
      host: process.env.REDIS_URL?.includes('localhost') ? 'localhost' : 
            process.env.REDIS_URL?.split('@')[1]?.split(':')[0] || 'localhost',
      port: 6379,
      password: process.env.REDIS_PASSWORD || 'redispassword',
      maxRetriesPerRequest: null,
    };

    this.initializeQueues();
    logger.info('Job Queue Service đã khởi tạo');
  }

  /**
   * Initialize all queues
   */
  private initializeQueues(): void {
    Object.values(JobType).forEach((jobType) => {
      const queue = new Queue(jobType, {
        connection: this.redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: {
            age: 24 * 3600, // Keep for 24 hours
            count: 100,
          },
          removeOnFail: {
            age: 7 * 24 * 3600, // Keep failed jobs for 7 days
          },
        },
      });

      const queueEvents = new QueueEvents(jobType, {
        connection: this.redisConnection,
      });

      // Event listeners
      queueEvents.on('completed', ({ jobId }) => {
        logger.success(`Job ${jobType}:${jobId} completed`);
      });

      queueEvents.on('failed', ({ jobId, failedReason }) => {
        logger.error(`Job ${jobType}:${jobId} failed`, failedReason);
      });

      queueEvents.on('progress', ({ jobId, data }) => {
        logger.debug(`Job ${jobType}:${jobId} progress: ${JSON.stringify(data)}`);
      });

      this.queues.set(jobType, queue);
      this.queueEvents.set(jobType, queueEvents);
    });
  }

  /**
   * Schedule Daily Quest Reset (mỗi ngày lúc 00:00)
   */
  async scheduleDailyQuestReset(): Promise<void> {
    const queue = this.queues.get(JobType.DAILY_QUEST_RESET);
    if (!queue) return;

    await queue.add(
      'reset',
      { date: new Date().toISOString() } as DailyQuestResetJobData,
      {
        repeat: {
          pattern: '0 0 * * *', // Cron: Every day at midnight
        },
      }
    );

    logger.info('📅 Daily Quest Reset job đã được schedule (00:00 hàng ngày)');
  }

  /**
   * Schedule Leaderboard Update (mỗi giờ)
   */
  async scheduleLeaderboardUpdate(): Promise<void> {
    const queue = this.queues.get(JobType.LEADERBOARD_UPDATE);
    if (!queue) return;

    await queue.add(
      'update-level',
      { type: 'level' } as LeaderboardUpdateJobData,
      {
        repeat: {
          pattern: '0 * * * *', // Cron: Every hour
        },
      }
    );

    logger.info('🏆 Leaderboard Update job đã được schedule (mỗi giờ)');
  }

  /**
   * Schedule Battle Log Cleanup (mỗi tuần)
   */
  async scheduleBattleLogCleanup(): Promise<void> {
    const queue = this.queues.get(JobType.BATTLE_LOG_CLEANUP);
    if (!queue) return;

    await queue.add(
      'cleanup',
      { olderThanDays: 30 } as BattleLogCleanupJobData,
      {
        repeat: {
          pattern: '0 0 * * 0', // Cron: Every Sunday at midnight
        },
      }
    );

    logger.info('🧹 Battle Log Cleanup job đã được schedule (mỗi Chủ nhật)');
  }

  /**
   * Add one-time job
   */
  async addJob<T>(
    jobType: JobType,
    name: string,
    data: T,
    options?: any
  ): Promise<void> {
    const queue = this.queues.get(jobType);
    if (!queue) {
      logger.error(`Queue ${jobType} not found`);
      return;
    }

    await queue.add(name, data, options);
    logger.info(`Job ${jobType}:${name} đã được thêm vào queue`);
  }

  /**
   * Helper methods to add specific jobs
   */
  async addDailyQuestResetJob(): Promise<void> {
    await this.addJob(
      JobType.DAILY_QUEST_RESET,
      'manual-reset',
      { date: new Date().toISOString() } as DailyQuestResetJobData
    );
  }

  async addLeaderboardUpdateJob(): Promise<void> {
    await this.addJob(
      JobType.LEADERBOARD_UPDATE,
      'manual-update',
      { type: 'level' } as LeaderboardUpdateJobData
    );
  }

  async addBattleLogCleanupJob(): Promise<void> {
    await this.addJob(
      JobType.BATTLE_LOG_CLEANUP,
      'manual-cleanup',
      { olderThanDays: 30 } as BattleLogCleanupJobData
    );
  }

  async addCacheWarmupJob(): Promise<void> {
    await this.addJob(
      JobType.CACHE_WARMUP,
      'warmup',
      { cacheKeys: ['monsters', 'items', 'skills', 'equipment'] } as CacheWarmupJobData
    );
  }

  /**
   * Get job statistics for all queues
   */
  async getJobStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const jobType of Object.values(JobType)) {
      const queue = this.queues.get(jobType);
      if (!queue) continue;

      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
      ]);

      // Convert enum value to camelCase key
      const key = jobType.replace(/-./g, x => x[1].toUpperCase());
      stats[key] = { waiting, active, completed, failed };
    }

    return stats;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(jobType: JobType): Promise<any> {
    const queue = this.queues.get(jobType);
    if (!queue) return null;

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Get all queues statistics
   */
  async getAllStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const [jobType, queue] of this.queues.entries()) {
      stats[jobType] = await this.getQueueStats(jobType);
    }

    return stats;
  }

  /**
   * Pause queue
   */
  async pauseQueue(jobType: JobType): Promise<void> {
    const queue = this.queues.get(jobType);
    if (!queue) return;

    await queue.pause();
    logger.warn(`Queue ${jobType} đã bị pause`);
  }

  /**
   * Resume queue
   */
  async resumeQueue(jobType: JobType): Promise<void> {
    const queue = this.queues.get(jobType);
    if (!queue) return;

    await queue.resume();
    logger.info(`Queue ${jobType} đã được resume`);
  }

  /**
   * Clear queue (remove all jobs)
   */
  async clearQueue(jobType: JobType): Promise<void> {
    const queue = this.queues.get(jobType);
    if (!queue) return;

    await queue.drain();
    await queue.clean(0, 1000);
    logger.warn(`Queue ${jobType} đã được clear`);
  }

  /**
   * Get queue instance
   */
  getQueue(jobType: JobType): Queue | undefined {
    return this.queues.get(jobType);
  }

  /**
   * Close all queues gracefully
   */
  async close(): Promise<void> {
    logger.info('Đang đóng tất cả job queues...');

    for (const [jobType, queue] of this.queues.entries()) {
      await queue.close();
      logger.debug(`Queue ${jobType} đã đóng`);
    }

    for (const [jobType, queueEvents] of this.queueEvents.entries()) {
      await queueEvents.close();
      logger.debug(`QueueEvents ${jobType} đã đóng`);
    }

    logger.success('Tất cả job queues đã được đóng');
  }
}

// Export singleton
export const jobQueueService = new JobQueueService();
