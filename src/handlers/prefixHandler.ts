import { Message, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';
import { MonsterService } from '../services/MonsterService';
import { BattleService } from '../services/BattleService';
import { SkillService } from '../services/SkillService';
import { query } from '../database/db';
import { validateCharacterPrefix, validateBattleReadyPrefix } from '../middleware/validate';
import { createBattleStartEmbed, createBattleResultEmbed, createLevelUpEmbed, createErrorEmbed, createProfileEmbed, createBossMenuEmbed, createInventoryEmbed, createSkillsEmbed } from '../utils/embeds';
import { createBattleLog, createHuntSummary, formatBattleRound } from '../utils/battleDisplay';
import { getRandomLocation, getRequiredExp, isBossOnlyLocation } from '../config';

export async function handlePrefixCommand(
  message: Message,
  commandName: string,
  _args: string[]
) {
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

      // Update reply để xóa menu
      await response.edit({ 
        embeds: [createErrorEmbed(`⚔️ CHUẨN BỊ CHIẾN ĐẤU!\n\nĐang tạo chiến trường cho trận đấu với **${selectedBossData.name}**...`)], 
        components: [] 
      });

      // Random vị trí
      const newLocation = getRandomLocation();
      await CharacterService.updateLocation(character.id, newLocation);

      // Spawn boss đã chọn với level ngẫu nhiên trong range
      const bossLevel = Math.floor(Math.random() * (selectedBossData.max_level - selectedBossData.min_level + 1)) + selectedBossData.min_level;
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
        location: newLocation,
        critical_chance: selectedBossData.critical_chance || 3,
        critical_damage: selectedBossData.critical_damage || 1.3,
        is_boss: true,
        is_super: false
      };

      // Tạo thread cho boss fight  
      const thread = await response.startThread({
        name: `⚔️ Boss Fight: ${boss.name}`,
        autoArchiveDuration: 60,
        reason: `Boss fight giữa ${character.name} và ${boss.name}`
      });

      // Gửi thông báo vào thread
      const startEmbed = createErrorEmbed(
        `📍 **${newLocation}** ✨\n\n**${character.name}** thách đấu **👑 ${boss.name}**!`
      )
        .setTitle('👑 THÁCH ĐẤU BOSS!')
        .setColor('#FFD700')
        .addFields(
          {
            name: `👤 ${character.name} (Lv.${character.level})`,
            value: `❤️ HP: \`${character.hp}\` • ⚔️ ATK: \`${character.attack}\` • 🛡️ DEF: \`${character.defense}\` • ⚡ SPD: \`${character.speed}\``,
            inline: false
          },
          {
            name: `👑 ${boss.name} (Lv.${boss.level})`,
            value: `❤️ HP: \`${boss.hp}\` • ⚔️ ATK: \`${boss.attack}\` • 🛡️ DEF: \`${boss.defense}\` • ⚡ SPD: \`${boss.speed}\``,
            inline: false
          }
        )
        .setFooter({ text: '⚔️ Trận chiến bắt đầu!' });

      await thread.send({ embeds: [startEmbed] });

      // Battle
      const result = await BattleService.battle(character, [boss]);

      // Gửi từng hiệp vào thread sử dụng formatBattleRound
      for (const round of result.rounds) {
        const roundText = formatBattleRound(round, character);
        const roundEmbed = createErrorEmbed(roundText).setColor('#FFA500');
        await thread.send({ embeds: [roundEmbed] });
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Kết quả
      const resultEmbed = createErrorEmbed(
        result.won 
          ? `**${character.name}** đã đánh bại **${boss.name}**!` 
          : `**${character.name}** đã bị **${boss.name}** đánh bại!`
      )
        .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
        .setColor(result.won ? '#00FF00' : '#FF0000')
        .setFooter({ text: `Tổng số hiệp: ${result.rounds.length}` });

      if (result.won) {
        resultEmbed.addFields({
          name: '🎁 Phần thưởng',
          value: `🎯 EXP: **\`+${result.expGained}\`** • 💰 Vàng: **\`+${result.goldGained}\`**`,
          inline: false
        });

        if (result.itemsDropped.length > 0) {
          const itemsList = result.itemsDropped.map(item => `• **${item.name}**`).join('\n');
          resultEmbed.addFields({
            name: '📦 Vật phẩm rơi',
            value: itemsList,
            inline: false
          });
        }
      } else {
        resultEmbed.addFields({
          name: '💔 Hậu quả',
          value: '*Bạn mất 10% vàng và HP còn 1*',
          inline: false
        });
      }

      await thread.send({ embeds: [resultEmbed] });

      // Level up trong thread nếu có
      if (result.won && result.leveledUp && result.newLevel) {
        const levelUpEmbed = createLevelUpEmbed(result.newLevel, character.name);
        await thread.send({ embeds: [levelUpEmbed] });
      }

      // Archive và lock thread sau 10 giây
      setTimeout(async () => {
        try {
          // Phải set archived và locked cùng lúc để tránh lỗi 50083
          await thread.edit({ archived: true, locked: true });
        } catch (error) {
          console.error('[handleBoss] Lỗi khi archive thread:', error);
        }
      }, 10000);

      // Update original message
      await response.edit({
        embeds: [createErrorEmbed(
          `Trận đấu với **${boss.name}** đã kết thúc!\n\n` +
          `*Chi tiết trận đấu đã được ghi lại trong thread (sẽ tự động ẩn sau 10 giây)*`
        )
          .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
          .setColor(result.won ? '#00FF00' : '#FF0000')
        ],
        components: []
      });

    } catch (error: any) {
      if (error.message && error.message.includes('time')) {
        await response.edit({ 
          embeds: [createErrorEmbed('⏰ Đã hết thời gian chọn Boss!')], 
          components: [] 
        });
      } else {
        console.error('[handleBoss] Error in component:', error);
        await response.edit({ 
          embeds: [createErrorEmbed('❌ Có lỗi xảy ra khi thách đấu Boss!')], 
          components: [] 
        });
      }
    }
  } catch (error: any) {
    console.error('[handleBoss] Error:', error);
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
          '└─ zhunt       • Săn quái vật, lên cấp\n' +
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
