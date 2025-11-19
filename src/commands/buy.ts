import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../index';
import { validateCharacter } from '../middleware/validate';
import { createErrorEmbed } from '../utils/embeds';
import { ShopService } from '../services/ShopService';

export const buyCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Mua item từ cửa hàng')
    .addIntegerOption(option =>
      option
        .setName('item_id')
        .setDescription('ID của item muốn mua')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('quantity')
        .setDescription('Số lượng (mặc định: 1)')
        .setRequired(false)
        .setMinValue(1)
    ) as SlashCommandBuilder,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const { character } = await validateCharacter(interaction);
      const itemId = interaction.options.getInteger('item_id', true);
      const quantity = interaction.options.getInteger('quantity') || 1;

      // Lấy thông tin item trước
      const item = await ShopService.getItemById(itemId);
      if (!item) {
        await interaction.editReply({
          embeds: [createErrorEmbed(`Không tìm thấy item với ID ${itemId}!`)]
        });
        return;
      }

      // Mua item
      const result = await ShopService.buyItem(character.id, itemId, quantity);

      if (!result.success) {
        await interaction.editReply({
          embeds: [createErrorEmbed(result.message)]
        });
        return;
      }

      // Success embed
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Mua Hàng Thành Công')
        .setDescription(result.message)
        .addFields(
          { name: '📦 Item', value: `[${itemId}] ${item.name}`, inline: true },
          { name: '🔢 Số lượng', value: `${quantity}`, inline: true },
          { name: '💰 Tổng giá', value: `${(item.price * quantity).toLocaleString()} vàng`, inline: true },
          { name: '💵 Vàng còn lại', value: `${result.newGold?.toLocaleString()} vàng`, inline: false }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error: any) {
      console.error('[buy.ts] Error:', error);
      const errorMessage = error.message || '❌ Có lỗi xảy ra!';
      await interaction.editReply({ embeds: [createErrorEmbed(errorMessage)] });
    }
  },
};
