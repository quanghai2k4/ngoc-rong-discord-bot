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

dotenv.config();

// Import commands
import { startCommand } from './commands/start';
import { profileCommand } from './commands/profile';
import { huntCommand } from './commands/hunt';
import { inventoryCommand } from './commands/inventory';
import { skillsCommand } from './commands/skills';

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
commands.set('inventory', inventoryCommand);
commands.set('skills', skillsCommand);

client.once('ready', async () => {
  console.log(`Bot đã sẵn sàng! Đăng nhập với tên ${client.user?.tag}`);
  
  // Register slash commands
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
  
  const commandsData = Array.from(commands.values()).map(cmd => cmd.data.toJSON());
  
  try {
    console.log('Đang đăng ký slash commands...');
    
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
      { body: commandsData },
    );
    
    console.log('Đã đăng ký slash commands thành công!');
  } catch (error) {
    console.error('Lỗi khi đăng ký commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) {
    console.error(`Không tìm thấy command: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Lỗi khi thực thi command:', error);
    
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
    console.error('Lỗi khi thực thi prefix command:', error);
    await message.reply('❌ Đã xảy ra lỗi khi thực hiện lệnh này!');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Đang tắt bot...');
  await pool.end();
  client.destroy();
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
