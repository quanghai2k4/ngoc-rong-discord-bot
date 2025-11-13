import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../index';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';
import { SkillService } from '../services/SkillService';

export const skillsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('skills')
    .setDescription('Xem danh sách kỹ năng theo chủng tộc') as SlashCommandBuilder,

  async execute(interaction) {
    const player = await PlayerService.findByDiscordId(interaction.user.id);
    if (!player) {
      await interaction.reply('❌ Bạn chưa có nhân vật! Sử dụng `/start` để bắt đầu.');
      return;
    }

    const character = await CharacterService.findByPlayerId(player.id);
    if (!character) {
      await interaction.reply('❌ Bạn chưa có nhân vật! Sử dụng `/start` để bắt đầu.');
      return;
    }

    const race = await CharacterService.getRaceById(character.race_id);
    const allSkills = await SkillService.getAllSkillsByRace(character.id, character.race_id);

    // Tính progress bar cho KI
    const kiPercentage = Math.floor((character.ki / character.max_ki) * 10);
    const kiBar = '█'.repeat(kiPercentage) + '░'.repeat(10 - kiPercentage);

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`⚡ Kỹ năng ${race?.name}`)
      .setDescription(`**${character.name}** • Level **${character.level}**\n💙 KI: \`${character.ki}\`/\`${character.max_ki}\` ${kiBar}`)
      .setFooter({ text: 'Skills sẽ tự động sử dụng trong combat!' });

    if (allSkills.length > 0) {
      const learnedSkills = allSkills.filter(s => s.learned);
      const unlearnedSkills = allSkills.filter(s => !s.learned);

      // Kỹ năng đã học - rút gọn
      if (learnedSkills.length > 0) {
        let learnedText = '';
        for (const skill of learnedSkills) {
          const canUse = character.level >= skill.required_level;
          const icon = canUse ? '✅' : '🔒';
          
          // Rút gọn: chỉ hiển thị tên, level, KI cost và damage multiplier (nếu có)
          let skillInfo = `${icon} **${skill.name}** Lv.\`${skill.required_level}\` • KI:\`${skill.ki_cost}\``;
          
          if (skill.skill_type === 'attack' && skill.damage_multiplier) {
            skillInfo += ` • 💥\`${Math.round(skill.damage_multiplier * 100)}%\``;
          } else if (skill.skill_type === 'heal') {
            skillInfo += ` • 💚\`${skill.heal_amount}\``;
          } else if (skill.skill_type === 'buff') {
            skillInfo += ` • ⭐Buff`;
          }
          
          learnedText += skillInfo + '\n';
        }
        
        embed.addFields({
          name: `✅ Đã học (${learnedSkills.length})`,
          value: learnedText || 'Không có',
          inline: false
        });
      }

      // Kỹ năng chưa học - rút gọn hơn nữa
      if (unlearnedSkills.length > 0) {
        let unlearnedText = '';
        for (const skill of unlearnedSkills) {
          const levelsNeeded = skill.required_level - character.level;
          unlearnedText += `🔒 **${skill.name}** Lv.\`${skill.required_level}\``;
          if (levelsNeeded > 0) {
            unlearnedText += ` (còn \`${levelsNeeded}\`)`;
          }
          unlearnedText += '\n';
        }
        
        embed.addFields({
          name: `🔒 Chưa học (${unlearnedSkills.length})`,
          value: unlearnedText || 'Không có',
          inline: false
        });
      }
    } else {
      embed.addFields({
        name: '📝 Kỹ năng',
        value: '*Chưa có kỹ năng! Hãy lên cấp để mở khóa.*',
        inline: false
      });
    }

    await interaction.reply({ embeds: [embed] });
  }
};
