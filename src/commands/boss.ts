import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, ChannelType } from 'discord.js';
import { Command } from '../index';
import { CharacterService } from '../services/CharacterService';
import { BattleService } from '../services/BattleService';
import { pool } from '../database/db';
import { validateBattleReady } from '../middleware/validate';
import { createBossMenuEmbed, createErrorEmbed, createLevelUpEmbed } from '../utils/embeds';
import { formatBattleRound } from '../utils/battleDisplay';
import { getRandomLocation } from '../config';
import { BOT_CONFIG } from '../config';

export const bossCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('boss')
    .setDescription('Thách đấu Boss để nhận phần thưởng lớn'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      // Validate character và HP
      const { character } = await validateBattleReady(interaction);

      // Lấy tất cả boss từ database
      const bossesResult = await pool.query(
        'SELECT id, name, min_level, max_level, hp, attack, defense, speed, experience_reward, gold_reward, critical_chance, critical_damage FROM monsters WHERE is_boss = true ORDER BY min_level'
      );
      const bosses = bossesResult.rows;

      if (bosses.length === 0) {
        await interaction.editReply({ embeds: [createErrorEmbed('❌ Không có Boss nào trong hệ thống!')] });
        return;
      }

      // Tạo select menu với tất cả boss
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('boss_select')
        .setPlaceholder('👑 Chọn Boss để thách đấu...')
        .addOptions(
          bosses.map(boss => ({
            label: `${boss.name} (Lv.${boss.min_level}-${boss.max_level})`,
            description: `HP: ${boss.hp} • ATK: ${boss.attack} • DEF: ${boss.defense} • SPD: ${boss.speed}`,
            value: boss.id.toString()
          }))
        );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
      const menuEmbed = createBossMenuEmbed(character);

      const response = await interaction.editReply({ 
        embeds: [menuEmbed], 
        components: [row] 
      });

      // Đợi user chọn boss
      const confirmation = await response.awaitMessageComponent({ 
        componentType: ComponentType.StringSelect,
        time: BOT_CONFIG.COMMAND_TIMEOUT,
        filter: (i: any) => i.user.id === interaction.user.id
      });

      const selectedBossId = parseInt(confirmation.values[0]);
      const selectedBossData = bosses.find(b => b.id === selectedBossId);

      if (!selectedBossData) {
        await confirmation.deferUpdate();
        await interaction.editReply({ 
          embeds: [createErrorEmbed('❌ Boss không tồn tại!')], 
          components: [] 
        });
        return;
      }

      // Defer update để tránh timeout
      await confirmation.deferUpdate();
      
      // Update reply để xóa menu
      await interaction.editReply({ 
        embeds: [createErrorEmbed(`⚔️ CHUẨN BỊ CHIẾN ĐẤU!\n\nĐang tạo chiến trường cho trận đấu với **${selectedBossData.name}**...`)], 
        components: [] 
      });

      // Random vị trí
      const newLocation = getRandomLocation();
      await CharacterService.updateLocation(character.id, newLocation);

      // Spawn boss đã chọn với level ngẫu nhiên trong range
      const bossLevel = Math.floor(Math.random() * (selectedBossData.max_level - selectedBossData.min_level + 1)) + selectedBossData.min_level;
      const boss = {
        id: selectedBossData.id,
        name: selectedBossData.name,
        level: bossLevel,
        hp: selectedBossData.hp + (bossLevel - selectedBossData.min_level) * 50,
        maxHp: selectedBossData.hp + (bossLevel - selectedBossData.min_level) * 50,
        attack: selectedBossData.attack + (bossLevel - selectedBossData.min_level) * 5,
        defense: selectedBossData.defense + (bossLevel - selectedBossData.min_level) * 4,
        speed: selectedBossData.speed + (bossLevel - selectedBossData.min_level) * 2,
        experience_reward: selectedBossData.experience_reward || 100,
        gold_reward: selectedBossData.gold_reward || 200,
        location: newLocation,
        critical_chance: selectedBossData.critical_chance || 3,
        critical_damage: selectedBossData.critical_damage || 1.3,
        is_boss: true,
        is_super: false
      };

      // Tạo thread cho boss fight
      if (!interaction.channel || !('threads' in interaction.channel)) {
        await interaction.editReply({ embeds: [createErrorEmbed('❌ Không thể tạo thread trong kênh này!')] });
        return;
      }

      const thread = await interaction.channel.threads.create({
        name: `⚔️ Boss Fight: ${boss.name}`,
        autoArchiveDuration: 60,
        type: ChannelType.PublicThread,
        reason: `Boss fight giữa ${character.name} và ${boss.name}`
      });

      // Gửi thông báo vào thread
      const startEmbed = createErrorEmbed(
        `📍 **${newLocation}** ✨\n\n**${character.name}** thách đấu **👑 ${boss.name}**!`
      )
        .setTitle('👑 THÁCH ĐẤU BOSS!')
        .setColor('#FFD700')
        .addFields(
          {
            name: `👤 ${character.name} (Lv.${character.level})`,
            value: `❤️ HP: \`${character.hp}\` • ⚔️ ATK: \`${character.attack}\` • 🛡️ DEF: \`${character.defense}\` • ⚡ SPD: \`${character.speed}\``,
            inline: false
          },
          {
            name: `👑 ${boss.name} (Lv.${boss.level})`,
            value: `❤️ HP: \`${boss.hp}\` • ⚔️ ATK: \`${boss.attack}\` • 🛡️ DEF: \`${boss.defense}\` • ⚡ SPD: \`${boss.speed}\``,
            inline: false
          }
        )
        .setFooter({ text: '⚔️ Trận chiến bắt đầu!' });

      await thread.send({ embeds: [startEmbed] });

      // Battle
      const result = await BattleService.battle(character, [boss]);

      // Gửi từng hiệp vào thread
      for (const round of result.rounds) {
        const roundText = formatBattleRound(round, character);
        const roundEmbed = createErrorEmbed(roundText).setColor('#FFA500');
        await thread.send({ embeds: [roundEmbed] });
        await new Promise(resolve => setTimeout(resolve, BOT_CONFIG.ROUND_DELAY));
      }

      // Kết quả
      const resultEmbed = createErrorEmbed(
        result.won 
          ? `**${character.name}** đã đánh bại **${boss.name}**!` 
          : `**${character.name}** đã bị **${boss.name}** đánh bại!`
      )
        .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
        .setColor(result.won ? '#00FF00' : '#FF0000')
        .setFooter({ text: `Tổng số hiệp: ${result.rounds.length}` });

      if (result.won) {
        resultEmbed.addFields({
          name: '🎁 Phần thưởng',
          value: `🎯 EXP: **\`+${result.expGained}\`** • 💰 Vàng: **\`+${result.goldGained}\`**`,
          inline: false
        });

        if (result.itemsDropped.length > 0) {
          const itemsList = result.itemsDropped.map(item => `• **${item.name}**`).join('\n');
          resultEmbed.addFields({
            name: '📦 Vật phẩm rơi',
            value: itemsList,
            inline: false
          });
        }
      } else {
        resultEmbed.addFields({
          name: '💔 Hậu quả',
          value: '*Bạn mất 10% vàng và HP còn 1*',
          inline: false
        });
      }

      await thread.send({ embeds: [resultEmbed] });

      // Level up trong thread nếu có
      if (result.won && result.leveledUp && result.newLevel) {
        const levelUpEmbed = createLevelUpEmbed(result.newLevel, character.name);
        await thread.send({ embeds: [levelUpEmbed] });
      }

      // Archive và lock thread sau 10 giây
      setTimeout(async () => {
        try {
          await thread.setArchived(true);
          await thread.setLocked(true);
        } catch (error) {
          console.error('Lỗi khi archive thread:', error);
        }
      }, BOT_CONFIG.BOSS_THREAD_ARCHIVE_DELAY);

      // Update original message
      await interaction.editReply({
        embeds: [createErrorEmbed(
          `Trận đấu với **${boss.name}** đã kết thúc!\n\n` +
          `*Chi tiết trận đấu đã được ghi lại trong thread (sẽ tự động ẩn sau 10 giây)*`
        )
          .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
          .setColor(result.won ? '#00FF00' : '#FF0000')
        ]
      });

    } catch (error: any) {
      console.error('[boss.ts] Error:', error);
      
      if (error.message && error.message.includes('time')) {
        await interaction.editReply({ 
          embeds: [createErrorEmbed('⏰ Đã hết thời gian chọn Boss!')], 
          components: [] 
        });
      } else {
        const errorMessage = error.message || '❌ Có lỗi xảy ra khi thách đấu Boss!';
        await interaction.editReply({ 
          embeds: [createErrorEmbed(errorMessage)], 
          components: [] 
        });
      }
    }
  },
};
