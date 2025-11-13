import { query } from '../database/db';
import { Monster } from '../types';

export class MonsterService {
  /**
   * Lấy tất cả monsters phù hợp với level của nhân vật
   */
  static async getMonstersByLevelRange(characterLevel: number): Promise<Monster[]> {
    const result = await query(
      `SELECT id, name, level, hp, attack, defense, speed, experience_reward, gold_reward,
              min_level, max_level, is_boss, is_super, critical_chance, critical_damage
       FROM monsters 
       WHERE $1 BETWEEN min_level AND max_level 
       ORDER BY level`,
      [characterLevel]
    );
    return result.rows;
  }

  static async getById(monsterId: number): Promise<Monster | null> {
    const result = await query(
      `SELECT id, name, level, hp, attack, defense, speed, experience_reward, gold_reward,
              min_level, max_level, is_boss, is_super, critical_chance, critical_damage
       FROM monsters WHERE id = $1`,
      [monsterId]
    );
    return result.rows[0] || null;
  }

  static async getRandomByLevel(minLevel: number, maxLevel: number): Promise<Monster | null> {
    const result = await query(
      'SELECT * FROM monsters WHERE level BETWEEN $1 AND $2 ORDER BY RANDOM() LIMIT 1',
      [minLevel, maxLevel]
    );
    return result.rows[0] || null;
  }

  /**
   * Spawn 1-3 monsters cho battle dựa trên character level
   * Tỉ lệ: 70% (1 quái), 25% (2 quái), 5% (3 quái)
   * Tối ưu: Lấy tất cả monsters phù hợp rồi random ở application layer thay vì ORDER BY RANDOM()
   */
  static async spawnMonsters(characterLevel: number, bossOnly: boolean = false): Promise<Monster[]> {
    // Nếu là khu vực boss-only, chỉ spawn 1 boss
    if (bossOnly) {
      const result = await query(
        `SELECT id, name, level, hp, attack, defense, speed, experience_reward, gold_reward,
                min_level, max_level, is_boss, is_super, critical_chance, critical_damage
         FROM monsters 
         WHERE $1 BETWEEN min_level AND max_level AND is_boss = TRUE`,
        [characterLevel]
      );
      
      // Random ở application layer thay vì database
      if (result.rows.length === 0) return [];
      const randomBoss = result.rows[Math.floor(Math.random() * result.rows.length)];
      return [randomBoss];
    }

    // Khu vực bình thường: spawn quái thường (không phải boss)
    const rand = Math.random() * 100;
    let count: number;

    if (rand < 70) {
      count = 1;
    } else if (rand < 95) {
      count = 2;
    } else {
      count = 3;
    }

    const result = await query(
      `SELECT id, name, level, hp, attack, defense, speed, experience_reward, gold_reward,
              min_level, max_level, is_boss, is_super, critical_chance, critical_damage
       FROM monsters 
       WHERE $1 BETWEEN min_level AND max_level AND is_boss = FALSE`,
      [characterLevel]
    );

    // Random ở application layer - hiệu quả hơn ORDER BY RANDOM()
    const monsters = result.rows;
    const spawned: Monster[] = [];
    
    for (let i = 0; i < Math.min(count, monsters.length); i++) {
      const randomIndex = Math.floor(Math.random() * monsters.length);
      spawned.push(monsters[randomIndex]);
    }

    return spawned;
  }

  static async getDrops(monsterId: number): Promise<any[]> {
    const result = await query(
      `SELECT i.*, md.drop_rate 
       FROM monster_drops md
       JOIN items i ON md.item_id = i.id
       WHERE md.monster_id = $1`,
      [monsterId]
    );
    return result.rows;
  }
}
