import { Worker, Job } from 'bullmq';
import { JobType } from './JobQueueService';
import { JobHandlers } from './JobHandlers';
import { logger } from '../utils/logger';
import { webhookService } from './WebhookService';

/**
 * Job Worker - Xử lý jobs từ queue
 */
class JobWorkerService {
  private workers: Map<JobType, Worker> = new Map();
  private redisConnection: any;

  constructor() {
    this.redisConnection = {
      host: process.env.REDIS_URL?.includes('localhost') ? 'localhost' : 
            process.env.REDIS_URL?.split('@')[1]?.split(':')[0] || 'localhost',
      port: 6379,
      password: process.env.REDIS_PASSWORD || 'redispassword',
      maxRetriesPerRequest: null,
    };
  }

  /**
   * Start all workers
   */
  async start(): Promise<void> {
    await this.startWorkers();
  }

  async startWorkers(): Promise<void> {
    logger.info('🔧 Đang khởi động Job Workers...');

    // Daily Quest Reset Worker
    this.createWorker(
      JobType.DAILY_QUEST_RESET,
      async (job: Job) => {
        await JobHandlers.handleDailyQuestReset(job.data);
      }
    );

    // Leaderboard Update Worker
    this.createWorker(
      JobType.LEADERBOARD_UPDATE,
      async (job: Job) => {
        await JobHandlers.handleLeaderboardUpdate(job.data);
      }
    );

    // Battle Log Cleanup Worker
    this.createWorker(
      JobType.BATTLE_LOG_CLEANUP,
      async (job: Job) => {
        await JobHandlers.handleBattleLogCleanup(job.data);
      }
    );

    // Cache Warmup Worker
    this.createWorker(
      JobType.CACHE_WARMUP,
      async (job: Job) => {
        await JobHandlers.handleCacheWarmup(job.data);
      }
    );

    logger.success(`✅ Đã khởi động ${this.workers.size} workers`);
  }

  /**
   * Create a worker for specific job type
   */
  private createWorker(
    jobType: JobType,
    processor: (job: Job) => Promise<void>
  ): void {
    const worker = new Worker(
      jobType,
      async (job: Job) => {
        logger.info(`▶️  Processing job ${jobType}:${job.id}`);
        const startTime = Date.now();

        try {
          await processor(job);
          
          const duration = Date.now() - startTime;
          logger.success(`✅ Job ${jobType}:${job.id} completed in ${duration}ms`);
          
          // Send completion notification for important jobs (only in production)
          if (process.env.NODE_ENV === 'production' && 
              [JobType.DAILY_QUEST_RESET, JobType.BATTLE_LOG_CLEANUP].includes(jobType)) {
            webhookService.sendJobNotification(
              jobType, 
              job.id!, 
              'completed', 
              duration
            ).catch(() => {});
          }
        } catch (error) {
          const duration = Date.now() - startTime;
          logger.error(`❌ Job ${jobType}:${job.id} failed`, error);
          
          // Send failure notification qua webhook
          webhookService.sendJobNotification(
            jobType,
            job.id!,
            'failed',
            duration,
            error
          ).catch(() => {});
          
          throw error; // Re-throw để BullMQ retry
        }
      },
      {
        connection: this.redisConnection,
        concurrency: 1, // Process 1 job at a time
        limiter: {
          max: 10, // Max 10 jobs
          duration: 1000, // per second
        },
      }
    );

    // Event listeners
    worker.on('completed', (job) => {
      logger.debug(`Worker ${jobType}: Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`Worker ${jobType}: Job ${job?.id} failed`, err);
    });

    worker.on('error', (err) => {
      logger.error(`Worker ${jobType} error`, err);
    });

    worker.on('stalled', (jobId) => {
      logger.warn(`Worker ${jobType}: Job ${jobId} stalled`);
    });

    this.workers.set(jobType, worker);
    logger.debug(`Worker for ${jobType} created`);
  }

  /**
   * Get worker instance
   */
  getWorker(jobType: JobType): Worker | undefined {
    return this.workers.get(jobType);
  }

  /**
   * Stop all workers gracefully
   */
  async stop(): Promise<void> {
    await this.stopWorkers();
  }

  async stopWorkers(): Promise<void> {
    logger.info('🛑 Đang dừng tất cả workers...');

    for (const [jobType, worker] of this.workers.entries()) {
      await worker.close();
      logger.debug(`Worker ${jobType} đã dừng`);
    }

    this.workers.clear();
    logger.success('✅ Tất cả workers đã dừng');
  }

  /**
   * Pause worker
   */
  async pauseWorker(jobType: JobType): Promise<void> {
    const worker = this.workers.get(jobType);
    if (worker) {
      await worker.pause();
      logger.warn(`Worker ${jobType} đã pause`);
    }
  }

  /**
   * Resume worker
   */
  async resumeWorker(jobType: JobType): Promise<void> {
    const worker = this.workers.get(jobType);
    if (worker) {
      await worker.resume();
      logger.info(`Worker ${jobType} đã resume`);
    }
  }
}

// Export singleton
export const jobWorkerService = new JobWorkerService();
