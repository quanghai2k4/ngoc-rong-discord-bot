import { query } from '../database/db';
import { Skill } from '../types';
import { gameDataCache } from './GameDataCache';

export class SkillService {
  // Lấy tất cả skills của một character
  static async getCharacterSkills(characterId: number): Promise<Skill[]> {
    const result = await query(
      `SELECT s.id, s.name, s.description, s.skill_type, s.race_id, s.required_level,
              s.ki_cost, s.cooldown, s.damage_multiplier, s.heal_amount, s.crit_bonus,
              s.stun_chance, s.defense_break, s.is_aoe
       FROM skills s
       JOIN character_skills cs ON s.id = cs.skill_id
       WHERE cs.character_id = $1
       ORDER BY s.required_level, s.ki_cost`,
      [characterId]
    );
    return result.rows;
  }

  // Lấy skills có thể học theo race và level
  static async getAvailableSkills(raceId: number, level: number): Promise<Skill[]> {
    const result = await query(
      `SELECT id, name, description, skill_type, race_id, required_level,
              ki_cost, cooldown, damage_multiplier, heal_amount, crit_bonus,
              stun_chance, defense_break, is_aoe
       FROM skills 
       WHERE (race_id = $1 OR race_id IS NULL) 
       AND required_level <= $2
       ORDER BY required_level, ki_cost`,
      [raceId, level]
    );
    return result.rows;
  }

  // Học một skill mới
  static async learnSkill(characterId: number, skillId: number): Promise<boolean> {
    try {
      await query(
        'INSERT INTO character_skills (character_id, skill_id) VALUES ($1, $2)',
        [characterId, skillId]
      );
      return true;
    } catch (error) {
      return false; // Đã học rồi hoặc lỗi
    }
  }

  // Kiểm tra character đã học skill chưa
  static async hasSkill(characterId: number, skillId: number): Promise<boolean> {
    const result = await query(
      'SELECT 1 FROM character_skills WHERE character_id = $1 AND skill_id = $2',
      [characterId, skillId]
    );
    return result.rows.length > 0;
  }

  // Lấy skill by ID - sử dụng cache
  static async getSkillById(skillId: number): Promise<Skill | null> {
    return gameDataCache.getSkillById(skillId) || null;
  }

  // Lấy skills của monster - sử dụng cache
  static async getMonsterSkills(monsterId: number): Promise<Array<Skill & { use_probability: number }>> {
    return gameDataCache.getMonsterSkills(monsterId);
  }

  // Lấy TẤT CẢ skills theo race (đã học và chưa học)
  static async getAllSkillsByRace(characterId: number, raceId: number): Promise<Array<Skill & { learned: boolean }>> {
    const result = await query(
      `SELECT s.id, s.name, s.description, s.skill_type, s.race_id, s.required_level,
              s.ki_cost, s.cooldown, s.damage_multiplier, s.heal_amount, s.crit_bonus,
              s.stun_chance, s.defense_break, s.is_aoe,
              CASE WHEN cs.character_id IS NOT NULL THEN true ELSE false END as learned
       FROM skills s
       LEFT JOIN character_skills cs ON s.id = cs.skill_id AND cs.character_id = $1
       WHERE (s.race_id = $2 OR s.race_id IS NULL)
       ORDER BY s.required_level, s.ki_cost`,
      [characterId, raceId]
    );
    return result.rows;
  }

  // Auto-learn basic skills khi tạo character - sử dụng cache
  static async autoLearnBasicSkills(characterId: number, raceId: number): Promise<void> {
    // Học Ki Blast (universal skill level 1)
    const kiBlast = gameDataCache.getSkillByName('Ki Blast');
    
    if (kiBlast && kiBlast.required_level === 1) {
      await this.learnSkill(characterId, kiBlast.id);
    }

    // Học skill đặc trưng của race nếu có (level 1-3)
    const raceSkills = gameDataCache.getSkillsByRace(raceId, 3);
    const firstSkill = raceSkills.sort((a, b) => a.required_level - b.required_level)[0];

    if (firstSkill) {
      await this.learnSkill(characterId, firstSkill.id);
    }
  }
}
