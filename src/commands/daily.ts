import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../index';
import { validateCharacter } from '../middleware/validate';
import { createErrorEmbed } from '../utils/embeds';
import { DailyQuestService } from '../services/DailyQuestService';
import { createProgressBar, BOX } from '../utils/helpers';

export const dailyCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Xem nhiệm vụ hàng ngày (tự động nhận thưởng)') as SlashCommandBuilder,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const { character } = await validateCharacter(interaction);

      // Assign daily quests nếu chưa có
      await DailyQuestService.assignDailyQuests(character.id, character.level);

      // List daily quests
      const quests = await DailyQuestService.getCharacterDailyQuests(character.id);

      if (quests.length === 0) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Không có nhiệm vụ hàng ngày! Hãy thử lại sau.')]
        });
        return;
      }

      const completedCount = quests.filter(q => q.completed).length;
      const claimedCount = quests.filter(q => q.claimed).length;
      
      // Header với rounded corners (hunt style)
      let description = `${BOX.ROUNDED_TOP_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_TOP_RIGHT}\n`;
      description += `${BOX.VERTICAL} 📜 **NHIỆM VỤ HÀNG NGÀY**                ${BOX.VERTICAL}\n`;
      description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
      description += `${BOX.VERTICAL} ✅ Hoàn thành: **${completedCount}/${quests.length}** • Đã nhận: **${claimedCount}/${quests.length}**\n`;
      description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;

      // Quest list
      quests.forEach((quest, index) => {
        const progress = `${quest.progress}/${quest.required_amount}`;
        const progressBar = createProgressBar(quest.progress, quest.required_amount!, 15, false);
        
        let statusIcon = quest.claimed ? '✅' : (quest.completed ? '🎁' : '⏳');
        let statusText = quest.claimed ? 'Đã nhận' : (quest.completed ? 'Hoàn thành' : 'Đang làm');

        const rewards = [];
        if (quest.exp_reward && quest.exp_reward > 0) rewards.push(`⭐${quest.exp_reward}`);
        if (quest.gold_reward && quest.gold_reward > 0) rewards.push(`💰${quest.gold_reward}`);
        if (quest.item_name) rewards.push(`🎁${quest.item_name}`);

        description += `${BOX.VERTICAL} ${statusIcon} **${quest.name}**\n`;
        description += `${BOX.VERTICAL}    ${quest.description}\n`;
        description += `${BOX.VERTICAL}    ${progressBar} \`${progress}\` • ${statusText}\n`;
        description += `${BOX.VERTICAL}    Thưởng: ${rewards.join(' • ')}\n`;
        
        // Divider giữa các quests (trừ quest cuối)
        if (index < quests.length - 1) {
          description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
        }
      });

      description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_BOTTOM_RIGHT}`;

      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('📜 Daily Quests')
        .setDescription(description)
        .setFooter({ 
          text: `🔄 Reset: Midnight UTC+7 | ⚡ Quest hoàn thành tự động nhận thưởng khi săn quái!` 
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error: any) {
      console.error('[daily.ts] Error:', error);
      const errorMessage = error.message || '❌ Có lỗi xảy ra!';
      await interaction.editReply({ embeds: [createErrorEmbed(errorMessage)] });
    }
  },
};
