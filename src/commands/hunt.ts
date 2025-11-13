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

    // Find a monster based on character level
    const minLevel = Math.max(1, character.level - 2);
    const maxLevel = character.level + 3;
    const monster = await MonsterService.getRandomByLevel(minLevel, maxLevel);

    if (!monster) {
      await interaction.editReply('❌ Không tìm thấy quái vật nào phù hợp với level của bạn!');
      return;
    }

    const startEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('⚔️ Bắt đầu chiến đấu!')
      .setDescription(`Bạn gặp **${monster.name}** (Level **\`${monster.level}\`**)`)
      .addFields({
        name: '📊 Thông tin quái vật',
        value: `❤️ HP: **\`${monster.hp}\`** • ⚔️ ATK: **\`${monster.attack}\`** • 🛡️ DEF: **\`${monster.defense}\`**`,
        inline: false
      })
      .setFooter({ text: '⏳ Đang chiến đấu...' });

    await interaction.editReply({ embeds: [startEmbed] });

    // Simulate battle
    setTimeout(async () => {
      const result = await BattleService.battle(character, monster);

      let battleLog = '';
      
      // Show only key rounds (first, last few, and when someone is low HP)
      const importantRounds = result.rounds.filter((round, index) => 
        index === 0 || 
        index >= result.rounds.length - 3 || 
        round.characterHp < character.max_hp * 0.3 ||
        round.monsterHp < monster.hp * 0.3
      );

      for (const round of importantRounds.slice(0, 5)) {
        battleLog += `╭─ **Hiệp ${round.round}**\n`;
        battleLog += `│ ${round.characterAction}\n`;
        battleLog += `│ ${round.monsterAction}\n`;
        
        // Progress bars cho HP của cả 2 bên
        const charHpPerc = Math.floor((round.characterHp / character.max_hp) * 5);
        const charHpBar = '█'.repeat(charHpPerc) + '░'.repeat(5 - charHpPerc);
        
        const monHpPerc = Math.floor((round.monsterHp / monster.hp) * 5);
        const monHpBar = '█'.repeat(monHpPerc) + '░'.repeat(5 - monHpPerc);
        
        battleLog += `╰─ ❤️ Bạn: ${charHpBar} \`${round.characterHp}\` | Quái: ${monHpBar} \`${round.monsterHp}\`\n\n`;
      }

      const resultEmbed = new EmbedBuilder()
        .setColor(result.won ? '#00FF00' : '#FF0000')
        .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
        .addFields({
          name: '⚔️ Diễn biến trận đấu',
          value: battleLog,
          inline: false
        })
        .setFooter({ text: `Số hiệp: ${result.rounds.length}` });

      if (result.won) {
        resultEmbed.addFields({
          name: '🎁 Phần thưởng',
          value: `🎯 EXP: **\`+${result.expGained}\`** • 💰 Vàng: **\`+${result.goldGained}\`**`,
          inline: false
        });

        if (result.leveledUp) {
          resultEmbed.addFields({
            name: '🎉 Level Up!',
            value: `Bạn đã lên Level **\`${result.newLevel}\`**`,
            inline: false
          });
        }

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

      await interaction.followUp({ embeds: [resultEmbed] });
    }, 2000);
  },
};
