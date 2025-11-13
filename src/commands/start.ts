import { 
  SlashCommandBuilder, 
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType
} from 'discord.js';
import { Command } from '../index';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';

export const startCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Bắt đầu hành trình của bạn trong thế giới Ngọc Rồng!'),

  async execute(interaction) {
    await interaction.deferReply();

    const player = await PlayerService.getOrCreate(
      interaction.user.id,
      interaction.user.username
    );

    const existingChar = await CharacterService.findByPlayerId(player.id);

    if (existingChar) {
      await interaction.editReply({
        content: `Bạn đã có nhân vật **${existingChar.name}** rồi! Sử dụng /profile để xem thông tin.`,
      });
      return;
    }

    const races = await CharacterService.getAllRaces();

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('🐉 Chào mừng đến với thế giới Ngọc Rồng!')
      .setDescription('Hãy chọn chủng tộc và tạo tên cho nhân vật của bạn!')
      .addFields(
        races.map(race => ({
          name: `${race.name}`,
          value: `${race.description}\nHP: +${race.hp_bonus} | KI: +${race.ki_bonus} | ATK: +${race.attack_bonus} | DEF: +${race.defense_bonus}`,
          inline: false
        }))
      );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('race_select')
      .setPlaceholder('Chọn chủng tộc của bạn')
      .addOptions(
        races.map(race => ({
          label: race.name,
          value: race.id.toString(),
          description: race.description.substring(0, 100),
        }))
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(selectMenu);

    const response = await interaction.editReply({
      embeds: [embed],
      components: [row],
    });

    try {
      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000,
      });

      collector.on('collect', async (i: any) => {
        if (i.user.id !== interaction.user.id) {
          await i.reply({ content: 'Đây không phải lựa chọn của bạn!', ephemeral: true });
          return;
        }

        const raceId = parseInt(i.values[0]);
        const race = races.find(r => r.id === raceId);

        await i.update({
          content: `Bạn đã chọn chủng tộc **${race?.name}**!\n\nVui lòng sử dụng lệnh: \`/createchar <tên nhân vật>\` để hoàn tất việc tạo nhân vật.`,
          embeds: [],
          components: [],
        });

        // Store race selection temporarily (in real app, use a cache or database)
        // For now, we'll create a simple character with default name
        const defaultName = `${race?.name}_${interaction.user.username.substring(0, 10)}`;
        const character = await CharacterService.create(player.id, defaultName, raceId);

        await i.followUp({
          content: `✅ Đã tạo nhân vật **${character.name}** thành công!\nSử dụng /profile để xem thông tin chi tiết.`,
          ephemeral: false,
        });
      });

      collector.on('end', (collected: any) => {
        if (collected.size === 0) {
          interaction.editReply({
            content: 'Hết thời gian chọn! Vui lòng thử lại với /start',
            components: [],
          });
        }
      });
    } catch (error) {
      console.error('Error in start command:', error);
      await interaction.editReply({
        content: 'Đã xảy ra lỗi! Vui lòng thử lại.',
        components: [],
      });
    }
  },
};
