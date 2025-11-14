import { query } from '../database/db';
import { Monster, Skill, Item, CharacterRace } from '../types';
import { CACHE_CONFIG } from '../config';

/**
 * GameDataCache - Cache layer cho tất cả dữ liệu tĩnh trong game
 * 
 * Cache các dữ liệu không thay đổi thường xuyên:
 * - Monsters (stats, drops)
 * - Skills 
 * - Items
 * - Character Races
 * - Monster Skills mapping
 * 
 * Giảm database queries từ hàng trăm xuống còn vài queries khi khởi động bot
 */
class GameDataCache {
  // Cache data
  private monsters: Map<number, Monster> = new Map();
  private skills: Map<number, Skill> = new Map();
  private items: Map<number, Item> = new Map();
  private races: Map<number, CharacterRace> = new Map();
  
  // Cache relationships
  private monsterDrops: Map<number, Array<Item & { drop_rate: number }>> = new Map();
  private monsterSkills: Map<number, Array<Skill & { use_probability: number }>> = new Map();
  
  // Cache timestamps
  private lastLoadTime: number = 0;
  private isInitialized: boolean = false;

  /**
   * Khởi tạo cache - load tất cả static data vào memory
   * Nên gọi khi bot khởi động
   */
  async initialize(): Promise<void> {
    console.log('🔄 Đang load game data vào cache...');
    const startTime = Date.now();

    try {
      // Load tất cả data song song
      await Promise.all([
        this.loadMonsters(),
        this.loadSkills(),
        this.loadItems(),
        this.loadRaces(),
        this.loadMonsterDrops(),
        this.loadMonsterSkills(),
      ]);

      this.lastLoadTime = Date.now();
      this.isInitialized = true;

      const loadTime = Date.now() - startTime;
      console.log(`✅ Game data cache loaded! (${loadTime}ms)`);
      console.log(`   📊 Monsters: ${this.monsters.size}`);
      console.log(`   ⚔️  Skills: ${this.skills.size}`);
      console.log(`   🎒 Items: ${this.items.size}`);
      console.log(`   🧬 Races: ${this.races.size}`);
    } catch (error) {
      console.error('❌ Lỗi khi load game data cache:', error);
      throw error;
    }
  }

  /**
   * Reload cache - gọi khi cần refresh data (sau khi update database)
   */
  async reload(): Promise<void> {
    console.log('🔄 Reloading game data cache...');
    this.clearAll();
    await this.initialize();
  }

  /**
   * Kiểm tra cache có cần reload không (theo TTL config)
   */
  shouldReload(): boolean {
    if (!this.isInitialized) return true;
    const age = Date.now() - this.lastLoadTime;
    return age > CACHE_CONFIG.STATIC_DATA_TTL;
  }

  // ==================== LOAD METHODS ====================

  private async loadMonsters(): Promise<void> {
    const result = await query(
      `SELECT id, name, level, hp, attack, defense, speed, 
              experience_reward, gold_reward, min_level, max_level, 
              is_boss, is_super, critical_chance, critical_damage
       FROM monsters 
       ORDER BY level`
    );

    this.monsters.clear();
    for (const row of result.rows) {
      this.monsters.set(row.id, row);
    }
  }

  private async loadSkills(): Promise<void> {
    const result = await query(
      `SELECT id, name, description, skill_type, race_id, required_level,
              ki_cost, cooldown, damage_multiplier, heal_amount, crit_bonus,
              stun_chance, defense_break, is_aoe
       FROM skills 
       ORDER BY required_level, ki_cost`
    );

    this.skills.clear();
    for (const row of result.rows) {
      this.skills.set(row.id, row);
    }
  }

  private async loadItems(): Promise<void> {
    const result = await query(
      `SELECT i.id, i.name, i.item_type_id, i.description,
              i.hp_bonus, i.ki_bonus, i.attack_bonus, i.defense_bonus,
              i.speed_bonus, i.price, i.is_consumable, i.required_level,
              it.name as item_type_name
       FROM items i
       LEFT JOIN item_types it ON i.item_type_id = it.id
       ORDER BY i.required_level, i.price`
    );

    this.items.clear();
    for (const row of result.rows) {
      this.items.set(row.id, row);
    }
  }

  private async loadRaces(): Promise<void> {
    const result = await query(
      `SELECT id, name, description, hp_bonus, ki_bonus, 
              attack_bonus, defense_bonus
       FROM character_races 
       ORDER BY id`
    );

    this.races.clear();
    for (const row of result.rows) {
      this.races.set(row.id, row);
    }
  }

  private async loadMonsterDrops(): Promise<void> {
    const result = await query(
      `SELECT md.monster_id, i.*, md.drop_rate
       FROM monster_drops md
       JOIN items i ON md.item_id = i.id
       ORDER BY md.monster_id, md.drop_rate DESC`
    );

    this.monsterDrops.clear();
    for (const row of result.rows) {
      const drops = this.monsterDrops.get(row.monster_id) || [];
      drops.push({ ...row, drop_rate: row.drop_rate });
      this.monsterDrops.set(row.monster_id, drops);
    }
  }

  private async loadMonsterSkills(): Promise<void> {
    const result = await query(
      `SELECT ms.monster_id, s.*, ms.use_probability
       FROM monster_skills ms
       JOIN skills s ON ms.skill_id = s.id
       ORDER BY ms.monster_id, ms.use_probability DESC`
    );

    this.monsterSkills.clear();
    for (const row of result.rows) {
      const skills = this.monsterSkills.get(row.monster_id) || [];
      skills.push({ ...row, use_probability: row.use_probability });
      this.monsterSkills.set(row.monster_id, skills);
    }
  }

  // ==================== GETTER METHODS ====================

  /**
   * Lấy monster theo ID
   */
  getMonsterById(id: number): Monster | undefined {
    return this.monsters.get(id);
  }

  /**
   * Lấy tất cả monsters theo level range
   */
  getMonstersByLevel(characterLevel: number, bossOnly: boolean = false): Monster[] {
    const results: Monster[] = [];
    
    for (const monster of this.monsters.values()) {
      if (characterLevel >= monster.min_level && characterLevel <= monster.max_level) {
        if (bossOnly && !monster.is_boss) continue;
        if (!bossOnly && monster.is_boss) continue;
        results.push(monster);
      }
    }
    
    return results;
  }

  /**
   * Lấy skill theo ID
   */
  getSkillById(id: number): Skill | undefined {
    return this.skills.get(id);
  }

  /**
   * Lấy skill theo tên
   */
  getSkillByName(name: string): Skill | undefined {
    for (const skill of this.skills.values()) {
      if (skill.name === name) return skill;
    }
    return undefined;
  }

  /**
   * Lấy tất cả skills theo race (bao gồm universal skills)
   */
  getSkillsByRace(raceId: number | null, maxLevel?: number): Skill[] {
    const results: Skill[] = [];
    
    for (const skill of this.skills.values()) {
      // Universal skills (race_id = null) hoặc skills của race này
      if (skill.race_id === null || skill.race_id === raceId) {
        if (maxLevel === undefined || skill.required_level <= maxLevel) {
          results.push(skill);
        }
      }
    }
    
    return results;
  }

  /**
   * Lấy item theo ID
   */
  getItemById(id: number): Item | undefined {
    return this.items.get(id);
  }

  /**
   * Lấy tất cả items
   */
  getAllItems(): Item[] {
    return Array.from(this.items.values());
  }

  /**
   * Lấy race theo ID
   */
  getRaceById(id: number): CharacterRace | undefined {
    return this.races.get(id);
  }

  /**
   * Lấy tất cả races
   */
  getAllRaces(): CharacterRace[] {
    return Array.from(this.races.values());
  }

  /**
   * Lấy drops của monster
   */
  getMonsterDrops(monsterId: number): Array<Item & { drop_rate: number }> {
    return this.monsterDrops.get(monsterId) || [];
  }

  /**
   * Lấy skills của monster
   */
  getMonsterSkills(monsterId: number): Array<Skill & { use_probability: number }> {
    return this.monsterSkills.get(monsterId) || [];
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Xóa toàn bộ cache
   */
  private clearAll(): void {
    this.monsters.clear();
    this.skills.clear();
    this.items.clear();
    this.races.clear();
    this.monsterDrops.clear();
    this.monsterSkills.clear();
    this.isInitialized = false;
  }

  /**
   * Lấy thông tin cache stats
   */
  getStats() {
    return {
      initialized: this.isInitialized,
      lastLoadTime: this.lastLoadTime,
      age: Date.now() - this.lastLoadTime,
      counts: {
        monsters: this.monsters.size,
        skills: this.skills.size,
        items: this.items.size,
        races: this.races.size,
        monsterDrops: this.monsterDrops.size,
        monsterSkills: this.monsterSkills.size,
      }
    };
  }
}

// Export singleton instance
export const gameDataCache = new GameDataCache();
