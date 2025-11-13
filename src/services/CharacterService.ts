import { query } from '../database/db';
import { Character, CharacterRace } from '../types';
import { SkillService } from './SkillService';
import { cacheService } from './CacheService';
import { 
  STARTING_HP, STARTING_KI, STARTING_ATTACK, STARTING_DEFENSE, 
  HP_PER_LEVEL, KI_PER_LEVEL, ATTACK_PER_LEVEL, DEFENSE_PER_LEVEL, SPEED_PER_LEVEL,
  BASE_EXP_PER_LEVEL, EXP_INCREASE_PER_LEVEL
} from '../utils/constants';

// Danh sách các vị trí trong thế giới Dragon Ball
const NORMAL_LOCATIONS = [
  'Sa Mạc',
  'Căn Cứ RR',
  'Cung Điện Piccolo',
  'Hành Tinh Namek',
  'Hành Tinh Vegeta',
  'Trái Đất',
  'Đền Thần',
  'Phòng Thời Gian',
  'Núi Paoz',
  'Thành Phố Phía Tây',
  'Vùng Đất Hoang',
  'Kame House',
];

// Các khu vực đặc biệt chỉ có boss
const BOSS_ONLY_LOCATIONS = [
  'Rừng Karin',
  'Tháp Karin',
];

export class CharacterService {
  /**
   * Lấy một vị trí ngẫu nhiên
   */
  static getRandomLocation(): string {
    const allLocations = [...NORMAL_LOCATIONS, ...BOSS_ONLY_LOCATIONS];
    return allLocations[Math.floor(Math.random() * allLocations.length)];
  }

  /**
   * Kiểm tra xem vị trí có phải là khu vực chỉ có boss không
   */
  static isBossOnlyLocation(location: string): boolean {
    return BOSS_ONLY_LOCATIONS.includes(location);
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
    // Tạm thời tất cả races đều bắt đầu ở Rừng Karin (có monsters level 1-3)
    const startingLocation = 'Rừng Karin';

    const result = await query(
      `INSERT INTO characters 
       (player_id, race_id, name, max_hp, hp, max_ki, ki, attack, defense, location) 
       VALUES ($1, $2, $3, $4, $4, $5, $5, $6, $7, $8) 
       RETURNING *`,
      [playerId, raceId, name, maxHp, maxKi, attack, defense, startingLocation]
    );
    
    const character = result.rows[0];
    
    // Auto-learn basic skills
    await SkillService.autoLearnBasicSkills(character.id, raceId);
    
    return character;
  }

  static async getAllRaces(): Promise<CharacterRace[]> {
    // Dùng cache thay vì query trực tiếp
    return cacheService.getAllRaces();
  }

  static async getRaceById(raceId: number): Promise<CharacterRace | null> {
    // Dùng cache thay vì query trực tiếp
    return cacheService.getRaceById(raceId);
  }

  static async updateStats(characterId: number, stats: Partial<Character>): Promise<void> {
    const fields = Object.keys(stats);
    const values = Object.values(stats);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    await query(
      `UPDATE characters SET ${setClause} WHERE id = $${fields.length + 1}`,
      [...values, characterId]
    );
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
    
    // Level up calculation
    let expNeeded = BASE_EXP_PER_LEVEL + (newLevel - 1) * EXP_INCREASE_PER_LEVEL;
    
    while (newExp >= expNeeded) {
      newExp -= expNeeded;
      newLevel++;
      
      // Increase stats on level up
      newMaxHp += HP_PER_LEVEL;
      newMaxKi += KI_PER_LEVEL;
      newAttack += ATTACK_PER_LEVEL;
      newDefense += DEFENSE_PER_LEVEL;
      newSpeed += SPEED_PER_LEVEL;
      
      // Recalculate exp needed for next level
      expNeeded = BASE_EXP_PER_LEVEL + (newLevel - 1) * EXP_INCREASE_PER_LEVEL;
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
