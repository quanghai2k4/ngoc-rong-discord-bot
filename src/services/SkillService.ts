import { query } from '../database/db';
import { Skill } from '../types';

export class SkillService {
  // Lấy tất cả skills của một character
  static async getCharacterSkills(characterId: number): Promise<Skill[]> {
    const result = await query(
      `SELECT s.* FROM skills s
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
      `SELECT * FROM skills 
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

  // Lấy skill by ID
  static async getSkillById(skillId: number): Promise<Skill | null> {
    const result = await query('SELECT * FROM skills WHERE id = $1', [skillId]);
    return result.rows[0] || null;
  }

  // Lấy skills của monster
  static async getMonsterSkills(monsterId: number): Promise<Array<Skill & { use_probability: number }>> {
    const result = await query(
      `SELECT s.*, ms.use_probability 
       FROM skills s
       JOIN monster_skills ms ON s.id = ms.skill_id
       WHERE ms.monster_id = $1`,
      [monsterId]
    );
    return result.rows;
  }

  // Lấy TẤT CẢ skills theo race (đã học và chưa học)
  static async getAllSkillsByRace(characterId: number, raceId: number): Promise<Array<Skill & { learned: boolean }>> {
    const result = await query(
      `SELECT s.*, 
              CASE WHEN cs.character_id IS NOT NULL THEN true ELSE false END as learned
       FROM skills s
       LEFT JOIN character_skills cs ON s.id = cs.skill_id AND cs.character_id = $1
       WHERE (s.race_id = $2 OR s.race_id IS NULL)
       ORDER BY s.required_level, s.ki_cost`,
      [characterId, raceId]
    );
    return result.rows;
  }

  // Auto-learn basic skills khi tạo character
  static async autoLearnBasicSkills(characterId: number, raceId: number): Promise<void> {
    // Học Ki Blast (universal skill level 1)
    const kiBlast = await query(
      'SELECT id FROM skills WHERE name = $1 AND required_level = 1',
      ['Ki Blast']
    );
    
    if (kiBlast.rows[0]) {
      await this.learnSkill(characterId, kiBlast.rows[0].id);
    }

    // Học skill đặc trưng của race nếu có (level 1)
    const raceSkills = await query(
      'SELECT id FROM skills WHERE race_id = $1 AND required_level <= 3 ORDER BY required_level LIMIT 1',
      [raceId]
    );

    if (raceSkills.rows[0]) {
      await this.learnSkill(characterId, raceSkills.rows[0].id);
    }
  }
}
