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

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle(`🎒 Túi đồ của ${character.name}`)
      .setDescription(`💰 Vàng: **\`${character.gold}\`**`);

    if (items.rows.length === 0) {
      embed.addFields({
        name: '📦 Túi đồ',
        value: '*❌ Túi đồ trống!*',
        inline: false
      });
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const itemsByType = items.rows.reduce((acc: any, item: any) => {
      if (!acc[item.type_name]) {
        acc[item.type_name] = [];
      }
      acc[item.type_name].push(item);
      return acc;
    }, {});

    for (const [typeName, typeItems] of Object.entries(itemsByType)) {
      let itemText = '';
      (typeItems as any[]).forEach((item, idx, arr) => {
        const isLast = idx === arr.length - 1;
        const prefix = isLast ? '╰─' : '├─';
        itemText += `${prefix} ${item.equipped ? '✅' : '⬜'} **${item.name}** x\`${item.quantity}\`\n`;
        const stats = [];
        if (item.hp_bonus > 0) stats.push(`❤️ +${item.hp_bonus}`);
        if (item.ki_bonus > 0) stats.push(`💙 +${item.ki_bonus}`);
        if (item.attack_bonus > 0) stats.push(`⚔️ +${item.attack_bonus}`);
        if (item.defense_bonus > 0) stats.push(`🛡️ +${item.defense_bonus}`);
        if (item.speed_bonus > 0) stats.push(`⚡ +${item.speed_bonus}`);
        if (stats.length > 0) {
          itemText += `   ${stats.join(' • ')}\n`;
        }
      });
      
      embed.addFields({
        name: `📦 ${typeName}`,
        value: itemText,
        inline: false
      });
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
