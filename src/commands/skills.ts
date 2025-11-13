import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../index';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';
import { SkillService } from '../services/SkillService';

function getSkillTypeName(type: string): string {
  const types: { [key: string]: string } = {
    'attack': 'Tấn công',
    'defense': 'Phòng thủ',
    'heal': 'Hồi phục',
    'buff': 'Tăng cường'
  };
  return types[type] || type;
}

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
      .setColor(0x9B59B6)
      .setTitle(`⚡ Kỹ năng ${race?.name}`)
      .setDescription(
        `**${character.name}** • Level **${character.level}**\n` +
        `╰─ 💙 KI: \`${character.ki}\`/\`${character.max_ki}\` ${kiBar}`
      )
      .setTimestamp();

    if (allSkills.length > 0) {
      const learnedSkills = allSkills.filter(s => s.learned);
      const unlearnedSkills = allSkills.filter(s => !s.learned);

      // Phần 1: Kỹ năng đã học
      if (learnedSkills.length > 0) {
        let learnedText = '';
        for (const skill of learnedSkills) {
          const canUse = character.level >= skill.required_level;
          learnedText += `${canUse ? '✅' : '🔒'} **${skill.name}** [Lv.${skill.required_level}] - KI: ${skill.ki_cost}\n`;
          
          if (skill.skill_type === 'attack') {
            const stats = [];
            stats.push(`💥${Math.round(skill.damage_multiplier * 100)}%`);
            if (skill.defense_break > 0) stats.push(`🛡️${Math.round(skill.defense_break * 100)}%`);
            if (skill.crit_bonus > 0) stats.push(`⚡${skill.crit_bonus}%`);
            if (skill.stun_chance > 0) stats.push(`💫${skill.stun_chance}%`);
            learnedText += `  ${stats.join(' • ')}\n`;
          } else if (skill.skill_type === 'heal') {
            learnedText += `  💚 Hồi: ${skill.heal_amount} HP\n`;
          } else if (skill.skill_type === 'buff') {
            learnedText += `  ⭐ Buff: Tăng DMG & Crit\n`;
          }
        }
        
        embed.addFields({
          name: `✅ Kỹ năng đã học (${learnedSkills.length})`,
          value: learnedText.substring(0, 1024) || '*Không có*',
          inline: false
        });
      }

      // Phần 2: Kỹ năng chưa học
      if (unlearnedSkills.length > 0) {
        let unlearnedText = '';
        for (const skill of unlearnedSkills) {
          const levelsNeeded = skill.required_level - character.level;
          unlearnedText += `🔒 **${skill.name}** [Lv.${skill.required_level}] ${levelsNeeded > 0 ? `- còn ${levelsNeeded}` : ''}\n`;
          
          if (skill.skill_type === 'attack') {
            const stats = [];
            stats.push(`💥${Math.round(skill.damage_multiplier * 100)}%`);
            if (skill.defense_break > 0) stats.push(`🛡️${Math.round(skill.defense_break * 100)}%`);
            if (skill.crit_bonus > 0) stats.push(`⚡${skill.crit_bonus}%`);
            if (skill.stun_chance > 0) stats.push(`💫${skill.stun_chance}%`);
            unlearnedText += `  ${stats.join(' • ')}\n`;
          } else if (skill.skill_type === 'heal') {
            unlearnedText += `  💚 Hồi: ${skill.heal_amount} HP\n`;
          } else if (skill.skill_type === 'buff') {
            unlearnedText += `  ⭐ Buff: Tăng DMG & Crit\n`;
          }
        }
        
        embed.addFields({
          name: `🔒 Kỹ năng chưa học (${unlearnedSkills.length})`,
          value: unlearnedText.substring(0, 1024) || '*Không có*',
          inline: false
        });
      }
    } else {
      embed.addFields({
        name: '📋 Danh sách kỹ năng',
        value: '*Chưa có kỹ năng! Hãy lên cấp để mở khóa.*',
        inline: false
      });
    }

    embed.setFooter({ text: 'Skills sẽ tự động sử dụng trong combat!' });

    await interaction.reply({ embeds: [embed] });
  }
};
