import { Message, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, ButtonBuilder, ButtonStyle } from 'discord.js';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';
import { MonsterService } from '../services/MonsterService';
import { BattleService } from '../services/BattleService';
import { SkillService } from '../services/SkillService';
import { EquipmentService } from '../services/EquipmentService';
import { ShopService } from '../services/ShopService';
import { DailyQuestService } from '../services/DailyQuestService';
import { XPService } from '../services/XPService';
import { DragonBallService } from '../services/DragonBallService';
import { SenzuService } from '../services/SenzuService';
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
    
    case 'rank':
    case 'xephang':
      await handleRank(message, args);
      break;
    
    case 'leaderboard':
    case 'bxh':
      await handleLeaderboard(message, args);
      break;
    
    case 'dragonballs':
    case 'ngongrong':
    case 'db':
      await handleDragonBalls(message, args);
      break;
    
    case 'summon':
    case 'trieuhoirong':
    case 'trieuhoirongsthan':
      await handleSummon(message, args);
      break;
    
    case 'senzu':
    case 'dauhan':
    case 'caydauhan':
      await handleSenzu(message, args);
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

    // Thực hiện battle ngay lập tức
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

    // Thêm thông tin location vào footer
    resultEmbed.setFooter({ text: `📍 ${newLocation}` });

    // Gửi 1 tin nhắn duy nhất với kết quả
    await message.reply({ embeds: [resultEmbed] });

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
          '├─ zstart        • Tạo nhân vật mới\n' +
          '├─ zprofile      • Xem thông tin nhân vật\n' +
          '├─ zrank [@user] • Xem rank card chi tiết\n' +
          '├─ zleaderboard  • Xem bảng xếp hạng server\n' +
          '├─ zskills       • Xem kỹ năng chiến đấu\n' +
          '├─ zinventory    • Xem túi đồ & trang bị\n' +
          '└─ zhelp         • Hiển thị trợ giúp này\n' +
          '\n' +
          '┌─ ⚔️ CHIẾN ĐẤU\n' +
          '├─ zhunt       • Săn quái vật, lên cấp\n' +
          '├─ zboss       • Thách đấu boss (cẩn thận!)\n' +
          '└─ zdaily      • Nhiệm vụ hàng ngày\n' +
          '\n' +
          '┌─ 🐉 NGỌC RỒNG\n' +
          '├─ zdragonballs [earth/namek] • Xem bộ sưu tập\n' +
          '└─ zsummon [earth/namek]      • Triệu hồi Rồng Thần\n' +
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
          '• Boss drops Ngọc Rồng - thu thập đủ 7 để triệu hồi!\n' +
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
      await message.reply({ embeds: [createErrorEmbed('❌ Không có nhiệm vụ hàng ngày! Hãy thử lại sau.')] });
      return;
    }

    const completedCount = quests.filter((q: any) => q.completed && !q.claimed).length;
    const totalCompleted = quests.filter((q: any) => q.completed).length;
    
    // Hàm tạo progress bar
    const createQuestProgressBar = (current: number, total: number, size: number = 10): string => {
      const progress = Math.round((current / total) * size);
      const empty = size - progress;
      const filledBar = '■'.repeat(progress);
      const emptyBar = '□'.repeat(empty);
      const percentage = Math.round((current / total) * 100);
      return `\`[${filledBar}${emptyBar}] ${percentage}%\``;
    };

    // Tạo embed đẹp với giao diện mới
    const questEmbed = new EmbedBuilder()
      .setColor(0xFFA500) // Màu cam vàng
      .setTitle('📜 Daily Quests Board')
      .setAuthor({ 
        name: 'Quest System', 
        iconURL: 'https://cdn-icons-png.flaticon.com/512/2104/2104672.png' 
      })
      .setDescription(
        `Chào **${message.author.username}**, đây là nhiệm vụ hôm nay của bạn!\n` +
        `Hoàn thành để nhận phần thưởng hấp dẫn.\n\n` +
        `**📊 Tiến độ:** ${totalCompleted}/${quests.length} hoàn thành ${completedCount > 0 ? `• ${completedCount} chưa nhận` : ''}`
      )
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/3076/3076404.png')
      .setTimestamp()
      .setFooter({ 
        text: '🔄 Reset vào lúc 00:00 UTC+7 • Tự động nhận thưởng khi hoàn thành', 
        iconURL: 'https://cdn-icons-png.flaticon.com/512/2088/2088617.png' 
      });

    // Thêm từng quest vào embed
    quests.forEach((quest: any) => {
      const progress = createQuestProgressBar(quest.progress, quest.required_amount!, 10);
      
      // Xác định icon và status
      let icon = '⏳';
      let status = 'Đang làm';
      if (quest.claimed) {
        icon = '✅';
        status = 'Đã nhận';
      } else if (quest.completed) {
        icon = '🎁';
        status = 'Hoàn thành - Chưa nhận';
      }

      // Tạo reward string
      const rewards = [];
      if (quest.exp_reward && quest.exp_reward > 0) rewards.push(`\`${quest.exp_reward} EXP\``);
      if (quest.gold_reward && quest.gold_reward > 0) rewards.push(`\`${quest.gold_reward} Gold\``);
      if (quest.item_name) rewards.push(`\`${quest.item_name}\``);

      // Emoji theo loại quest
      let questIcon = '⚔️';
      if (quest.quest_type?.includes('skill')) questIcon = '✨';
      else if (quest.quest_type?.includes('boss')) questIcon = '👹';
      else if (quest.quest_type?.includes('gold')) questIcon = '💰';
      else if (quest.quest_type?.includes('hunt')) questIcon = '🎯';

      questEmbed.addFields({
        name: `${icon} ${questIcon} ${quest.name}`,
        value: 
          `${progress}\n` +
          `> ${quest.description}\n` +
          `> **Tiến độ:** ${quest.progress}/${quest.required_amount} • **${status}**\n` +
          `**🎁 Phần thưởng:** ${rewards.join(' • ')}`,
        inline: false
      });
    });

    // Tạo buttons
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('daily_refresh')
          .setLabel('Cập nhật')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔄'),
        new ButtonBuilder()
          .setCustomId('daily_claim_all')
          .setLabel(`Nhận tất cả (${completedCount})`)
          .setStyle(ButtonStyle.Success)
          .setEmoji('🎁')
          .setDisabled(completedCount === 0)
      );

    const response = await message.reply({ 
      embeds: [questEmbed], 
      components: [row] 
    });

    // Handle button interactions
    const collector = response.createMessageComponentCollector({
      filter: (i: any) => i.user.id === message.author.id,
      time: 60000 // 1 minute
    });

    collector.on('collect', async (i: any) => {
      if (i.customId === 'daily_refresh') {
        await i.deferUpdate();
        // Re-execute command to refresh
        const updatedQuests = await DailyQuestService.getCharacterDailyQuests(character.id);
        const updatedCompletedCount = updatedQuests.filter((q: any) => q.completed && !q.claimed).length;
        const updatedTotalCompleted = updatedQuests.filter((q: any) => q.completed).length;
        
        questEmbed.setDescription(
          `Chào **${message.author.username}**, đây là nhiệm vụ hôm nay của bạn!\n` +
          `Hoàn thành để nhận phần thưởng hấp dẫn.\n\n` +
          `**📊 Tiến độ:** ${updatedTotalCompleted}/${updatedQuests.length} hoàn thành ${updatedCompletedCount > 0 ? `• ${updatedCompletedCount} chưa nhận` : ''}`
        );
        
        questEmbed.setFields([]);
        updatedQuests.forEach((quest: any) => {
          const progress = createQuestProgressBar(quest.progress, quest.required_amount!, 10);
          
          let icon = '⏳';
          let status = 'Đang làm';
          if (quest.claimed) {
            icon = '✅';
            status = 'Đã nhận';
          } else if (quest.completed) {
            icon = '🎁';
            status = 'Hoàn thành - Chưa nhận';
          }

          const rewards = [];
          if (quest.exp_reward && quest.exp_reward > 0) rewards.push(`\`${quest.exp_reward} EXP\``);
          if (quest.gold_reward && quest.gold_reward > 0) rewards.push(`\`${quest.gold_reward} Gold\``);
          if (quest.item_name) rewards.push(`\`${quest.item_name}\``);

          let questIcon = '⚔️';
          if (quest.quest_type?.includes('skill')) questIcon = '✨';
          else if (quest.quest_type?.includes('boss')) questIcon = '👹';
          else if (quest.quest_type?.includes('gold')) questIcon = '💰';
          else if (quest.quest_type?.includes('hunt')) questIcon = '🎯';

          questEmbed.addFields({
            name: `${icon} ${questIcon} ${quest.name}`,
            value: 
              `${progress}\n` +
              `> ${quest.description}\n` +
              `> **Tiến độ:** ${quest.progress}/${quest.required_amount} • **${status}**\n` +
              `**🎁 Phần thưởng:** ${rewards.join(' • ')}`,
            inline: false
          });
        });

        row.components[1].setDisabled(updatedCompletedCount === 0);
        row.components[1].setLabel(`Nhận tất cả (${updatedCompletedCount})`);
        
        await i.editReply({ embeds: [questEmbed], components: [row] });
      } else if (i.customId === 'daily_claim_all') {
        await i.deferUpdate();
        
        // Claim all completed quests
        const claimResults = await DailyQuestService.claimAllCompletedQuests(character.id);
        
        if (claimResults.totalClaimed === 0) {
          await i.followUp({ 
            content: '❌ Không có nhiệm vụ nào để nhận thưởng!', 
            ephemeral: true 
          });
          return;
        }

        // Create reward summary
        const rewardEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('🎁 Nhận thưởng thành công!')
          .setDescription(
            `Bạn đã nhận thưởng từ **${claimResults.totalClaimed}** nhiệm vụ!\n\n` +
            `**📊 Tổng phần thưởng:**\n` +
            `⭐ **${claimResults.totalExp} EXP**\n` +
            `💰 **${claimResults.totalGold} Gold**\n` +
            (claimResults.itemsReceived.length > 0 
              ? `🎁 **Items:** ${claimResults.itemsReceived.join(', ')}\n` 
              : '')
          )
          .setTimestamp();

        await i.followUp({ embeds: [rewardEmbed] });

        // Refresh the quest display
        const updatedQuests = await DailyQuestService.getCharacterDailyQuests(character.id);
        const updatedCompletedCount = updatedQuests.filter((q: any) => q.completed && !q.claimed).length;
        const updatedTotalCompleted = updatedQuests.filter((q: any) => q.completed).length;
        
        questEmbed.setDescription(
          `Chào **${message.author.username}**, đây là nhiệm vụ hôm nay của bạn!\n` +
          `Hoàn thành để nhận phần thưởng hấp dẫn.\n\n` +
          `**📊 Tiến độ:** ${updatedTotalCompleted}/${updatedQuests.length} hoàn thành ${updatedCompletedCount > 0 ? `• ${updatedCompletedCount} chưa nhận` : ''}`
        );
        
        questEmbed.setFields([]);
        updatedQuests.forEach((quest: any) => {
          const progress = createQuestProgressBar(quest.progress, quest.required_amount!, 10);
          
          let icon = '⏳';
          let status = 'Đang làm';
          if (quest.claimed) {
            icon = '✅';
            status = 'Đã nhận';
          } else if (quest.completed) {
            icon = '🎁';
            status = 'Hoàn thành - Chưa nhận';
          }

          const rewards = [];
          if (quest.exp_reward && quest.exp_reward > 0) rewards.push(`\`${quest.exp_reward} EXP\``);
          if (quest.gold_reward && quest.gold_reward > 0) rewards.push(`\`${quest.gold_reward} Gold\``);
          if (quest.item_name) rewards.push(`\`${quest.item_name}\``);

          let questIcon = '⚔️';
          if (quest.quest_type?.includes('skill')) questIcon = '✨';
          else if (quest.quest_type?.includes('boss')) questIcon = '👹';
          else if (quest.quest_type?.includes('gold')) questIcon = '💰';
          else if (quest.quest_type?.includes('hunt')) questIcon = '🎯';

          questEmbed.addFields({
            name: `${icon} ${questIcon} ${quest.name}`,
            value: 
              `${progress}\n` +
              `> ${quest.description}\n` +
              `> **Tiến độ:** ${quest.progress}/${quest.required_amount} • **${status}**\n` +
              `**🎁 Phần thưởng:** ${rewards.join(' • ')}`,
            inline: false
          });
        });

        row.components[1].setDisabled(updatedCompletedCount === 0);
        row.components[1].setLabel(`Nhận tất cả (${updatedCompletedCount})`);
        
        await i.editReply({ embeds: [questEmbed], components: [row] });
      }
    });

    collector.on('end', () => {
      row.components.forEach(button => button.setDisabled(true));
      response.edit({ components: [row] }).catch(() => {});
    });

  } catch (error: any) {
    console.error('[handleDaily] Error:', error);
    await message.reply({ embeds: [createErrorEmbed(error.message || '❌ Có lỗi xảy ra!')] });
  }
}

async function handleRank(message: Message, args: string[]) {
  try {
    // Lấy user từ mention hoặc chính user gọi lệnh
    const targetUser = message.mentions.users.first() || message.author;
    const player = await PlayerService.findByDiscordId(targetUser.id);

    if (!player) {
      await message.reply({
        content: `❌ ${targetUser.id === message.author.id ? 'Bạn' : 'Người chơi này'} chưa có nhân vật! Sử dụng \`zstart\` để bắt đầu.`,
      });
      return;
    }

    const character = await CharacterService.findByPlayerId(player.id);

    if (!character) {
      await message.reply({
        content: `❌ ${targetUser.id === message.author.id ? 'Bạn' : 'Người chơi này'} chưa có nhân vật!`,
      });
      return;
    }

    // Lấy thông tin đầy đủ với rank và stats
    const charWithRank = await XPService.getCharacterWithRank(character.id);

    if (!charWithRank) {
      await message.reply({ content: '❌ Không thể tải thông tin rank!' });
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

    const formatCompactNumber = (num: number) => {
      if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    };

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

    await message.reply({ embeds: [embed] });
  } catch (error: any) {
    console.error('[handleRank] Error:', error);
    await message.reply({ embeds: [createErrorEmbed(error.message || '❌ Có lỗi xảy ra!')] });
  }
}

async function handleLeaderboard(message: Message, args: string[]) {
  try {
    const leaderboardType = args[0]?.toLowerCase() || 'xp';
    const topPlayers = await XPService.getLeaderboard(10);

    if (topPlayers.length === 0) {
      await message.reply({ content: '❌ Chưa có dữ liệu bảng xếp hạng!' });
      return;
    }

    let title = '🏆 BẢNG XẾP HẠNG SERVER';
    let description = '';
    let sortField: keyof typeof topPlayers[0]['stats'] | 'total_xp' = 'total_xp';

    // Map Vietnamese aliases to types
    const typeMap: { [key: string]: string } = {
      'xp': 'xp',
      'thang': 'wins',
      'wins': 'wins',
      'quai': 'kills',
      'kills': 'kills',
      'boss': 'bosses',
      'bosses': 'bosses',
      'vang': 'gold',
      'gold': 'gold'
    };

    const mappedType = typeMap[leaderboardType] || 'xp';

    const formatCompactNumber = (num: number) => {
      if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    };

    switch (mappedType) {
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
    
    const getSortIcon = (field: string): string => {
      const icons: Record<string, string> = {
        total_xp: '✨',
        total_battles_won: '⚔️',
        total_monsters_killed: '💀',
        total_bosses_defeated: '👹',
        total_gold_earned: '💰',
      };
      return icons[field] || '📊';
    };

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

    await message.reply({ embeds: [embed] });
  } catch (error: any) {
    console.error('[handleLeaderboard] Error:', error);
    await message.reply({ embeds: [createErrorEmbed(error.message || '❌ Có lỗi xảy ra!')] });
  }
}

async function handleDragonBalls(message: Message, args: string[]) {
  try {
    const { character } = await validateCharacterPrefix(message);
    
    // Parse args: zdragonballs [type]
    let setType: 'earth' | 'namek' = 'earth';
    if (args.length > 0) {
      const typeArg = args[0].toLowerCase();
      if (typeArg === 'namek' || typeArg === 'n') {
        setType = 'namek';
      }
    }

    // Lấy Dragon Balls từ inventory
    const dragonBalls = await DragonBallService.getCharacterDragonBalls(character.id, setType);
    const hasComplete = dragonBalls.length >= 7;

    // Tạo map để track số sao đã có
    const ballMap: { [key: number]: boolean } = {};
    dragonBalls.forEach((ball: any) => {
      // Extract số sao từ tên (e.g., "Ngọc Rồng 3 sao" -> 3)
      const match = ball.name.match(/(\d+)\s*sao/i);
      if (match) {
        const stars = parseInt(match[1]);
        ballMap[stars] = true;
      }
    });

    // Icon cho từng loại
    const typeIcon = setType === 'earth' ? '🌍' : '🟢';
    const typeName = setType === 'earth' ? 'Trái Đất' : 'Namek';
    const dragonName = setType === 'earth' ? 'Shenron' : 'Porunga';

    // Tạo header
    let description = `${BOX.ROUNDED_TOP_LEFT}${BOX.HORIZONTAL.repeat(42)}${BOX.ROUNDED_TOP_RIGHT}\n`;
    description += `${BOX.VERTICAL} ${typeIcon} **BỘ SƯU TẬP NGỌC RỒNG ${typeName.toUpperCase()}**        ${BOX.VERTICAL}\n`;
    description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(42)}${BOX.T_LEFT}\n`;
    description += `${BOX.VERTICAL} Đã thu thập: **${dragonBalls.length}/7** viên              ${BOX.VERTICAL}\n`;
    
    if (hasComplete) {
      description += `${BOX.VERTICAL} 🎉 **Bộ sưu tập hoàn chỉnh!**                   ${BOX.VERTICAL}\n`;
      description += `${BOX.VERTICAL} 🐉 Sử dụng \`zsummon\` để triệu hồi ${dragonName}!    ${BOX.VERTICAL}\n`;
    } else {
      description += `${BOX.VERTICAL} ⏳ Còn thiếu: **${7 - dragonBalls.length}** viên                    ${BOX.VERTICAL}\n`;
    }
    
    description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(42)}${BOX.T_LEFT}\n`;

    // Hiển thị từng viên (1-7 sao)
    for (let i = 1; i <= 7; i++) {
      const hasStars = ballMap[i];
      const icon = hasStars ? '🌟' : '⚫';
      const status = hasStars ? '✅ Đã có' : '❌ Chưa có';
      const starDisplay = '⭐'.repeat(i);
      
      description += `${BOX.VERTICAL} ${icon} **${i} sao** ${starDisplay.padEnd(14)} ${status.padEnd(10)} ${BOX.VERTICAL}\n`;
      
      if (i < 7) {
        description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(42)}${BOX.T_LEFT}\n`;
      }
    }

    description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(42)}${BOX.ROUNDED_BOTTOM_RIGHT}\n`;

    // Thêm lịch sử wishes nếu có
    const wishHistory = await DragonBallService.getWishHistory(character.id, 3);
    
    if (wishHistory.length > 0) {
      description += `\n**📜 Lịch sử ước nguyện gần đây:**\n`;
      wishHistory.forEach((wish: any, index: number) => {
        const date = new Date(wish.granted_at).toLocaleDateString('vi-VN');
        const dragonIcon = wish.dragon_type === 'earth' ? '🌍' : '🟢';
        description += `${index + 1}. ${dragonIcon} **${wish.wish_name}** - ${date}\n`;
      });
    }

    // Thông tin về cách lấy Dragon Balls
    description += `\n💡 **Cách thu thập:**\n`;
    description += `• Đánh bại Boss có tỷ lệ rơi Ngọc Rồng\n`;
    description += `• Boss càng mạnh, tỷ lệ rơi càng cao\n`;
    if (setType === 'namek') {
      description += `• Ngọc Rồng Namek chỉ rơi từ Boss level 15+\n`;
    }

    const embed = new EmbedBuilder()
      .setColor(hasComplete ? '#FFD700' : '#FF6B6B')
      .setTitle(`🐉 Ngọc Rồng ${typeName}`)
      .setDescription(description)
      .setFooter({ 
        text: hasComplete 
          ? `Sử dụng zsummon để triệu hồi ${dragonName}!`
          : `Hãy tìm kiếm ${7 - dragonBalls.length} viên còn lại!` 
      })
      .setTimestamp();

    await message.reply({ embeds: [embed] });

  } catch (error: any) {
    console.error('[handleDragonBalls] Error:', error);
    const errorMessage = error.message || '❌ Có lỗi xảy ra khi xem Ngọc Rồng!';
    await message.reply({ embeds: [createErrorEmbed(errorMessage)] });
  }
}

async function handleSummon(message: Message, args: string[]) {
  try {
    const { character } = await validateCharacterPrefix(message);
    
    // Parse args: zsummon [type]
    let setType: 'earth' | 'namek' = 'earth';
    if (args.length > 0) {
      const typeArg = args[0].toLowerCase();
      if (typeArg === 'namek' || typeArg === 'n') {
        setType = 'namek';
      }
    }

    // 1. Kiểm tra có đủ 7 viên không
    const hasComplete = await DragonBallService.hasCompletedSet(character.id, setType);
    
    if (!hasComplete) {
      const dragonBalls = await DragonBallService.getCharacterDragonBalls(character.id, setType);
      await message.reply({
        embeds: [createErrorEmbed(
          `❌ Bạn chưa có đủ 7 viên Ngọc Rồng ${setType === 'earth' ? 'Trái Đất' : 'Namek'}!\n\n` +
          `Hiện có: **${dragonBalls.length}/7** viên\n` +
          `Sử dụng \`zdragonballs\` để xem bộ sưu tập.`
        )]
      });
      return;
    }

    // 2. Lấy danh sách wishes có thể dùng
    const availableWishes = await DragonBallService.getAvailableWishes(character.level, setType);

    if (availableWishes.length === 0) {
      await message.reply({
        embeds: [createErrorEmbed('❌ Không có ước nguyện nào khả dụng cho level của bạn!')]
      });
      return;
    }

    // 3. Kiểm tra cooldown cho từng wish
    const wishesWithCooldown = await Promise.all(
      availableWishes.map(async (wish) => {
        const cooldownCheck = await DragonBallService.canUseWish(character.id, wish.code);
        return { ...wish, ...cooldownCheck };
      })
    );

    // 4. Hiển thị animation triệu hồi
    const dragonName = setType === 'earth' ? 'Shenron' : 'Porunga';
    const dragonColor = setType === 'earth' ? '#FFD700' : '#2ECC71';
    
    const summonEmbed = new EmbedBuilder()
      .setColor(dragonColor as any)
      .setTitle(`🐉 TRIỆU HỒI ${dragonName.toUpperCase()}!`)
      .setDescription(
        `*7 viên Ngọc Rồng tỏa sáng rực rỡ...*\n\n` +
        `✨ ✨ ✨ ✨ ✨ ✨ ✨\n\n` +
        `**${dragonName}** xuất hiện từ trong ánh sáng!\n\n` +
        `🐉 *"Ta sẽ thực hiện một ước nguyện của ngươi..."*\n\n` +
        `**Danh sách ước nguyện:**`
      )
      .setTimestamp();

    // Add wishes to embed
    wishesWithCooldown.forEach((wish, index) => {
      let statusIcon = wish.canUse ? '✅' : '⏳';
      let name = `${statusIcon} ${index + 1}. ${wish.name}`;
      let value = wish.description;
      
      if (!wish.canUse) {
        value += `\n⏳ *Cooldown: ${wish.daysRemaining} ngày*`;
      }
      
      summonEmbed.addFields({
        name: name,
        value: value,
        inline: false
      });
    });

    summonEmbed.setFooter({ 
      text: 'Trả lời bằng số (1, 2, 3...) để chọn ước nguyện trong 60 giây!' 
    });

    const response = await message.reply({ embeds: [summonEmbed] });

    // 5. Đợi user chọn wish
    const filter = (m: Message) => {
      if (m.author.id !== message.author.id) return false;
      const num = parseInt(m.content);
      return !isNaN(num) && num >= 1 && num <= wishesWithCooldown.length;
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

      const userResponse = collected.first();
      if (!userResponse) return;

      const wishIndex = parseInt(userResponse.content) - 1;
      const selectedWish = wishesWithCooldown[wishIndex];

      if (!selectedWish.canUse) {
        await message.reply({
          embeds: [createErrorEmbed(
            `⏰ Ước nguyện này đang trong thời gian chờ!\n\n` +
            `Còn: **${selectedWish.daysRemaining} ngày**\n` +
            `Hãy chọn ước nguyện khác.`
          )]
        });
        return;
      }

      // 6. Thực hiện ước nguyện
      const processingEmbed = new EmbedBuilder()
        .setColor(dragonColor as any)
        .setTitle(`🐉 ${dragonName} đang thực hiện ước nguyện...`)
        .setDescription(
          `✨ *Ánh sáng rực rỡ bao trùm...*\n\n` +
          `**Ước nguyện:** ${selectedWish.name}\n` +
          `${selectedWish.description}\n\n` +
          `⏳ Đang xử lý...`
        );

      await response.edit({ embeds: [processingEmbed] });

      // Thực hiện wish
      const result = await DragonBallService.summonAndWish(
        character.id,
        selectedWish.code,
        setType
      );

      // 7. Hiển thị kết quả
      const resultEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`✨ ƯỚC NGUYỆN ĐƯỢC THỰC HIỆN!`)
        .setDescription(
          `🐉 **${dragonName}:**\n` +
          `*"${result.message}"*\n\n` +
          `**Ước nguyện:** ${selectedWish.name}\n\n` +
          `**Phần thưởng nhận được:**`
        );

      // Add rewards to embed
      if (result.rewards?.gold) {
        resultEmbed.addFields({
          name: '💰 Vàng',
          value: `+${result.rewards.gold.toLocaleString()} vàng`,
          inline: true
        });
      }

      if (result.rewards?.levels) {
        resultEmbed.addFields({
          name: '⭐ Levels',
          value: `+${result.rewards.levels} levels`,
          inline: true
        });
      }

      if (result.rewards?.stats) {
        const statsText = [];
        if (result.rewards.stats.max_hp_percent) {
          statsText.push(`Max HP: +${result.rewards.stats.max_hp_percent}%`);
        }
        if (result.rewards.stats.all_stats_percent) {
          statsText.push(`All Stats: +${result.rewards.stats.all_stats_percent}%`);
        }
        if (statsText.length > 0) {
          resultEmbed.addFields({
            name: '📈 Stats',
            value: statsText.join('\n'),
            inline: true
          });
        }
      }

      if (result.rewards?.items && result.rewards.items.length > 0) {
        resultEmbed.addFields({
          name: '🎁 Items',
          value: result.rewards.items.map(item => `• ${item.name} x${item.quantity}`).join('\n'),
          inline: false
        });
      }

      if (result.rewards?.transformations && result.rewards.transformations.length > 0) {
        resultEmbed.addFields({
          name: '✨ Transformations',
          value: result.rewards.transformations.map(t => `• ${t}`).join('\n'),
          inline: false
        });
      }

      resultEmbed.addFields({
        name: '🔄 Ngọc Rồng',
        value: `7 viên Ngọc Rồng đã bay đi khắp nơi...\nHãy tìm kiếm chúng lại!`,
        inline: false
      });

      resultEmbed.setFooter({
        text: `Cooldown: ${selectedWish.cooldown_days} ngày | Sử dụng zdragonballs để xem tiến độ`
      });

      await response.edit({ embeds: [resultEmbed] });

    } catch (error: any) {
      if (error.message && error.message.includes('time')) {
        await response.edit({
          embeds: [createErrorEmbed('⏰ Hết thời gian chọn ước nguyện!\n7 viên Ngọc Rồng vẫn còn với bạn.')]
        });
      } else {
        throw error;
      }
    }

  } catch (error: any) {
    console.error('[handleSummon] Error:', error);
    const errorMessage = error.message || '❌ Có lỗi xảy ra khi triệu hồi Rồng Thần!';
    await message.reply({ embeds: [createErrorEmbed(errorMessage)] });
  }
}

async function handleSenzu(message: Message, args: string[]) {
  try {
    const { character } = await validateCharacterPrefix(message);
    const subcommand = args[0]?.toLowerCase();

    switch (subcommand) {
      case 'harvest':
      case 'thuhoach':
      case 'thu':
        await handleSenzuHarvest(message, character.id);
        break;
      
      case 'upgrade':
      case 'nangcap':
      case 'nc':
        await handleSenzuUpgrade(message, character.id);
        break;
      
      case 'use':
      case 'dung':
      case 'sudung':
        const quantity = parseInt(args[1]);
        if (!quantity || quantity < 1) {
          await message.reply({ embeds: [createErrorEmbed('❌ Vui lòng nhập số lượng hợp lệ!\nVí dụ: `zsenzu use 5`')] });
          return;
        }
        await handleSenzuUse(message, character.id, quantity);
        break;
      
      default:
        // Hiển thị info
        await handleSenzuInfo(message, character.id);
        break;
    }
  } catch (error: any) {
    console.error('[handleSenzu] Error:', error);
    const errorMessage = error.message || '❌ Có lỗi xảy ra!';
    await message.reply({ embeds: [createErrorEmbed(errorMessage)] });
  }
}

async function handleSenzuInfo(message: Message, characterId: number) {
  const info = await SenzuService.getSenzuInfo(characterId);
  const currentConfig = info.config;
  const nextConfig = info.nextLevelConfig;

  // Header
  let description = `${BOX.ROUNDED_TOP_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_TOP_RIGHT}\n`;
  description += `${BOX.VERTICAL} 🌱 **CÂY ĐẬU THẦN - LEVEL ${info.level}/10**     ${BOX.VERTICAL}\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;

  // Kho Đậu Thần hiện tại
  description += `${BOX.VERTICAL} 🫘 **Kho:** ${info.beans} Đậu Thần\n`;
  description += `${BOX.VERTICAL} 💚 **Hồi phục:** ${currentConfig.bean_hp_restore} HP & ${currentConfig.bean_ki_restore} KI/hạt\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;

  // Thông tin thu hoạch
  description += `${BOX.VERTICAL} ⏱️  **Chu kỳ:** ${currentConfig.production_time} phút\n`;
  description += `${BOX.VERTICAL} 🌾 **Thu hoạch:** ${currentConfig.beans_per_harvest} Đậu/lần\n`;

  // Kiểm tra thời gian thu hoạch
  if (info.canHarvest) {
    description += `${BOX.VERTICAL} ✅ **Trạng thái:** Có thể thu hoạch ngay!\n`;
  } else {
    description += `${BOX.VERTICAL} ⏳ **Trạng thái:** Còn ${info.minutesRemaining} phút nữa\n`;
  }

  // Thông tin nâng cấp
  if (nextConfig) {
    description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
    description += `${BOX.VERTICAL} 🔼 **NÂNG CẤP LÊN LEVEL ${info.level + 1}**\n`;
    description += `${BOX.VERTICAL}    💰 Chi phí: ${nextConfig.upgrade_cost.toLocaleString()} vàng\n`;
    description += `${BOX.VERTICAL}    📊 Level yêu cầu: ${nextConfig.required_character_level}\n`;
    description += `${BOX.VERTICAL}    ⏱️  Chu kỳ: ${nextConfig.production_time} phút\n`;
    description += `${BOX.VERTICAL}    🌾 Thu hoạch: ${nextConfig.beans_per_harvest} Đậu/lần\n`;
    description += `${BOX.VERTICAL}    💚 Hồi phục: ${nextConfig.bean_hp_restore} HP & ${nextConfig.bean_ki_restore} KI/hạt\n`;
  } else {
    description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
    description += `${BOX.VERTICAL} 🏆 **ĐÃ ĐẠT CẤP ĐỘ TỐI ĐA!**\n`;
  }

  description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_BOTTOM_RIGHT}`;

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('🌱 Cây Đậu Thần')
    .setDescription(description)
    .setFooter({ 
      text: `💡 Dùng: zsenzu harvest | zsenzu upgrade | zsenzu use <số lượng>` 
    })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handleSenzuHarvest(message: Message, characterId: number) {
  const result = await SenzuService.harvest(characterId);

  if (!result.success) {
    await message.reply({ embeds: [createErrorEmbed(result.message)] });
    return;
  }

  const info = await SenzuService.getSenzuInfo(characterId);

  let description = `${BOX.ROUNDED_TOP_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_TOP_RIGHT}\n`;
  description += `${BOX.VERTICAL} 🌾 **THU HOẠCH THÀNH CÔNG!**          ${BOX.VERTICAL}\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
  description += `${BOX.VERTICAL} 🫘 **Nhận được:** ${result.beansHarvested} Đậu Thần\n`;
  description += `${BOX.VERTICAL} 📦 **Tổng kho:** ${result.totalBeans} Đậu Thần\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
  description += `${BOX.VERTICAL} ⏱️  **Lần thu hoạch tiếp theo:**\n`;
  description += `${BOX.VERTICAL}    ${info.config.production_time} phút nữa\n`;
  description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_BOTTOM_RIGHT}`;

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('🌾 Thu Hoạch Đậu Thần')
    .setDescription(description)
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handleSenzuUpgrade(message: Message, characterId: number) {
  const result = await SenzuService.upgrade(characterId);

  if (!result.success) {
    await message.reply({ embeds: [createErrorEmbed(result.message)] });
    return;
  }

  const info = await SenzuService.getSenzuInfo(characterId);
  const charResult = await query('SELECT gold FROM characters WHERE id = $1', [characterId]);
  const remainingGold = charResult.rows[0].gold;

  let description = `${BOX.ROUNDED_TOP_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_TOP_RIGHT}\n`;
  description += `${BOX.VERTICAL} 🔼 **NÂNG CẤP THÀNH CÔNG!**          ${BOX.VERTICAL}\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
  description += `${BOX.VERTICAL} 🌱 **Cấp độ mới:** Level ${result.newLevel}/10\n`;
  description += `${BOX.VERTICAL} 💵 **Vàng còn lại:** ${remainingGold.toLocaleString()}\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
  description += `${BOX.VERTICAL} 📈 **CẢI TIẾN:**\n`;
  description += `${BOX.VERTICAL}    ⏱️  Chu kỳ: ${info.config.production_time} phút\n`;
  description += `${BOX.VERTICAL}    🌾 Thu hoạch: ${info.config.beans_per_harvest} Đậu/lần\n`;
  description += `${BOX.VERTICAL}    💚 Hồi phục: ${info.config.bean_hp_restore} HP & ${info.config.bean_ki_restore} KI/hạt\n`;
  description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_BOTTOM_RIGHT}`;

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🔼 Nâng Cấp Cây Đậu Thần')
    .setDescription(description)
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handleSenzuUse(message: Message, characterId: number, quantity: number) {
  const result = await SenzuService.useSenzu(characterId, quantity);

  if (!result.success) {
    await message.reply({ embeds: [createErrorEmbed(result.message)] });
    return;
  }

  const info = await SenzuService.getSenzuInfo(characterId);
  const charResult = await query('SELECT hp, max_hp, ki, max_ki FROM characters WHERE id = $1', [characterId]);
  const { hp, max_hp, ki, max_ki } = charResult.rows[0];

  let description = `${BOX.ROUNDED_TOP_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_TOP_RIGHT}\n`;
  description += `${BOX.VERTICAL} 🫘 **SỬ DỤNG ĐẬU THẦN**                ${BOX.VERTICAL}\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
  description += `${BOX.VERTICAL} 💊 **Đã dùng:** ${quantity} Đậu Thần\n`;
  description += `${BOX.VERTICAL} 📦 **Còn lại:** ${info.beans} Đậu Thần\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;

  if (result.hpRestored > 0 || result.kiRestored > 0) {
    description += `${BOX.VERTICAL} 💚 **HỒI PHỤC:**\n`;
    if (result.hpRestored > 0) {
      description += `${BOX.VERTICAL}    ❤️  HP: +${result.hpRestored} (${hp}/${max_hp})\n`;
    }
    if (result.kiRestored > 0) {
      description += `${BOX.VERTICAL}    💙 KI: +${result.kiRestored} (${ki}/${max_ki})\n`;
    }
  } else {
    description += `${BOX.VERTICAL} ℹ️  **HP/KI đã đầy!**\n`;
  }

  description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_BOTTOM_RIGHT}`;

  const embed = new EmbedBuilder()
    .setColor('#00FFFF')
    .setTitle('🫘 Sử Dụng Đậu Thần')
    .setDescription(description)
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}
