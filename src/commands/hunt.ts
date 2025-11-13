import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../index';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';
import { MonsterService } from '../services/MonsterService';
import { BattleService } from '../services/BattleService';

export const huntCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('hunt')
    .setDescription('Đi săn quái vật để kiếm kinh nghiệm và vàng'),

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

    // Random vị trí mới mỗi lần hunt
    const newLocation = CharacterService.getRandomLocation();
    await CharacterService.updateLocation(character.id, newLocation);
    
    // Hunt command chỉ spawn quái thường (không phải boss)
    const monsters = await MonsterService.spawnMonsters(character.level, false);

    if (monsters.length === 0) {
      await interaction.editReply('❌ Không tìm thấy quái vật nào phù hợp với level của bạn!');
      return;
    }

    // Build start message
    const startEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('⚔️ Bắt đầu chiến đấu!')
      .setDescription(
        `📍 **${newLocation}**\n\n` +
        (monsters.length === 1
          ? `Bạn gặp **${monsters[0].name}** (Level **\`${monsters[0].level}\`**)${monsters[0].is_super ? ' ⭐' : ''}`
          : `⚠️ Bạn bị bao vây bởi **${monsters.length} quái vật**!`)
      );

    // Thêm thông tin từng quái
    for (let i = 0; i < monsters.length; i++) {
      const monster = monsters[i];
      startEmbed.addFields({
        name: `${i + 1}. ${monster.name} (Lv.${monster.level})`,
        value: `❤️ HP: **\`${monster.hp}\`** • ⚔️ ATK: **\`${monster.attack}\`** • 🛡️ DEF: **\`${monster.defense}\`**`,
        inline: false
      });
    }

    startEmbed.setFooter({ text: '⏳ Đang chiến đấu...' });

    await interaction.editReply({ embeds: [startEmbed] });

    // Simulate battle
    setTimeout(async () => {
      const result = await BattleService.battle(character, monsters);

      // Kiểm tra xem có boss hoặc super monster không
      const hasBoss = monsters.some(m => m.is_boss || m.is_super);

      const resultEmbed = new EmbedBuilder()
        .setColor(result.won ? '#00FF00' : '#FF0000')
        .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!');

      // Chỉ hiển thị chi tiết hiệp đấu nếu có boss/super monster
      if (hasBoss) {
        let battleLog = '';
        
        // Show only key rounds
        const importantRounds = result.rounds.filter((round, index) => 
          index === 0 || 
          index >= result.rounds.length - 3 || 
          round.characterHp < character.max_hp * 0.3 ||
          round.monsterStates.some(m => m.hp < m.maxHp * 0.3 && m.hp > 0)
        );

        for (const round of importantRounds.slice(0, 5)) {
          battleLog += `╭─ **Hiệp ${round.round}**\n`;
          
          console.log(`[hunt.ts] Round ${round.round} - has actions:`, !!round.actions, 'length:', round.actions?.length);
          
          // Hiển thị actions theo thứ tự thực tế (turn order)
          // Fallback to old format if actions array doesn't exist
          if (round.actions && round.actions.length > 0) {
            console.log(`[hunt.ts] Round ${round.round} - using actions array`);
            for (const action of round.actions) {
              battleLog += `│ ${action}\n`;
            }
          } else {
            console.log(`[hunt.ts] Round ${round.round} - using fallback`);
            // Fallback: hiển thị theo cách cũ
            battleLog += `│ ${round.characterAction}\n`;
            for (const monAction of round.monsterActions) {
              battleLog += `│ ${monAction}\n`;
            }
          }
          
          // HP bars
          const charHpPerc = Math.max(0, Math.floor((round.characterHp / character.max_hp) * 5));
          const charHpBar = '█'.repeat(charHpPerc) + '░'.repeat(5 - charHpPerc);
          battleLog += `│ ❤️ Bạn: ${charHpBar} \`${round.characterHp}/${character.max_hp}\`\n`;
          
          // Monster HP bars
          for (const monState of round.monsterStates) {
            const monHpPerc = Math.max(0, Math.floor((monState.hp / monState.maxHp) * 5));
            const monHpBar = '█'.repeat(monHpPerc) + '░'.repeat(5 - monHpPerc);
            const status = monState.hp === 0 ? '💀' : '🔥';
            battleLog += `│ ${status} ${monState.name}: ${monHpBar} \`${monState.hp}/${monState.maxHp}\`\n`;
          }
          
          battleLog += `╰─────\n\n`;
        }

        if (importantRounds.length < result.rounds.length) {
          battleLog += `*...và ${result.rounds.length - importantRounds.length} hiệp khác*\n\n`;
        }

        resultEmbed.addFields({
          name: '⚔️ Diễn biến trận đấu',
          value: battleLog,
          inline: false
        });
        resultEmbed.setFooter({ text: `Số hiệp: ${result.rounds.length} | Quái hạ: ${result.monstersDefeated}/${monsters.length}` });
      } else {
        // Quái thường: Chỉ hiển thị tổng kết
        let summary = '';
        if (result.won) {
          // Liệt kê quái đã hạ
          const monsterNames = monsters.map(m => m.name).join(', ');
          summary = `⚔️ Bạn đã **kết liễu** ${monsters.length > 1 ? `**${monsters.length} quái**: ` : ''}**${monsterNames}**!\n\n`;
          summary += `⏱️ Chiến đấu kết thúc sau **${result.rounds.length}** hiệp`;
        } else {
          summary = `💀 Bạn đã bị đánh bại sau **${result.rounds.length}** hiệp chiến đấu`;
        }
        
        resultEmbed.setDescription(summary);
      }

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
          value: '*Bạn mất 10% vàng*',
          inline: false
        });
      }

      await interaction.editReply({ embeds: [resultEmbed] });

      // Gửi tin nhắn level up riêng nếu có
      if (result.won && result.leveledUp) {
        const levelUpEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('✨ LEVEL UP! ✨')
          .setDescription(`🎊 Chúc mừng! Bạn đã lên **Level \`${result.newLevel}\`**!`)
          .addFields({
            name: '📈 Tăng chỉ số',
            value: '```diff\n+ HP & KI: +20\n+ ATK & DEF: +5\n+ SPD: +3\n```',
            inline: false
          })
          .setFooter({ text: 'HP và KI đã được hồi phục đầy!' })
          .setTimestamp();

        await interaction.followUp({ embeds: [levelUpEmbed] });
      }
    }, 2000);
  },
};
