import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../index';
import { validateCharacter } from '../middleware/validate';
import { createErrorEmbed } from '../utils/embeds';
import { ShopService } from '../services/ShopService';

export const sellCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('Bán item cho cửa hàng (giá = 50% giá mua)')
    .addIntegerOption(option =>
      option
        .setName('item_id')
        .setDescription('ID của item muốn bán')
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

      // Bán item
      const result = await ShopService.sellItem(character.id, itemId, quantity);

      if (!result.success) {
        await interaction.editReply({
          embeds: [createErrorEmbed(result.message)]
        });
        return;
      }

      const sellPrice = ShopService.getSellPrice(item.price);

      // Success embed
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Bán Hàng Thành Công')
        .setDescription(result.message)
        .addFields(
          { name: '📦 Item', value: `[${itemId}] ${item.name}`, inline: true },
          { name: '🔢 Số lượng', value: `${quantity}`, inline: true },
          { name: '💰 Tổng giá', value: `${(sellPrice * quantity).toLocaleString()} vàng`, inline: true },
          { name: '💵 Vàng hiện tại', value: `${result.newGold?.toLocaleString()} vàng`, inline: false }
        )
        .setFooter({ text: 'Giá bán = 50% giá mua' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error: any) {
      console.error('[sell.ts] Error:', error);
      const errorMessage = error.message || '❌ Có lỗi xảy ra!';
      await interaction.editReply({ embeds: [createErrorEmbed(errorMessage)] });
    }
  },
};
