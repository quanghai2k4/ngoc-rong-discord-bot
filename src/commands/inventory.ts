import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../index';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';
import { query } from '../database/db';

export const inventoryCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Xem túi đồ của bạn'),

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

    const items = await query(
      `SELECT i.*, ci.quantity, ci.equipped, it.name as type_name
       FROM character_items ci
       JOIN items i ON ci.item_id = i.id
       JOIN item_types it ON i.item_type_id = it.id
       WHERE ci.character_id = $1
       ORDER BY it.id, i.name`,
      [character.id]
    );

    if (items.rows.length === 0) {
      const emptyEmbed = new EmbedBuilder()
        .setColor(0x808080)
        .setTitle(`🎒 Túi đồ của ${character.name}`)
        .addFields({ name: '💰 Vàng', value: `**\`${character.gold}\`**`, inline: false })
        .setDescription('*❌ Túi đồ trống!*')
        .setTimestamp();

      await interaction.editReply({ embeds: [emptyEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x9370DB)
      .setTitle(`🎒 Túi đồ của ${character.name}`)
      .addFields({ name: '💰 Vàng', value: `**\`${character.gold}\`**`, inline: false });

    const itemsByType = items.rows.reduce((acc: any, item: any) => {
      if (!acc[item.type_name]) {
        acc[item.type_name] = [];
      }
      acc[item.type_name].push(item);
      return acc;
    }, {});

    for (const [typeName, typeItems] of Object.entries(itemsByType)) {
      const itemList = (typeItems as any[]).map(item => {
        let info = `${item.equipped ? '✅' : '⬜'} **${item.name}** x\`${item.quantity}\``;
        const stats = [];
        if (item.hp_bonus > 0) stats.push(`HP+${item.hp_bonus}`);
        if (item.ki_bonus > 0) stats.push(`KI+${item.ki_bonus}`);
        if (item.attack_bonus > 0) stats.push(`ATK+${item.attack_bonus}`);
        if (item.defense_bonus > 0) stats.push(`DEF+${item.defense_bonus}`);
        if (item.speed_bonus > 0) stats.push(`SPD+${item.speed_bonus}`);
        if (stats.length > 0) {
          info += ` *(${stats.join(', ')})*`;
        }
        return info;
      }).join('\n');

      embed.addFields({
        name: `📦 ${typeName}`,
        value: itemList || '*Trống*',
        inline: false,
      });
    }

    embed.setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
