import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../index';
import { CharacterService } from '../services/CharacterService';
import { query } from '../database/db';
import { validateCharacter } from '../middleware/validate';
import { createInventoryEmbed, createErrorEmbed } from '../utils/embeds';

export const inventoryCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Xem túi đồ của bạn'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const { character } = await validateCharacter(interaction);

      const items = await query(
        `SELECT i.*, ci.quantity, ci.equipped, it.name as type_name
         FROM character_items ci
         JOIN items i ON ci.item_id = i.id
         JOIN item_types it ON i.item_type_id = it.id
         WHERE ci.character_id = $1
         ORDER BY it.id, i.name`,
        [character.id]
      );

      const inventoryEmbed = createInventoryEmbed(character, items.rows);
      await interaction.editReply({ embeds: [inventoryEmbed] });
    } catch (error: any) {
      console.error('[inventory.ts] Error:', error);
      const errorMessage = error.message || '❌ Có lỗi xảy ra!';
      await interaction.editReply({ embeds: [createErrorEmbed(errorMessage)] });
    }
  },
};
