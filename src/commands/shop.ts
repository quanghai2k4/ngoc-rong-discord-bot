import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../index';
import { validateCharacter } from '../middleware/validate';
import { createErrorEmbed } from '../utils/embeds';
import { ShopService } from '../services/ShopService';

export const shopCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Cửa hàng NPC - Mua bán trang bị')
    .addIntegerOption(option =>
      option
        .setName('type')
        .setDescription('Loại item (để trống để xem menu)')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('page')
        .setDescription('Trang (mặc định: 1)')
        .setRequired(false)
        .setMinValue(1)
    ) as SlashCommandBuilder,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const { character } = await validateCharacter(interaction);
      const typeId = interaction.options.getInteger('type');
      const page = interaction.options.getInteger('page') || 1;

      // Nếu không chọn type, hiển thị menu item types
      if (typeId === null) {
        const itemTypes = await ShopService.getItemTypes();

        const embed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('🏪 Cửa Hàng NPC')
          .setDescription(
            '**Chào mừng đến với cửa hàng!**\n\n' +
            'Sử dụng `/shop type:<loại>` để xem items theo loại:\n\n' +
            itemTypes.map(type => `**${type.id}** - ${type.name} - ${type.description}`).join('\n') +
            '\n\n**Ví dụ:** `/shop type:0` để xem Áo giáp' +
            '\n\n**Lệnh khác:**\n' +
            '• `/buy item_id:<id> quantity:<số lượng>` - Mua item\n' +
            '• `/sell item_id:<id> quantity:<số lượng>` - Bán item'
          )
          .setFooter({ text: `💰 Vàng: ${character.gold.toLocaleString()} | Bán item = 50% giá gốc` });

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Hiển thị items theo type với phân trang
      const result = await ShopService.getItemsByType(typeId, page);

      if (result.items.length === 0) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Không tìm thấy item nào trong loại này!')]
        });
        return;
      }

      const itemList = result.items.map(item => {
        const stats = [];
        if (item.hp_bonus > 0) stats.push(`❤️ +${item.hp_bonus}`);
        if (item.ki_bonus > 0) stats.push(`⚡ +${item.ki_bonus}`);
        if (item.attack_bonus > 0) stats.push(`⚔️ +${item.attack_bonus}`);
        if (item.defense_bonus > 0) stats.push(`🛡️ +${item.defense_bonus}`);
        if (item.speed_bonus > 0) stats.push(`💨 +${item.speed_bonus}`);

        const statsStr = stats.length > 0 ? ` • ${stats.join(', ')}` : '';
        const consumable = item.is_consumable ? ' 🍎' : '';
        
        return `**[${item.id}]** ${item.name}${consumable}\n` +
               `  ├ Lvl ${item.required_level}${statsStr}\n` +
               `  └ 💰 Mua: ${item.price.toLocaleString()} | Bán: ${ShopService.getSellPrice(item.price).toLocaleString()}`;
      }).join('\n\n');

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`🏪 ${result.items[0].item_type_name}`)
        .setDescription(itemList)
        .setFooter({ 
          text: `💰 Vàng: ${character.gold.toLocaleString()} | Trang ${result.currentPage}/${result.totalPages} | Tổng: ${result.total} items` 
        });

      await interaction.editReply({ embeds: [embed] });
    } catch (error: any) {
      console.error('[shop.ts] Error:', error);
      const errorMessage = error.message || '❌ Có lỗi xảy ra!';
      await interaction.editReply({ embeds: [createErrorEmbed(errorMessage)] });
    }
  },
};
