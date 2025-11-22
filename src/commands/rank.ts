import { SlashCommandBuilder, EmbedBuilder, User } from 'discord.js';
import { Command } from '../index';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';
import { XPService } from '../services/XPService';
import { formatCompactNumber } from '../utils/helpers';

export const rankCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Xem rank card và thống kê của bạn hoặc người khác')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Người chơi muốn xem (để trống để xem của bạn)')
        .setRequired(false)
    ) as SlashCommandBuilder,

  async execute(interaction) {
    await interaction.deferReply();

    const targetUser = (interaction.options.getUser('user') || interaction.user) as User;
    const player = await PlayerService.findByDiscordId(targetUser.id);

    if (!player) {
      await interaction.editReply({
        content: `❌ ${targetUser.id === interaction.user.id ? 'Bạn' : 'Người chơi này'} chưa có nhân vật! Sử dụng \`/start\` để bắt đầu.`,
      });
      return;
    }

    const character = await CharacterService.findByPlayerId(player.id);

    if (!character) {
      await interaction.editReply({
        content: `❌ ${targetUser.id === interaction.user.id ? 'Bạn' : 'Người chơi này'} chưa có nhân vật!`,
      });
      return;
    }

    // Lấy thông tin đầy đủ với rank và stats
    const charWithRank = await XPService.getCharacterWithRank(character.id);

    if (!charWithRank) {
      await interaction.editReply({ content: '❌ Không thể tải thông tin rank!' });
      return;
    }

    const race = await CharacterService.getRaceById(character.race_id);
    const nextLevelXP = XPService.calculateRequiredXP(charWithRank.level);
    const currentXP = charWithRank.experience;
    
    // Progress bars
    const hpPercentage = Math.floor((charWithRank.hp / charWithRank.max_hp) * 20);
    const hpBar = '█'.repeat(hpPercentage) + '░'.repeat(20 - hpPercentage);
    
    const kiPercentage = Math.floor((charWithRank.ki / charWithRank.max_ki) * 20);
    const kiBar = '█'.repeat(kiPercentage) + '░'.repeat(20 - kiPercentage);
    
    const xpPercentage = Math.floor((currentXP / nextLevelXP) * 20);
    const xpBar = '█'.repeat(xpPercentage) + '░'.repeat(20 - xpPercentage);

    // Win rate
    const totalBattles = charWithRank.stats.total_battles_won + charWithRank.stats.total_battles_lost;
    const winRate = totalBattles > 0 
      ? ((charWithRank.stats.total_battles_won / totalBattles) * 100).toFixed(1)
      : '0.0';

    const embed = new EmbedBuilder()
      .setColor(charWithRank.rank.color as any)
      .setAuthor({
        name: `${targetUser.username}`,
        iconURL: targetUser.displayAvatarURL(),
      })
      .setTitle(`${charWithRank.rank.icon} ${charWithRank.rank.name.toUpperCase()}`)
      .setDescription(
        `╭─ **${charWithRank.name}** • **${race?.name}**\n` +
        `├─ Level **${charWithRank.level}** • 🏆 Hạng **#${charWithRank.server_rank}**\n` +
        `├─ 💰 **${formatCompactNumber(charWithRank.gold)}** vàng\n` +
        `╰─ 📍 ${charWithRank.location}`
      )
      .addFields(
        {
          name: '❤️ HP',
          value: `\`${charWithRank.hp.toLocaleString()}\`/\`${charWithRank.max_hp.toLocaleString()}\`\n${hpBar}`,
          inline: false,
        },
        {
          name: '💙 KI',
          value: `\`${charWithRank.ki.toLocaleString()}\`/\`${charWithRank.max_ki.toLocaleString()}\`\n${kiBar}`,
          inline: false,
        },
        {
          name: '✨ EXP',
          value: `\`${currentXP.toLocaleString()}\`/\`${nextLevelXP.toLocaleString()}\` (**${Math.floor((currentXP / nextLevelXP) * 100)}%**)\n${xpBar}`,
          inline: false,
        },
        {
          name: '⚔️ Combat Stats',
          value: 
            `╭─ ⚔️ ATK: **${charWithRank.attack.toLocaleString()}** • 🛡️ DEF: **${charWithRank.defense.toLocaleString()}**\n` +
            `├─ ⚡ SPD: **${charWithRank.speed.toLocaleString()}**\n` +
            `├─ 💥 Crit: **${charWithRank.critical_chance}%** (x**${charWithRank.critical_damage}**)\n` +
            `╰─ 💨 Dodge: **${charWithRank.dodge_chance}%**`,
          inline: true,
        },
        {
          name: '📊 Battle Record',
          value:
            `╭─ ✅ Thắng: **${charWithRank.stats.total_battles_won.toLocaleString()}**\n` +
            `├─ ❌ Thua: **${charWithRank.stats.total_battles_lost.toLocaleString()}**\n` +
            `├─ 📈 Tỷ lệ thắng: **${winRate}%**\n` +
            `╰─ 🔥 Chuỗi thắng: **${charWithRank.stats.current_win_streak}** (Max: **${charWithRank.stats.longest_win_streak}**)`,
          inline: true,
        },
        {
          name: '🎯 Achievements',
          value:
            `╭─ 💀 Quái vật: **${charWithRank.stats.total_monsters_killed.toLocaleString()}**\n` +
            `├─ 👹 Boss: **${charWithRank.stats.total_bosses_defeated.toLocaleString()}**\n` +
            `├─ 📜 Nhiệm vụ: **${charWithRank.stats.total_quests_completed.toLocaleString()}**\n` +
            `├─ 💸 Vàng kiếm: **${formatCompactNumber(charWithRank.stats.total_gold_earned)}**\n` +
            `╰─ 💥 Sát thương cao nhất: **${formatCompactNumber(charWithRank.stats.highest_damage_dealt)}**`,
          inline: false,
        },
        {
          name: '📈 Total XP Earned',
          value: `**${formatCompactNumber(charWithRank.total_xp)}** XP`,
          inline: true,
        },
        {
          name: '⏰ Thời gian chơi',
          value: `Tham gia từ <t:${Math.floor(new Date(charWithRank.created_at).getTime() / 1000)}:R>`,
          inline: true,
        }
      )
      .setFooter({ 
        text: `ID: ${charWithRank.id} • Rank Card`,
        iconURL: targetUser.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
