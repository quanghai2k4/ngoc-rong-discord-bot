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

    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle(`⚡ Kỹ năng của ${character.name}`)
      .setDescription(`**Chủng tộc:** ${race?.name}\n**Level:** ${character.level}\n**KI hiện tại:** \`${character.ki}\`/\`${character.max_ki}\``)
      .setTimestamp();

    if (allSkills.length > 0) {
      const learnedSkills = allSkills.filter(s => s.learned);
      const unlearnedSkills = allSkills.filter(s => !s.learned);

      // Phần 1: Kỹ năng đã học
      if (learnedSkills.length > 0) {
        let learnedText = '';
        for (const skill of learnedSkills) {
          const canUse = character.level >= skill.required_level;
          learnedText += `${canUse ? '✅' : '🔒'} **${skill.name}** [Lv.${skill.required_level}] - KI: \`${skill.ki_cost}\`\n`;
          learnedText += `  ${skill.description}\n`;
          
          if (skill.skill_type === 'attack') {
            learnedText += `  *Sát thương:* **\`${(skill.damage_multiplier * 100)}%\`** ATK`;
            if (skill.defense_break > 0) learnedText += ` | *Phá giáp:* \`${(skill.defense_break * 100)}%\``;
            if (skill.crit_bonus > 0) learnedText += ` | *Crit+:* \`${skill.crit_bonus}%\``;
            if (skill.stun_chance > 0) learnedText += ` | *Choáng:* \`${skill.stun_chance}%\``;
            learnedText += '\n\n';
          } else if (skill.skill_type === 'heal') {
            learnedText += `  *Hồi phục:* **\`${skill.heal_amount}\`** HP\n\n`;
          } else if (skill.skill_type === 'buff') {
            learnedText += `  *Buff:* Tăng sát thương và tỉ lệ chí mạng\n\n`;
          }
        }
        
        embed.addFields({
          name: `✅ Kỹ năng đã học (${learnedSkills.length})`,
          value: learnedText,
          inline: false
        });
      }

      // Phần 2: Kỹ năng chưa học
      if (unlearnedSkills.length > 0) {
        let unlearnedText = '';
        for (const skill of unlearnedSkills) {
          unlearnedText += `🔒 **${skill.name}** [Lv.${skill.required_level}] - KI: \`${skill.ki_cost}\`\n`;
          unlearnedText += `  ${skill.description}\n`;
          
          if (skill.skill_type === 'attack') {
            unlearnedText += `  *Sát thương:* **\`${(skill.damage_multiplier * 100)}%\`** ATK`;
            if (skill.defense_break > 0) unlearnedText += ` | *Phá giáp:* \`${(skill.defense_break * 100)}%\``;
            if (skill.crit_bonus > 0) unlearnedText += ` | *Crit+:* \`${skill.crit_bonus}%\``;
            if (skill.stun_chance > 0) unlearnedText += ` | *Choáng:* \`${skill.stun_chance}%\``;
            unlearnedText += '\n\n';
          } else if (skill.skill_type === 'heal') {
            unlearnedText += `  *Hồi phục:* **\`${skill.heal_amount}\`** HP\n\n`;
          } else if (skill.skill_type === 'buff') {
            unlearnedText += `  *Buff:* Tăng sát thương và tỉ lệ chí mạng\n\n`;
          }
        }
        
        embed.addFields({
          name: `🔒 Kỹ năng chưa học (${unlearnedSkills.length})`,
          value: unlearnedText,
          inline: false
        });
      }
    } else {
      embed.addFields({
        name: '🎯 Danh sách kỹ năng',
        value: '*Chưa có kỹ năng! Hãy lên cấp để mở khóa.*',
        inline: false
      });
    }

    embed.setFooter({ text: 'Skills sẽ tự động sử dụng trong combat!' });

    await interaction.reply({ embeds: [embed] });
  }
};
