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
