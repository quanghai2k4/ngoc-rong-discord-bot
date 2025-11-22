import { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder,
  ComponentType 
} from 'discord.js';
import { Command } from '../index';
import { validateCharacter } from '../middleware/validate';
import { createErrorEmbed } from '../utils/embeds';
import { DragonBallService } from '../services/DragonBallService';
import { BOT_CONFIG } from '../config';

export const summonCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('summon')
    .setDescription('Triệu hồi Rồng Thần và thực hiện ước nguyện')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Loại Ngọc Rồng để triệu hồi')
        .setRequired(false)
        .addChoices(
          { name: '🌍 Shenron (Trái Đất)', value: 'earth' },
          { name: '🟢 Porunga (Namek)', value: 'namek' }
        )
    ) as SlashCommandBuilder,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const { character } = await validateCharacter(interaction);
      const setType = (interaction.options.get('type')?.value as 'earth' | 'namek') || 'earth';

      // 1. Kiểm tra có đủ 7 viên không
      const hasComplete = await DragonBallService.hasCompletedSet(character.id, setType);
      
      if (!hasComplete) {
        const dragonBalls = await DragonBallService.getCharacterDragonBalls(character.id, setType);
        await interaction.editReply({
          embeds: [createErrorEmbed(
            `❌ Bạn chưa có đủ 7 viên Ngọc Rồng ${setType === 'earth' ? 'Trái Đất' : 'Namek'}!\n\n` +
            `Hiện có: **${dragonBalls.length}/7** viên\n` +
            `Sử dụng \`/dragonballs\` để xem bộ sưu tập.`
          )]
        });
        return;
      }

      // 2. Lấy danh sách wishes có thể dùng
      const availableWishes = await DragonBallService.getAvailableWishes(character.level, setType);

      if (availableWishes.length === 0) {
        await interaction.editReply({
          embeds: [createErrorEmbed('❌ Không có ước nguyện nào khả dụng cho level của bạn!')]
        });
        return;
      }

      // 3. Kiểm tra cooldown cho từng wish
      const wishesWithCooldown = await Promise.all(
        availableWishes.map(async (wish) => {
          const cooldownCheck = await DragonBallService.canUseWish(character.id, wish.code);
          return { ...wish, ...cooldownCheck };
        })
      );

      // 4. Hiển thị animation triệu hồi
      const dragonName = setType === 'earth' ? 'Shenron' : 'Porunga';
      const dragonColor = setType === 'earth' ? '#FFD700' : '#2ECC71';
      
      const summonEmbed = new EmbedBuilder()
        .setColor(dragonColor as any)
        .setTitle(`🐉 TRIỆU HỒI ${dragonName.toUpperCase()}!`)
        .setDescription(
          `*7 viên Ngọc Rồng tỏa sáng rực rỡ...*\n\n` +
          `✨ ✨ ✨ ✨ ✨ ✨ ✨\n\n` +
          `**${dragonName}** xuất hiện từ trong ánh sáng!\n\n` +
          `🐉 *"Ta sẽ thực hiện một ước nguyện của ngươi..."*\n\n` +
          `Hãy chọn ước nguyện của bạn:`
        )
        .setThumbnail('https://i.imgur.com/8qQZQ0x.png') // Placeholder
        .setTimestamp();

      // 5. Tạo select menu với wishes
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('wish_select')
        .setPlaceholder('✨ Chọn ước nguyện của bạn...')
        .addOptions(
          wishesWithCooldown.map(wish => {
            let label = wish.name;
            let description = wish.description.substring(0, 100);
            
            if (!wish.canUse) {
              label += ` (Cooldown: ${wish.daysRemaining} ngày)`;
              description = `⏳ Chưa thể sử dụng. ${description}`;
            }

            return {
              label: label,
              description: description,
              value: wish.code,
              emoji: wish.canUse ? '✅' : '⏳'
            };
          })
        );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      const response = await interaction.editReply({
        embeds: [summonEmbed],
        components: [row]
      });

      // 6. Đợi user chọn wish
      try {
        const confirmation = await response.awaitMessageComponent({
          componentType: ComponentType.StringSelect,
          time: BOT_CONFIG.COMMAND_TIMEOUT,
          filter: (i: any) => i.user.id === interaction.user.id
        });

        const selectedWishCode = confirmation.values[0];

        // Defer update
        await confirmation.deferUpdate();

        // Kiểm tra wish có thể dùng không
        const selectedWish = wishesWithCooldown.find(w => w.code === selectedWishCode);
        if (!selectedWish) {
          throw new Error('Ước nguyện không hợp lệ!');
        }

        if (!selectedWish.canUse) {
          await interaction.editReply({
            embeds: [createErrorEmbed(
              `⏰ Ước nguyện này đang trong thời gian chờ!\n\n` +
              `Còn: **${selectedWish.daysRemaining} ngày**\n` +
              `Hãy chọn ước nguyện khác.`
            )],
            components: []
          });
          return;
        }

        // 7. Thực hiện ước nguyện
        const processingEmbed = new EmbedBuilder()
          .setColor(dragonColor as any)
          .setTitle(`🐉 ${dragonName} đang thực hiện ước nguyện...`)
          .setDescription(
            `✨ *Ánh sáng rực rỡ bao trùm...*\n\n` +
            `**Ước nguyện:** ${selectedWish.name}\n` +
            `${selectedWish.description}\n\n` +
            `⏳ Đang xử lý...`
          );

        await interaction.editReply({
          embeds: [processingEmbed],
          components: []
        });

        // Thực hiện wish
        const result = await DragonBallService.summonAndWish(
          character.id,
          selectedWishCode,
          setType
        );

        // 8. Hiển thị kết quả
        const resultEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle(`✨ ƯỚC NGUYỆN ĐƯỢC THỰC HIỆN!`)
          .setDescription(
            `🐉 **${dragonName}:**\n` +
            `*"${result.message}"*\n\n` +
            `**Ước nguyện:** ${selectedWish.name}\n\n` +
            `**Phần thưởng nhận được:**`
          );

        // Add rewards to embed
        if (result.rewards?.gold) {
          resultEmbed.addFields({
            name: '💰 Vàng',
            value: `+${result.rewards.gold.toLocaleString()} vàng`,
            inline: true
          });
        }

        if (result.rewards?.levels) {
          resultEmbed.addFields({
            name: '⭐ Levels',
            value: `+${result.rewards.levels} levels`,
            inline: true
          });
        }

        if (result.rewards?.stats) {
          const statsText = [];
          if (result.rewards.stats.max_hp_percent) {
            statsText.push(`Max HP: +${result.rewards.stats.max_hp_percent}%`);
          }
          if (result.rewards.stats.all_stats_percent) {
            statsText.push(`All Stats: +${result.rewards.stats.all_stats_percent}%`);
          }
          if (statsText.length > 0) {
            resultEmbed.addFields({
              name: '📈 Stats',
              value: statsText.join('\n'),
              inline: true
            });
          }
        }

        if (result.rewards?.items && result.rewards.items.length > 0) {
          resultEmbed.addFields({
            name: '🎁 Items',
            value: result.rewards.items.map(item => `• ${item.name} x${item.quantity}`).join('\n'),
            inline: false
          });
        }

        if (result.rewards?.transformations && result.rewards.transformations.length > 0) {
          resultEmbed.addFields({
            name: '✨ Transformations',
            value: result.rewards.transformations.map(t => `• ${t}`).join('\n'),
            inline: false
          });
        }

        resultEmbed.addFields({
          name: '🔄 Ngọc Rồng',
          value: `7 viên Ngọc Rồng đã bay đi khắp nơi...\nHãy tìm kiếm chúng lại!`,
          inline: false
        });

        resultEmbed.setFooter({
          text: `Cooldown: ${selectedWish.cooldown_days} ngày | Sử dụng /dragonballs để xem tiến độ`
        });

        await interaction.editReply({
          embeds: [resultEmbed]
        });

      } catch (error: any) {
        if (error.message && error.message.includes('time')) {
          await interaction.editReply({
            embeds: [createErrorEmbed('⏰ Hết thời gian chọn ước nguyện!\n7 viên Ngọc Rồng vẫn còn với bạn.')],
            components: []
          });
        } else {
          throw error;
        }
      }

    } catch (error: any) {
      console.error('[summon.ts] Error:', error);
      const errorMessage = error.message || '❌ Có lỗi xảy ra khi triệu hồi Rồng Thần!';
      await interaction.editReply({
        embeds: [createErrorEmbed(errorMessage)],
        components: []
      });
    }
  },
};
