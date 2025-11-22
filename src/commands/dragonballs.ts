import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../index';
import { validateCharacter } from '../middleware/validate';
import { createErrorEmbed } from '../utils/embeds';
import { DragonBallService } from '../services/DragonBallService';
import { BOX } from '../utils/helpers';

export const dragonballsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('dragonballs')
    .setDescription('Xem bộ sưu tập Ngọc Rồng của bạn')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Loại Ngọc Rồng')
        .setRequired(false)
        .addChoices(
          { name: '🌍 Trái Đất (Earth)', value: 'earth' },
          { name: '🟢 Namek', value: 'namek' }
        )
    ) as SlashCommandBuilder,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const { character } = await validateCharacter(interaction);
      const setType = (interaction.options.get('type')?.value as 'earth' | 'namek') || 'earth';

      // Lấy Dragon Balls từ inventory
      const dragonBalls = await DragonBallService.getCharacterDragonBalls(character.id, setType);
      const hasComplete = dragonBalls.length >= 7;

      // Tạo map để track số sao đã có
      const ballMap: { [key: number]: boolean } = {};
      dragonBalls.forEach((ball: any) => {
        // Extract số sao từ tên (e.g., "Ngọc Rồng 3 sao" -> 3)
        const match = ball.name.match(/(\d+)\s*sao/i);
        if (match) {
          const stars = parseInt(match[1]);
          ballMap[stars] = true;
        }
      });

      // Icon cho từng loại
      const typeIcon = setType === 'earth' ? '🌍' : '🟢';
      const typeName = setType === 'earth' ? 'Trái Đất' : 'Namek';
      const dragonName = setType === 'earth' ? 'Shenron' : 'Porunga';

      // Tạo header
      let description = `${BOX.ROUNDED_TOP_LEFT}${BOX.HORIZONTAL.repeat(42)}${BOX.ROUNDED_TOP_RIGHT}\n`;
      description += `${BOX.VERTICAL} ${typeIcon} **BỘ SƯU TẬP NGỌC RỒNG ${typeName.toUpperCase()}**        ${BOX.VERTICAL}\n`;
      description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(42)}${BOX.T_LEFT}\n`;
      description += `${BOX.VERTICAL} Đã thu thập: **${dragonBalls.length}/7** viên              ${BOX.VERTICAL}\n`;
      
      if (hasComplete) {
        description += `${BOX.VERTICAL} 🎉 **Bộ sưu tập hoàn chỉnh!**                   ${BOX.VERTICAL}\n`;
        description += `${BOX.VERTICAL} 🐉 Sử dụng \`/summon\` để triệu hồi ${dragonName}!   ${BOX.VERTICAL}\n`;
      } else {
        description += `${BOX.VERTICAL} ⏳ Còn thiếu: **${7 - dragonBalls.length}** viên                    ${BOX.VERTICAL}\n`;
      }
      
      description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(42)}${BOX.T_LEFT}\n`;

      // Hiển thị từng viên (1-7 sao)
      for (let i = 1; i <= 7; i++) {
        const hasStars = ballMap[i];
        const icon = hasStars ? '🌟' : '⚫';
        const status = hasStars ? '✅ Đã có' : '❌ Chưa có';
        const starDisplay = '⭐'.repeat(i);
        
        description += `${BOX.VERTICAL} ${icon} **${i} sao** ${starDisplay.padEnd(14)} ${status.padEnd(10)} ${BOX.VERTICAL}\n`;
        
        if (i < 7) {
          description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(42)}${BOX.T_LEFT}\n`;
        }
      }

      description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(42)}${BOX.ROUNDED_BOTTOM_RIGHT}\n`;

      // Thêm lịch sử wishes nếu có
      const wishHistory = await DragonBallService.getWishHistory(character.id, 3);
      
      if (wishHistory.length > 0) {
        description += `\n**📜 Lịch sử ước nguyện gần đây:**\n`;
        wishHistory.forEach((wish: any, index: number) => {
          const date = new Date(wish.granted_at).toLocaleDateString('vi-VN');
          const dragonIcon = wish.dragon_type === 'earth' ? '🌍' : '🟢';
          description += `${index + 1}. ${dragonIcon} **${wish.wish_name}** - ${date}\n`;
        });
      }

      // Thông tin về cách lấy Dragon Balls
      description += `\n💡 **Cách thu thập:**\n`;
      description += `• Đánh bại Boss có tỷ lệ rơi Ngọc Rồng\n`;
      description += `• Boss càng mạnh, tỷ lệ rơi càng cao\n`;
      if (setType === 'namek') {
        description += `• Ngọc Rồng Namek chỉ rơi từ Boss level 15+\n`;
      }

      const embed = new EmbedBuilder()
        .setColor(hasComplete ? '#FFD700' : '#FF6B6B')
        .setTitle(`🐉 Ngọc Rồng ${typeName}`)
        .setDescription(description)
        .setFooter({ 
          text: hasComplete 
            ? `Sử dụng /summon để triệu hồi ${dragonName}!`
            : `Hãy tìm kiếm ${7 - dragonBalls.length} viên còn lại!` 
        })
        .setTimestamp();

      // Thêm thumbnail
      if (hasComplete) {
        embed.setThumbnail('https://i.imgur.com/8qQZQ0x.png'); // Shenron icon (placeholder)
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error: any) {
      console.error('[dragonballs.ts] Error:', error);
      const errorMessage = error.message || '❌ Có lỗi xảy ra khi xem Ngọc Rồng!';
      await interaction.editReply({ embeds: [createErrorEmbed(errorMessage)] });
    }
  },
};
