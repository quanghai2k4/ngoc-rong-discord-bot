import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../index';
import { CharacterService } from '../services/CharacterService';
import { MonsterService } from '../services/MonsterService';
import { BattleService } from '../services/BattleService';
import { validateBattleReady } from '../middleware/validate';
import { createBattleStartEmbed, createBattleResultEmbed, createLevelUpEmbed, createErrorEmbed, createQuestRewardsEmbed } from '../utils/embeds';
import { createBattleLog, createHuntSummary } from '../utils/battleDisplay';
import { getRandomLocation } from '../config';

export const huntCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('hunt')
    .setDescription('Đi săn quái vật để kiếm kinh nghiệm và vàng'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      // Validate character và HP
      const { character } = await validateBattleReady(interaction);

      // Random vị trí mới mỗi lần hunt
      const newLocation = getRandomLocation();
      await CharacterService.updateLocation(character.id, newLocation);
      
      // Hunt command chỉ spawn quái thường (không phải boss)
      const monsters = await MonsterService.spawnMonsters(character.level, false);

      if (monsters.length === 0) {
        await interaction.editReply({ embeds: [createErrorEmbed('❌ Không tìm thấy quái vật nào phù hợp với level của bạn!')] });
        return;
      }

      // Hiển thị battle start
      const startEmbed = createBattleStartEmbed(newLocation, monsters);
      await interaction.editReply({ embeds: [startEmbed] });

      // Simulate battle
      setTimeout(async () => {
        try {
          const result = await BattleService.battle(character, monsters);

          // Tạo battle log và summary
          const hasBoss = monsters.some(m => m.is_boss || m.is_super);
          const battleLog = createBattleLog(result.rounds, character, monsters);
          
          // Nếu là quái thường, thêm summary vào description
          let summaryDescription = '';
          if (!hasBoss) {
            // Lấy HP cuối cùng từ round cuối
            const finalRound = result.rounds[result.rounds.length - 1];
            summaryDescription = createHuntSummary(
              result.won, 
              monsters, 
              result.rounds.length,
              finalRound?.characterHp,
              character.max_hp,
              finalRound?.monsterStates
            );
          }

          // Tạo result embed
          const resultEmbed = createBattleResultEmbed(
            result.won,
            battleLog,
            result.expGained,
            result.goldGained,
            result.itemsDropped,
            result.rounds.length,
            result.monstersDefeated,
            monsters.length
          );

          // Thêm summary cho quái thường
          if (summaryDescription) {
            resultEmbed.setDescription(summaryDescription);
          }

          await interaction.editReply({ embeds: [resultEmbed] });

          // Gửi quest rewards riêng nếu có
          if (result.won && result.questRewards.length > 0) {
            const questRewardsEmbed = createQuestRewardsEmbed(result.questRewards);
            await interaction.followUp({ embeds: [questRewardsEmbed] });
          }

          // Gửi tin nhắn level up riêng nếu có
          if (result.won && result.leveledUp && result.newLevel) {
            const levelUpEmbed = createLevelUpEmbed(result.newLevel);
            await interaction.followUp({ embeds: [levelUpEmbed] });
          }
        } catch (error) {
          console.error('[hunt.ts] Battle error:', error);
          await interaction.editReply({ 
            embeds: [createErrorEmbed('❌ Có lỗi xảy ra trong trận chiến!')] 
          });
        }
      }, 2000);
    } catch (error: any) {
      console.error('[hunt.ts] Error:', error);
      const errorMessage = error.message || '❌ Có lỗi xảy ra!';
      await interaction.editReply({ embeds: [createErrorEmbed(errorMessage)] });
    }
  },
};
