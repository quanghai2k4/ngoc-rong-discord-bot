import { query } from '../database/db';

export class EquipmentService {
  /**
   * Equip một item
   */
  static async equipItem(characterId: number, itemName: string): Promise<{
    success: boolean;
    message: string;
    item?: any;
    statsGained?: {
      hp: number;
      ki: number;
      attack: number;
      defense: number;
      speed: number;
    };
  }> {
    try {
      // Tìm item trong inventory
      const itemResult = await query(
        `SELECT ci.*, i.name, i.item_type_id, i.hp_bonus, i.ki_bonus, 
                i.attack_bonus, i.defense_bonus, i.speed_bonus, i.is_consumable,
                it.name as type_name
         FROM character_items ci
         JOIN items i ON ci.item_id = i.id
         JOIN item_types it ON i.item_type_id = it.id
         WHERE ci.character_id = $1 AND LOWER(i.name) = LOWER($2)`,
        [characterId, itemName]
      );

      if (itemResult.rows.length === 0) {
        return {
          success: false,
          message: `❌ Bạn không có **${itemName}** trong túi đồ!`
        };
      }

      const item = itemResult.rows[0];

      // Kiểm tra nếu là consumable
      if (item.is_consumable) {
        return {
          success: false,
          message: `❌ **${item.name}** là vật phẩm tiêu hao, không thể trang bị! Sử dụng \`/use ${item.name}\` để dùng.`
        };
      }

      // Kiểm tra đã equipped chưa
      if (item.equipped) {
        return {
          success: false,
          message: `⚠️ **${item.name}** đã được trang bị rồi!`
        };
      }

      // Kiểm tra xem đã có item cùng loại được equip chưa
      const equippedSameType = await query(
        `SELECT ci.*, i.name
         FROM character_items ci
         JOIN items i ON ci.item_id = i.id
         WHERE ci.character_id = $1 AND i.item_type_id = $2 AND ci.equipped = true`,
        [characterId, item.item_type_id]
      );

      // Unequip item cũ nếu có
      if (equippedSameType.rows.length > 0) {
        const oldItem = equippedSameType.rows[0];
        await query(
          `UPDATE character_items SET equipped = false WHERE character_id = $1 AND item_id = $2`,
          [characterId, oldItem.item_id]
        );
      }

      // Equip item mới
      await query(
        `UPDATE character_items SET equipped = true WHERE character_id = $1 AND item_id = $2`,
        [characterId, item.item_id]
      );

      // Cập nhật stats của character
      await this.recalculateStats(characterId);

      const statsGained = {
        hp: item.hp_bonus,
        ki: item.ki_bonus,
        attack: item.attack_bonus,
        defense: item.defense_bonus,
        speed: item.speed_bonus
      };

      let message = `✅ Đã trang bị **${item.name}**!`;
      if (equippedSameType.rows.length > 0) {
        message += `\n🔄 Đã gỡ **${equippedSameType.rows[0].name}** (${item.type_name})`;
      }

      return {
        success: true,
        message,
        item,
        statsGained
      };
    } catch (error) {
      console.error('[EquipmentService] equipItem error:', error);
      throw error;
    }
  }

  /**
   * Unequip một item
   */
  static async unequipItem(characterId: number, itemName: string): Promise<{
    success: boolean;
    message: string;
    item?: any;
  }> {
    try {
      // Tìm item trong inventory
      const itemResult = await query(
        `SELECT ci.*, i.name, i.hp_bonus, i.ki_bonus, i.attack_bonus, 
                i.defense_bonus, i.speed_bonus
         FROM character_items ci
         JOIN items i ON ci.item_id = i.id
         WHERE ci.character_id = $1 AND LOWER(i.name) = LOWER($2)`,
        [characterId, itemName]
      );

      if (itemResult.rows.length === 0) {
        return {
          success: false,
          message: `❌ Bạn không có **${itemName}** trong túi đồ!`
        };
      }

      const item = itemResult.rows[0];

      // Kiểm tra đã equipped chưa
      if (!item.equipped) {
        return {
          success: false,
          message: `⚠️ **${item.name}** chưa được trang bị!`
        };
      }

      // Unequip item
      await query(
        `UPDATE character_items SET equipped = false WHERE character_id = $1 AND item_id = $2`,
        [characterId, item.item_id]
      );

      // Cập nhật stats của character
      await this.recalculateStats(characterId);

      return {
        success: true,
        message: `✅ Đã gỡ **${item.name}**!`,
        item
      };
    } catch (error) {
      console.error('[EquipmentService] unequipItem error:', error);
      throw error;
    }
  }

  /**
   * Sử dụng consumable item
   */
  static async useItem(characterId: number, itemName: string): Promise<{
    success: boolean;
    message: string;
    item?: any;
    healedHp?: number;
    healedKi?: number;
  }> {
    try {
      // Lấy thông tin character
      const charResult = await query(
        `SELECT hp, max_hp, ki, max_ki FROM characters WHERE id = $1`,
        [characterId]
      );

      if (charResult.rows.length === 0) {
        return {
          success: false,
          message: '❌ Không tìm thấy nhân vật!'
        };
      }

      const character = charResult.rows[0];

      // Tìm item trong inventory
      const itemResult = await query(
        `SELECT ci.*, i.name, i.hp_bonus, i.ki_bonus, i.is_consumable
         FROM character_items ci
         JOIN items i ON ci.item_id = i.id
         WHERE ci.character_id = $1 AND LOWER(i.name) = LOWER($2)`,
        [characterId, itemName]
      );

      if (itemResult.rows.length === 0) {
        return {
          success: false,
          message: `❌ Bạn không có **${itemName}** trong túi đồ!`
        };
      }

      const item = itemResult.rows[0];

      // Kiểm tra nếu không phải consumable
      if (!item.is_consumable) {
        return {
          success: false,
          message: `❌ **${item.name}** không phải vật phẩm tiêu hao! Sử dụng \`/equip ${item.name}\` để trang bị.`
        };
      }

      // Kiểm tra HP/KI đã đầy chưa
      if (character.hp >= character.max_hp && character.ki >= character.max_ki) {
        return {
          success: false,
          message: `⚠️ HP và KI của bạn đã đầy rồi!`
        };
      }

      // Tính toán HP/KI hồi phục
      const newHp = Math.min(character.hp + item.hp_bonus, character.max_hp);
      const newKi = Math.min(character.ki + item.ki_bonus, character.max_ki);
      const healedHp = newHp - character.hp;
      const healedKi = newKi - character.ki;

      if (healedHp === 0 && healedKi === 0) {
        return {
          success: false,
          message: `⚠️ HP và KI của bạn đã đầy rồi!`
        };
      }

      // Cập nhật HP/KI
      await query(
        `UPDATE characters SET hp = $1, ki = $2 WHERE id = $3`,
        [newHp, newKi, characterId]
      );

      // Giảm quantity hoặc xóa item
      if (item.quantity > 1) {
        await query(
          `UPDATE character_items SET quantity = quantity - 1 
           WHERE character_id = $1 AND item_id = $2`,
          [characterId, item.item_id]
        );
      } else {
        await query(
          `DELETE FROM character_items WHERE character_id = $1 AND item_id = $2`,
          [characterId, item.item_id]
        );
      }

      let message = `✅ Đã sử dụng **${item.name}**!`;
      const effects = [];
      if (healedHp > 0) effects.push(`❤️ HP +${healedHp}`);
      if (healedKi > 0) effects.push(`💙 KI +${healedKi}`);
      message += `\n${effects.join(' • ')}`;

      return {
        success: true,
        message,
        item,
        healedHp,
        healedKi
      };
    } catch (error) {
      console.error('[EquipmentService] useItem error:', error);
      throw error;
    }
  }

  /**
   * Tính lại stats của character dựa trên equipped items
   */
  static async recalculateStats(characterId: number): Promise<void> {
    try {
      // Lấy base stats từ character (không có bonus từ items)
      const charResult = await query(
        `SELECT c.*, cr.hp_bonus as race_hp_bonus, cr.ki_bonus as race_ki_bonus,
                cr.attack_bonus as race_attack_bonus, cr.defense_bonus as race_defense_bonus
         FROM characters c
         JOIN character_races cr ON c.race_id = cr.id
         WHERE c.id = $1`,
        [characterId]
      );

      if (charResult.rows.length === 0) return;

      const char = charResult.rows[0];

      // Tính base stats (level-based + race bonus)
      const baseMaxHp = 100 + (char.level - 1) * 20 + char.race_hp_bonus;
      const baseMaxKi = 100 + (char.level - 1) * 20 + char.race_ki_bonus;
      const baseAttack = 10 + (char.level - 1) * 5 + char.race_attack_bonus;
      const baseDefense = 10 + (char.level - 1) * 5 + char.race_defense_bonus;
      const baseSpeed = 10 + (char.level - 1) * 3;

      // Lấy tổng bonus từ equipped items
      const equipmentResult = await query(
        `SELECT COALESCE(SUM(i.hp_bonus), 0) as total_hp_bonus,
                COALESCE(SUM(i.ki_bonus), 0) as total_ki_bonus,
                COALESCE(SUM(i.attack_bonus), 0) as total_attack_bonus,
                COALESCE(SUM(i.defense_bonus), 0) as total_defense_bonus,
                COALESCE(SUM(i.speed_bonus), 0) as total_speed_bonus
         FROM character_items ci
         JOIN items i ON ci.item_id = i.id
         WHERE ci.character_id = $1 AND ci.equipped = true`,
        [characterId]
      );

      const equipment = equipmentResult.rows[0];

      // Tính final stats
      const newMaxHp = baseMaxHp + parseInt(equipment.total_hp_bonus);
      const newMaxKi = baseMaxKi + parseInt(equipment.total_ki_bonus);
      const newAttack = baseAttack + parseInt(equipment.total_attack_bonus);
      const newDefense = baseDefense + parseInt(equipment.total_defense_bonus);
      const newSpeed = baseSpeed + parseInt(equipment.total_speed_bonus);

      // Đảm bảo current HP/KI không vượt quá max mới
      const newHp = Math.min(char.hp, newMaxHp);
      const newKi = Math.min(char.ki, newMaxKi);

      // Update character stats
      await query(
        `UPDATE characters 
         SET max_hp = $1, max_ki = $2, attack = $3, defense = $4, speed = $5, hp = $6, ki = $7
         WHERE id = $8`,
        [newMaxHp, newMaxKi, newAttack, newDefense, newSpeed, newHp, newKi, characterId]
      );
    } catch (error) {
      console.error('[EquipmentService] recalculateStats error:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách equipped items
   */
  static async getEquippedItems(characterId: number): Promise<any[]> {
    const result = await query(
      `SELECT i.*, ci.quantity, ci.equipped, it.name as type_name
       FROM character_items ci
       JOIN items i ON ci.item_id = i.id
       JOIN item_types it ON i.item_type_id = it.id
       WHERE ci.character_id = $1 AND ci.equipped = true
       ORDER BY it.id, i.name`,
      [characterId]
    );
    return result.rows;
  }
}
