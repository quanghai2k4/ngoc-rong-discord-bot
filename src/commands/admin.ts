import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { jobQueueService } from '../services/JobQueueService';
import { logger } from '../utils/logger';

export const adminCommand = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('[Admin] Quản lý hệ thống')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('jobs')
        .setDescription('Xem thống kê job queue')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('warmup-cache')
        .setDescription('Làm nóng cache thủ công')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset-daily')
        .setDescription('Reset daily quests thủ công')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('update-leaderboard')
        .setDescription('Cập nhật leaderboard thủ công')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('cleanup-logs')
        .setDescription('Dọn dẹp battle logs thủ công')
    ) as SlashCommandBuilder,

  async execute(interaction: any) {
    const subcommand = interaction.options.getSubcommand();

    try {
      switch (subcommand) {
        case 'jobs': {
          const stats = await jobQueueService.getJobStats();
          
          const embed = new EmbedBuilder()
            .setTitle('📊 Job Queue Statistics')
            .setColor(0x00AE86)
            .addFields(
              { 
                name: '⏰ Daily Quest Reset', 
                value: `Waiting: ${stats.dailyQuestReset.waiting}\nActive: ${stats.dailyQuestReset.active}\nCompleted: ${stats.dailyQuestReset.completed}\nFailed: ${stats.dailyQuestReset.failed}`,
                inline: true
              },
              { 
                name: '🏆 Leaderboard Update', 
                value: `Waiting: ${stats.leaderboardUpdate.waiting}\nActive: ${stats.leaderboardUpdate.active}\nCompleted: ${stats.leaderboardUpdate.completed}\nFailed: ${stats.leaderboardUpdate.failed}`,
                inline: true
              },
              { 
                name: '🧹 Battle Log Cleanup', 
                value: `Waiting: ${stats.battleLogCleanup.waiting}\nActive: ${stats.battleLogCleanup.active}\nCompleted: ${stats.battleLogCleanup.completed}\nFailed: ${stats.battleLogCleanup.failed}`,
                inline: true
              },
              { 
                name: '🔥 Cache Warmup', 
                value: `Waiting: ${stats.cacheWarmup.waiting}\nActive: ${stats.cacheWarmup.active}\nCompleted: ${stats.cacheWarmup.completed}\nFailed: ${stats.cacheWarmup.failed}`,
                inline: true
              }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed], ephemeral: true });
          break;
        }

        case 'warmup-cache': {
          await jobQueueService.addCacheWarmupJob();
          await interaction.reply({ 
            content: '✅ Cache warmup job đã được thêm vào queue!', 
            ephemeral: true 
          });
          logger.info(`Cache warmup triggered by ${interaction.user.tag}`);
          break;
        }

        case 'reset-daily': {
          await jobQueueService.addDailyQuestResetJob();
          await interaction.reply({ 
            content: '✅ Daily quest reset job đã được thêm vào queue!', 
            ephemeral: true 
          });
          logger.info(`Daily quest reset triggered by ${interaction.user.tag}`);
          break;
        }

        case 'update-leaderboard': {
          await jobQueueService.addLeaderboardUpdateJob();
          await interaction.reply({ 
            content: '✅ Leaderboard update job đã được thêm vào queue!', 
            ephemeral: true 
          });
          logger.info(`Leaderboard update triggered by ${interaction.user.tag}`);
          break;
        }

        case 'cleanup-logs': {
          await jobQueueService.addBattleLogCleanupJob();
          await interaction.reply({ 
            content: '✅ Battle log cleanup job đã được thêm vào queue!', 
            ephemeral: true 
          });
          logger.info(`Battle log cleanup triggered by ${interaction.user.tag}`);
          break;
        }

        default:
          await interaction.reply({ 
            content: '❌ Subcommand không hợp lệ!', 
            ephemeral: true 
          });
      }
    } catch (error) {
      logger.error('Error in admin command', error);
      await interaction.reply({ 
        content: '❌ Đã xảy ra lỗi khi thực hiện lệnh admin!', 
        ephemeral: true 
      });
    }
  },
};
