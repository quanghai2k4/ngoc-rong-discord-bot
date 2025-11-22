import { pool } from '../database/db';
import { CharacterStats, XPLog, Rank, CharacterWithRank } from '../types';
import { logger } from '../utils/logger';

/**
 * Service để quản lý hệ thống XP, Level và Rank
 */
export class XPService {
  /**
   * Tính XP cần thiết cho level tiếp theo
   * Công thức: baseXP * (level ^ 1.8)
   * Level 1->2: 100 XP
   * Level 10->11: ~1,585 XP
   * Level 50->51: ~39,811 XP
   * Level 100->101: ~158,489 XP
   */
  static calculateRequiredXP(currentLevel: number): number {
    const baseXP = 100;
    return Math.floor(baseXP * Math.pow(currentLevel, 1.8));
  }

  /**
   * Tính tổng XP cần để đạt level cụ thể
   */
  static calculateTotalXPForLevel(targetLevel: number): number {
    let total = 0;
    for (let i = 1; i < targetLevel; i++) {
      total += this.calculateRequiredXP(i);
    }
    return total;
  }

  /**
   * Thêm XP cho nhân vật và auto level-up nếu đủ
   */
  static async addXP(
    characterId: number,
    xpAmount: number,
    activityType: XPLog['activity_type'],
    description: string
  ): Promise<{
    levelsGained: number;
    oldLevel: number;
    newLevel: number;
    totalXP: number;
    nextLevelXP: number;
  }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Lấy thông tin character hiện tại
      const charResult = await client.query(
        'SELECT id, level, experience FROM characters WHERE id = $1',
        [characterId]
      );

      if (charResult.rows.length === 0) {
        throw new Error('Character not found');
      }

      const character = charResult.rows[0];
      const oldLevel = character.level;
      let currentLevel = character.level;
      let currentXP = character.experience + xpAmount;
      let levelsGained = 0;

      // Auto level-up loop
      while (true) {
        const requiredXP = this.calculateRequiredXP(currentLevel);
        
        if (currentXP >= requiredXP) {
          currentXP -= requiredXP;
          currentLevel++;
          levelsGained++;

          // Tăng stats khi level up
          await this.applyLevelUpBonuses(client, characterId, currentLevel);
        } else {
          break;
        }

        // Giới hạn level tối đa 300
        if (currentLevel >= 300) {
          currentXP = 0;
          break;
        }
      }

      // Cập nhật level và XP
      await client.query(
        'UPDATE characters SET level = $1, experience = $2 WHERE id = $3',
        [currentLevel, currentXP, characterId]
      );

      // Log XP gain
      await client.query(
        `INSERT INTO xp_logs (character_id, activity_type, xp_amount, description) 
         VALUES ($1, $2, $3, $4)`,
        [characterId, activityType, xpAmount, description]
      );

      // Cập nhật character_stats
      await this.updateStats(client, characterId, { total_xp_earned: xpAmount });

      await client.query('COMMIT');

      const nextLevelXP = this.calculateRequiredXP(currentLevel);

      logger.info(`✨ Character ${characterId} gained ${xpAmount} XP (${oldLevel} -> ${currentLevel})`);

      return {
        levelsGained,
        oldLevel,
        newLevel: currentLevel,
        totalXP: currentXP,
        nextLevelXP,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('❌ Error adding XP:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Áp dụng bonuses khi level up
   */
  private static async applyLevelUpBonuses(client: any, characterId: number, newLevel: number) {
    // Mỗi level tăng:
    // +10 HP, +10 KI, +2 ATK, +2 DEF, +1 SPD
    // Mỗi 10 level: +0.5% crit chance, +0.1 crit damage
    const hpBonus = 10;
    const kiBonus = 10;
    const atkBonus = 2;
    const defBonus = 2;
    const spdBonus = 1;

    let critChanceBonus = 0;
    let critDamageBonus = 0;

    if (newLevel % 10 === 0) {
      critChanceBonus = 0.5;
      critDamageBonus = 0.1;
    }

    await client.query(
      `UPDATE characters 
       SET max_hp = max_hp + $1,
           hp = hp + $1,
           max_ki = max_ki + $2,
           ki = ki + $2,
           attack = attack + $3,
           defense = defense + $4,
           speed = speed + $5,
           critical_chance = critical_chance + $6,
           critical_damage = critical_damage + $7
       WHERE id = $8`,
      [hpBonus, kiBonus, atkBonus, defBonus, spdBonus, critChanceBonus, critDamageBonus, characterId]
    );
  }

  /**
   * Cập nhật character stats
   */
  static async updateStats(
    client: any,
    characterId: number,
    updates: Partial<Omit<CharacterStats, 'id' | 'character_id' | 'created_at' | 'updated_at'>>
  ) {
    // Đảm bảo character_stats tồn tại
    await client.query(
      `INSERT INTO character_stats (character_id) 
       VALUES ($1) 
       ON CONFLICT (character_id) DO NOTHING`,
      [characterId]
    );

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ${key} + $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length > 0) {
      values.push(characterId);
      await client.query(
        `UPDATE character_stats 
         SET ${updateFields.join(', ')}, updated_at = NOW() 
         WHERE character_id = $${paramIndex}`,
        values
      );
    }
  }

  /**
   * Lấy rank dựa trên level
   */
  static async getRankByLevel(level: number): Promise<Rank | null> {
    const result = await pool.query(
      `SELECT * FROM ranks 
       WHERE min_level <= $1 
       ORDER BY min_level DESC 
       LIMIT 1`,
      [level]
    );

    return result.rows[0] || null;
  }

  /**
   * Lấy tất cả ranks
   */
  static async getAllRanks(): Promise<Rank[]> {
    const result = await pool.query('SELECT * FROM ranks ORDER BY display_order ASC');
    return result.rows;
  }

  /**
   * Lấy character stats
   */
  static async getCharacterStats(characterId: number): Promise<CharacterStats | null> {
    const result = await pool.query(
      'SELECT * FROM character_stats WHERE character_id = $1',
      [characterId]
    );

    return result.rows[0] || null;
  }

  /**
   * Lấy full thông tin character với rank và stats
   */
  static async getCharacterWithRank(characterId: number): Promise<CharacterWithRank | null> {
    const result = await pool.query(
      `SELECT 
        c.*,
        r.id as rank_id,
        r.name as rank_name,
        r.color as rank_color,
        r.icon as rank_icon,
        r.min_level as rank_min_level,
        r.display_order as rank_display_order,
        cs.total_xp_earned,
        cs.total_monsters_killed,
        cs.total_bosses_defeated,
        cs.total_quests_completed,
        cs.total_daily_quests_completed,
        cs.total_gold_earned,
        cs.total_damage_dealt,
        cs.total_damage_taken,
        cs.total_battles_won,
        cs.total_battles_lost,
        cs.highest_damage_dealt,
        cs.longest_win_streak,
        cs.current_win_streak,
        (SELECT COUNT(*) + 1 
         FROM character_stats cs2 
         WHERE cs2.total_xp_earned > cs.total_xp_earned
        ) as server_rank
       FROM characters c
       LEFT JOIN ranks r ON r.min_level <= c.level
       LEFT JOIN character_stats cs ON cs.character_id = c.id
       WHERE c.id = $1
       ORDER BY r.min_level DESC
       LIMIT 1`,
      [characterId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    return {
      ...row,
      rank: {
        id: row.rank_id,
        name: row.rank_name,
        color: row.rank_color,
        icon: row.rank_icon,
        min_level: row.rank_min_level,
        display_order: row.rank_display_order,
      },
      stats: {
        id: row.id,
        character_id: row.character_id,
        total_xp_earned: row.total_xp_earned || 0,
        total_monsters_killed: row.total_monsters_killed || 0,
        total_bosses_defeated: row.total_bosses_defeated || 0,
        total_quests_completed: row.total_quests_completed || 0,
        total_daily_quests_completed: row.total_daily_quests_completed || 0,
        total_gold_earned: row.total_gold_earned || 0,
        total_damage_dealt: row.total_damage_dealt || 0,
        total_damage_taken: row.total_damage_taken || 0,
        total_battles_won: row.total_battles_won || 0,
        total_battles_lost: row.total_battles_lost || 0,
        highest_damage_dealt: row.highest_damage_dealt || 0,
        longest_win_streak: row.longest_win_streak || 0,
        current_win_streak: row.current_win_streak || 0,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      total_xp: row.total_xp_earned || 0,
      server_rank: row.server_rank || 999,
    };
  }

  /**
   * Lấy leaderboard (top players)
   */
  static async getLeaderboard(limit: number = 10): Promise<CharacterWithRank[]> {
    const result = await pool.query(
      `SELECT 
        c.*,
        r.id as rank_id,
        r.name as rank_name,
        r.color as rank_color,
        r.icon as rank_icon,
        r.min_level as rank_min_level,
        r.display_order as rank_display_order,
        cs.total_xp_earned,
        cs.total_monsters_killed,
        cs.total_bosses_defeated,
        cs.total_quests_completed,
        cs.total_daily_quests_completed,
        cs.total_gold_earned,
        cs.total_damage_dealt,
        cs.total_damage_taken,
        cs.total_battles_won,
        cs.total_battles_lost,
        cs.highest_damage_dealt,
        cs.longest_win_streak,
        cs.current_win_streak,
        ROW_NUMBER() OVER (ORDER BY cs.total_xp_earned DESC) as server_rank
       FROM characters c
       LEFT JOIN ranks r ON r.min_level <= c.level
       LEFT JOIN character_stats cs ON cs.character_id = c.id
       WHERE r.id = (
         SELECT r2.id FROM ranks r2 
         WHERE r2.min_level <= c.level 
         ORDER BY r2.min_level DESC 
         LIMIT 1
       )
       ORDER BY cs.total_xp_earned DESC NULLS LAST, c.level DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map((row) => ({
      ...row,
      rank: {
        id: row.rank_id,
        name: row.rank_name,
        color: row.rank_color,
        icon: row.rank_icon,
        min_level: row.rank_min_level,
        display_order: row.rank_display_order,
      },
      stats: {
        id: row.id,
        character_id: row.character_id,
        total_xp_earned: row.total_xp_earned || 0,
        total_monsters_killed: row.total_monsters_killed || 0,
        total_bosses_defeated: row.total_bosses_defeated || 0,
        total_quests_completed: row.total_quests_completed || 0,
        total_daily_quests_completed: row.total_daily_quests_completed || 0,
        total_gold_earned: row.total_gold_earned || 0,
        total_damage_dealt: row.total_damage_dealt || 0,
        total_damage_taken: row.total_damage_taken || 0,
        total_battles_won: row.total_battles_won || 0,
        total_battles_lost: row.total_battles_lost || 0,
        highest_damage_dealt: row.highest_damage_dealt || 0,
        longest_win_streak: row.longest_win_streak || 0,
        current_win_streak: row.current_win_streak || 0,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      total_xp: row.total_xp_earned || 0,
      server_rank: row.server_rank || 999,
    }));
  }

  /**
   * Tính XP thưởng cho hunt/boss/quest
   */
  static calculateActivityXP(type: 'hunt' | 'boss' | 'quest' | 'daily_quest', baseXP: number, level: number): number {
    const multipliers = {
      hunt: 1.0,
      boss: 3.0,
      quest: 2.0,
      daily_quest: 1.5,
    };

    // XP scale với level của player
    const levelMultiplier = 1 + (level * 0.02); // +2% per level
    
    return Math.floor(baseXP * multipliers[type] * levelMultiplier);
  }
}
