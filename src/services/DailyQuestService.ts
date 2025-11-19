import { query } from '../database/db';

export interface DailyQuestTemplate {
  id: number;
  name: string;
  description: string;
  quest_type: string;
  target_id: number | null;
  required_amount: number;
  exp_reward: number;
  gold_reward: number;
  item_reward_id: number | null;
  min_level: number;
}

export interface CharacterDailyQuest {
  id: number;
  character_id: number;
  quest_template_id: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  assigned_date: string;
  completed_at: Date | null;
  claimed_at: Date | null;
  // Joined data from template
  name?: string;
  description?: string;
  quest_type?: string;
  target_id?: number | null;
  required_amount?: number;
  exp_reward?: number;
  gold_reward?: number;
  item_reward_id?: number | null;
  item_name?: string;
}

export class DailyQuestService {
  /**
   * Lấy ngày hiện tại theo UTC+7 (Vietnam timezone)
   */
  static getCurrentVNDate(): string {
    const now = new Date();
    // UTC+7 offset
    const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return vnTime.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }

  /**
   * Assign random 3-5 quests cho character nếu chưa có quest hôm nay
   */
  static async assignDailyQuests(characterId: number, characterLevel: number): Promise<void> {
    const currentDate = this.getCurrentVNDate();

    // Kiểm tra đã có quests hôm nay chưa
    const existingQuests = await query(
      'SELECT COUNT(*) FROM character_daily_quests WHERE character_id = $1 AND assigned_date = $2',
      [characterId, currentDate]
    );

    if (parseInt(existingQuests.rows[0].count) > 0) {
      // Đã có quests hôm nay rồi
      return;
    }

    // Lấy tất cả quest templates phù hợp với level
    const templates = await query(
      'SELECT * FROM daily_quest_templates WHERE min_level <= $1 ORDER BY RANDOM()',
      [characterLevel]
    );

    if (templates.rows.length === 0) {
      return; // Không có quest nào phù hợp
    }

    // Random số lượng quests: 3-5
    const questCount = Math.floor(Math.random() * 3) + 3; // Random 3, 4, hoặc 5
    const selectedQuests = templates.rows.slice(0, Math.min(questCount, templates.rows.length));

    // Insert quests cho character
    for (const template of selectedQuests) {
      await query(
        `INSERT INTO character_daily_quests (character_id, quest_template_id, assigned_date)
         VALUES ($1, $2, $3)`,
        [characterId, template.id, currentDate]
      );
    }
  }

  /**
   * Lấy daily quests của character
   */
  static async getCharacterDailyQuests(characterId: number): Promise<CharacterDailyQuest[]> {
    const currentDate = this.getCurrentVNDate();

    const result = await query(
      `SELECT 
        cdq.*,
        dqt.name,
        dqt.description,
        dqt.quest_type,
        dqt.target_id,
        dqt.required_amount,
        dqt.exp_reward,
        dqt.gold_reward,
        dqt.item_reward_id,
        i.name as item_name
       FROM character_daily_quests cdq
       JOIN daily_quest_templates dqt ON cdq.quest_template_id = dqt.id
       LEFT JOIN items i ON dqt.item_reward_id = i.id
       WHERE cdq.character_id = $1 AND cdq.assigned_date = $2
       ORDER BY cdq.completed, cdq.id`,
      [characterId, currentDate]
    );

    return result.rows;
  }

  /**
   * Update progress cho quest và tự động claim nếu hoàn thành
   * Returns: Array of claimed quest rewards
   */
  static async updateQuestProgress(
    characterId: number,
    questType: string,
    targetId: number | null,
    amount: number = 1
  ): Promise<Array<{
    questName: string;
    expReward: number;
    goldReward: number;
    itemName: string | null;
  }>> {
    const currentDate = this.getCurrentVNDate();
    const claimedRewards: Array<{
      questName: string;
      expReward: number;
      goldReward: number;
      itemName: string | null;
    }> = [];

    // Tìm quests phù hợp (chưa completed)
    const quests = await query(
      `SELECT cdq.id, cdq.progress, dqt.required_amount, dqt.name, dqt.exp_reward, dqt.gold_reward, dqt.item_reward_id, i.name as item_name
       FROM character_daily_quests cdq
       JOIN daily_quest_templates dqt ON cdq.quest_template_id = dqt.id
       LEFT JOIN items i ON dqt.item_reward_id = i.id
       WHERE cdq.character_id = $1 
         AND cdq.assigned_date = $2
         AND cdq.completed = FALSE
         AND dqt.quest_type = $3
         AND (dqt.target_id = $4 OR dqt.target_id IS NULL)`,
      [characterId, currentDate, questType, targetId]
    );

    for (const quest of quests.rows) {
      const newProgress = quest.progress + amount;
      const completed = newProgress >= quest.required_amount;

      await query(
        `UPDATE character_daily_quests 
         SET progress = $1, completed = $2, completed_at = $3
         WHERE id = $4`,
        [
          Math.min(newProgress, quest.required_amount),
          completed,
          completed ? new Date() : null,
          quest.id
        ]
      );

      // Nếu quest vừa hoàn thành, tự động claim reward
      if (completed) {
        // Cộng rewards cho character
        await query(
          'UPDATE characters SET experience = experience + $1, gold = gold + $2 WHERE id = $3',
          [quest.exp_reward || 0, quest.gold_reward || 0, characterId]
        );

        // Thêm item reward nếu có
        if (quest.item_reward_id) {
          await query(
            `INSERT INTO character_items (character_id, item_id, quantity)
             VALUES ($1, $2, 1)
             ON CONFLICT (character_id, item_id)
             DO UPDATE SET quantity = character_items.quantity + 1`,
            [characterId, quest.item_reward_id]
          );
        }

        // Mark quest as claimed
        await query(
          'UPDATE character_daily_quests SET claimed = TRUE, claimed_at = $1 WHERE id = $2',
          [new Date(), quest.id]
        );

        // Add to claimed rewards list
        claimedRewards.push({
          questName: quest.name,
          expReward: quest.exp_reward || 0,
          goldReward: quest.gold_reward || 0,
          itemName: quest.item_name || null
        });
      }
    }

    return claimedRewards;
  }

  /**
   * Claim rewards cho quest đã hoàn thành
   */
  static async claimQuestReward(
    characterId: number,
    questId: number
  ): Promise<{ success: boolean; message: string; rewards?: any }> {
    try {
      // Lấy thông tin quest
      const questResult = await query(
        `SELECT 
          cdq.*, 
          dqt.exp_reward, 
          dqt.gold_reward, 
          dqt.item_reward_id,
          dqt.name as quest_name,
          i.name as item_name
         FROM character_daily_quests cdq
         JOIN daily_quest_templates dqt ON cdq.quest_template_id = dqt.id
         LEFT JOIN items i ON dqt.item_reward_id = i.id
         WHERE cdq.id = $1 AND cdq.character_id = $2`,
        [questId, characterId]
      );

      if (questResult.rows.length === 0) {
        return { success: false, message: 'Không tìm thấy quest!' };
      }

      const quest = questResult.rows[0];

      if (!quest.completed) {
        return { success: false, message: 'Quest chưa hoàn thành!' };
      }

      if (quest.claimed) {
        return { success: false, message: 'Đã nhận thưởng quest này rồi!' };
      }

      // Cộng rewards
      const rewards: any = {
        exp: quest.exp_reward || 0,
        gold: quest.gold_reward || 0,
        item: quest.item_name || null
      };

      // Update character
      await query(
        'UPDATE characters SET experience = experience + $1, gold = gold + $2 WHERE id = $3',
        [quest.exp_reward || 0, quest.gold_reward || 0, characterId]
      );

      // Thêm item reward nếu có
      if (quest.item_reward_id) {
        await query(
          `INSERT INTO character_items (character_id, item_id, quantity)
           VALUES ($1, $2, 1)
           ON CONFLICT (character_id, item_id)
           DO UPDATE SET quantity = character_items.quantity + 1`,
          [characterId, quest.item_reward_id]
        );
      }

      // Mark quest as claimed
      await query(
        'UPDATE character_daily_quests SET claimed = TRUE, claimed_at = $1 WHERE id = $2',
        [new Date(), questId]
      );

      return {
        success: true,
        message: `Đã nhận thưởng quest: ${quest.quest_name}`,
        rewards
      };
    } catch (error) {
      console.error('Error claiming quest reward:', error);
      return { success: false, message: 'Có lỗi xảy ra khi nhận thưởng!' };
    }
  }

  /**
   * Claim tất cả rewards cho các quests đã hoàn thành
   */
  static async claimAllRewards(characterId: number): Promise<{
    success: boolean;
    message: string;
    totalRewards?: { exp: number; gold: number; items: string[] };
  }> {
    const currentDate = this.getCurrentVNDate();

    // Lấy tất cả quests đã hoàn thành nhưng chưa claim
    const quests = await query(
      `SELECT 
        cdq.id,
        cdq.quest_template_id,
        dqt.exp_reward,
        dqt.gold_reward,
        dqt.item_reward_id,
        dqt.name as quest_name,
        i.name as item_name
       FROM character_daily_quests cdq
       JOIN daily_quest_templates dqt ON cdq.quest_template_id = dqt.id
       LEFT JOIN items i ON dqt.item_reward_id = i.id
       WHERE cdq.character_id = $1 
         AND cdq.assigned_date = $2
         AND cdq.completed = TRUE
         AND cdq.claimed = FALSE`,
      [characterId, currentDate]
    );

    if (quests.rows.length === 0) {
      return { success: false, message: 'Không có quest nào để nhận thưởng!' };
    }

    let totalExp = 0;
    let totalGold = 0;
    const items: string[] = [];

    for (const quest of quests.rows) {
      totalExp += quest.exp_reward || 0;
      totalGold += quest.gold_reward || 0;

      if (quest.item_name) {
        items.push(quest.item_name);
      }

      // Add item to inventory
      if (quest.item_reward_id) {
        await query(
          `INSERT INTO character_items (character_id, item_id, quantity)
           VALUES ($1, $2, 1)
           ON CONFLICT (character_id, item_id)
           DO UPDATE SET quantity = character_items.quantity + 1`,
          [characterId, quest.item_reward_id]
        );
      }

      // Mark as claimed
      await query(
        'UPDATE character_daily_quests SET claimed = TRUE, claimed_at = $1 WHERE id = $2',
        [new Date(), quest.id]
      );
    }

    // Update character với tổng rewards
    await query(
      'UPDATE characters SET experience = experience + $1, gold = gold + $2 WHERE id = $3',
      [totalExp, totalGold, characterId]
    );

    return {
      success: true,
      message: `Đã nhận thưởng ${quests.rows.length} quest(s)!`,
      totalRewards: { exp: totalExp, gold: totalGold, items }
    };
  }
}
