import { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder,
  ComponentType 
} from 'discord.js';
import { Command } from '../index';
import { CharacterService } from '../services/CharacterService';
import { SkillService } from '../services/SkillService';
import { validateCharacter } from '../middleware/validate';
import { createErrorEmbed } from '../utils/embeds';
import { UI_CONFIG } from '../config';

export const learnCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('learn')
    .setDescription('Học hoặc nâng cấp kỹ năng') as SlashCommandBuilder,

  async execute(interaction) {
    try {
      await interaction.deferReply();
      
      const { character } = await validateCharacter(interaction);
      const race = await CharacterService.getRaceById(character.race_id);
      
      // Lấy tất cả skills (learned và unlearned)
      const allSkills = await SkillService.getAllSkillsByRace(character.id, character.race_id);
      
      if (allSkills.length === 0) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Không tìm thấy kỹ năng nào cho chủng tộc của bạn!')]
        });
        return;
      }

      // Lọc skills có thể học/nâng cấp (chưa max level)
      const upgradeableSkills = allSkills.filter(s => s.current_point < s.max_point);
      
      if (upgradeableSkills.length === 0) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Tất cả kỹ năng đã đạt level tối đa!')]
        });
        return;
      }

      // Tạo embed hiển thị skills
      const embed = new EmbedBuilder()
        .setColor(UI_CONFIG.COLORS.BOSS)
        .setTitle('⚡ Học Kỹ Năng')
        .setDescription(
          `**${character.name}** (${race?.name})\n` +
          `💰 Vàng hiện có: **\`${character.gold.toLocaleString()}\`**\n\n` +
          `*Chọn kỹ năng để học/nâng cấp:*`
        );

      // Thêm field cho mỗi skill
      for (const skill of upgradeableSkills) {
        const currentLevel = skill.current_point;
        const nextLevel = currentLevel + 1;
        const isNewSkill = currentLevel === 0;
        
        // Get next level data để show requirements
        const template = await SkillService.getSkillTemplate(skill.nclass_id, skill.skill_id);
        if (!template) continue;
        
        const nextLevelData = template.skill_levels[nextLevel - 1];
        if (!nextLevelData) continue;

        let fieldValue = '';
        
        if (isNewSkill) {
          fieldValue += `🆕 *Học mới* → Level \`1\`\n`;
        } else {
          fieldValue += `⬆️ Level \`${currentLevel}\` → \`${nextLevel}\`\n`;
        }
        
        // Requirements
        fieldValue += `💰 Chi phí: **\`${nextLevelData.price.toLocaleString()}\`** vàng\n`;
        // TODO: Uncomment khi có power stat
        // fieldValue += `⚡ Cần sức mạnh: **\`${nextLevelData.power_require.toLocaleString()}\`**\n`;
        
        // Stats preview
        if (skill.skill_type === 1) { // Attack
          fieldValue += `💥 Damage: **\`${nextLevelData.damage}%\`** • 💙 KI: **\`${nextLevelData.mana_use}\`**`;
        } else if (skill.skill_type === 2) { // Heal
          fieldValue += `💚 Heal: **\`${nextLevelData.damage}%\`** • 💙 KI: **\`${nextLevelData.mana_use}\`**`;
        } else if (skill.skill_type === 3) { // Buff
          fieldValue += `⭐ Buff: **\`${nextLevelData.damage}%\`** • 💙 KI: **\`${nextLevelData.mana_use}\`**`;
        }

        embed.addFields({
          name: `${skill.name}`,
          value: fieldValue,
          inline: false
        });
      }

      // Tạo select menu (với descriptions đơn giản)
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('skill_select')
        .setPlaceholder('Chọn kỹ năng để học/nâng cấp')
        .addOptions(
          upgradeableSkills.map(skill => {
            const currentLevel = skill.current_point;
            const nextLevel = currentLevel + 1;
            const isNew = currentLevel === 0;
            
            return {
              label: `${skill.name} (${isNew ? 'Học mới' : `Lv.${currentLevel}→${nextLevel}`})`,
              value: `${skill.nclass_id}:${skill.skill_id}`,
              description: isNew ? 'Học kỹ năng mới' : `Nâng cấp lên level ${nextLevel}`,
            };
          })
        );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu);

      const response = await interaction.editReply({
        embeds: [embed],
        components: [row]
      });

      // Collector để xử lý selection
      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000 // 60 seconds
      });

      collector.on('collect', async (i: any) => {
        if (i.user.id !== interaction.user.id) {
          await i.reply({ 
            content: '❌ Đây không phải lựa chọn của bạn!', 
            ephemeral: true 
          });
          return;
        }

        const [nclassId, skillId] = i.values[0].split(':').map(Number);
        
        // Update message trước
        await i.update({
          content: '⏳ Đang xử lý...',
          embeds: [],
          components: []
        });

        // Thực hiện học/nâng cấp skill
        const result = await SkillService.learnOrUpgradeSkill(
          character.id,
          nclassId,
          skillId
        );

        if (result.success) {
          const successEmbed = new EmbedBuilder()
            .setColor(UI_CONFIG.COLORS.SUCCESS)
            .setTitle('✅ Thành công!')
            .setDescription(result.message)
            .setFooter({ text: 'Sử dụng /skills để xem kỹ năng của bạn!' });

          await i.followUp({
            embeds: [successEmbed]
          });
        } else {
          await i.followUp({
            embeds: [createErrorEmbed(result.message)]
          });
        }

        collector.stop();
      });

      collector.on('end', (collected: any) => {
        if (collected.size === 0) {
          interaction.editReply({
            content: '⏰ Hết thời gian chọn! Sử dụng `/learn` để thử lại.',
            components: []
          });
        }
      });

    } catch (error: any) {
      console.error('[learn.ts] Error:', error);
      const errorMessage = error.message || '❌ Có lỗi xảy ra!';
      
      if (interaction.deferred) {
        await interaction.editReply({ embeds: [createErrorEmbed(errorMessage)] });
      } else {
        await interaction.reply({ embeds: [createErrorEmbed(errorMessage)] });
      }
    }
  }
};
