import { Message, EmbedBuilder } from 'discord.js';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';
import { MonsterService } from '../services/MonsterService';
import { BattleService } from '../services/BattleService';
import { query } from '../database/db';

export async function handlePrefixCommand(
  message: Message,
  commandName: string,
  args: string[]
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

  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🐉 Chào mừng đến với thế giới Ngọc Rồng!')
    .setDescription('**Chọn chủng tộc của bạn:**\n\nTrả lời bằng số **1**, **2**, hoặc **3** để chọn chủng tộc!')
    .addFields(
      races.map((race, index) => ({
        name: `${index + 1}. ${race.name}`,
        value: `${race.description}\nHP: +${race.hp_bonus} | KI: +${race.ki_bonus} | ATK: +${race.attack_bonus} | DEF: +${race.defense_bonus}`,
        inline: false
      }))
    )
    .setTimestamp();

  const initialMsg = await message.reply({ embeds: [embed] });

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

    const defaultName = `${selectedRace.name}_${message.author.username.substring(0, 10)}`;
    const character = await CharacterService.create(player.id, defaultName, selectedRace.id);

    const successEmbed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('✅ Tạo nhân vật thành công!')
      .setDescription(`**${character.name}** (${selectedRace.name})`)
      .addFields(
        { name: '❤️ HP', value: `${character.max_hp}`, inline: true },
        { name: '💙 KI', value: `${character.max_ki}`, inline: true },
        { name: '⚡ Speed', value: `${character.speed}`, inline: true },
        { name: '⚔️ Attack', value: `${character.attack}`, inline: true },
        { name: '🛡️ Defense', value: `${character.defense}`, inline: true },
        { name: '\u200B', value: '\u200B', inline: true }
      )
      .setFooter({ text: 'Sử dụng zprofile để xem thông tin chi tiết!' })
      .setTimestamp();

    await message.reply({ embeds: [successEmbed] });

  } catch (error) {
    await message.reply('⏰ Hết thời gian chọn! Vui lòng thử lại với \`zstart\`');
  }
}

async function handleProfile(message: Message) {
  const player = await PlayerService.findByDiscordId(message.author.id);

  if (!player) {
    await message.reply('❌ Bạn chưa có nhân vật! Sử dụng \`zstart\` để bắt đầu.');
    return;
  }

  const character = await CharacterService.findByPlayerId(player.id);

  if (!character) {
    await message.reply('❌ Bạn chưa có nhân vật! Sử dụng \`zstart\` để bắt đầu.');
    return;
  }

  const race = await CharacterService.getRaceById(character.race_id);
  const expNeeded = 100 + (character.level - 1) * 50;

  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle(`⚔️ ${character.name}`)
    .setDescription(`Chủng tộc: **${race?.name}**`)
    .addFields(
      { name: '📊 Level', value: `${character.level}`, inline: true },
      { name: '✨ EXP', value: `${character.experience}/${expNeeded}`, inline: true },
      { name: '💰 Vàng', value: `${character.gold}`, inline: true },
      { name: '❤️ HP', value: `${character.hp}/${character.max_hp}`, inline: true },
      { name: '💙 KI', value: `${character.ki}/${character.max_ki}`, inline: true },
      { name: '⚡ Speed', value: `${character.speed}`, inline: true },
      { name: '⚔️ Attack', value: `${character.attack}`, inline: true },
      { name: '🛡️ Defense', value: `${character.defense}`, inline: true },
      { name: '📍 Vị trí', value: `${character.location}`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: `ID: ${character.id}` });

  await message.reply({ embeds: [embed] });
}

async function handleHunt(message: Message) {
  const player = await PlayerService.findByDiscordId(message.author.id);
  if (!player) {
    await message.reply('❌ Bạn chưa có nhân vật! Sử dụng \`zstart\` để bắt đầu.');
    return;
  }

  const character = await CharacterService.findByPlayerId(player.id);
  if (!character) {
    await message.reply('❌ Bạn chưa có nhân vật! Sử dụng \`zstart\` để bắt đầu.');
    return;
  }

  if (character.hp <= 0) {
    await message.reply('❌ Bạn đã hết HP! Hãy nghỉ ngơi để hồi phục.');
    return;
  }

  const minLevel = Math.max(1, character.level - 2);
  const maxLevel = character.level + 3;
  const monster = await MonsterService.getRandomByLevel(minLevel, maxLevel);

  if (!monster) {
    await message.reply('❌ Không tìm thấy quái vật nào phù hợp với level của bạn!');
    return;
  }

  const battleStartEmbed = new EmbedBuilder()
    .setColor(0xFF4500)
    .setTitle('⚔️ Bắt đầu chiến đấu!')
    .setDescription(`Bạn gặp **${monster.name}** (Level ${monster.level})`)
    .addFields(
      { name: '❤️ HP', value: `${monster.hp}`, inline: true },
      { name: '⚔️ ATK', value: `${monster.attack}`, inline: true },
      { name: '🛡️ DEF', value: `${monster.defense}`, inline: true }
    )
    .setFooter({ text: '⏳ Đang chiến đấu...' });

  const battleMsg = await message.reply({ embeds: [battleStartEmbed] });

  setTimeout(async () => {
    const result = await BattleService.battle(character, monster);

    let battleLog = '';

    const importantRounds = result.rounds.filter((round, index) =>
      index === 0 ||
      index >= result.rounds.length - 3 ||
      round.characterHp < character.max_hp * 0.3 ||
      round.monsterHp < monster.hp * 0.3
    );

    for (const round of importantRounds.slice(0, 5)) {
      battleLog += `**Hiệp ${round.round}:**\n`;
      battleLog += `${round.characterAction}\n`;
      battleLog += `${round.monsterAction}\n\n`;
    }

    const resultEmbed = new EmbedBuilder()
      .setColor(result.won ? 0x00FF00 : 0xFF0000)
      .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
      .setDescription(battleLog || 'Không có nhật ký chiến đấu.')
      .addFields({ name: '⚔️ Số hiệp', value: `${result.rounds.length}`, inline: true });

    if (result.won) {
      resultEmbed.addFields(
        { name: '✨ EXP', value: `+${result.expGained}`, inline: true },
        { name: '💰 Vàng', value: `+${result.goldGained}`, inline: true }
      );

      if (result.itemsDropped.length > 0) {
        const itemsList = result.itemsDropped.map(item => `• ${item.name}`).join('\n');
        resultEmbed.addFields({ name: '🎁 Vật phẩm rơi', value: itemsList, inline: false });
      }
    } else {
      resultEmbed.addFields({ name: '💔 Hậu quả', value: 'Bạn mất 10% vàng và HP còn 1', inline: false });
    }

    resultEmbed.setTimestamp();

    await message.reply({ embeds: [resultEmbed] });
  }, 2000);
}

async function handleInventory(message: Message) {
  const player = await PlayerService.findByDiscordId(message.author.id);
  if (!player) {
    await message.reply('❌ Bạn chưa có nhân vật! Sử dụng \`zstart\` để bắt đầu.');
    return;
  }

  const character = await CharacterService.findByPlayerId(player.id);
  if (!character) {
    await message.reply('❌ Bạn chưa có nhân vật! Sử dụng \`zstart\` để bắt đầu.');
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

  if (items.rows.length === 0) {
    const emptyEmbed = new EmbedBuilder()
      .setColor(0x808080)
      .setTitle(`🎒 Túi đồ của ${character.name}`)
      .addFields({ name: '💰 Vàng', value: `${character.gold}`, inline: false })
      .setDescription('❌ Túi đồ trống!')
      .setTimestamp();

    await message.reply({ embeds: [emptyEmbed] });
    return;
  }

  const itemsByType = items.rows.reduce((acc: any, item: any) => {
    if (!acc[item.type_name]) {
      acc[item.type_name] = [];
    }
    acc[item.type_name].push(item);
    return acc;
  }, {});

  const inventoryEmbed = new EmbedBuilder()
    .setColor(0x9370DB)
    .setTitle(`🎒 Túi đồ của ${character.name}`)
    .addFields({ name: '💰 Vàng', value: `${character.gold}`, inline: false });

  for (const [typeName, typeItems] of Object.entries(itemsByType)) {
    let itemsText = '';
    (typeItems as any[]).forEach(item => {
      let info = `${item.equipped ? '✅' : '⬜'} ${item.name} x${item.quantity}`;
      const stats = [];
      if (item.hp_bonus > 0) stats.push(`HP+${item.hp_bonus}`);
      if (item.ki_bonus > 0) stats.push(`KI+${item.ki_bonus}`);
      if (item.attack_bonus > 0) stats.push(`ATK+${item.attack_bonus}`);
      if (item.defense_bonus > 0) stats.push(`DEF+${item.defense_bonus}`);
      if (item.speed_bonus > 0) stats.push(`SPD+${item.speed_bonus}`);
      if (stats.length > 0) {
        info += ` (${stats.join(', ')})`;
      }
      itemsText += `${info}\n`;
    });
    inventoryEmbed.addFields({ name: `📦 ${typeName}`, value: itemsText, inline: false });
  }

  inventoryEmbed.setTimestamp();

  await message.reply({ embeds: [inventoryEmbed] });
}

async function handleHelp(message: Message) {
  const helpEmbed = new EmbedBuilder()
    .setColor(0x1E90FF)
    .setTitle('🐉 NGỌC RỒNG BOT - HƯỚNG DẪN')
    .setDescription('**Prefix:** `z`')
    .addFields(
      { name: '📋 zstart / zbatdau', value: 'Bắt đầu hành trình, tạo nhân vật', inline: false },
      { name: '📋 zprofile / zinfo / ztt / zthongtin', value: 'Xem thông tin nhân vật', inline: false },
      { name: '📋 zhunt / zsan / zdanhquai', value: 'Đi săn quái vật để kiếm EXP và vàng', inline: false },
      { name: '📋 zinventory / zinv / ztui / ztuido', value: 'Xem túi đồ của bạn', inline: false },
      { name: '📋 zhelp / zh / ztrogiup', value: 'Hiển thị hướng dẫn này', inline: false },
      { 
        name: '💡 Mẹo', 
        value: '• Săn quái để lên level và kiếm vàng\n• Quái vật có thể rơi vật phẩm quý hiếm\n• Mỗi lần lên cấp, chỉ số của bạn sẽ tăng\n• Nếu thua trận, bạn sẽ mất 10% vàng', 
        inline: false 
      },
      { 
        name: '🔗 Liên kết', 
        value: 'Slash commands: `/start`, `/profile`, `/hunt`, `/inventory`', 
        inline: false 
      }
    )
    .setTimestamp();

  await message.reply({ embeds: [helpEmbed] });
}
