import { Monster } from '../types';
import { gameDataCache } from './GameDataCache';

export class MonsterService {
  /**
   * Lấy tất cả monsters phù hợp với level của nhân vật
   * Sử dụng cache thay vì query DB
   */
  static async getMonstersByLevelRange(characterLevel: number): Promise<Monster[]> {
    return gameDataCache.getMonstersByLevel(characterLevel, false);
  }

  static async getById(monsterId: number): Promise<Monster | null> {
    return gameDataCache.getMonsterById(monsterId) || null;
  }

  static async getRandomByLevel(minLevel: number, maxLevel: number): Promise<Monster | null> {
    // Lấy tất cả monsters có level trong range
    const allMonsters = gameDataCache.getMonstersByLevel(minLevel, false);
    const filtered = allMonsters.filter(m => m.level >= minLevel && m.level <= maxLevel);
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  /**
   * Spawn 1-3 monsters cho battle dựa trên character level
   * Tỉ lệ: 70% (1 quái), 25% (2 quái), 5% (3 quái)
   * Sử dụng cache thay vì query DB - nhanh hơn nhiều
   */
  static async spawnMonsters(characterLevel: number, bossOnly: boolean = false): Promise<Monster[]> {
    // Nếu là khu vực boss-only, chỉ spawn 1 boss
    if (bossOnly) {
      const bosses = gameDataCache.getMonstersByLevel(characterLevel, true);
      if (bosses.length === 0) return [];
      const randomBoss = bosses[Math.floor(Math.random() * bosses.length)];
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

    const monsters = gameDataCache.getMonstersByLevel(characterLevel, false);
    const spawned: Monster[] = [];
    
    for (let i = 0; i < Math.min(count, monsters.length); i++) {
      const randomIndex = Math.floor(Math.random() * monsters.length);
      spawned.push(monsters[randomIndex]);
    }

    return spawned;
  }

  static async getDrops(monsterId: number): Promise<any[]> {
    // Sử dụng cache
    return gameDataCache.getMonsterDrops(monsterId);
  }
}
