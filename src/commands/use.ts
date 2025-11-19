import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../index';
import { validateCharacter } from '../middleware/validate';
import { EquipmentService } from '../services/EquipmentService';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embeds';

export const useCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('use')
    .setDescription('Sử dụng vật phẩm tiêu hao')
    .addStringOption(option =>
      option
        .setName('item')
        .setDescription('Tên vật phẩm cần sử dụng')
        .setRequired(true)
    ) as SlashCommandBuilder,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const { character } = await validateCharacter(interaction);
      const itemName = interaction.options.getString('item', true);

      const result = await EquipmentService.useItem(character.id, itemName);

      if (!result.success) {
        await interaction.editReply({ embeds: [createErrorEmbed(result.message)] });
        return;
      }

      await interaction.editReply({
        embeds: [createSuccessEmbed('💊 Sử dụng vật phẩm thành công!', result.message)]
      });
    } catch (error: any) {
      console.error('[use.ts] Error:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed(error.message || '❌ Có lỗi xảy ra!')]
      });
    }
  },
};
