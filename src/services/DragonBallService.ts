import { pool } from '../database/db';
import { logger } from '../utils/logger';

/**
 * Interface cho Dragon Ball Set
 */
export interface DragonBallSet {
  id: number;
  character_id: number;
  set_type: 'earth' | 'namek';
  ball_1_item_id: number | null;
  ball_2_item_id: number | null;
  ball_3_item_id: number | null;
  ball_4_item_id: number | null;
  ball_5_item_id: number | null;
  ball_6_item_id: number | null;
  ball_7_item_id: number | null;
  is_complete: boolean;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface cho Wish Type
 */
export interface WishType {
  id: number;
  code: string;
  name: string;
  description: string;
  required_level: number;
  dragon_type: 'earth' | 'namek';
  cooldown_days: number;
  is_active: boolean;
}

/**
 * Interface cho Wish Result
 */
export interface WishResult {
  success: boolean;
  message: string;
  rewards?: {
    gold?: number;
    levels?: number;
    items?: Array<{ id: number; name: string; quantity: number }>;
    stats?: {
      max_hp_percent?: number;
      all_stats_percent?: number;
    };
    transformations?: string[];
  };
}

/**
 * Service quản lý hệ thống Dragon Ball Collection
 */
export class DragonBallService {
  /**
   * Lấy Dragon Ball set của character
   */
  static async getCharacterSet(characterId: number, setType: 'earth' | 'namek' = 'earth'): Promise<DragonBallSet | null> {
    try {
      const result = await pool.query(
        `SELECT * FROM dragon_ball_sets 
         WHERE character_id = $1 AND set_type = $2`,
        [characterId, setType]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error('[DragonBallService] Error getting character set', error);
      throw error;
    }
  }

  /**
   * Tạo hoặc lấy Dragon Ball set cho character
   */
  static async getOrCreateSet(characterId: number, setType: 'earth' | 'namek' = 'earth'): Promise<DragonBallSet> {
    try {
      const existingSet = await this.getCharacterSet(characterId, setType);

      if (existingSet) {
        return existingSet;
      }

      const result = await pool.query(
        `INSERT INTO dragon_ball_sets (character_id, set_type) 
         VALUES ($1, $2) 
         RETURNING *`,
        [characterId, setType]
      );
      
      logger.info(`Created new Dragon Ball set for character ${characterId}, type: ${setType}`);
      return result.rows[0];
    } catch (error) {
      logger.error('[DragonBallService] Error creating set', error);
      throw error;
    }
  }

  /**
   * Lấy Dragon Balls từ inventory của character
   */
  static async getCharacterDragonBalls(characterId: number, setType: 'earth' | 'namek' = 'earth'): Promise<any[]> {
    try {
      // Get Dragon Ball item IDs based on set type
      const itemTypeId = setType === 'earth' ? 12 : 11; // Quest = 12, Accessory = 11
      const namePattern = setType === 'earth' ? 'Ngọc Rồng % sao' : 'Ngọc Rồng Namek % Sao';

      const result = await pool.query(
        `SELECT ci.*, i.name, i.description
         FROM character_items ci
         JOIN items i ON ci.item_id = i.id
         WHERE ci.character_id = $1 
           AND i.item_type_id = $2
           AND i.name ILIKE $3
           AND ci.quantity > 0
         ORDER BY i.id`,
        [characterId, itemTypeId, namePattern]
      );

      return result.rows;
    } catch (error) {
      logger.error('[DragonBallService] Error getting character dragon balls', error);
      throw error;
    }
  }

  /**
   * Đếm số Dragon Balls character đã có
   */
  static async countDragonBalls(characterId: number, setType: 'earth' | 'namek' = 'earth'): Promise<number> {
    try {
      const balls = await this.getCharacterDragonBalls(characterId, setType);
      return balls.length;
    } catch (error) {
      logger.error('[DragonBallService] Error counting dragon balls', error);
      throw error;
    }
  }

  /**
   * Kiểm tra xem character có đủ 7 viên không
   */
  static async hasCompletedSet(characterId: number, setType: 'earth' | 'namek' = 'earth'): Promise<boolean> {
    try {
      const count = await this.countDragonBalls(characterId, setType);
      return count >= 7;
    } catch (error) {
      logger.error('[DragonBallService] Error checking complete set', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách wish types có thể dùng
   */
  static async getAvailableWishes(characterLevel: number, dragonType: 'earth' | 'namek' = 'earth'): Promise<WishType[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM wish_types 
         WHERE dragon_type = $1 
           AND required_level <= $2 
           AND is_active = true
         ORDER BY required_level, id`,
        [dragonType, characterLevel]
      );

      return result.rows;
    } catch (error) {
      logger.error('[DragonBallService] Error getting available wishes', error);
      throw error;
    }
  }

  /**
   * Kiểm tra xem wish có thể sử dụng không (cooldown)
   */
  static async canUseWish(characterId: number, wishCode: string): Promise<{ canUse: boolean; daysRemaining?: number }> {
    try {
      const result = await pool.query(
        `SELECT w.granted_at, wt.cooldown_days
         FROM wishes w
         JOIN wish_types wt ON w.wish_type_id = wt.id
         WHERE w.character_id = $1 AND wt.code = $2
         ORDER BY w.granted_at DESC
         LIMIT 1`,
        [characterId, wishCode]
      );

      if (result.rows.length === 0) {
        return { canUse: true };
      }

      const lastWish = result.rows[0];
      const cooldownMs = lastWish.cooldown_days * 24 * 60 * 60 * 1000;
      const timeSinceLastWish = Date.now() - new Date(lastWish.granted_at).getTime();

      if (timeSinceLastWish >= cooldownMs) {
        return { canUse: true };
      }

      const daysRemaining = Math.ceil((cooldownMs - timeSinceLastWish) / (24 * 60 * 60 * 1000));
      return { canUse: false, daysRemaining };
    } catch (error) {
      logger.error('[DragonBallService] Error checking wish cooldown', error);
      throw error;
    }
  }

  /**
   * Triệu hồi Shenron và thực hiện ước nguyện
   */
  static async summonAndWish(
    characterId: number,
    wishCode: string,
    setType: 'earth' | 'namek' = 'earth'
  ): Promise<WishResult> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Kiểm tra có đủ 7 viên không
      const hasComplete = await this.hasCompletedSet(characterId, setType);
      if (!hasComplete) {
        throw new Error('Bạn chưa có đủ 7 viên Ngọc Rồng!');
      }

      // 2. Lấy thông tin wish
      const wishResult = await client.query(
        `SELECT * FROM wish_types WHERE code = $1 AND dragon_type = $2 AND is_active = true`,
        [wishCode, setType]
      );

      if (wishResult.rows.length === 0) {
        throw new Error('Ước nguyện không hợp lệ!');
      }

      const wishType: WishType = wishResult.rows[0];

      // 3. Kiểm tra level requirement
      const charResult = await client.query(
        'SELECT level FROM characters WHERE id = $1',
        [characterId]
      );
      const characterLevel = charResult.rows[0].level;

      if (characterLevel < wishType.required_level) {
        throw new Error(`Bạn cần đạt level ${wishType.required_level} để sử dụng ước nguyện này!`);
      }

      // 4. Kiểm tra cooldown
      const cooldownCheck = await this.canUseWish(characterId, wishCode);
      if (!cooldownCheck.canUse) {
        throw new Error(`Ước nguyện này đang trong thời gian chờ! Còn ${cooldownCheck.daysRemaining} ngày.`);
      }

      // 5. Thực hiện ước nguyện
      const result = await this.executeWish(client, characterId, wishType);

      // 6. Xóa Dragon Balls khỏi inventory
      await this.consumeDragonBalls(client, characterId, setType);

      // 7. Lưu wish history
      await client.query(
        `INSERT INTO wishes (character_id, wish_type_id, set_type, wish_result) 
         VALUES ($1, $2, $3, $4)`,
        [characterId, wishType.id, setType, JSON.stringify(result.rewards)]
      );

      // 8. Lưu summon history
      await client.query(
        `INSERT INTO dragon_ball_summons (character_id, set_type, balls_used) 
         VALUES ($1, $2, $3)`,
        [characterId, setType, JSON.stringify({ consumed: true })]
      );

      await client.query('COMMIT');

      logger.success(`Wish granted: ${wishType.name} for character ${characterId}`);
      return result;

    } catch (error: any) {
      await client.query('ROLLBACK');
      logger.error('[DragonBallService] Error summoning Shenron', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Thực hiện các hiệu ứng của wish
   */
  private static async executeWish(client: any, characterId: number, wishType: WishType): Promise<WishResult> {
    const result: WishResult = {
      success: true,
      message: '',
      rewards: {}
    };

    switch (wishType.code) {
      case 'immortality':
      case 'immortality_namek':
        const hpBonus = wishType.code === 'immortality' ? 50 : 100;
        await client.query(
          `UPDATE characters 
           SET max_hp = FLOOR(max_hp * (1 + $1::float / 100)),
               hp = FLOOR(max_hp * (1 + $1::float / 100))
           WHERE id = $2`,
          [hpBonus, characterId]
        );
        result.message = `🌟 Shenron đã ban cho bạn sức sống bất tử! Max HP tăng ${hpBonus}%!`;
        result.rewards!.stats = { max_hp_percent: hpBonus };
        break;

      case 'power':
      case 'power_namek':
        const levels = wishType.code === 'power' ? 10 : 25;
        await client.query(
          `UPDATE characters 
           SET level = level + $1,
               max_hp = max_hp + ($1 * 20),
               max_ki = max_ki + ($1 * 20),
               attack = attack + ($1 * 5),
               defense = defense + ($1 * 5),
               speed = speed + ($1 * 3)
           WHERE id = $2`,
          [levels, characterId]
        );
        result.message = `⚡ Shenron đã trao cho bạn sức mạnh tuyệt đại! Bạn tăng ${levels} levels!`;
        result.rewards!.levels = levels;
        break;

      case 'wealth':
      case 'wealth_namek':
        const gold = wishType.code === 'wealth' ? 1000000 : 5000000;
        await client.query(
          'UPDATE characters SET gold = gold + $1 WHERE id = $2',
          [gold, characterId]
        );
        result.message = `💰 Shenron đã ban cho bạn kho báu vô tận! Nhận ${gold.toLocaleString()} vàng!`;
        result.rewards!.gold = gold;
        break;

      case 'rare_item':
      case 'rare_item_namek':
        const itemCount = wishType.code === 'rare_item' ? 1 : 3;
        // TODO: Implement random legendary item drop
        result.message = `🎁 Shenron đã trao cho bạn ${itemCount} vật phẩm huyền thoại!`;
        result.rewards!.items = [];
        break;

      case 'transformation':
        // TODO: Implement transformation unlock
        result.message = `✨ Shenron đã mở khóa biến hình mới cho bạn!`;
        result.rewards!.transformations = ['Super Saiyan'];
        break;

      case 'revival':
        await client.query(
          `UPDATE characters 
           SET hp = max_hp, ki = max_ki 
           WHERE id = $1`,
          [characterId]
        );
        result.message = `💚 Shenron đã hồi phục hoàn toàn sức lực của bạn!`;
        break;

      case 'skill_mastery':
        await client.query(
          `UPDATE character_skills 
           SET current_point = (
             SELECT max_point FROM skill_template 
             WHERE nclass_id = character_skills.nclass_id 
             AND skill_id = character_skills.skill_id
           )
           WHERE character_id = $1`,
          [characterId]
        );
        result.message = `🎯 Shenron đã nâng tất cả kỹ năng của bạn lên max level!`;
        break;

      case 'zenkai_boost':
        await client.query(
          `UPDATE characters 
           SET attack = FLOOR(attack * 1.2),
               defense = FLOOR(defense * 1.2),
               speed = FLOOR(speed * 1.2),
               max_hp = FLOOR(max_hp * 1.2),
               max_ki = FLOOR(max_ki * 1.2)
           WHERE id = $1`,
          [characterId]
        );
        result.message = `🔥 Shenron đã kích hoạt Zenkai Boost! Tất cả stats tăng 20%!`;
        result.rewards!.stats = { all_stats_percent: 20 };
        break;

      case 'ultimate_power':
        // TODO: Implement Super Shenron transformation
        result.message = `🐉 Shenron đã ban cho bạn sức mạnh tối thượng của Super Shenron!`;
        result.rewards!.transformations = ['Super Shenron'];
        break;

      default:
        throw new Error('Ước nguyện không được hỗ trợ!');
    }

    return result;
  }

  /**
   * Xóa Dragon Balls sau khi summon
   */
  private static async consumeDragonBalls(client: any, characterId: number, setType: 'earth' | 'namek'): Promise<void> {
    try {
      const itemTypeId = setType === 'earth' ? 12 : 11;
      const namePattern = setType === 'earth' ? 'Ngọc Rồng % sao' : 'Ngọc Rồng Namek % Sao';

      await client.query(
        `DELETE FROM character_items 
         WHERE character_id = $1 
           AND item_id IN (
             SELECT id FROM items 
             WHERE item_type_id = $2 
             AND name ILIKE $3
           )`,
        [characterId, itemTypeId, namePattern]
      );

      logger.info(`Consumed Dragon Balls for character ${characterId}, type: ${setType}`);
    } catch (error) {
      logger.error('[DragonBallService] Error consuming dragon balls', error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử wishes của character
   */
  static async getWishHistory(characterId: number, limit: number = 10): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT w.*, wt.name as wish_name, wt.description, wt.dragon_type
         FROM wishes w
         JOIN wish_types wt ON w.wish_type_id = wt.id
         WHERE w.character_id = $1
         ORDER BY w.granted_at DESC
         LIMIT $2`,
        [characterId, limit]
      );

      return result.rows;
    } catch (error) {
      logger.error('[DragonBallService] Error getting wish history', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê Dragon Ball cho server
   */
  static async getServerStats(): Promise<any> {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(DISTINCT character_id) as total_collectors,
          COUNT(*) FILTER (WHERE is_complete = true) as completed_sets,
          (SELECT COUNT(*) FROM wishes) as total_wishes_granted,
          (SELECT COUNT(DISTINCT character_id) FROM wishes) as unique_wishers
        FROM dragon_ball_sets
      `);

      return result.rows[0];
    } catch (error) {
      logger.error('[DragonBallService] Error getting server stats', error);
      throw error;
    }
  }
}
