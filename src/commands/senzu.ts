import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../index';
import { validateCharacter } from '../middleware/validate';
import { createErrorEmbed } from '../utils/embeds';
import { SenzuService } from '../services/SenzuService';
import { BOX } from '../utils/helpers';

export const senzuCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('senzu')
    .setDescription('Quản lý cây Đậu Thần tại nhà của bạn')
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Xem thông tin cây Đậu Thần')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('harvest')
        .setDescription('Thu hoạch Đậu Thần')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('upgrade')
        .setDescription('Nâng cấp cây Đậu Thần')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('use')
        .setDescription('Sử dụng Đậu Thần để hồi HP/KI')
        .addIntegerOption(option =>
          option
            .setName('quantity')
            .setDescription('Số lượng Đậu Thần muốn dùng')
            .setRequired(true)
            .setMinValue(1)
        )
    ) as SlashCommandBuilder,

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const { character } = await validateCharacter(interaction);
      const subcommand = interaction.options.getSubcommand();

      switch (subcommand) {
        case 'info':
          await handleInfo(interaction, character.id);
          break;
        case 'harvest':
          await handleHarvest(interaction, character.id);
          break;
        case 'upgrade':
          await handleUpgrade(interaction, character.id);
          break;
        case 'use':
          const quantity = interaction.options.getInteger('quantity', true);
          await handleUse(interaction, character.id, quantity);
          break;
        default:
          await interaction.editReply({
            embeds: [createErrorEmbed('Lệnh không hợp lệ!')]
          });
      }
    } catch (error: any) {
      console.error('[senzu.ts] Error:', error);
      const errorMessage = error.message || '❌ Có lỗi xảy ra!';
      await interaction.editReply({ embeds: [createErrorEmbed(errorMessage)] });
    }
  },
};

async function handleInfo(interaction: any, characterId: number) {
  const info = await SenzuService.getSenzuInfo(characterId);
  const currentConfig = info.config;
  const nextConfig = info.nextLevelConfig;

  // Header với rounded corners
  let description = `${BOX.ROUNDED_TOP_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_TOP_RIGHT}\n`;
  description += `${BOX.VERTICAL} 🌱 **CÂY ĐẬU THẦN - LEVEL ${info.level}/10**     ${BOX.VERTICAL}\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;

  // Kho Đậu Thần hiện tại
  description += `${BOX.VERTICAL} 🫘 **Kho:** ${info.beans} Đậu Thần\n`;
  description += `${BOX.VERTICAL} 💚 **Hồi phục:** ${currentConfig.bean_hp_restore} HP & ${currentConfig.bean_ki_restore} KI/hạt\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;

  // Thông tin thu hoạch
  description += `${BOX.VERTICAL} ⏱️  **Chu kỳ:** ${currentConfig.production_time} phút\n`;
  description += `${BOX.VERTICAL} 🌾 **Thu hoạch:** ${currentConfig.beans_per_harvest} Đậu/lần\n`;

  // Kiểm tra thời gian thu hoạch
  if (info.canHarvest) {
    description += `${BOX.VERTICAL} ✅ **Trạng thái:** Có thể thu hoạch ngay!\n`;
  } else {
    description += `${BOX.VERTICAL} ⏳ **Trạng thái:** Còn ${info.minutesRemaining} phút nữa\n`;
  }

  // Thông tin nâng cấp
  if (nextConfig) {
    description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
    description += `${BOX.VERTICAL} 🔼 **NÂNG CẤP LÊN LEVEL ${info.level + 1}**\n`;
    description += `${BOX.VERTICAL}    💰 Chi phí: ${nextConfig.upgrade_cost.toLocaleString()} vàng\n`;
    description += `${BOX.VERTICAL}    📊 Level yêu cầu: ${nextConfig.required_character_level}\n`;
    description += `${BOX.VERTICAL}    ⏱️  Chu kỳ: ${nextConfig.production_time} phút\n`;
    description += `${BOX.VERTICAL}    🌾 Thu hoạch: ${nextConfig.beans_per_harvest} Đậu/lần\n`;
    description += `${BOX.VERTICAL}    💚 Hồi phục: ${nextConfig.bean_hp_restore} HP & ${nextConfig.bean_ki_restore} KI/hạt\n`;
  } else {
    description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
    description += `${BOX.VERTICAL} 🏆 **ĐÃ ĐẠT CẤP ĐỘ TỐI ĐA!**\n`;
  }

  description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_BOTTOM_RIGHT}`;

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('🌱 Cây Đậu Thần')
    .setDescription(description)
    .setFooter({ 
      text: `💡 Dùng: /senzu harvest | /senzu upgrade | /senzu use <số lượng>` 
    })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleHarvest(interaction: any, characterId: number) {
  const result = await SenzuService.harvest(characterId);

  if (!result.success) {
    await interaction.editReply({
      embeds: [createErrorEmbed(result.message)]
    });
    return;
  }

  // Lấy info để biết chu kỳ
  const info = await SenzuService.getSenzuInfo(characterId);

  let description = `${BOX.ROUNDED_TOP_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_TOP_RIGHT}\n`;
  description += `${BOX.VERTICAL} 🌾 **THU HOẠCH THÀNH CÔNG!**          ${BOX.VERTICAL}\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
  description += `${BOX.VERTICAL} 🫘 **Nhận được:** ${result.beansHarvested} Đậu Thần\n`;
  description += `${BOX.VERTICAL} 📦 **Tổng kho:** ${result.totalBeans} Đậu Thần\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
  description += `${BOX.VERTICAL} ⏱️  **Lần thu hoạch tiếp theo:**\n`;
  description += `${BOX.VERTICAL}    ${info.config.production_time} phút nữa\n`;
  description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_BOTTOM_RIGHT}`;

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('🌾 Thu Hoạch Đậu Thần')
    .setDescription(description)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleUpgrade(interaction: any, characterId: number) {
  const result = await SenzuService.upgrade(characterId);

  if (!result.success) {
    await interaction.editReply({
      embeds: [createErrorEmbed(result.message)]
    });
    return;
  }

  // Lấy info mới sau khi upgrade
  const info = await SenzuService.getSenzuInfo(characterId);
  
  // Lấy thông tin character để biết gold còn lại
  const { query } = await import('../database/db');
  const charResult = await query('SELECT gold FROM characters WHERE id = $1', [characterId]);
  const remainingGold = charResult.rows[0].gold;

  let description = `${BOX.ROUNDED_TOP_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_TOP_RIGHT}\n`;
  description += `${BOX.VERTICAL} 🔼 **NÂNG CẤP THÀNH CÔNG!**          ${BOX.VERTICAL}\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
  description += `${BOX.VERTICAL} 🌱 **Cấp độ mới:** Level ${result.newLevel}/10\n`;
  description += `${BOX.VERTICAL} 💵 **Vàng còn lại:** ${remainingGold.toLocaleString()}\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
  description += `${BOX.VERTICAL} 📈 **CẢI TIẾN:**\n`;
  description += `${BOX.VERTICAL}    ⏱️  Chu kỳ: ${info.config.production_time} phút\n`;
  description += `${BOX.VERTICAL}    🌾 Thu hoạch: ${info.config.beans_per_harvest} Đậu/lần\n`;
  description += `${BOX.VERTICAL}    💚 Hồi phục: ${info.config.bean_hp_restore} HP & ${info.config.bean_ki_restore} KI/hạt\n`;
  description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_BOTTOM_RIGHT}`;

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🔼 Nâng Cấp Cây Đậu Thần')
    .setDescription(description)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleUse(interaction: any, characterId: number, quantity: number) {
  const result = await SenzuService.useSenzu(characterId, quantity);

  if (!result.success) {
    await interaction.editReply({
      embeds: [createErrorEmbed(result.message)]
    });
    return;
  }

  // Lấy info để biết beans còn lại và HP/KI hiện tại
  const info = await SenzuService.getSenzuInfo(characterId);
  const { query } = await import('../database/db');
  const charResult = await query('SELECT hp, max_hp, ki, max_ki FROM characters WHERE id = $1', [characterId]);
  const { hp, max_hp, ki, max_ki } = charResult.rows[0];

  let description = `${BOX.ROUNDED_TOP_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_TOP_RIGHT}\n`;
  description += `${BOX.VERTICAL} 🫘 **SỬ DỤNG ĐẬU THẦN**                ${BOX.VERTICAL}\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
  description += `${BOX.VERTICAL} 💊 **Đã dùng:** ${quantity} Đậu Thần\n`;
  description += `${BOX.VERTICAL} 📦 **Còn lại:** ${info.beans} Đậu Thần\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;

  if (result.hpRestored > 0 || result.kiRestored > 0) {
    description += `${BOX.VERTICAL} 💚 **HỒI PHỤC:**\n`;
    if (result.hpRestored > 0) {
      description += `${BOX.VERTICAL}    ❤️  HP: +${result.hpRestored} (${hp}/${max_hp})\n`;
    }
    if (result.kiRestored > 0) {
      description += `${BOX.VERTICAL}    💙 KI: +${result.kiRestored} (${ki}/${max_ki})\n`;
    }
  } else {
    description += `${BOX.VERTICAL} ℹ️  **HP/KI đã đầy!**\n`;
  }

  description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_BOTTOM_RIGHT}`;

  const embed = new EmbedBuilder()
    .setColor('#00FFFF')
    .setTitle('🫘 Sử Dụng Đậu Thần')
    .setDescription(description)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
