import { query } from '../database/db';
import { Monster } from '../types';

export class MonsterService {
  static async getByLocation(location: string): Promise<Monster[]> {
    const result = await query(
      'SELECT * FROM monsters WHERE location = $1 ORDER BY level',
      [location]
    );
    return result.rows;
  }

  static async getById(monsterId: number): Promise<Monster | null> {
    const result = await query(
      'SELECT * FROM monsters WHERE id = $1',
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
   * Spawn 1-3 monsters cho battle
   * Tỉ lệ: 70% (1 quái), 25% (2 quái), 5% (3 quái)
   */
  static async spawnMonsters(minLevel: number, maxLevel: number): Promise<Monster[]> {
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
      'SELECT * FROM monsters WHERE level BETWEEN $1 AND $2 ORDER BY RANDOM() LIMIT $3',
      [minLevel, maxLevel, count]
    );

    return result.rows;
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
