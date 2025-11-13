import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../index';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';

export const profileCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Xem thông tin nhân vật của bạn'),

  async execute(interaction) {
    await interaction.deferReply();

    const player = await PlayerService.findByDiscordId(interaction.user.id);

    if (!player) {
      await interaction.editReply({
        content: '❌ Bạn chưa có nhân vật! Sử dụng `/start` để bắt đầu.',
      });
      return;
    }

    const character = await CharacterService.findByPlayerId(player.id);

    if (!character) {
      await interaction.editReply({
        content: '❌ Bạn chưa có nhân vật! Sử dụng `/start` để bắt đầu.',
      });
      return;
    }

    const race = await CharacterService.getRaceById(character.race_id);
    const expNeeded = 100 + (character.level - 1) * 50;

    // Tính progress bars
    const hpPercentage = Math.floor((character.hp / character.max_hp) * 10);
    const hpBar = '█'.repeat(hpPercentage) + '░'.repeat(10 - hpPercentage);
    
    const kiPercentage = Math.floor((character.ki / character.max_ki) * 10);
    const kiBar = '█'.repeat(kiPercentage) + '░'.repeat(10 - kiPercentage);
    
    const expPercentage = Math.floor((character.experience / expNeeded) * 10);
    const expBar = '█'.repeat(expPercentage) + '░'.repeat(10 - expPercentage);

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(`⚔️ ${character.name}`)
      .setDescription(
        `**${race?.name}** • Level **${character.level}** • 💰 **${character.gold}** vàng\n` +
        `╰─ 📍 ${character.location}`
      )
      .addFields(
        {
          name: '❤️ HP',
          value: `\`${character.hp}\`/\`${character.max_hp}\` ${hpBar}`,
          inline: false
        },
        {
          name: '💙 KI',
          value: `\`${character.ki}\`/\`${character.max_ki}\` ${kiBar}`,
          inline: false
        },
        {
          name: '✨ EXP',
          value: `\`${character.experience}\`/\`${expNeeded}\` ${expBar}`,
          inline: false
        },
        {
          name: '⚔️ Combat Stats',
          value: 
            `╭─ ⚔️ ATK: **${character.attack}** • 🛡️ DEF: **${character.defense}**\n` +
            `├─ ⚡ SPD: **${character.speed}**\n` +
            `├─ 💥 Crit: **${character.critical_chance}%** (x**${character.critical_damage}**)\n` +
            `╰─ 💨 Dodge: **${character.dodge_chance}%**`,
          inline: false
        }
      )
      .setTimestamp()
      .setFooter({ text: `ID: ${character.id}` });

    await interaction.editReply({ embeds: [embed] });
  },
};
