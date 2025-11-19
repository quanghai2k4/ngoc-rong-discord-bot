import { query } from '../database/db';
import { logger } from '../utils/logger';
import { redisService } from './RedisService';
import { 
  DailyQuestResetJobData, 
  LeaderboardUpdateJobData, 
  BattleLogCleanupJobData,
  CacheWarmupJobData 
} from './JobQueueService';

/**
 * Job Handlers - Xử lý các background jobs
 */
export class JobHandlers {
  /**
   * Reset tất cả daily quests
   */
  static async handleDailyQuestReset(data: DailyQuestResetJobData): Promise<void> {
    logger.info(`🔄 Bắt đầu reset daily quests cho ngày ${data.date}`);
    
    try {
      // Check if table exists
      const tableCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'character_quests'
        );
      `);

      if (!tableCheck.rows[0].exists) {
        logger.warn('⚠️ Table character_quests không tồn tại, bỏ qua daily quest reset');
        return;
      }

      // Get columns that exist
      const columnCheck = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'character_quests'
        AND column_name IN ('completed', 'rewards_claimed', 'progress', 'updated_at')
      `);

      const existingColumns = columnCheck.rows.map(r => r.column_name);
      
      if (existingColumns.length === 0) {
        logger.warn('⚠️ Table character_quests không có columns phù hợp, bỏ qua reset');
        return;
      }

      // Build dynamic UPDATE query based on existing columns
      const setClauses: string[] = [];
      if (existingColumns.includes('completed')) setClauses.push('completed = false');
      if (existingColumns.includes('rewards_claimed')) setClauses.push('rewards_claimed = false');
      if (existingColumns.includes('progress')) setClauses.push('progress = 0');
      if (existingColumns.includes('updated_at')) setClauses.push('updated_at = CURRENT_TIMESTAMP');

      if (setClauses.length === 0) {
        logger.warn('⚠️ Không có columns nào để reset');
        return;
      }

      const result = await query(`
        UPDATE character_quests
        SET ${setClauses.join(', ')}
        WHERE quest_id IS NOT NULL
      `);

      logger.success(`✅ Đã reset ${result.rowCount || 0} quests (columns: ${existingColumns.join(', ')})`);

      // Clear cache
      await redisService.deletePattern('quest:*');
      logger.debug('Cache cleared for quests');

    } catch (error) {
      logger.error('Lỗi khi reset daily quests', error);
      throw error;
    }
  }

  /**
   * Update leaderboard
   */
  static async handleLeaderboardUpdate(data: LeaderboardUpdateJobData): Promise<void> {
    logger.info(`📊 Cập nhật leaderboard: ${data.type}`);

    try {
      let query_text = '';
      let cacheKey = '';

      switch (data.type) {
        case 'level':
          query_text = `
            SELECT 
              c.id,
              c.name,
              c.level,
              c.experience,
              cr.name as race_name,
              p.discord_id
            FROM characters c
            JOIN players p ON c.player_id = p.id
            JOIN character_races cr ON c.race_id = cr.id
            ORDER BY c.level DESC, c.experience DESC
            LIMIT 100
          `;
          cacheKey = 'leaderboard:level';
          break;

        case 'gold':
          query_text = `
            SELECT 
              c.id,
              c.name,
              c.gold,
              cr.name as race_name,
              p.discord_id
            FROM characters c
            JOIN players p ON c.player_id = p.id
            JOIN character_races cr ON c.race_id = cr.id
            ORDER BY c.gold DESC
            LIMIT 100
          `;
          cacheKey = 'leaderboard:gold';
          break;

        case 'battles':
          query_text = `
            SELECT 
              c.id,
              c.name,
              COUNT(bl.id) as total_battles,
              SUM(CASE WHEN bl.result = 'won' THEN 1 ELSE 0 END) as wins,
              cr.name as race_name,
              p.discord_id
            FROM characters c
            JOIN players p ON c.player_id = p.id
            JOIN character_races cr ON c.race_id = cr.id
            LEFT JOIN battle_logs bl ON c.id = bl.character_id
            GROUP BY c.id, c.name, cr.name, p.discord_id
            ORDER BY wins DESC, total_battles DESC
            LIMIT 100
          `;
          cacheKey = 'leaderboard:battles';
          break;
      }

      const result = await query(query_text);
      
      // Cache leaderboard for 1 hour
      await redisService.set(cacheKey, result.rows, 3600);

      logger.success(`✅ Đã cập nhật ${data.type} leaderboard (${result.rows.length} entries)`);

    } catch (error) {
      logger.error(`Lỗi khi update leaderboard ${data.type}`, error);
      throw error;
    }
  }

  /**
   * Cleanup old battle logs
   */
  static async handleBattleLogCleanup(data: BattleLogCleanupJobData): Promise<void> {
    logger.info(`🧹 Cleaning up battle logs older than ${data.olderThanDays} days`);

    try {
      const result = await query(`
        DELETE FROM battle_logs
        WHERE battle_date < NOW() - INTERVAL '${data.olderThanDays} days'
      `);

      logger.success(`✅ Đã xóa ${result.rowCount} battle logs cũ`);

      // Vacuum table để reclaim space
      await query('VACUUM ANALYZE battle_logs');
      logger.debug('VACUUM ANALYZE battle_logs completed');

    } catch (error) {
      logger.error('Lỗi khi cleanup battle logs', error);
      throw error;
    }
  }

  /**
   * Warmup cache (optional - chạy khi bot restart)
   */
  static async handleCacheWarmup(data: CacheWarmupJobData): Promise<void> {
    logger.info('🔥 Warming up cache...');

    try {
      // Preload frequently accessed data
      const queries = [
        { key: 'monsters:all', query: 'SELECT * FROM monsters ORDER BY level' },
        { key: 'items:all', query: 'SELECT * FROM items ORDER BY price' },
        { key: 'races:all', query: 'SELECT * FROM character_races ORDER BY id' },
      ];

      for (const { key, query: queryText } of queries) {
        const result = await query(queryText);
        await redisService.set(key, result.rows, 1800); // 30 min cache
        logger.debug(`Cached ${key}: ${result.rows.length} rows`);
      }

      logger.success('✅ Cache warmup completed');

    } catch (error) {
      logger.error('Lỗi khi warmup cache', error);
      throw error;
    }
  }
}
