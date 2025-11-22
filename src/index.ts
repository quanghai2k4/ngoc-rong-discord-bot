import { 
  Client, 
  GatewayIntentBits, 
  Collection,
  REST,
  Routes,
  SlashCommandBuilder
} from 'discord.js';
import dotenv from 'dotenv';
import { pool } from './database/db';
import { gameDataCache } from './services/GameDataCache';
import { redisService } from './services/RedisService';
import { jobQueueService } from './services/JobQueueService';
import { jobWorkerService } from './services/JobWorkerService';
import { logger } from './utils/logger';
import { validateEnv } from './utils/validateEnv';

dotenv.config();

// Validate environment variables trước khi khởi động bot
validateEnv();

// Import commands
import { startCommand } from './commands/start';
import { profileCommand } from './commands/profile';
import { huntCommand } from './commands/hunt';
import { bossCommand } from './commands/boss';
import { inventoryCommand } from './commands/inventory';
import { skillsCommand } from './commands/skills';
import { learnCommand } from './commands/learn';
import { equipCommand } from './commands/equip';
import { unequipCommand } from './commands/unequip';
import { useCommand } from './commands/use';
import { shopCommand } from './commands/shop';
import { buyCommand } from './commands/buy';
import { sellCommand } from './commands/sell';
import { dailyCommand } from './commands/daily';
import { adminCommand } from './commands/admin';
import { rankCommand } from './commands/rank';
import { leaderboardCommand } from './commands/leaderboard';

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: any) => Promise<void>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = new Collection<string, Command>();

// Register commands
commands.set('start', startCommand);
commands.set('profile', profileCommand);
commands.set('hunt', huntCommand);
commands.set('boss', bossCommand);
commands.set('inventory', inventoryCommand);
commands.set('skills', skillsCommand);
commands.set('learn', learnCommand);
commands.set('equip', equipCommand);
commands.set('unequip', unequipCommand);
commands.set('use', useCommand);
commands.set('shop', shopCommand);
commands.set('buy', buyCommand);
commands.set('sell', sellCommand);
commands.set('daily', dailyCommand);
commands.set('admin', adminCommand);
commands.set('rank', rankCommand);
commands.set('leaderboard', leaderboardCommand);

client.once('ready', async () => {
  logger.success(`Bot đã sẵn sàng! Đăng nhập với tên ${client.user?.tag}`);
  logger.system(`🚀 Bot started successfully - ${client.user?.tag}`, 'success');
  
  // Check Redis connection
  const redisHealthy = await redisService.ping();
  if (redisHealthy) {
    logger.success('Redis connection healthy');
  } else {
    logger.warn('Redis connection failed - bot sẽ chạy nhưng không có caching/rate limiting');
  }
  
  // Initialize game data cache
  try {
    await gameDataCache.initialize();
  } catch (error) {
    logger.error('Không thể load game data cache! Bot sẽ tắt.', error);
    process.exit(1);
  }
  
  // Initialize job queue and workers
  try {
    // Start worker processes
    await jobWorkerService.start();
    logger.success('Job workers started successfully');
    
    // Schedule recurring jobs
    await jobQueueService.scheduleDailyQuestReset();
    await jobQueueService.scheduleLeaderboardUpdate();
    await jobQueueService.scheduleBattleLogCleanup();
    logger.success('Recurring jobs scheduled successfully');
    
    // Warm up cache on startup
    await jobQueueService.addCacheWarmupJob();
    logger.info('Cache warmup job added to queue');
  } catch (error) {
    logger.warn('Job queue initialization failed - scheduled tasks will not run', error);
  }
  
  // Register slash commands
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
  
  const commandsData = Array.from(commands.values()).map(cmd => cmd.data.toJSON());
  
  try {
    logger.info('Đang đăng ký slash commands...');
    logger.info(`Tổng số commands: ${commandsData.length}`);
    logger.info(`Commands: ${commandsData.map(c => c.name).join(', ')}`);
    
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
      { body: commandsData },
    );
    
    logger.success('Đã đăng ký slash commands thành công!');
  } catch (error) {
    logger.error('Lỗi khi đăng ký commands', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Check rate limit
  const { checkRateLimit } = await import('./middleware/validate');
  const rateLimitCheck = await checkRateLimit(interaction.user.id);
  
  if (!rateLimitCheck.allowed) {
    await interaction.reply({
      content: rateLimitCheck.message || '⏱️ Rate limited',
      ephemeral: true,
    });
    return;
  }

  const command = commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`Không tìm thấy command: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Lỗi khi thực thi command ${interaction.commandName}`, error);
    
    const errorMessage = { 
      content: '❌ Đã xảy ra lỗi khi thực hiện lệnh này!', 
      ephemeral: true 
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// Prefix commands handler
const PREFIX = 'z';

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  try {
    // Import prefix command handlers
    const { handlePrefixCommand } = await import('./handlers/prefixHandler');
    await handlePrefixCommand(message, commandName, args);
  } catch (error) {
    logger.error(`Lỗi khi thực thi prefix command ${commandName}`, error);
    await message.reply('❌ Đã xảy ra lỗi khi thực hiện lệnh này!');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Đang tắt bot...');
  logger.system('🛑 Bot is shutting down...', 'warning');
  
  // Stop job workers
  try {
    await jobWorkerService.stop();
    logger.success('Job workers stopped');
  } catch (error) {
    logger.error('Error stopping job workers', error);
  }
  
  // Close job queue
  try {
    await jobQueueService.close();
    logger.success('Job queue closed');
  } catch (error) {
    logger.error('Error closing job queue', error);
  }
  
  // Close Redis connection
  try {
    await redisService.disconnect();
    logger.success('Redis disconnected');
  } catch (error) {
    logger.error('Error disconnecting Redis', error);
  }
  
  // Close database pool
  await pool.end();
  logger.success('Database connection closed');
  
  // Destroy Discord client
  client.destroy();
  logger.success('Bot shutdown complete');
  logger.system('✅ Bot stopped gracefully', 'success');
  
  // Wait a bit for webhook to send
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM signal');
  process.emit('SIGINT');
});

client.login(process.env.DISCORD_TOKEN);
