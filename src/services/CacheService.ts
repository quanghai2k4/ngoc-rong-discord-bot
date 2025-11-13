import { query } from '../database/db';
import { CharacterRace } from '../types';
import { CACHE_TTL } from '../utils/constants';

/**
 * Cache service để cache dữ liệu tĩnh (races, items, skills)
 * Giảm số lượng database queries
 */
class CacheService {
  private racesCache: CharacterRace[] | null = null;
  private racesCacheTime: number = 0;

  /**
   * Lấy tất cả races với caching
   */
  async getAllRaces(): Promise<CharacterRace[]> {
    const now = Date.now();
    
    // Nếu cache còn hạn, return cache
    if (this.racesCache && (now - this.racesCacheTime) < CACHE_TTL) {
      return this.racesCache;
    }

    // Cache hết hạn hoặc chưa có, query từ DB
    const result = await query(
      `SELECT id, name, description, hp_bonus, ki_bonus, attack_bonus, defense_bonus 
       FROM character_races 
       ORDER BY id`
    );
    
    this.racesCache = result.rows;
    this.racesCacheTime = now;
    
    return this.racesCache;
  }

  /**
   * Lấy race theo ID từ cache
   */
  async getRaceById(raceId: number): Promise<CharacterRace | null> {
    const races = await this.getAllRaces();
    return races.find(r => r.id === raceId) || null;
  }

  /**
   * Xóa cache (khi cần reload data)
   */
  clearCache(): void {
    this.racesCache = null;
    this.racesCacheTime = 0;
  }
}

// Export singleton instance
export const cacheService = new CacheService();
