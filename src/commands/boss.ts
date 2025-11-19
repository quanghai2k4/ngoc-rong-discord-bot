import { 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ButtonBuilder,
  ButtonStyle,
  ComponentType 
} from 'discord.js';
import { Command } from '../index';
import { CharacterService } from '../services/CharacterService';
import { BattleService } from '../services/BattleService';
import { pool } from '../database/db';
import { validateBattleReady } from '../middleware/validate';
import { createBossMenuEmbed, createErrorEmbed } from '../utils/embeds';
import { getRandomLocation } from '../config';
import { BOT_CONFIG } from '../config';
import {
  createBattleLiveEmbed,
  createBattleResultEmbedV2,
  getBattleStateFromRounds,
  extractBattleHighlights,
  calculateBattleStats
} from '../utils/bossBattleV2';
import { logger } from '../utils/logger';

const BOSS_BATTLE_CONFIG = {
  UPDATE_INTERVAL: 800, // ms giữa mỗi update
  FAST_FORWARD_INTERVAL: 100, // ms khi fast forward
  MAX_ROUNDS_BEFORE_AUTO_SKIP: 30, // Auto skip nếu quá 30 rounds
};

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

      // Defer update
      await confirmation.deferUpdate();
      
      // Random vị trí
      const newLocation = getRandomLocation();
      await CharacterService.updateLocation(character.id, newLocation);

      // Spawn boss với level ngẫu nhiên
      const bossLevel = Math.floor(
        Math.random() * (selectedBossData.max_level - selectedBossData.min_level + 1)
      ) + selectedBossData.min_level;

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
        min_level: selectedBossData.min_level,
        max_level: selectedBossData.max_level,
        location: newLocation,
        critical_chance: selectedBossData.critical_chance || 3,
        critical_damage: selectedBossData.critical_damage || 1.3,
        is_boss: true,
        is_super: false
      };

      // Thông báo bắt đầu
      const startEmbed = createErrorEmbed(
        `⚔️ **CHUẨN BỊ CHIẾN ĐẤU!**\n\n` +
        `📍 Vị trí: **${newLocation}**\n` +
        `👤 **${character.name}** (Lv.${character.level}) vs 👑 **${boss.name}** (Lv.${boss.level})\n\n` +
        `*Đang mô phỏng trận chiến...*`
      )
        .setTitle('👑 BOSS BATTLE')
        .setColor(0xFFD700);

      await interaction.editReply({ 
        embeds: [startEmbed], 
        components: [] 
      });

      // Run battle simulation
      const result = await BattleService.battle(character, [boss]);
      
      // Extract highlights và stats
      const highlights = extractBattleHighlights(result.rounds, character, boss);
      const stats = calculateBattleStats(result.rounds, character);

      // Determine if should animate or skip
      const shouldAnimate = result.rounds.length <= BOSS_BATTLE_CONFIG.MAX_ROUNDS_BEFORE_AUTO_SKIP;

      if (shouldAnimate) {
        // Animated battle display
        logger.info(`Boss battle animation: ${result.rounds.length} rounds`);

        // Create control buttons
        let paused = false;
        let fastForward = false;

        const buttons = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('pause')
              .setLabel('⏸️ Pause')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('fast_forward')
              .setLabel('⏩ Fast Forward')
              .setStyle(ButtonStyle.Primary)
          );

        const message = await interaction.editReply({
          embeds: [startEmbed],
          components: [buttons]
        });

        // Button collector
        const collector = message.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: result.rounds.length * BOSS_BATTLE_CONFIG.UPDATE_INTERVAL + 10000
        });

        collector.on('collect', async (i: any) => {
          if (i.user.id !== interaction.user.id) {
            await i.reply({ content: '❌ Chỉ người thách đấu mới có thể điều khiển!', ephemeral: true });
            return;
          }

          if (i.customId === 'pause') {
            paused = !paused;
            await i.update({
              components: [
                new ActionRowBuilder<ButtonBuilder>()
                  .addComponents(
                    new ButtonBuilder()
                      .setCustomId('pause')
                      .setLabel(paused ? '▶️ Resume' : '⏸️ Pause')
                      .setStyle(paused ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder()
                      .setCustomId('fast_forward')
                      .setLabel('⏩ Fast Forward')
                      .setStyle(ButtonStyle.Primary)
                      .setDisabled(paused)
                  )
              ]
            });
          } else if (i.customId === 'fast_forward') {
            fastForward = true;
            await i.update({ components: [] });
          }
        });

        // Animation loop
        for (let i = 0; i < result.rounds.length; i++) {
          // Wait while paused
          while (paused && !fastForward) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          if (fastForward) break; // Skip to result

          const state = getBattleStateFromRounds(result.rounds, i, character, boss);
          const liveEmbed = createBattleLiveEmbed(state, character, boss);

          try {
            await message.edit({ embeds: [liveEmbed] });
          } catch (error) {
            logger.error('Error updating battle embed', error);
            break;
          }

          const interval = fastForward 
            ? BOSS_BATTLE_CONFIG.FAST_FORWARD_INTERVAL 
            : BOSS_BATTLE_CONFIG.UPDATE_INTERVAL;

          await new Promise(resolve => setTimeout(resolve, interval));
        }

        collector.stop();
      } else {
        // Skip animation cho battles quá dài
        logger.info(`Boss battle auto-skipped: ${result.rounds.length} rounds (> ${BOSS_BATTLE_CONFIG.MAX_ROUNDS_BEFORE_AUTO_SKIP})`);
      }

      // Show final result
      const resultEmbed = createBattleResultEmbedV2(
        result,
        character,
        boss,
        highlights,
        stats
      );

      await interaction.editReply({
        embeds: [resultEmbed],
        components: []
      });

      logger.success(`Boss battle completed: ${character.name} vs ${boss.name} - ${result.won ? 'Won' : 'Lost'}`);

    } catch (error: any) {
      logger.error('[boss.ts] Boss battle error', error);
      
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
