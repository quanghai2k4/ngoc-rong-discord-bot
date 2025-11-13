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

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(`⚔️ ${character.name}`)
      .setDescription(`Chủng tộc: **${race?.name}**`)
      .addFields(
        { name: '📊 Level', value: `**\`${character.level}\`**`, inline: true },
        { name: '✨ EXP', value: `**\`${character.experience}\`** / \`${expNeeded}\``, inline: true },
        { name: '💰 Vàng', value: `**\`${character.gold}\`**`, inline: true },
        { name: '❤️ HP', value: `**\`${character.hp}\`** / \`${character.max_hp}\``, inline: true },
        { name: '💙 KI', value: `**\`${character.ki}\`** / \`${character.max_ki}\``, inline: true },
        { name: '⚡ Speed', value: `**\`${character.speed}\`**`, inline: true },
        { name: '⚔️ Attack', value: `**\`${character.attack}\`**`, inline: true },
        { name: '🛡️ Defense', value: `**\`${character.defense}\`**`, inline: true },
        { name: '💥 Crit', value: `**\`${character.critical_chance}%\`** (x\`${character.critical_damage}\`)`, inline: true },
        { name: '💨 Dodge', value: `**\`${character.dodge_chance}%\`**`, inline: true },
        { name: '📍 Vị trí', value: `**${character.location}**`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `ID: ${character.id}` });

    await interaction.editReply({ embeds: [embed] });
  },
};
