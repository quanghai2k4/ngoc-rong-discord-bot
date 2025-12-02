import { query } from '../database/db';
import { Character, CharacterRace } from '../types';
import { SkillService } from './SkillService';
import { gameDataCache } from './GameDataCache';
import { redisService } from './RedisService';
import { STARTING_HP, STARTING_KI, STARTING_ATTACK, STARTING_DEFENSE } from '../utils/constants';
import { GAME_CONFIG, getRandomLocation, isBossOnlyLocation, getRequiredExp } from '../config';

export class CharacterService {
  /**
   * Lấy một vị trí ngẫu nhiên
   */
  static getRandomLocation(): string {
    return getRandomLocation(false);
  }

  /**
   * Kiểm tra xem vị trí có phải là khu vực chỉ có boss không
   */
  static isBossOnlyLocation(location: string): boolean {
    return isBossOnlyLocation(location);
  }

  /**
   * Tối ưu: Lấy character với Redis cache
   */
  static async findByPlayerIdCached(playerId: number, discordId?: string): Promise<Character | null> {
    // Nếu có discordId, thử cache trước
    if (discordId && redisService.isHealthy()) {
      const cached = await redisService.getCachedCharacter(discordId);
      if (cached) return cached;
    }

    // Không có cache, query DB
    const character = await this.findByPlayerId(playerId);
    
    // Cache lại nếu tìm thấy
    if (character && discordId && redisService.isHealthy()) {
      await redisService.cacheCharacter(discordId, character);
    }
    
    return character;
  }

  static async findByPlayerId(playerId: number): Promise<Character | null> {
    const result = await query(
      `SELECT id, player_id, race_id, name, level, experience, hp, max_hp, ki, max_ki, 
              attack, defense, speed, gold, location, created_at, critical_chance, 
              critical_damage, dodge_chance 
       FROM characters WHERE player_id = $1`,
      [playerId]
    );
    return result.rows[0] || null;
  }

  static async create(
    playerId: number,
    name: string,
    raceId: number
  ): Promise<Character> {
    const race = await this.getRaceById(raceId);
    if (!race) {
      throw new Error('Race not found');
    }

    const maxHp = STARTING_HP + race.hp_bonus;
    const maxKi = STARTING_KI + race.ki_bonus;
    const attack = STARTING_ATTACK + race.attack_bonus;
    const defense = STARTING_DEFENSE + race.defense_bonus;

    // Xác định vị trí bắt đầu theo chủng tộc
    let startingLocation = 'Làng Aru'; // Default
    if (raceId === 0) {
      startingLocation = 'Nhà Kame'; // Trái Đất
    } else if (raceId === 1) {
      startingLocation = 'Làng Moori'; // Namek
    } else if (raceId === 2) {
      startingLocation = 'Hành Tinh Vegeta'; // Saiyan
    }

    const result = await query(
      `INSERT INTO characters 
       (player_id, race_id, name, max_hp, hp, max_ki, ki, attack, defense, location, senzu_level, senzu_beans) 
       VALUES ($1, $2, $3, $4, $4, $5, $5, $6, $7, $8, 1, 0) 
       RETURNING *`,
      [playerId, raceId, name, maxHp, maxKi, attack, defense, startingLocation]
    );
    
    const character = result.rows[0];
    
    // Auto-learn basic skills
    await SkillService.autoLearnBasicSkills(character.id, raceId);
    
    return character;
  }

  static async getAllRaces(): Promise<CharacterRace[]> {
    // Dùng GameDataCache thay vì CacheService
    return gameDataCache.getAllRaces();
  }

  static async getRaceById(raceId: number): Promise<CharacterRace | null> {
    // Dùng GameDataCache thay vì CacheService
    return gameDataCache.getRaceById(raceId) || null;
  }

  static async updateStats(characterId: number, stats: Partial<Character>, discordId?: string): Promise<void> {
    const fields = Object.keys(stats);
    const values = Object.values(stats);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    await query(
      `UPDATE characters SET ${setClause} WHERE id = $${fields.length + 1}`,
      [...values, characterId]
    );

    // Invalidate cache sau khi update
    if (discordId && redisService.isHealthy()) {
      await redisService.invalidateCharacter(discordId);
    }
  }

  static async addExperience(characterId: number, exp: number): Promise<Character> {
    // Lấy character hiện tại
    const charResult = await query(
      `SELECT id, level, experience, max_hp, max_ki, attack, defense, speed, hp, ki 
       FROM characters WHERE id = $1`,
      [characterId]
    );
    
    if (!charResult.rows[0]) {
      throw new Error('Character not found');
    }

    const character = charResult.rows[0];
    let newExp = character.experience + exp;
    let newLevel = character.level;
    let newMaxHp = character.max_hp;
    let newMaxKi = character.max_ki;
    let newAttack = character.attack;
    let newDefense = character.defense;
    let newSpeed = character.speed;
    
    // Level up calculation using GAME_CONFIG
    let expNeeded = getRequiredExp(newLevel);
    
    while (newExp >= expNeeded) {
      newExp -= expNeeded;
      newLevel++;
      
      // Increase stats on level up
      newMaxHp += GAME_CONFIG.LEVEL_UP.HP_BONUS;
      newMaxKi += GAME_CONFIG.LEVEL_UP.KI_BONUS;
      newAttack += GAME_CONFIG.LEVEL_UP.ATTACK_BONUS;
      newDefense += GAME_CONFIG.LEVEL_UP.DEFENSE_BONUS;
      newSpeed += GAME_CONFIG.LEVEL_UP.SPEED_BONUS;
      
      // Recalculate exp needed for next level
      expNeeded = getRequiredExp(newLevel);
    }

    // Single UPDATE query thay vì nhiều queries
    const updateResult = await query(
      `UPDATE characters 
       SET level = $1, experience = $2, max_hp = $3, hp = GREATEST(hp, $3),
           max_ki = $4, ki = GREATEST(ki, $4), attack = $5, defense = $6, speed = $7
       WHERE id = $8
       RETURNING id, player_id, race_id, name, level, experience, hp, max_hp, ki, max_ki,
                 attack, defense, speed, gold, location, created_at, critical_chance,
                 critical_damage, dodge_chance`,
      [newLevel, newExp, newMaxHp, newMaxKi, newAttack, newDefense, newSpeed, characterId]
    );

    return updateResult.rows[0];
  }

  static async heal(characterId: number, hp: number, ki: number): Promise<void> {
    await query(
      `UPDATE characters 
       SET hp = LEAST(hp + $1, max_hp), 
           ki = LEAST(ki + $2, max_ki) 
       WHERE id = $3`,
      [hp, ki, characterId]
    );
  }

  /**
   * Cập nhật vị trí của nhân vật
   */
  static async updateLocation(characterId: number, location: string): Promise<void> {
    await query(
      'UPDATE characters SET location = $1 WHERE id = $2',
      [location, characterId]
    );
  }
}
