import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../index';
import { CharacterService } from '../services/CharacterService';
import { SkillService } from '../services/SkillService';
import { validateCharacter } from '../middleware/validate';
import { createSkillsEmbed, createErrorEmbed } from '../utils/embeds';

export const skillsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('skills')
    .setDescription('Xem danh sách kỹ năng theo chủng tộc') as SlashCommandBuilder,

  async execute(interaction) {
    try {
      const { character } = await validateCharacter(interaction);

      const race = await CharacterService.getRaceById(character.race_id);
      const allSkills = await SkillService.getAllSkillsByRace(character.id, character.race_id);

      const skillsEmbed = createSkillsEmbed(character, race?.name || 'Unknown', allSkills);
      await interaction.reply({ embeds: [skillsEmbed] });
    } catch (error: any) {
      console.error('[skills.ts] Error:', error);
      const errorMessage = error.message || '❌ Có lỗi xảy ra!';
      await interaction.reply({ embeds: [createErrorEmbed(errorMessage)] });
    }
  }
};
