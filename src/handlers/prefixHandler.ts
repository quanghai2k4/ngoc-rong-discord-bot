import { Message, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';
import { MonsterService } from '../services/MonsterService';
import { BattleService } from '../services/BattleService';
import { SkillService } from '../services/SkillService';
import { EquipmentService } from '../services/EquipmentService';
import { ShopService } from '../services/ShopService';
import { DailyQuestService } from '../services/DailyQuestService';
import { query } from '../database/db';
import { validateCharacterPrefix, validateBattleReadyPrefix, checkRateLimit, checkStrictRateLimit } from '../middleware/validate';
import { createBattleStartEmbed, createBattleResultEmbed, createLevelUpEmbed, createErrorEmbed, createProfileEmbed, createBossMenuEmbed, createInventoryEmbed, createSkillsEmbed, createSuccessEmbed, createQuestRewardsEmbed } from '../utils/embeds';
import { createBattleLog, createHuntSummary, formatBattleRound } from '../utils/battleDisplay';
import {
  createBattleLiveEmbed,
  createBattleResultEmbedV2,
  getBattleStateFromRounds,
  extractBattleHighlights,
  calculateBattleStats
} from '../utils/bossBattleV2';
import { getRandomLocation, getRequiredExp, isBossOnlyLocation } from '../config';
import { createProgressBar, BOX } from '../utils/helpers';
import { logger } from '../utils/logger';

export async function handlePrefixCommand(
  message: Message,
  commandName: string,
  args: string[]
) {
  // Check rate limit trước khi execute command
  const rateLimitCheck = await checkRateLimit(message.author.id);
  if (!rateLimitCheck.allowed) {
    await message.reply(rateLimitCheck.message || '⏱️ Rate limited');
    return;
  }
  
  switch (commandName) {
    case 'start':
    case 'batdau':
      await handleStart(message);
      break;
    
    case 'profile':
    case 'info':
    case 'tt':
    case 'thongtin':
      await handleProfile(message);
      break;
    
    case 'hunt':
    case 'san':
    case 'danhquai':
      await handleHunt(message);
      break;
    
    case 'boss':
    case 'thachdau':
      await handleBoss(message);
      break;
    
    case 'inventory':
    case 'inv':
    case 'tui':
    case 'tuido':
      await handleInventory(message);
      break;
    
    case 'skills':
    case 'skill':
    case 'kynang':
    case 'kn':
      await handleSkills(message);
      break;
    
    case 'equip':
    case 'trangbi':
    case 'tb':
      await handleEquip(message, args);
      break;
    
    case 'unequip':
    case 'gotrangbi':
    case 'go':
      await handleUnequip(message, args);
      break;
    
    case 'use':
    case 'dung':
    case 'sudung':
      await handleUse(message, args);
      break;
    
    case 'shop':
    case 'cuahang':
    case 'ch':
      await handleShop(message, args);
      break;
    
    case 'buy':
    case 'mua':
      await handleBuy(message, args);
      break;
    
    case 'sell':
    case 'ban':
      await handleSell(message, args);
      break;
    
    case 'daily':
    case 'nhiemvu':
    case 'nv':
      await handleDaily(message);
      break;
    
    case 'help':
    case 'h':
    case 'trogiup':
      await handleHelp(message);
      break;
    
    default:
      await message.reply(`❌ Không tìm thấy lệnh \`${commandName}\`. Sử dụng \`zhelp\` để xem danh sách lệnh.`);
  }
}

async function handleStart(message: Message) {
  const player = await PlayerService.getOrCreate(
    message.author.id,
    message.author.username
  );

  const existingChar = await CharacterService.findByPlayerId(player.id);

  if (existingChar) {
    await message.reply(`❌ Bạn đã có nhân vật **${existingChar.name}** rồi! Sử dụng \`zprofile\` để xem thông tin.`);
    return;
  }

  const races = await CharacterService.getAllRaces();

  const startEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('🐉 Chào mừng đến với thế giới Ngọc Rồng!')
    .setDescription('**Chọn chủng tộc của bạn:**')
    .addFields(
      races.map((race, index) => ({
        name: `${index + 1}. ${race.name}`,
        value: `*${race.description}*\n\`HP: +${race.hp_bonus}\` | \`KI: +${race.ki_bonus}\` | \`ATK: +${race.attack_bonus}\` | \`DEF: +${race.defense_bonus}\``,
        inline: false
      }))
    )
    .setFooter({ text: 'Trả lời bằng số 1, 2, hoặc 3 để chọn chủng tộc!' });

  await message.reply({ embeds: [startEmbed] });

  const filter = (m: Message) => {
    return m.author.id === message.author.id && ['1', '2', '3'].includes(m.content);
  };

  try {
    if (!message.channel || !('awaitMessages' in message.channel)) {
      await message.reply('❌ Lệnh này không thể sử dụng trong kênh này!');
      return;
    }

    const collected = await message.channel.awaitMessages({
      filter,
      max: 1,
      time: 60000,
      errors: ['time']
    });

    const response = collected.first();
    if (!response) return;

    const raceIndex = parseInt(response.content) - 1;
    const selectedRace = races[raceIndex];

    if (!selectedRace) {
      await message.reply('❌ Lựa chọn không hợp lệ!');
      return;
    }

    const defaultName = message.author.username;
    const character = await CharacterService.create(player.id, defaultName, selectedRace.id);

    const successEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎉 Tạo nhân vật thành công!')
      .setDescription(`**${character.name}** (${selectedRace.name})`)
      .addFields(
        {
          name: '📊 Chỉ số ban đầu',
          value: `❤️ HP: **\`${character.max_hp}\`** • 💙 KI: **\`${character.max_ki}\`** • ⚡ Speed: **\`${character.speed}\`**\n⚔️ Attack: **\`${character.attack}\`** • 🛡️ Defense: **\`${character.defense}\`**`,
          inline: false
        },
        {
          name: '📍 Vị trí',
          value: `**${character.location}**`,
          inline: false
        }
      )
      .setFooter({ text: 'Sử dụng zprofile để xem thông tin chi tiết!' });

    await message.reply({ embeds: [successEmbed] });

  } catch (error) {
    await message.reply('⏰ Hết thời gian chọn! Vui lòng thử lại với \`zstart\`');
  }
}

async function handleProfile(message: Message) {
  try {
    const { character } = await validateCharacterPrefix(message);

    const race = await CharacterService.getRaceById(character.race_id);
    const expNeeded = getRequiredExp(character.level);

    const profileEmbed = createProfileEmbed(character, race?.name || 'Unknown', expNeeded);
    await message.reply({ embeds: [profileEmbed] });
  } catch (error: any) {
    console.error('[handleProfile] Error:', error);
    const errorMessage = error.message || '❌ Có lỗi xảy ra!';
    await message.reply({ embeds: [createErrorEmbed(errorMessage)] });
  }
}

async function handleHunt(message: Message) {
  try {
    // Validate character và HP
    const { character } = await validateBattleReadyPrefix(message);

    // Random vị trí mới mỗi lần hunt
    const newLocation = getRandomLocation();
    await CharacterService.updateLocation(character.id, newLocation);

    // Kiểm tra xem có phải khu vực boss-only không
    const isBossArea = isBossOnlyLocation(newLocation);
    
    // Spawn monsters dựa trên level của nhân vật và loại khu vực
    const monsters = await MonsterService.spawnMonsters(character.level, isBossArea);

    if (monsters.length === 0) {
      if (isBossArea) {
        await message.reply({ embeds: [createErrorEmbed(`❌ Không có Boss nào phù hợp với level của bạn tại **${newLocation}**!\n💡 *Hãy lên level cao hơn để thách đấu Boss.*`)] });
      } else {
        await message.reply({ embeds: [createErrorEmbed('❌ Không tìm thấy quái vật nào phù hợp với level của bạn!')] });
      }
      return;
    }

    // Hiển thị battle start
    const startEmbed = createBattleStartEmbed(newLocation, monsters, isBossArea);
    const battleMessage = await message.reply({ embeds: [startEmbed] });

    setTimeout(async () => {
      try {
        const result = await BattleService.battle(character, monsters);

        // Tạo battle log và summary
        const hasBoss = monsters.some(m => m.is_boss || m.is_super);
        const battleLog = createBattleLog(result.rounds, character, monsters);
        
        // Nếu là quái thường, thêm summary vào description
        let summaryDescription = '';
        if (!hasBoss) {
          // Lấy HP cuối cùng từ round cuối
          const finalRound = result.rounds[result.rounds.length - 1];
          summaryDescription = createHuntSummary(
            result.won, 
            monsters, 
            result.rounds.length,
            finalRound?.characterHp,
            character.max_hp,
            finalRound?.monsterStates
          );
        }

        // Tạo result embed
        const resultEmbed = createBattleResultEmbed(
          result.won,
          battleLog,
          result.expGained,
          result.goldGained,
          result.itemsDropped,
          result.rounds.length,
          result.monstersDefeated,
          monsters.length
        );

        // Thêm summary cho quái thường
        if (summaryDescription) {
          resultEmbed.setDescription(summaryDescription);
        }

        await battleMessage.edit({ embeds: [resultEmbed] });

        // Gửi quest rewards riêng biệt nếu có
        if (result.won && result.questRewards.length > 0) {
          const questRewardsEmbed = createQuestRewardsEmbed(result.questRewards);
          await message.reply({ embeds: [questRewardsEmbed] });
        }

        // Gửi level up notification riêng biệt
        if (result.won && result.leveledUp && result.newLevel) {
          const levelUpEmbed = createLevelUpEmbed(result.newLevel);
          await message.reply({ embeds: [levelUpEmbed] });
        }
      } catch (error) {
        console.error('[handleHunt] Battle error:', error);
        await battleMessage.edit({ embeds: [createErrorEmbed('❌ Có lỗi xảy ra trong trận chiến!')] });
      }
    }, 2000);
  } catch (error: any) {
    console.error('[handleHunt] Error:', error);
    const errorMessage = error.message || '❌ Có lỗi xảy ra!';
    await message.reply({ embeds: [createErrorEmbed(errorMessage)] });
  }
}

async function handleBoss(message: Message) {
  try {
    // Check strict rate limit cho boss (expensive command)
    const strictCheck = await checkStrictRateLimit(message.author.id, 'boss');
    if (!strictCheck.allowed) {
      await message.reply({ embeds: [createErrorEmbed(strictCheck.message || '⏱️ Rate limited')] });
      return;
    }
    
    // Validate character và HP
    const { character } = await validateBattleReadyPrefix(message);

    // Lấy tất cả boss từ database
    const bossesResult = await query(
      'SELECT id, name, min_level, max_level, hp, attack, defense, speed, experience_reward, gold_reward, critical_chance, critical_damage FROM monsters WHERE is_boss = true ORDER BY min_level'
    );
    const bosses = bossesResult.rows;

    if (bosses.length === 0) {
      await message.reply({ embeds: [createErrorEmbed('❌ Không có Boss nào trong hệ thống!')] });
      return;
    }

    // Tạo select menu với tất cả boss
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('boss_select')
      .setPlaceholder('👑 Chọn Boss để thách đấu...')
      .addOptions(
        bosses.map((boss: any) => ({
          label: `${boss.name} (Lv.${boss.min_level}-${boss.max_level})`,
          description: `HP: ${boss.hp} • ATK: ${boss.attack} • DEF: ${boss.defense} • SPD: ${boss.speed}`,
          value: boss.id.toString()
        }))
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    const menuEmbed = createBossMenuEmbed(character);

    const response = await message.reply({ 
      embeds: [menuEmbed], 
      components: [row] 
    });

    // Đợi user chọn boss
    try {
      const confirmation = await response.awaitMessageComponent({ 
        componentType: ComponentType.StringSelect,
        time: 60000,
        filter: (i) => i.user.id === message.author.id
      });

      // Defer interaction ngay lập tức để tránh timeout
      await confirmation.deferUpdate();

      const selectedBossId = parseInt(confirmation.values[0]);
      const selectedBossData = bosses.find((b: any) => b.id === selectedBossId);

      if (!selectedBossData) {
        await response.edit({ 
          embeds: [createErrorEmbed('❌ Boss không tồn tại!')], 
          components: [] 
        });
        return;
      }

      // Random vị trí
      const newLocation = getRandomLocation();
      await CharacterService.updateLocation(character.id, newLocation);

      // Spawn boss với level ngẫu nhiên
      const bossLevel = Math.floor(
        Math.random() * (selectedBossData.max_level - selectedBossData.min_level + 1)
      ) + selectedBossData.min_level;

      const boss = {
        id: selectedBossData.id,
        name: selectedBossData.name,
        level: bossLevel,
        hp: selectedBossData.hp + (bossLevel - selectedBossData.min_level) * 50,
        maxHp: selectedBossData.hp + (bossLevel - selectedBossData.min_level) * 50,
        attack: selectedBossData.attack + (bossLevel - selectedBossData.min_level) * 5,
        defense: selectedBossData.defense + (bossLevel - selectedBossData.min_level) * 4,
        speed: selectedBossData.speed + (bossLevel - selectedBossData.min_level) * 2,
        experience_reward: selectedBossData.experience_reward || 100,
        gold_reward: selectedBossData.gold_reward || 200,
        min_level: selectedBossData.min_level,
        max_level: selectedBossData.max_level,
        location: newLocation,
        critical_chance: selectedBossData.critical_chance || 3,
        critical_damage: selectedBossData.critical_damage || 1.3,
        is_boss: true,
        is_super: false
      };

      // Thông báo bắt đầu
      const startEmbed = createErrorEmbed(
        `⚔️ **CHUẨN BỊ CHIẾN ĐẤU!**\n\n` +
        `📍 Vị trí: **${newLocation}**\n` +
        `👤 **${character.name}** (Lv.${character.level}) vs 👑 **${boss.name}** (Lv.${boss.level})\n\n` +
        `*Đang mô phỏng trận chiến...*`
      )
        .setTitle('👑 BOSS BATTLE')
        .setColor('#FFD700');

      await response.edit({ 
        embeds: [startEmbed], 
        components: [] 
      });

      // Run battle simulation
      const result = await BattleService.battle(character, [boss]);
      
      // Extract highlights và stats
      const highlights = extractBattleHighlights(result.rounds, character, boss);
      const stats = calculateBattleStats(result.rounds, character);

      // Boss Battle V2: Animated display
      const BOSS_BATTLE_CONFIG = {
        UPDATE_INTERVAL: 800,
        MAX_ROUNDS_BEFORE_AUTO_SKIP: 30,
      };

      const shouldAnimate = result.rounds.length <= BOSS_BATTLE_CONFIG.MAX_ROUNDS_BEFORE_AUTO_SKIP;

      if (shouldAnimate) {
        logger.info(`Boss battle animation: ${result.rounds.length} rounds`);

        // Animation loop (simplified for prefix - no buttons)
        for (let i = 0; i < result.rounds.length; i++) {
          const state = getBattleStateFromRounds(result.rounds, i, character, boss);
          const liveEmbed = createBattleLiveEmbed(state, character, boss);

          try {
            await response.edit({ embeds: [liveEmbed] });
          } catch (error) {
            logger.error('Error updating battle embed', error);
            break;
          }

          await new Promise(resolve => setTimeout(resolve, BOSS_BATTLE_CONFIG.UPDATE_INTERVAL));
        }
      } else {
        logger.info(`Boss battle auto-skipped: ${result.rounds.length} rounds`);
      }

      // Show final result
      const resultEmbed = createBattleResultEmbedV2(
        result,
        character,
        boss,
        highlights,
        stats
      );

      await response.edit({ embeds: [resultEmbed] });

      // Quest rewards nếu có
      if (result.won && result.questRewards.length > 0) {
        const questRewardsEmbed = createQuestRewardsEmbed(result.questRewards);
        await message.reply({ embeds: [questRewardsEmbed] });
      }

      // Level up nếu có
      if (result.won && result.leveledUp && result.newLevel) {
        const levelUpEmbed = createLevelUpEmbed(result.newLevel, character.name);
        await message.reply({ embeds: [levelUpEmbed] });
      }

      logger.success(`Boss battle completed: ${character.name} vs ${boss.name} - ${result.won ? 'Won' : 'Lost'}`);

    } catch (error: any) {
      if (error.message && error.message.includes('time')) {
        await response.edit({ 
          embeds: [createErrorEmbed('⏰ Đã hết thời gian chọn Boss!')], 
          components: [] 
        });
      } else {
        logger.error('[handleBoss] Error in component:', error);
        await response.edit({ 
          embeds: [createErrorEmbed('❌ Có lỗi xảy ra khi thách đấu Boss!')], 
          components: [] 
        });
      }
    }
  } catch (error: any) {
    logger.error('[handleBoss] Error:', error);
    const errorMessage = error.message || '❌ Có lỗi xảy ra!';
    await message.reply({ embeds: [createErrorEmbed(errorMessage)] });
  }
}

async function handleInventory(message: Message) {
  try {
    const { character } = await validateCharacterPrefix(message);

    const items = await query(
      `SELECT i.*, ci.quantity, ci.equipped, it.name as type_name
       FROM character_items ci
       JOIN items i ON ci.item_id = i.id
       JOIN item_types it ON i.item_type_id = it.id
       WHERE ci.character_id = $1
       ORDER BY it.id, i.name`,
      [character.id]
    );

    const inventoryEmbed = createInventoryEmbed(character, items.rows);
    await message.reply({ embeds: [inventoryEmbed] });
  } catch (error: any) {
    console.error('[handleInventory] Error:', error);
    const errorMessage = error.message || '❌ Có lỗi xảy ra!';
    await message.reply({ embeds: [createErrorEmbed(errorMessage)] });
  }
}

async function handleSkills(message: Message) {
  try {
    const { character } = await validateCharacterPrefix(message);

    const race = await CharacterService.getRaceById(character.race_id);
    const allSkills = await SkillService.getAllSkillsByRace(character.id, character.race_id);

    const skillsEmbed = createSkillsEmbed(character, race?.name || 'Unknown', allSkills);
    await message.reply({ embeds: [skillsEmbed] });
  } catch (error: any) {
    console.error('[handleSkills] Error:', error);
    const errorMessage = error.message || '❌ Có lỗi xảy ra!';
    await message.reply({ embeds: [createErrorEmbed(errorMessage)] });
  }
}

async function handleHelp(message: Message) {
  const helpEmbed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🐉 Hướng dẫn Ngọc Rồng Bot')
    .setDescription('**Prefix:** `z` hoặc `/` (slash commands)')
    .addFields(
      {
        name: '📋 Danh sách lệnh',
        value: 
          '```\n' +
          '┌─ 🎮 CƠ BẢN\n' +
          '├─ zstart      • Tạo nhân vật mới\n' +
          '├─ zprofile    • Xem thông tin nhân vật\n' +
          '├─ zskills     • Xem kỹ năng chiến đấu\n' +
          '├─ zinventory  • Xem túi đồ & trang bị\n' +
          '└─ zhelp       • Hiển thị trợ giúp này\n' +
          '\n' +
          '┌─ ⚔️ CHIẾN ĐẤU\n' +
          '├─ zhunt       • Săn quái vật, lên cấp\n' +
          '├─ zboss       • Thách đấu boss (cẩn thận!)\n' +
          '└─ zdaily      • Nhiệm vụ hàng ngày\n' +
          '\n' +
          '┌─ 🎒 VẬT PHẨM\n' +
          '├─ zequip <tên>   • Trang bị vật phẩm\n' +
          '├─ zunequip <tên> • Gỡ trang bị\n' +
          '└─ zuse <tên>     • Dùng vật phẩm tiêu hao\n' +
          '\n' +
          '┌─ 🏪 MUA BÁN\n' +
          '├─ zshop [loại] [trang]      • Xem cửa hàng\n' +
          '├─ zbuy <id> [số lượng]      • Mua vật phẩm\n' +
          '└─ zsell <id> [số lượng]     • Bán vật phẩm\n' +
          '```',
        inline: false
      },
      {
        name: '💡 Mẹo hữu ích',
        value: 
          '```\n' +
          '• KI tự động hồi +10 mỗi lượt\n' +
          '• HP/KI hồi đầy sau mỗi trận (thắng/thua)\n' +
          '• Thua trận chỉ mất 10% vàng (không mất HP)\n' +
          '• Level up tăng +20 HP/KI, +5 ATK/DEF, +3 SPD\n' +
          '• Skills có 65% tỉ lệ kích hoạt nếu đủ KI\n' +
          '• Săn quái có cơ hội nhận vật phẩm rơi\n' +
          '• Nhiệm vụ hàng ngày reset lúc 00:00 (UTC+7)\n' +
          '• Bán vật phẩm được 50% giá mua\n' +
          '```',
        inline: false
      },
      {
        name: '🎯 Chủng tộc & Kỹ năng',
        value: 
          '```\n' +
          '⚡ Saiyan   • Skills tấn công mạnh\n' +
          '🟢 Namek    • Skills hỗ trợ & hồi phục\n' +
          '🌍 Trái đất • Skills cân bằng, đa dạng\n' +
          '\n' +
          'Mỗi chủng tộc có bộ kỹ năng riêng biệt!\n' +
          'Mở khóa skills mới khi lên cấp.\n' +
          '```',
        inline: false
      }
    )
    .setFooter({ text: 'Sử dụng zstart để bắt đầu hành trình!' });

  await message.reply({ embeds: [helpEmbed] });
}

async function handleEquip(message: Message, args: string[]) {
  try {
    const { character } = await validateCharacterPrefix(message);
    
    if (args.length === 0) {
      await message.reply({ embeds: [createErrorEmbed('❌ Vui lòng nhập tên vật phẩm cần trang bị!\nVí dụ: `zequip Kiếm Z`')] });
      return;
    }

    const itemName = args.join(' ');
    const result = await EquipmentService.equipItem(character.id, itemName);

    if (!result.success) {
      await message.reply({ embeds: [createErrorEmbed(result.message)] });
      return;
    }

    // Build stats message
    const statsLines = [];
    if (result.statsGained) {
      if (result.statsGained.hp > 0) statsLines.push(`❤️ HP +${result.statsGained.hp}`);
      if (result.statsGained.ki > 0) statsLines.push(`💙 KI +${result.statsGained.ki}`);
      if (result.statsGained.attack > 0) statsLines.push(`⚔️ ATK +${result.statsGained.attack}`);
      if (result.statsGained.defense > 0) statsLines.push(`🛡️ DEF +${result.statsGained.defense}`);
      if (result.statsGained.speed > 0) statsLines.push(`⚡ SPD +${result.statsGained.speed}`);
    }

    let description = result.message;
    if (statsLines.length > 0) {
      description += `\n\n**Bonus Stats:**\n${statsLines.join(' • ')}`;
    }

    await message.reply({
      embeds: [createSuccessEmbed('⚔️ Trang bị thành công!', description)]
    });
  } catch (error: any) {
    console.error('[handleEquip] Error:', error);
    await message.reply({ embeds: [createErrorEmbed(error.message || '❌ Có lỗi xảy ra!')] });
  }
}

async function handleUnequip(message: Message, args: string[]) {
  try {
    const { character } = await validateCharacterPrefix(message);
    
    if (args.length === 0) {
      await message.reply({ embeds: [createErrorEmbed('❌ Vui lòng nhập tên vật phẩm cần gỡ!\nVí dụ: `zunequip Kiếm Z`')] });
      return;
    }

    const itemName = args.join(' ');
    const result = await EquipmentService.unequipItem(character.id, itemName);

    if (!result.success) {
      await message.reply({ embeds: [createErrorEmbed(result.message)] });
      return;
    }

    await message.reply({
      embeds: [createSuccessEmbed('🎒 Gỡ trang bị thành công!', result.message)]
    });
  } catch (error: any) {
    console.error('[handleUnequip] Error:', error);
    await message.reply({ embeds: [createErrorEmbed(error.message || '❌ Có lỗi xảy ra!')] });
  }
}

async function handleUse(message: Message, args: string[]) {
  try {
    const { character } = await validateCharacterPrefix(message);
    
    if (args.length === 0) {
      await message.reply({ embeds: [createErrorEmbed('❌ Vui lòng nhập tên vật phẩm cần sử dụng!\nVí dụ: `zuse Thuốc Hồi HP Nhỏ`')] });
      return;
    }

    const itemName = args.join(' ');
    const result = await EquipmentService.useItem(character.id, itemName);

    if (!result.success) {
      await message.reply({ embeds: [createErrorEmbed(result.message)] });
      return;
    }

    await message.reply({
      embeds: [createSuccessEmbed('💊 Sử dụng vật phẩm thành công!', result.message)]
    });
  } catch (error: any) {
    console.error('[handleUse] Error:', error);
    await message.reply({ embeds: [createErrorEmbed(error.message || '❌ Có lỗi xảy ra!')] });
  }
}

async function handleShop(message: Message, args: string[]) {
  try {
    // Check strict rate limit
    const strictCheck = await checkStrictRateLimit(message.author.id, 'shop');
    if (!strictCheck.allowed) {
      await message.reply({ embeds: [createErrorEmbed(strictCheck.message || '⏱️ Rate limited')] });
      return;
    }
    
    const { character } = await validateCharacterPrefix(message);

    // Parse args: zshop [type] [page]
    const typeInput = args[0]?.toLowerCase() || null;
    const page = args[1] ? parseInt(args[1]) : 1;

    if (isNaN(page) || page < 1) {
      await message.reply({ embeds: [createErrorEmbed('❌ Số trang không hợp lệ!')] });
      return;
    }

    // Nếu không có type, hiển thị menu types
    if (!typeInput) {
      const types = await ShopService.getItemTypes();
      
      const shopEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏪 CỬA HÀNG CAPSULE CORP')
        .setDescription('**Chọn loại vật phẩm bạn muốn xem:**\n\n' +
          types.map((t: any) => `**${t.id}.** ${t.name}`).join('\n') +
          '\n\n*Sử dụng: `zshop <loại> [trang]`*\n' +
          '*Ví dụ: `zshop 1` hoặc `zshop weapon`*'
        )
        .addFields({
          name: '💰 Vàng hiện tại',
          value: `**\`${character.gold}\`** 💰`,
          inline: false
        })
        .setFooter({ text: 'Dùng zbuy <item_id> <số lượng> để mua' });

      await message.reply({ embeds: [shopEmbed] });
      return;
    }

    // Convert typeInput to typeId
    const types = await ShopService.getItemTypes();
    let typeId: number | null = null;
    let typeName = '';

    // Kiểm tra xem typeInput có phải là số không
    const typeIdNum = parseInt(typeInput);
    if (!isNaN(typeIdNum)) {
      const foundType = types.find((t: any) => t.id === typeIdNum);
      if (foundType) {
        typeId = foundType.id;
        typeName = foundType.name;
      }
    } else {
      // Tìm theo tên (case-insensitive)
      const foundType = types.find((t: any) => 
        t.name.toLowerCase().includes(typeInput) || 
        typeInput.includes(t.name.toLowerCase())
      );
      if (foundType) {
        typeId = foundType.id;
        typeName = foundType.name;
      }
    }

    if (!typeId) {
      await message.reply({ embeds: [createErrorEmbed('❌ Loại vật phẩm không hợp lệ!')] });
      return;
    }

    // Có type, hiển thị items
    const itemsData = await ShopService.getItemsByType(typeId, page);

    if (!itemsData.items || itemsData.items.length === 0) {
      await message.reply({ embeds: [createErrorEmbed('❌ Không tìm thấy vật phẩm nào!')] });
      return;
    }

    const shopEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`🏪 CỬA HÀNG - ${typeName}`)
      .setDescription(
        itemsData.items.map((item: any) => {
          const stats = [];
          if (item.hp_bonus > 0) stats.push(`❤️ +${item.hp_bonus}`);
          if (item.ki_bonus > 0) stats.push(`💙 +${item.ki_bonus}`);
          if (item.attack_bonus > 0) stats.push(`⚔️ +${item.attack_bonus}`);
          if (item.defense_bonus > 0) stats.push(`🛡️ +${item.defense_bonus}`);
          if (item.speed_bonus > 0) stats.push(`⚡ +${item.speed_bonus}`);
          
          const statsStr = stats.length > 0 ? `\n   ${stats.join(' • ')}` : '';
          const levelReq = item.required_level > 1 ? ` [Lv.${item.required_level}+]` : '';
          
          return `**${item.id}.** ${item.name}${levelReq}\n   💰 ${item.price} vàng${statsStr}`;
        }).join('\n\n')
      )
      .addFields(
        {
          name: '💰 Vàng hiện tại',
          value: `**\`${character.gold}\`** 💰`,
          inline: true
        },
        {
          name: '📄 Trang',
          value: `**${page}/${itemsData.totalPages}**`,
          inline: true
        }
      )
      .setFooter({ text: 'Dùng zbuy <item_id> <số lượng> để mua' });

    await message.reply({ embeds: [shopEmbed] });
  } catch (error: any) {
    console.error('[handleShop] Error:', error);
    await message.reply({ embeds: [createErrorEmbed(error.message || '❌ Có lỗi xảy ra!')] });
  }
}

async function handleBuy(message: Message, args: string[]) {
  try {
    const { character } = await validateCharacterPrefix(message);

    // Parse args: zbuy <item_id> [quantity]
    if (args.length === 0) {
      await message.reply({ embeds: [createErrorEmbed('❌ Vui lòng nhập ID vật phẩm!\nVí dụ: `zbuy 1 5` (mua item ID 1, số lượng 5)')] });
      return;
    }

    const itemId = parseInt(args[0]);
    const quantity = args[1] ? parseInt(args[1]) : 1;

    if (isNaN(itemId) || isNaN(quantity) || quantity < 1) {
      await message.reply({ embeds: [createErrorEmbed('❌ ID hoặc số lượng không hợp lệ!')] });
      return;
    }

    const result = await ShopService.buyItem(character.id, itemId, quantity);

    if (!result.success) {
      await message.reply({ embeds: [createErrorEmbed(result.message)] });
      return;
    }

    const successEmbed = createSuccessEmbed('🛒 Mua thành công!', result.message);
    await message.reply({ embeds: [successEmbed] });
  } catch (error: any) {
    console.error('[handleBuy] Error:', error);
    await message.reply({ embeds: [createErrorEmbed(error.message || '❌ Có lỗi xảy ra!')] });
  }
}

async function handleSell(message: Message, args: string[]) {
  try {
    const { character } = await validateCharacterPrefix(message);

    // Parse args: zsell <item_id> [quantity]
    if (args.length === 0) {
      await message.reply({ embeds: [createErrorEmbed('❌ Vui lòng nhập ID vật phẩm!\nVí dụ: `zsell 1 5` (bán item ID 1, số lượng 5)')] });
      return;
    }

    const itemId = parseInt(args[0]);
    const quantity = args[1] ? parseInt(args[1]) : 1;

    if (isNaN(itemId) || isNaN(quantity) || quantity < 1) {
      await message.reply({ embeds: [createErrorEmbed('❌ ID hoặc số lượng không hợp lệ!')] });
      return;
    }

    const result = await ShopService.sellItem(character.id, itemId, quantity);

    if (!result.success) {
      await message.reply({ embeds: [createErrorEmbed(result.message)] });
      return;
    }

    const successEmbed = createSuccessEmbed('💰 Bán thành công!', result.message);
    await message.reply({ embeds: [successEmbed] });
  } catch (error: any) {
    console.error('[handleSell] Error:', error);
    await message.reply({ embeds: [createErrorEmbed(error.message || '❌ Có lỗi xảy ra!')] });
  }
}

async function handleDaily(message: Message) {
  try {
    const { character } = await validateCharacterPrefix(message);

    // Assign daily quests nếu chưa có
    await DailyQuestService.assignDailyQuests(character.id, character.level);

    // Lấy danh sách quests
    const quests = await DailyQuestService.getCharacterDailyQuests(character.id);

    if (quests.length === 0) {
      await message.reply({ embeds: [createErrorEmbed('❌ Bạn chưa có nhiệm vụ hàng ngày nào!')] });
      return;
    }

    const completedCount = quests.filter((q: any) => q.completed).length;
    const claimedCount = quests.filter((q: any) => q.claimed).length;
    
    // Header với rounded corners (hunt style)
    let description = `${BOX.ROUNDED_TOP_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_TOP_RIGHT}\n`;
    description += `${BOX.VERTICAL} 📜 **NHIỆM VỤ HÀNG NGÀY**                ${BOX.VERTICAL}\n`;
    description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
    description += `${BOX.VERTICAL} ✅ Hoàn thành: **${completedCount}/${quests.length}** • Đã nhận: **${claimedCount}/${quests.length}**\n`;
    description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;

    // Quest list
    quests.forEach((quest: any, index: number) => {
      const progress = `${quest.progress}/${quest.required_amount}`;
      const progressBar = createProgressBar(quest.progress, quest.required_amount!, 15, false);
      
      let statusIcon = quest.claimed ? '✅' : (quest.completed ? '🎁' : '⏳');
      let statusText = quest.claimed ? 'Đã nhận' : (quest.completed ? 'Hoàn thành' : 'Đang làm');

      const rewards = [];
      if (quest.exp_reward && quest.exp_reward > 0) rewards.push(`⭐${quest.exp_reward}`);
      if (quest.gold_reward && quest.gold_reward > 0) rewards.push(`💰${quest.gold_reward}`);
      if (quest.item_name) rewards.push(`🎁${quest.item_name}`);

      description += `${BOX.VERTICAL} ${statusIcon} **${quest.name}**\n`;
      description += `${BOX.VERTICAL}    ${quest.description}\n`;
      description += `${BOX.VERTICAL}    ${progressBar} \`${progress}\` • ${statusText}\n`;
      description += `${BOX.VERTICAL}    Thưởng: ${rewards.join(' • ')}\n`;
      
      // Divider giữa các quests (trừ quest cuối)
      if (index < quests.length - 1) {
        description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
      }
    });

    description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_BOTTOM_RIGHT}`;

    const dailyEmbed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('📜 Daily Quests')
      .setDescription(description)
      .setFooter({ text: `🔄 Reset: Midnight UTC+7 | ⚡ Quest hoàn thành tự động nhận thưởng khi săn quái!` })
      .setTimestamp();

    await message.reply({ embeds: [dailyEmbed] });
  } catch (error: any) {
    console.error('[handleDaily] Error:', error);
    await message.reply({ embeds: [createErrorEmbed(error.message || '❌ Có lỗi xảy ra!')] });
  }
}
