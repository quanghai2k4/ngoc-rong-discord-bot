import { query } from '../database/db';

interface SenzuConfig {
  level: number;
  upgrade_cost: number;
  production_time: number; // minutes
  beans_per_harvest: number;
  bean_hp_restore: number;
  bean_ki_restore: number;
  required_character_level: number;
}

export class SenzuService {
  /**
   * Lấy config của cấp độ cây đậu thần
   */
  static async getSenzuConfig(level: number): Promise<SenzuConfig | null> {
    const result = await query(
      'SELECT * FROM senzu_upgrade_config WHERE level = $1',
      [level]
    );
    return result.rows[0] || null;
  }

  /**
   * Lấy tất cả config
   */
  static async getAllSenzuConfigs(): Promise<SenzuConfig[]> {
    const result = await query(
      'SELECT * FROM senzu_upgrade_config ORDER BY level ASC'
    );
    return result.rows;
  }

  /**
   * Kiểm tra xem có thể thu hoạch không
   */
  static async canHarvest(characterId: number): Promise<{
    canHarvest: boolean;
    minutesRemaining: number;
    beansReady: number;
  }> {
    const charResult = await query(
      'SELECT senzu_level, senzu_last_harvest FROM characters WHERE id = $1',
      [characterId]
    );

    if (charResult.rows.length === 0) {
      throw new Error('Character not found');
    }

    const { senzu_level, senzu_last_harvest } = charResult.rows[0];
    const config = await this.getSenzuConfig(senzu_level);

    if (!config) {
      throw new Error('Senzu config not found');
    }

    const lastHarvest = new Date(senzu_last_harvest);
    const now = new Date();
    const minutesPassed = (now.getTime() - lastHarvest.getTime()) / (1000 * 60);
    const minutesRemaining = Math.max(0, config.production_time - minutesPassed);

    return {
      canHarvest: minutesPassed >= config.production_time,
      minutesRemaining: Math.ceil(minutesRemaining),
      beansReady: minutesPassed >= config.production_time ? config.beans_per_harvest : 0,
    };
  }

  /**
   * Thu hoạch đậu thần
   */
  static async harvest(characterId: number): Promise<{
    success: boolean;
    message: string;
    beansHarvested: number;
    totalBeans: number;
  }> {
    const harvestCheck = await this.canHarvest(characterId);

    if (!harvestCheck.canHarvest) {
      return {
        success: false,
        message: `⏰ Cây đậu thần chưa sẵn sàng!\nCòn **${harvestCheck.minutesRemaining}** phút nữa.`,
        beansHarvested: 0,
        totalBeans: 0,
      };
    }

    // Update senzu_beans và senzu_last_harvest
    const result = await query(
      `UPDATE characters 
       SET senzu_beans = senzu_beans + $1, 
           senzu_last_harvest = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING senzu_beans`,
      [harvestCheck.beansReady, characterId]
    );

    const totalBeans = result.rows[0].senzu_beans;

    return {
      success: true,
      message: `🌱 Thu hoạch thành công **${harvestCheck.beansReady}** đậu thần!\nTổng: **${totalBeans}** đậu.`,
      beansHarvested: harvestCheck.beansReady,
      totalBeans: totalBeans,
    };
  }

  /**
   * Nâng cấp cây đậu thần
   */
  static async upgrade(characterId: number): Promise<{
    success: boolean;
    message: string;
    newLevel?: number;
  }> {
    const charResult = await query(
      'SELECT senzu_level, gold, level FROM characters WHERE id = $1',
      [characterId]
    );

    if (charResult.rows.length === 0) {
      throw new Error('Character not found');
    }

    const { senzu_level, gold, level: characterLevel } = charResult.rows[0];

    if (senzu_level >= 10) {
      return {
        success: false,
        message: '🌳 Cây đậu thần của bạn đã đạt cấp tối đa (10)!',
      };
    }

    const nextLevel = senzu_level + 1;
    const nextConfig = await this.getSenzuConfig(nextLevel);

    if (!nextConfig) {
      return {
        success: false,
        message: '❌ Không tìm thấy thông tin nâng cấp!',
      };
    }

    // Kiểm tra level requirement
    if (characterLevel < nextConfig.required_character_level) {
      return {
        success: false,
        message: `❌ Bạn cần đạt level **${nextConfig.required_character_level}** để nâng cấp lên cấp ${nextLevel}!\nLevel hiện tại: **${characterLevel}**`,
      };
    }

    // Kiểm tra gold
    if (gold < nextConfig.upgrade_cost) {
      return {
        success: false,
        message: `❌ Không đủ vàng để nâng cấp!\nCần: **${nextConfig.upgrade_cost.toLocaleString()}** 💰\nCó: **${gold.toLocaleString()}** 💰`,
      };
    }

    // Nâng cấp
    await query(
      'UPDATE characters SET senzu_level = $1, gold = gold - $2 WHERE id = $3',
      [nextLevel, nextConfig.upgrade_cost, characterId]
    );

    return {
      success: true,
      message: `🌳 Nâng cấp cây đậu thần thành công!\n` +
        `**Cấp ${senzu_level}** → **Cấp ${nextLevel}**\n\n` +
        `**Thông tin mới:**\n` +
        `⏱️ Thời gian: **${nextConfig.production_time}** phút\n` +
        `🌱 Thu hoạch: **${nextConfig.beans_per_harvest}** đậu\n` +
        `💚 Hồi phục: **${nextConfig.bean_hp_restore}** HP / **${nextConfig.bean_ki_restore}** KI\n` +
        `💰 Đã trả: **${nextConfig.upgrade_cost.toLocaleString()}** vàng`,
      newLevel: nextLevel,
    };
  }

  /**
   * Sử dụng đậu thần
   */
  static async useSenzu(characterId: number, quantity: number = 1): Promise<{
    success: boolean;
    message: string;
    hpRestored: number;
    kiRestored: number;
  }> {
    const charResult = await query(
      `SELECT senzu_beans, senzu_level, hp, max_hp, ki, max_ki 
       FROM characters WHERE id = $1`,
      [characterId]
    );

    if (charResult.rows.length === 0) {
      throw new Error('Character not found');
    }

    const { senzu_beans, senzu_level, hp, max_hp, ki, max_ki } = charResult.rows[0];

    if (senzu_beans < quantity) {
      return {
        success: false,
        message: `❌ Không đủ đậu thần!\nCó: **${senzu_beans}** đậu\nCần: **${quantity}** đậu`,
        hpRestored: 0,
        kiRestored: 0,
      };
    }

    const config = await this.getSenzuConfig(senzu_level);
    if (!config) {
      throw new Error('Senzu config not found');
    }

    // Tính HP/KI restore
    const totalHpRestore = config.bean_hp_restore * quantity;
    const totalKiRestore = config.bean_ki_restore * quantity;

    const newHp = Math.min(max_hp, hp + totalHpRestore);
    const newKi = Math.min(max_ki, ki + totalKiRestore);

    const actualHpRestored = newHp - hp;
    const actualKiRestored = newKi - ki;

    // Update
    await query(
      `UPDATE characters 
       SET senzu_beans = senzu_beans - $1, hp = $2, ki = $3 
       WHERE id = $4`,
      [quantity, newHp, newKi, characterId]
    );

    return {
      success: true,
      message: `🌱 Sử dụng **${quantity}** đậu thần!\n` +
        `❤️ HP: **+${actualHpRestored}** (${hp} → ${newHp})\n` +
        `💙 KI: **+${actualKiRestored}** (${ki} → ${newKi})\n` +
        `Còn lại: **${senzu_beans - quantity}** đậu`,
      hpRestored: actualHpRestored,
      kiRestored: actualKiRestored,
    };
  }

  /**
   * Xem thông tin cây đậu thần
   */
  static async getSenzuInfo(characterId: number): Promise<{
    level: number;
    beans: number;
    config: SenzuConfig;
    canHarvest: boolean;
    minutesRemaining: number;
    beansReady: number;
    nextLevelConfig: SenzuConfig | null;
  }> {
    const charResult = await query(
      'SELECT senzu_level, senzu_beans FROM characters WHERE id = $1',
      [characterId]
    );

    if (charResult.rows.length === 0) {
      throw new Error('Character not found');
    }

    const { senzu_level, senzu_beans } = charResult.rows[0];
    const config = await this.getSenzuConfig(senzu_level);
    const harvestCheck = await this.canHarvest(characterId);
    
    let nextLevelConfig = null;
    if (senzu_level < 10) {
      nextLevelConfig = await this.getSenzuConfig(senzu_level + 1);
    }

    if (!config) {
      throw new Error('Senzu config not found');
    }

    return {
      level: senzu_level,
      beans: senzu_beans,
      config,
      canHarvest: harvestCheck.canHarvest,
      minutesRemaining: harvestCheck.minutesRemaining,
      beansReady: harvestCheck.beansReady,
      nextLevelConfig,
    };
  }
}
