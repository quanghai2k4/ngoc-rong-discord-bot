import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../index';
import { validateCharacter } from '../middleware/validate';
import { EquipmentService } from '../services/EquipmentService';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embeds';

export const unequipCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('unequip')
    .setDescription('Gỡ bỏ vật phẩm đang trang bị')
    .addStringOption(option =>
      option
        .setName('item')
        .setDescription('Tên vật phẩm cần gỡ')
        .setRequired(true)
    ) as SlashCommandBuilder,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const { character } = await validateCharacter(interaction);
      const itemName = interaction.options.getString('item', true);

      const result = await EquipmentService.unequipItem(character.id, itemName);

      if (!result.success) {
        await interaction.editReply({ embeds: [createErrorEmbed(result.message)] });
        return;
      }

      await interaction.editReply({
        embeds: [createSuccessEmbed('🎒 Gỡ trang bị thành công!', result.message)]
      });
    } catch (error: any) {
      console.error('[unequip.ts] Error:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed(error.message || '❌ Có lỗi xảy ra!')]
      });
    }
  },
};
