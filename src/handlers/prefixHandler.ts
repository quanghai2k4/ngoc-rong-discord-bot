import { Message, EmbedBuilder } from 'discord.js';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';
import { MonsterService } from '../services/MonsterService';
import { BattleService } from '../services/BattleService';
import { SkillService } from '../services/SkillService';
import { query } from '../database/db';

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
  const player = await PlayerService.findByDiscordId(message.author.id);

  if (!player) {
    await message.reply('❌ Bạn chưa có nhân vật! Sử dụng `zstart` để bắt đầu.');
    return;
  }

  const character = await CharacterService.findByPlayerId(player.id);

  if (!character) {
    await message.reply('❌ Bạn chưa có nhân vật! Sử dụng `zstart` để bắt đầu.');
    return;
  }

  const race = await CharacterService.getRaceById(character.race_id);
  const expNeeded = 100 + (character.level - 1) * 50;

  // Tính progress bars
  const hpPercentage = Math.floor((character.hp / character.max_hp) * 10);
  const hpBar = '█'.repeat(hpPercentage) + '░'.repeat(10 - hpPercentage);
  
  const kiPercentage = Math.floor((character.ki / character.max_ki) * 10);
  const kiBar = '█'.repeat(kiPercentage) + '░'.repeat(10 - kiPercentage);
  
  const expPercentage = Math.floor((character.experience / expNeeded) * 10);
  const expBar = '█'.repeat(expPercentage) + '░'.repeat(10 - expPercentage);

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`⚔️ ${character.name}`)
    .setDescription(`**${race?.name}** • Level **${character.level}** • 💰 **${character.gold}** vàng\n╰─ 📍 ${character.location}`)
    .addFields(
      { 
        name: '❤️ HP', 
        value: `\`${character.hp}\`/\`${character.max_hp}\` ${hpBar}`,
        inline: false 
      },
      { 
        name: '💙 KI', 
        value: `\`${character.ki}\`/\`${character.max_ki}\` ${kiBar}`,
        inline: false 
      },
      { 
        name: '✨ EXP', 
        value: `\`${character.experience}\`/\`${expNeeded}\` ${expBar}`,
        inline: false 
      },
      {
        name: '⚔️ Combat Stats',
        value: `╭─ ⚔️ ATK: **${character.attack}** • 🛡️ DEF: **${character.defense}**\n├─ ⚡ SPD: **${character.speed}**\n├─ 💥 Crit: **${character.critical_chance}%** (x**${character.critical_damage}**)\n╰─ 💨 Dodge: **${character.dodge_chance}%**`,
        inline: false
      }
    )
    .setFooter({ text: `ID: ${character.id}` });

  await message.reply({ embeds: [embed] });
}

async function handleHunt(message: Message) {
  const player = await PlayerService.findByDiscordId(message.author.id);
  if (!player) {
    await message.reply('❌ Bạn chưa có nhân vật! Sử dụng `zstart` để bắt đầu.');
    return;
  }

  const character = await CharacterService.findByPlayerId(player.id);
  if (!character) {
    await message.reply('❌ Bạn chưa có nhân vật! Sử dụng `zstart` để bắt đầu.');
    return;
  }

  if (character.hp <= 0) {
    await message.reply('❌ Bạn đã hết HP! Hãy nghỉ ngơi để hồi phục. 💤');
    return;
  }

  // Spawn 1-3 monsters
  const minLevel = Math.max(1, character.level - 2);
  const maxLevel = character.level + 3;
  const monsters = await MonsterService.spawnMonsters(minLevel, maxLevel);

  if (monsters.length === 0) {
    await message.reply('❌ Không tìm thấy quái vật nào phù hợp với level của bạn!');
    return;
  }

  // Build start message
  const startEmbed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('⚔️ Bắt đầu chiến đấu!')
    .setDescription(
      monsters.length === 1
        ? `Bạn gặp **${monsters[0].name}** (Level **\`${monsters[0].level}\`**)`
        : `⚠️ Bạn bị bao vây bởi **${monsters.length} quái vật**!`
    );

  // Thêm thông tin từng quái
  for (let i = 0; i < monsters.length; i++) {
    const monster = monsters[i];
    startEmbed.addFields({
      name: `${i + 1}. ${monster.name} (Lv.${monster.level})`,
      value: `❤️ HP: **\`${monster.hp}\`** • ⚔️ ATK: **\`${monster.attack}\`** • 🛡️ DEF: **\`${monster.defense}\`**`,
      inline: false
    });
  }

  startEmbed.setFooter({ text: '⏳ Đang chiến đấu...' });

  const battleMessage = await message.reply({ embeds: [startEmbed] });

  setTimeout(async () => {
    const result = await BattleService.battle(character, monsters);

    let battleLog = '';

    const importantRounds = result.rounds.filter((round, index) =>
      index === 0 ||
      index >= result.rounds.length - 3 ||
      round.characterHp < character.max_hp * 0.3 ||
      round.monsterStates.some(m => m.hp < m.maxHp * 0.3 && m.hp > 0)
    );

    for (const round of importantRounds.slice(0, 5)) {
      battleLog += `╭─ **Hiệp ${round.round}**\n`;
      battleLog += `│ ${round.characterAction}\n`;
      
      // Monster actions
      for (const monAction of round.monsterActions) {
        battleLog += `│ ${monAction}\n`;
      }
      
      // HP bars
      const charHpPerc = Math.max(0, Math.floor((round.characterHp / character.max_hp) * 5));
      const charHpBar = '█'.repeat(charHpPerc) + '░'.repeat(5 - charHpPerc);
      battleLog += `│ ❤️ Bạn: ${charHpBar} \`${round.characterHp}/${character.max_hp}\`\n`;
      
      // Monster HP bars
      for (const monState of round.monsterStates) {
        const monHpPerc = Math.max(0, Math.floor((monState.hp / monState.maxHp) * 5));
        const monHpBar = '█'.repeat(monHpPerc) + '░'.repeat(5 - monHpPerc);
        const status = monState.hp === 0 ? '💀' : '🔥';
        battleLog += `│ ${status} ${monState.name}: ${monHpBar} \`${monState.hp}/${monState.maxHp}\`\n`;
      }
      
      battleLog += `╰─────\n\n`;
    }

    if (importantRounds.length < result.rounds.length) {
      battleLog += `*...và ${result.rounds.length - importantRounds.length} hiệp khác*\n\n`;
    }

    const resultEmbed = new EmbedBuilder()
      .setColor(result.won ? '#00FF00' : '#FF0000')
      .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
      .addFields({
        name: '⚔️ Diễn biến trận đấu',
        value: battleLog,
        inline: false
      })
      .setFooter({ text: `Số hiệp: ${result.rounds.length} | Quái hạ: ${result.monstersDefeated}/${monsters.length}` });

    if (result.won) {
      resultEmbed.addFields({
        name: '🎁 Phần thưởng',
        value: `🎯 EXP: **\`+${result.expGained}\`** • 💰 Vàng: **\`+${result.goldGained}\`**`,
        inline: false
      });

      if (result.itemsDropped.length > 0) {
        let itemsList = '';
        for (const item of result.itemsDropped) {
          itemsList += `• **${item.name}**\n`;
        }
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

    await battleMessage.edit({ embeds: [resultEmbed] });

    // Gửi level up notification riêng biệt
    if (result.won && result.leveledUp) {
      const levelUpEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('✨ LEVEL UP! ✨')
        .setDescription(`Chúc mừng! Bạn đã lên **Level ${result.newLevel}**!`)
        .addFields(
          {
            name: '📊 Chỉ số tăng',
            value: 
              '```diff\n' +
              '+ HP: +20 (Max HP tăng)\n' +
              '+ KI: +20 (Max KI tăng)\n' +
              '+ Attack: +5\n' +
              '+ Defense: +5\n' +
              '+ Speed: +3\n' +
              '```',
            inline: false
          }
        )
        .setFooter({ text: '💚 HP và KI đã được hồi phục đầy!' })
        .setTimestamp();

      await message.reply({ embeds: [levelUpEmbed] });
    }
  }, 2000);
}

async function handleInventory(message: Message) {
  const player = await PlayerService.findByDiscordId(message.author.id);
  if (!player) {
    await message.reply('❌ Bạn chưa có nhân vật! Sử dụng `zstart` để bắt đầu.');
    return;
  }

  const character = await CharacterService.findByPlayerId(player.id);
  if (!character) {
    await message.reply('❌ Bạn chưa có nhân vật! Sử dụng `zstart` để bắt đầu.');
    return;
  }

  const items = await query(
    `SELECT i.*, ci.quantity, ci.equipped, it.name as type_name
     FROM character_items ci
     JOIN items i ON ci.item_id = i.id
     JOIN item_types it ON i.item_type_id = it.id
     WHERE ci.character_id = $1
     ORDER BY it.id, i.name`,
    [character.id]
  );

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle(`🎒 Túi đồ của ${character.name}`)
    .setDescription(`💰 Vàng: **\`${character.gold}\`**`);

  if (items.rows.length === 0) {
    embed.addFields({
      name: '📦 Túi đồ',
      value: '*❌ Túi đồ trống!*',
      inline: false
    });
    await message.reply({ embeds: [embed] });
    return;
  }

  const itemsByType = items.rows.reduce((acc: any, item: any) => {
    if (!acc[item.type_name]) {
      acc[item.type_name] = [];
    }
    acc[item.type_name].push(item);
    return acc;
  }, {});

  for (const [typeName, typeItems] of Object.entries(itemsByType)) {
    let itemText = '';
    (typeItems as any[]).forEach((item, idx, arr) => {
      const isLast = idx === arr.length - 1;
      const prefix = isLast ? '╰─' : '├─';
      itemText += `${prefix} ${item.equipped ? '✅' : '⬜'} **${item.name}** x\`${item.quantity}\`\n`;
      const stats = [];
      if (item.hp_bonus > 0) stats.push(`❤️ +${item.hp_bonus}`);
      if (item.ki_bonus > 0) stats.push(`💙 +${item.ki_bonus}`);
      if (item.attack_bonus > 0) stats.push(`⚔️ +${item.attack_bonus}`);
      if (item.defense_bonus > 0) stats.push(`🛡️ +${item.defense_bonus}`);
      if (item.speed_bonus > 0) stats.push(`⚡ +${item.speed_bonus}`);
      if (stats.length > 0) {
        itemText += `   ${stats.join(' • ')}\n`;
      }
    });
    
    embed.addFields({
      name: `📦 ${typeName}`,
      value: itemText,
      inline: false
    });
  }

  await message.reply({ embeds: [embed] });
}

async function handleSkills(message: Message) {
  const player = await PlayerService.findByDiscordId(message.author.id);
  if (!player) {
    await message.reply('❌ Bạn chưa có nhân vật! Sử dụng `zstart` để bắt đầu.');
    return;
  }

  const character = await CharacterService.findByPlayerId(player.id);
  if (!character) {
    await message.reply('❌ Bạn chưa có nhân vật! Sử dụng `zstart` để bắt đầu.');
    return;
  }

  const race = await CharacterService.getRaceById(character.race_id);
  const allSkills = await SkillService.getAllSkillsByRace(character.id, character.race_id);

  // Tính progress bar cho KI
  const kiPercentage = Math.floor((character.ki / character.max_ki) * 10);
  const kiBar = '█'.repeat(kiPercentage) + '░'.repeat(10 - kiPercentage);

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle(`⚡ Kỹ năng ${race?.name}`)
    .setDescription(`**${character.name}** • Level **${character.level}**\n💙 KI: \`${character.ki}\`/\`${character.max_ki}\` ${kiBar}`)
    .setFooter({ text: 'Skills sẽ tự động sử dụng trong combat!' });

  if (allSkills.length > 0) {
    const learnedSkills = allSkills.filter(s => s.learned);
    const unlearnedSkills = allSkills.filter(s => !s.learned);

    // Kỹ năng đã học - rút gọn
    if (learnedSkills.length > 0) {
      let learnedText = '';
      for (const skill of learnedSkills) {
        const canUse = character.level >= skill.required_level;
        const icon = canUse ? '✅' : '🔒';
        
        // Rút gọn: chỉ hiển thị tên, level, KI cost và damage multiplier (nếu có)
        let skillInfo = `${icon} **${skill.name}** Lv.\`${skill.required_level}\` • KI:\`${skill.ki_cost}\``;
        
        if (skill.skill_type === 'attack' && skill.damage_multiplier) {
          skillInfo += ` • 💥\`${Math.round(skill.damage_multiplier * 100)}%\``;
        } else if (skill.skill_type === 'heal') {
          skillInfo += ` • 💚\`${skill.heal_amount}\``;
        } else if (skill.skill_type === 'buff') {
          skillInfo += ` • ⭐Buff`;
        }
        
        learnedText += skillInfo + '\n';
      }
      
      embed.addFields({
        name: `✅ Đã học (${learnedSkills.length})`,
        value: learnedText || 'Không có',
        inline: false
      });
    }

    // Kỹ năng chưa học - rút gọn hơn nữa
    if (unlearnedSkills.length > 0) {
      let unlearnedText = '';
      for (const skill of unlearnedSkills) {
        const levelsNeeded = skill.required_level - character.level;
        unlearnedText += `🔒 **${skill.name}** Lv.\`${skill.required_level}\``;
        if (levelsNeeded > 0) {
          unlearnedText += ` (còn \`${levelsNeeded}\`)`;
        }
        unlearnedText += '\n';
      }
      
      embed.addFields({
        name: `🔒 Chưa học (${unlearnedSkills.length})`,
        value: unlearnedText || 'Không có',
        inline: false
      });
    }
  } else {
    embed.addFields({
      name: '📝 Kỹ năng',
      value: '*Chưa có kỹ năng! Hãy lên cấp để mở khóa.*',
      inline: false
    });
  }

  await message.reply({ embeds: [embed] });
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
