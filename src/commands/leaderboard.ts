import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../index';
import { XPService } from '../services/XPService';
import { formatCompactNumber } from '../utils/helpers';

export const leaderboardCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Xem bảng xếp hạng server')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Loại bảng xếp hạng')
        .setRequired(false)
        .addChoices(
          { name: '🏆 Tổng XP', value: 'xp' },
          { name: '⚔️ Chiến thắng', value: 'wins' },
          { name: '💀 Quái vật tiêu diệt', value: 'kills' },
          { name: '👹 Boss đánh bại', value: 'bosses' },
          { name: '💰 Vàng kiếm được', value: 'gold' }
        )
    ) as SlashCommandBuilder,

  async execute(interaction) {
    await interaction.deferReply();

    const leaderboardType = (interaction.options.getString('type') || 'xp') as string;
    const topPlayers = await XPService.getLeaderboard(10);

    if (topPlayers.length === 0) {
      await interaction.editReply({ content: '❌ Chưa có dữ liệu bảng xếp hạng!' });
      return;
    }

    let title = '🏆 BẢNG XẾP HẠNG SERVER';
    let description = '';
    let sortField: keyof typeof topPlayers[0]['stats'] | 'total_xp' = 'total_xp';

    switch (leaderboardType) {
      case 'xp':
        title = '🏆 TOP TỔNG XP';
        sortField = 'total_xp';
        break;
      case 'wins':
        title = '⚔️ TOP CHIẾN THẮNG';
        sortField = 'total_battles_won';
        topPlayers.sort((a, b) => b.stats.total_battles_won - a.stats.total_battles_won);
        break;
      case 'kills':
        title = '💀 TOP QUÁI VẬT TIÊU DIỆT';
        sortField = 'total_monsters_killed';
        topPlayers.sort((a, b) => b.stats.total_monsters_killed - a.stats.total_monsters_killed);
        break;
      case 'bosses':
        title = '👹 TOP BOSS ĐÁNH BẠI';
        sortField = 'total_bosses_defeated';
        topPlayers.sort((a, b) => b.stats.total_bosses_defeated - a.stats.total_bosses_defeated);
        break;
      case 'gold':
        title = '💰 TOP VÀNG KIẾM ĐƯỢC';
        sortField = 'total_gold_earned';
        topPlayers.sort((a, b) => Number(b.stats.total_gold_earned) - Number(a.stats.total_gold_earned));
        break;
    }

    const medals = ['🥇', '🥈', '🥉'];
    
    description = topPlayers
      .map((char, index) => {
        const medal = index < 3 ? medals[index] : `\`#${index + 1}\``;
        let value: string | number = '';

        switch (sortField) {
          case 'total_xp':
            value = formatCompactNumber(char.total_xp);
            break;
          case 'total_battles_won':
            value = char.stats.total_battles_won.toLocaleString();
            break;
          case 'total_monsters_killed':
            value = char.stats.total_monsters_killed.toLocaleString();
            break;
          case 'total_bosses_defeated':
            value = char.stats.total_bosses_defeated.toLocaleString();
            break;
          case 'total_gold_earned':
            value = formatCompactNumber(Number(char.stats.total_gold_earned));
            break;
        }

        const levelDisplay = `Lv.${char.level}`;

        return `${medal} **${char.name}** • ${levelDisplay}\n╰─ ${getSortIcon(sortField)} **${value}**`;
      })
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: 'Cập nhật realtime' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

function getSortIcon(sortField: string): string {
  const icons: Record<string, string> = {
    total_xp: '✨',
    total_battles_won: '⚔️',
    total_monsters_killed: '💀',
    total_bosses_defeated: '👹',
    total_gold_earned: '💰',
  };
  return icons[sortField] || '📊';
}
