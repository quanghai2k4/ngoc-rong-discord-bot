import { query } from '../database/db';
import { SkillTemplate, SkillLevelData, CharacterSkillView, Skill } from '../types';
import { gameDataCache } from './GameDataCache';

export class SkillService {
  // ==========================================
  // NEW METHODS - Skill Leveling System
  // ==========================================

  /**
   * Lấy tất cả skills của character với current levels
   * Sử dụng PostgreSQL helper function get_character_skills()
   */
  static async getCharacterSkills(characterId: number): Promise<CharacterSkillView[]> {
    const result = await query(
      `SELECT * FROM get_character_skills($1)`,
      [characterId]
    );
    
    // Parse JSONB field
    return result.rows.map(row => ({
      ...row,
      current_level_data: row.current_level_data ? row.current_level_data : null
    }));
  }

  /**
   * Lấy skill template by nclass_id và skill_id
   */
  static async getSkillTemplate(nclassId: number, skillId: number): Promise<SkillTemplate | null> {
    const result = await query(
      `SELECT nclass_id, skill_id, name, max_point, mana_use_type, 
              skill_type, icon_id, dam_info, slot, skill_levels
       FROM skill_template
       WHERE nclass_id = $1 AND skill_id = $2`,
      [nclassId, skillId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      skill_levels: Array.isArray(row.skill_levels) ? row.skill_levels : JSON.parse(row.skill_levels)
    };
  }

  /**
   * Lấy skill info tại một level cụ thể
   */
  static async getSkillAtLevel(nclassId: number, skillId: number, level: number): Promise<SkillLevelData | null> {
    const result = await query(
      `SELECT get_skill_at_level($1, $2, $3) as level_data`,
      [nclassId, skillId, level]
    );

    if (!result.rows[0]?.level_data) return null;
    
    return result.rows[0].level_data;
  }

  /**
   * Học skill mới HOẶC nâng cấp skill level
   * @returns { success: boolean, message: string, newLevel?: number }
   */
  static async learnOrUpgradeSkill(
    characterId: number, 
    nclassId: number, 
    skillId: number
  ): Promise<{ success: boolean; message: string; newLevel?: number }> {
    try {
      // 1. Check if skill template exists
      const template = await this.getSkillTemplate(nclassId, skillId);
      if (!template) {
        return { success: false, message: 'Skill không tồn tại!' };
      }

      // 2. Get character's current skill level
      const currentSkillResult = await query(
        `SELECT current_point FROM character_skills 
         WHERE character_id = $1 AND nclass_id = $2 AND skill_id = $3`,
        [characterId, nclassId, skillId]
      );

      const currentLevel = currentSkillResult.rows[0]?.current_point || 0;

      // 3. Check if already max level
      if (currentLevel >= template.max_point) {
        return { success: false, message: `Skill đã đạt level tối đa (${template.max_point})!` };
      }

      const nextLevel = currentLevel + 1;

      // 4. Get character stats để check requirements
      const charResult = await query(
        `SELECT c.*, cr.name as race_name 
         FROM characters c
         JOIN character_races cr ON c.race_id = cr.id
         WHERE c.id = $1`,
        [characterId]
      );
      
      if (charResult.rows.length === 0) {
        return { success: false, message: 'Character không tồn tại!' };
      }

      const character = charResult.rows[0];
      const nextLevelData = template.skill_levels[nextLevel - 1];

      if (!nextLevelData) {
        return { success: false, message: 'Dữ liệu skill level không hợp lệ!' };
      }

      // 5. Check requirements
      // TODO: Implement power_require check khi có stat "Sức mạnh"
      // if (character.power < nextLevelData.power_require) {
      //   return { success: false, message: `Cần ${nextLevelData.power_require} sức mạnh!` };
      // }

      if (character.gold < nextLevelData.price) {
        return { 
          success: false, 
          message: `Không đủ vàng! Cần ${nextLevelData.price.toLocaleString()} vàng.` 
        };
      }

      // 6. Deduct gold
      await query(
        `UPDATE characters SET gold = gold - $1 WHERE id = $2`,
        [nextLevelData.price, characterId]
      );

      // 7. Learn hoặc upgrade skill
      if (currentLevel === 0) {
        // Learn new skill
        await query(
          `INSERT INTO character_skills (character_id, nclass_id, skill_id, current_point)
           VALUES ($1, $2, $3, 1)`,
          [characterId, nclassId, skillId]
        );
      } else {
        // Upgrade existing skill
        await query(
          `UPDATE character_skills 
           SET current_point = current_point + 1
           WHERE character_id = $1 AND nclass_id = $2 AND skill_id = $3`,
          [characterId, nclassId, skillId]
        );
      }

      return {
        success: true,
        message: currentLevel === 0 
          ? `Đã học skill **${template.name}** level 1!`
          : `Đã nâng cấp **${template.name}** lên level ${nextLevel}!`,
        newLevel: nextLevel
      };

    } catch (error) {
      console.error('Error in learnOrUpgradeSkill:', error);
      return { success: false, message: 'Lỗi khi học/nâng cấp skill!' };
    }
  }

  /**
   * Lấy tất cả skills available cho character (theo race)
   * Bao gồm: chưa học, đã học chưa max level, và đã max level
   */
  static async getAvailableSkillsByRace(characterId: number): Promise<CharacterSkillView[]> {
    return await this.getCharacterSkills(characterId);
  }

  /**
   * Kiểm tra character có skill ở level cụ thể không
   */
  static async hasSkillAtLevel(
    characterId: number, 
    nclassId: number, 
    skillId: number, 
    minLevel: number = 1
  ): Promise<boolean> {
    const result = await query(
      `SELECT current_point FROM character_skills 
       WHERE character_id = $1 AND nclass_id = $2 AND skill_id = $3`,
      [characterId, nclassId, skillId]
    );

    if (result.rows.length === 0) return false;
    return result.rows[0].current_point >= minLevel;
  }

  /**
   * Auto-learn basic skills khi tạo character
   * Mặc định: Học skill đầu tiên (slot 0) của race ở level 1
   */
  static async autoLearnBasicSkills(characterId: number, raceId: number): Promise<void> {
    // Direct 1:1 mapping: race_id = nclass_id (both start from 0)
    const nclassId = raceId;

    // Get first skill (slot 0) for this race
    const skillResult = await query(
      `SELECT skill_id FROM skill_template 
       WHERE nclass_id = $1 AND slot = 0
       LIMIT 1`,
      [nclassId]
    );

    if (skillResult.rows.length === 0) return;

    const firstSkillId = skillResult.rows[0].skill_id;

    // Learn skill at level 1
    await this.learnOrUpgradeSkill(characterId, nclassId, firstSkillId);
  }

  // ==========================================
  // LEGACY METHODS - For backward compatibility
  // TODO: Remove after refactoring all usages
  // ==========================================

  /**
   * Convert CharacterSkillView to legacy Skill format
   * Used by BattleService until full migration
   */
  private static convertToLegacySkill(skillView: CharacterSkillView): Skill | null {
    if (!skillView.current_level_data) return null;

    const levelData = skillView.current_level_data;
    
    return {
      // From SkillTemplate
      nclass_id: skillView.nclass_id,
      skill_id: skillView.skill_id,
      name: skillView.name,
      max_point: skillView.max_point,
      mana_use_type: 0,
      skill_type: skillView.skill_type,
      icon_id: 0,
      dam_info: '',
      slot: skillView.slot,
      skill_levels: [levelData],
      
      // Legacy mappings
      id: skillView.skill_id,
      description: `Level ${skillView.current_point}/${skillView.max_point}`,
      race_id: null, // TODO: map from nclass_id if needed
      required_level: 1,
      ki_cost: levelData.mana_use,
      cooldown: levelData.cool_down,
      damage_multiplier: levelData.damage / 100, // Convert % to multiplier
      heal_amount: skillView.skill_type === 2 ? levelData.damage : 0,
      crit_bonus: 0,
      stun_chance: 0,
      defense_break: 0,
      is_aoe: false,
      created_at: new Date()
    };
  }

  /**
   * Get character skills in legacy Skill[] format
   * Used by BattleService
   */
  static async getCharacterSkillsLegacy(characterId: number): Promise<Skill[]> {
    const skillViews = await this.getCharacterSkills(characterId);
    
    return skillViews
      .filter(sv => sv.current_point > 0) // Only learned skills
      .map(sv => this.convertToLegacySkill(sv))
      .filter((s): s is Skill => s !== null);
  }

  /**
   * @deprecated Use getAvailableSkillsByRace() instead
   */
  static async getAllSkillsByRace(characterId: number, raceId: number): Promise<CharacterSkillView[]> {
    return await this.getCharacterSkills(characterId);
  }

  /**
   * @deprecated Monster skills - TODO: Implement in new system
   */
  static async getMonsterSkills(monsterId: number): Promise<any[]> {
    // Temporary: return from cache if available
    return gameDataCache.getMonsterSkills(monsterId);
  }
}
