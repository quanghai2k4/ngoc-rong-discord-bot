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
      await interaction.editReply('Bạn chưa có nhân vật! Sử dụng /start để bắt đầu.');
      return;
    }

    const character = await CharacterService.findByPlayerId(player.id);
    if (!character) {
      await interaction.editReply('Bạn chưa có nhân vật! Sử dụng /start để bắt đầu.');
      return;
    }

    if (character.hp <= 0) {
      await interaction.editReply('Bạn đã hết HP! Hãy nghỉ ngơi để hồi phục.');
      return;
    }

    // Find a monster based on character level
    const minLevel = Math.max(1, character.level - 2);
    const maxLevel = character.level + 3;
    const monster = await MonsterService.getRandomByLevel(minLevel, maxLevel);

    if (!monster) {
      await interaction.editReply('Không tìm thấy quái vật nào phù hợp với level của bạn!');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xFF4500)
      .setTitle('⚔️ Bắt đầu chiến đấu!')
      .setDescription(`Bạn gặp **${monster.name}** (Level ${monster.level})`)
      .addFields(
        { name: '❤️ HP', value: `${monster.hp}`, inline: true },
        { name: '⚔️ ATK', value: `${monster.attack}`, inline: true },
        { name: '🛡️ DEF', value: `${monster.defense}`, inline: true }
      )
      .setFooter({ text: '⏳ Đang chiến đấu...' });

    await interaction.editReply({ embeds: [embed] });

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
        battleLog += `**Hiệp ${round.round}:**\n`;
        battleLog += `${round.characterAction}\n`;
        battleLog += `${round.monsterAction}\n\n`;
      }

      const resultEmbed = new EmbedBuilder()
        .setColor(result.won ? 0x00FF00 : 0xFF0000)
        .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
        .setDescription(battleLog.substring(0, 4000) || 'Không có nhật ký chiến đấu.')
        .addFields(
          { name: '⚔️ Số hiệp', value: `${result.rounds.length}`, inline: true }
        )
        .setTimestamp();

      if (result.won) {
        resultEmbed.addFields(
          { name: '✨ EXP nhận được', value: `+${result.expGained}`, inline: true },
          { name: '💰 Vàng nhận được', value: `+${result.goldGained}`, inline: true }
        );

        if (result.itemsDropped.length > 0) {
          const items = result.itemsDropped.map(item => `• ${item.name}`).join('\n');
          resultEmbed.addFields({ 
            name: '🎁 Vật phẩm rơi', 
            value: items,
            inline: false 
          });
        }
      } else {
        resultEmbed.addFields(
          { name: '💔 Hậu quả', value: 'Bạn mất 10% vàng và HP còn 1', inline: false }
        );
      }

      await interaction.followUp({ embeds: [resultEmbed] });
    }, 2000);
  },
};
