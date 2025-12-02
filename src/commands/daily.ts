import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command } from '../index';
import { validateCharacter } from '../middleware/validate';
import { createErrorEmbed } from '../utils/embeds';
import { DailyQuestService } from '../services/DailyQuestService';

// Hàm tạo thanh tiến trình đẹp
function createProgressBar(current: number, total: number, size: number = 10): string {
  const progress = Math.round((current / total) * size);
  const empty = size - progress;
  const filledBar = '■'.repeat(progress);
  const emptyBar = '□'.repeat(empty);
  const percentage = Math.round((current / total) * 100);
  return `\`[${filledBar}${emptyBar}] ${percentage}%\``;
}

export const dailyCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Xem nhiệm vụ hàng ngày và nhận thưởng') as SlashCommandBuilder,

  async execute(interaction) {
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

      const completedCount = quests.filter(q => q.completed && !q.claimed).length;
      const totalCompleted = quests.filter(q => q.completed).length;
      
      // Tạo embed đẹp với giao diện mới
      const questEmbed = new EmbedBuilder()
        .setColor(0xFFA500) // Màu cam vàng
        .setTitle('📜 Daily Quests Board')
        .setAuthor({ 
          name: 'Quest System', 
          iconURL: 'https://cdn-icons-png.flaticon.com/512/2104/2104672.png' 
        })
        .setDescription(
          `Chào **${interaction.user.username}**, đây là nhiệm vụ hôm nay của bạn!\n` +
          `Hoàn thành để nhận phần thưởng hấp dẫn.\n\n` +
          `**📊 Tiến độ:** ${totalCompleted}/${quests.length} hoàn thành ${completedCount > 0 ? `• ${completedCount} chưa nhận` : ''}`
        )
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/3076/3076404.png')
        .setTimestamp()
        .setFooter({ 
          text: '🔄 Reset vào lúc 00:00 UTC+7 • Tự động nhận thưởng khi hoàn thành', 
          iconURL: 'https://cdn-icons-png.flaticon.com/512/2088/2088617.png' 
        });

      // Thêm từng quest vào embed
      quests.forEach(quest => {
        const progress = createProgressBar(quest.progress, quest.required_amount!, 10);
        
        // Xác định icon và status
        let icon = '⏳';
        let status = 'Đang làm';
        if (quest.claimed) {
          icon = '✅';
          status = 'Đã nhận';
        } else if (quest.completed) {
          icon = '🎁';
          status = 'Hoàn thành - Chưa nhận';
        }

        // Tạo reward string
        const rewards = [];
        if (quest.exp_reward && quest.exp_reward > 0) rewards.push(`\`${quest.exp_reward} EXP\``);
        if (quest.gold_reward && quest.gold_reward > 0) rewards.push(`\`${quest.gold_reward} Gold\``);
        if (quest.item_name) rewards.push(`\`${quest.item_name}\``);

        // Emoji theo loại quest
        let questIcon = '⚔️';
        if (quest.quest_type?.includes('skill')) questIcon = '✨';
        else if (quest.quest_type?.includes('boss')) questIcon = '👹';
        else if (quest.quest_type?.includes('gold')) questIcon = '💰';
        else if (quest.quest_type?.includes('hunt')) questIcon = '🎯';

        questEmbed.addFields({
          name: `${icon} ${questIcon} ${quest.name}`,
          value: 
            `${progress}\n` +
            `> ${quest.description}\n` +
            `> **Tiến độ:** ${quest.progress}/${quest.required_amount} • **${status}**\n` +
            `**🎁 Phần thưởng:** ${rewards.join(' • ')}`,
          inline: false
        });
      });

      // Tạo buttons
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('daily_refresh')
            .setLabel('Cập nhật')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔄'),
          new ButtonBuilder()
            .setCustomId('daily_claim_all')
            .setLabel(`Nhận tất cả (${completedCount})`)
            .setStyle(ButtonStyle.Success)
            .setEmoji('🎁')
            .setDisabled(completedCount === 0)
        );

      await interaction.editReply({ 
        embeds: [questEmbed], 
        components: [row] 
      });

      // Handle button interactions
      const collector = interaction.channel?.createMessageComponentCollector({
        filter: (i: any) => i.user.id === interaction.user.id,
        time: 60000 // 1 minute
      });

      collector?.on('collect', async (i: any) => {
        if (i.customId === 'daily_refresh') {
          await i.deferUpdate();
          // Re-execute command to refresh
          const updatedQuests = await DailyQuestService.getCharacterDailyQuests(character.id);
          const updatedCompletedCount = updatedQuests.filter(q => q.completed && !q.claimed).length;
          const updatedTotalCompleted = updatedQuests.filter(q => q.completed).length;
          
          questEmbed.setDescription(
            `Chào **${interaction.user.username}**, đây là nhiệm vụ hôm nay của bạn!\n` +
            `Hoàn thành để nhận phần thưởng hấp dẫn.\n\n` +
            `**📊 Tiến độ:** ${updatedTotalCompleted}/${updatedQuests.length} hoàn thành ${updatedCompletedCount > 0 ? `• ${updatedCompletedCount} chưa nhận` : ''}`
          );
          
          questEmbed.setFields([]);
          updatedQuests.forEach(quest => {
            const progress = createProgressBar(quest.progress, quest.required_amount!, 10);
            
            let icon = '⏳';
            let status = 'Đang làm';
            if (quest.claimed) {
              icon = '✅';
              status = 'Đã nhận';
            } else if (quest.completed) {
              icon = '🎁';
              status = 'Hoàn thành - Chưa nhận';
            }

            const rewards = [];
            if (quest.exp_reward && quest.exp_reward > 0) rewards.push(`\`${quest.exp_reward} EXP\``);
            if (quest.gold_reward && quest.gold_reward > 0) rewards.push(`\`${quest.gold_reward} Gold\``);
            if (quest.item_name) rewards.push(`\`${quest.item_name}\``);

            let questIcon = '⚔️';
            if (quest.quest_type?.includes('skill')) questIcon = '✨';
            else if (quest.quest_type?.includes('boss')) questIcon = '👹';
            else if (quest.quest_type?.includes('gold')) questIcon = '💰';
            else if (quest.quest_type?.includes('hunt')) questIcon = '🎯';

            questEmbed.addFields({
              name: `${icon} ${questIcon} ${quest.name}`,
              value: 
                `${progress}\n` +
                `> ${quest.description}\n` +
                `> **Tiến độ:** ${quest.progress}/${quest.required_amount} • **${status}**\n` +
                `**🎁 Phần thưởng:** ${rewards.join(' • ')}`,
              inline: false
            });
          });

          row.components[1].setDisabled(updatedCompletedCount === 0);
          row.components[1].setLabel(`Nhận tất cả (${updatedCompletedCount})`);
          
          await i.editReply({ embeds: [questEmbed], components: [row] });
        } else if (i.customId === 'daily_claim_all') {
          await i.deferUpdate();
          
          // Claim all completed quests
          const claimResults = await DailyQuestService.claimAllCompletedQuests(character.id);
          
          if (claimResults.totalClaimed === 0) {
            await i.followUp({ 
              content: '❌ Không có nhiệm vụ nào để nhận thưởng!', 
              ephemeral: true 
            });
            return;
          }

          // Create reward summary
          const rewardEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🎁 Nhận thưởng thành công!')
            .setDescription(
              `Bạn đã nhận thưởng từ **${claimResults.totalClaimed}** nhiệm vụ!\n\n` +
              `**📊 Tổng phần thưởng:**\n` +
              `⭐ **${claimResults.totalExp} EXP**\n` +
              `💰 **${claimResults.totalGold} Gold**\n` +
              (claimResults.itemsReceived.length > 0 
                ? `🎁 **Items:** ${claimResults.itemsReceived.join(', ')}\n` 
                : '')
            )
            .setTimestamp();

          await i.followUp({ embeds: [rewardEmbed], ephemeral: true });

          // Refresh the quest display
          const updatedQuests = await DailyQuestService.getCharacterDailyQuests(character.id);
          const updatedCompletedCount = updatedQuests.filter(q => q.completed && !q.claimed).length;
          const updatedTotalCompleted = updatedQuests.filter(q => q.completed).length;
          
          questEmbed.setDescription(
            `Chào **${interaction.user.username}**, đây là nhiệm vụ hôm nay của bạn!\n` +
            `Hoàn thành để nhận phần thưởng hấp dẫn.\n\n` +
            `**📊 Tiến độ:** ${updatedTotalCompleted}/${updatedQuests.length} hoàn thành ${updatedCompletedCount > 0 ? `• ${updatedCompletedCount} chưa nhận` : ''}`
          );
          
          questEmbed.setFields([]);
          updatedQuests.forEach(quest => {
            const progress = createProgressBar(quest.progress, quest.required_amount!, 10);
            
            let icon = '⏳';
            let status = 'Đang làm';
            if (quest.claimed) {
              icon = '✅';
              status = 'Đã nhận';
            } else if (quest.completed) {
              icon = '🎁';
              status = 'Hoàn thành - Chưa nhận';
            }

            const rewards = [];
            if (quest.exp_reward && quest.exp_reward > 0) rewards.push(`\`${quest.exp_reward} EXP\``);
            if (quest.gold_reward && quest.gold_reward > 0) rewards.push(`\`${quest.gold_reward} Gold\``);
            if (quest.item_name) rewards.push(`\`${quest.item_name}\``);

            let questIcon = '⚔️';
            if (quest.quest_type?.includes('skill')) questIcon = '✨';
            else if (quest.quest_type?.includes('boss')) questIcon = '👹';
            else if (quest.quest_type?.includes('gold')) questIcon = '💰';
            else if (quest.quest_type?.includes('hunt')) questIcon = '🎯';

            questEmbed.addFields({
              name: `${icon} ${questIcon} ${quest.name}`,
              value: 
                `${progress}\n` +
                `> ${quest.description}\n` +
                `> **Tiến độ:** ${quest.progress}/${quest.required_amount} • **${status}**\n` +
                `**🎁 Phần thưởng:** ${rewards.join(' • ')}`,
              inline: false
            });
          });

          row.components[1].setDisabled(updatedCompletedCount === 0);
          row.components[1].setLabel(`Nhận tất cả (${updatedCompletedCount})`);
          
          await i.editReply({ embeds: [questEmbed], components: [row] });
        }
      });

      collector?.on('end', () => {
        row.components.forEach(button => button.setDisabled(true));
        interaction.editReply({ components: [row] }).catch(() => {});
      });

    } catch (error: any) {
      console.error('[daily.ts] Error:', error);
      const errorMessage = error.message || '❌ Có lỗi xảy ra!';
      await interaction.editReply({ embeds: [createErrorEmbed(errorMessage)] });
    }
  },
};
