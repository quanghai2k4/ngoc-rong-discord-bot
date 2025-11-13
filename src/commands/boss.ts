import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, ChannelType } from 'discord.js';
import { Command } from '../index';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';
import { BattleService } from '../services/BattleService';
import { pool } from '../database/db';

export const bossCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('boss')
    .setDescription('Thách đấu Boss để nhận phần thưởng lớn'),

  async execute(interaction) {
    await interaction.deferReply();

    const player = await PlayerService.findByDiscordId(interaction.user.id);
    if (!player) {
      await interaction.editReply('❌ Bạn chưa có nhân vật! Sử dụng `/start` để bắt đầu.');
      return;
    }

    const character = await CharacterService.findByPlayerId(player.id);
    if (!character) {
      await interaction.editReply('❌ Bạn chưa có nhân vật! Sử dụng `/start` để bắt đầu.');
      return;
    }

    if (character.hp <= 0) {
      await interaction.editReply('❌ Bạn đã hết HP! Hãy nghỉ ngơi để hồi phục. 💤');
      return;
    }

    // Lấy tất cả boss từ database
    const bossesResult = await pool.query(
      'SELECT id, name, min_level, max_level, hp, attack, defense, speed, experience_reward, gold_reward, critical_chance, critical_damage FROM monsters WHERE is_boss = true ORDER BY min_level'
    );
    const bosses = bossesResult.rows;

    if (bosses.length === 0) {
      await interaction.editReply('❌ Không có Boss nào trong hệ thống!');
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

    const menuEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('👑 CHỌN BOSS ĐỂ THÁCH ĐẤU')
      .setDescription(
        `**${character.name}** (Level ${character.level})\n` +
        `❤️ HP: ${character.hp}/${character.max_hp} • ⚔️ ATK: ${character.attack} • 🛡️ DEF: ${character.defense} • ⚡ SPD: ${character.speed}\n\n` +
        `*Chọn Boss từ menu bên dưới để bắt đầu trận chiến!*`
      )
      .setFooter({ text: 'Menu sẽ tự động hết hạn sau 60 giây' });

    const response = await interaction.editReply({ 
      embeds: [menuEmbed], 
      components: [row] 
    });

    // Đợi user chọn boss
    try {
      const confirmation = await response.awaitMessageComponent({ 
        componentType: ComponentType.StringSelect,
        time: 60000,
        filter: (i: any) => i.user.id === interaction.user.id
      });

      const selectedBossId = parseInt(confirmation.values[0]);
      const selectedBossData = bosses.find(b => b.id === selectedBossId);

      if (!selectedBossData) {
        await confirmation.deferUpdate();
        await interaction.editReply({ 
          content: '❌ Boss không tồn tại!', 
          embeds: [], 
          components: [] 
        });
        return;
      }

      // Defer update để tránh timeout
      await confirmation.deferUpdate();
      
      // Update reply để xóa menu
      await interaction.editReply({ 
        embeds: [new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('⚔️ CHUẨN BỊ CHIẾN ĐẤU!')
          .setDescription(`Đang tạo chiến trường cho trận đấu với **${selectedBossData.name}**...`)
        ], 
        components: [] 
      });

      // Random vị trí
      const newLocation = CharacterService.getRandomLocation();
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
        await interaction.editReply('❌ Không thể tạo thread trong kênh này!');
        return;
      }

      const thread = await interaction.channel.threads.create({
        name: `⚔️ Boss Fight: ${boss.name}`,
        autoArchiveDuration: 60,
        type: ChannelType.PublicThread,
        reason: `Boss fight giữa ${character.name} và ${boss.name}`
      });

      // Gửi thông báo vào thread
      const startEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('👑 THÁCH ĐẤU BOSS!')
        .setDescription(
          `📍 **${newLocation}** ✨\n\n` +
          `**${character.name}** thách đấu **👑 ${boss.name}**!`
        )
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
        // Actions
        let actionsText = '';
        if (round.actions && round.actions.length > 0) {
          for (const action of round.actions) {
            actionsText += `│ ${action}\n`;
          }
        } else {
          actionsText += `│ ${round.characterAction}\n`;
          for (const monAction of round.monsterActions) {
            actionsText += `│ ${monAction}\n`;
          }
        }

        // HP bars
        const charHpPerc = Math.max(0, Math.floor((round.characterHp / character.max_hp) * 5));
        const charHpBar = '█'.repeat(charHpPerc) + '░'.repeat(5 - charHpPerc);
        const charHpStatus = `│ ❤️ ${character.name}: ${charHpBar} \`${round.characterHp}/${character.max_hp}\``;
        
        const bossState = round.monsterStates[0];
        const bossHpPerc = Math.max(0, Math.floor((bossState.hp / bossState.maxHp) * 5));
        const bossHpBar = '█'.repeat(bossHpPerc) + '░'.repeat(5 - bossHpPerc);
        const status = bossState.hp === 0 ? '💀' : '👑';
        const bossHpStatus = `│ ${status} ${bossState.name}: ${bossHpBar} \`${bossState.hp}/${bossState.maxHp}\``;

        // Tạo embed cho từng hiệp với box drawing
        const roundEmbed = new EmbedBuilder()
          .setColor('#FFA500')
          .setDescription(
            `╭─ **Hiệp ${round.round}**\n` +
            actionsText +
            charHpStatus + `\n` +
            bossHpStatus + `\n` +
            `╰─────`
          );

        await thread.send({ embeds: [roundEmbed] });
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay giữa các hiệp
      }

      // Kết quả
      const resultEmbed = new EmbedBuilder()
        .setColor(result.won ? '#00FF00' : '#FF0000')
        .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
        .setDescription(
          result.won 
            ? `**${character.name}** đã đánh bại **${boss.name}**!` 
            : `**${character.name}** đã bị **${boss.name}** đánh bại!`
        )
        .setFooter({ text: `Tổng số hiệp: ${result.rounds.length}` });

      if (result.won) {
        resultEmbed.addFields({
          name: '🎁 Phần thưởng',
          value: `🎯 EXP: **\`+${result.expGained}\`** • 💰 Vàng: **\`+${result.goldGained}\`**`,
          inline: false
        });

        if (result.itemsDropped.length > 0) {
          let itemsList = '';
          for (const item of result.itemsDropped) {
            itemsList += `• **${item.name}**\n`;
          }
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
      if (result.won && result.leveledUp) {
        const levelUpEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('✨ LEVEL UP! ✨')
          .setDescription(`🎊 Chúc mừng! **${character.name}** đã lên **Level \`${result.newLevel}\`**!`)
          .addFields({
            name: '📈 Tăng chỉ số',
            value: '```diff\n+ HP & KI: +20\n+ ATK & DEF: +5\n+ SPD: +3\n```',
            inline: false
          })
          .setFooter({ text: 'HP và KI đã được hồi phục đầy!' });

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
      }, 10000);

      // Update original message
      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(result.won ? '#00FF00' : '#FF0000')
          .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
          .setDescription(
            `Trận đấu với **${boss.name}** đã kết thúc!\n\n` +
            `*Chi tiết trận đấu đã được ghi lại trong thread (sẽ tự động ẩn sau 10 giây)*`
          )
        ]
      });

    } catch (error: any) {
      if (error.message && error.message.includes('time')) {
        await interaction.editReply({ 
          content: '⏰ Đã hết thời gian chọn Boss!', 
          embeds: [], 
          components: [] 
        });
      } else {
        console.error('Lỗi trong boss command:', error);
        await interaction.editReply({ 
          content: '❌ Có lỗi xảy ra khi thách đấu Boss!', 
          embeds: [], 
          components: [] 
        });
      }
    }
  },
};
