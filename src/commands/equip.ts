import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../index';
import { validateCharacter } from '../middleware/validate';
import { EquipmentService } from '../services/EquipmentService';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embeds';

export const equipCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('equip')
    .setDescription('Trang bị vật phẩm')
    .addStringOption(option =>
      option
        .setName('item')
        .setDescription('Tên vật phẩm cần trang bị')
        .setRequired(true)
    ) as SlashCommandBuilder,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const { character } = await validateCharacter(interaction);
      const itemName = interaction.options.getString('item', true);

      const result = await EquipmentService.equipItem(character.id, itemName);

      if (!result.success) {
        await interaction.editReply({ embeds: [createErrorEmbed(result.message)] });
        return;
      }

      // Build stats message
      const statsLines = [];
      if (result.statsGained) {
        if (result.statsGained.hp > 0) statsLines.push(`❤️ HP +${result.statsGained.hp}`);
        if (result.statsGained.ki > 0) statsLines.push(`💙 KI +${result.statsGained.ki}`);
        if (result.statsGained.attack > 0) statsLines.push(`⚔️ ATK +${result.statsGained.attack}`);
        if (result.statsGained.defense > 0) statsLines.push(`🛡️ DEF +${result.statsGained.defense}`);
        if (result.statsGained.speed > 0) statsLines.push(`⚡ SPD +${result.statsGained.speed}`);
      }

      let description = result.message;
      if (statsLines.length > 0) {
        description += `\n\n**Bonus Stats:**\n${statsLines.join(' • ')}`;
      }

      await interaction.editReply({
        embeds: [createSuccessEmbed('⚔️ Trang bị thành công!', description)]
      });
    } catch (error: any) {
      console.error('[equip.ts] Error:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed(error.message || '❌ Có lỗi xảy ra!')]
      });
    }
  },
};
