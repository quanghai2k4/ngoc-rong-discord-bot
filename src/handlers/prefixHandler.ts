import { Message, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js';
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

  // Random vị trí mới mỗi lần hunt
  const newLocation = CharacterService.getRandomLocation();
  await CharacterService.updateLocation(character.id, newLocation);

  // Kiểm tra xem có phải khu vực boss-only không
  const isBossOnlyArea = CharacterService.isBossOnlyLocation(newLocation);
  
  // Spawn monsters dựa trên level của nhân vật và loại khu vực
  const monsters = await MonsterService.spawnMonsters(character.level, isBossOnlyArea);

  if (monsters.length === 0) {
    if (isBossOnlyArea) {
      await message.reply(`❌ Không có Boss nào phù hợp với level của bạn tại **${newLocation}**!\n💡 *Hãy lên level cao hơn để thách đấu Boss.*`);
    } else {
      await message.reply('❌ Không tìm thấy quái vật nào phù hợp với level của bạn!');
    }
    return;
  }

  // Build start message
  const startEmbed = new EmbedBuilder()
    .setColor(isBossOnlyArea ? '#FFD700' : '#FF0000')
    .setTitle(isBossOnlyArea ? '👑 THÁCH ĐẤU BOSS!' : '⚔️ Bắt đầu chiến đấu!')
    .setDescription(
      `📍 **${newLocation}**${isBossOnlyArea ? ' ✨' : ''}\n\n` +
      (monsters.length === 1
        ? `Bạn gặp **${monsters[0].is_super ? '⭐ ' : ''}${monsters[0].is_boss ? '👑 ' : ''}${monsters[0].name}** (Level **\`${monsters[0].level}\`**)${monsters[0].is_super ? ' ✨ **SIÊU QUÁI!**' : ''}${monsters[0].is_boss ? ' 👑 **BOSS**' : ''}`
        : `⚠️ Bạn bị bao vây bởi **${monsters.length} quái vật**!`)
    );

  // Thêm thông tin từng quái
  startEmbed.addFields(
    ...monsters.map((monster, i) => ({
      name: `${i + 1}. ${monster.is_super ? '⭐ ' : ''}${monster.name} (Lv.${monster.level})${monster.is_boss ? ' 👑 BOSS' : ''}${monster.is_super ? ' ✨ SIÊU' : ''}`,
      value: `❤️ HP: **\`${monster.hp}\`** • ⚔️ ATK: **\`${monster.attack}\`** • 🛡️ DEF: **\`${monster.defense}\`**`,
      inline: false
    }))
  );

  startEmbed.setFooter({ text: '⏳ Đang chiến đấu...' });

  const battleMessage = await message.reply({ embeds: [startEmbed] });

  setTimeout(async () => {
    const result = await BattleService.battle(character, monsters);

    // Kiểm tra xem có đánh boss không
    const isBossFight = monsters.some(m => m.is_boss);

    let battleLog = '';

    // Nếu đánh boss -> hiển thị đầy đủ, nếu không -> chỉ hiệp cuối
    let importantRounds;
    if (isBossFight) {
      // Boss fight: hiển thị hiệp đầu + hiệp cuối + hiệp quan trọng
      importantRounds = result.rounds.filter((round, index) =>
        index === 0 ||
        index >= result.rounds.length - 3 ||
        round.characterHp < character.max_hp * 0.3 ||
        round.monsterStates.some(m => m.hp < m.maxHp * 0.3 && m.hp > 0)
      );
    } else {
      // Hunt thường: chỉ hiệp cuối
      importantRounds = result.rounds.slice(-1);
    }

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

    if (isBossFight && importantRounds.length < result.rounds.length) {
      battleLog += `*...và ${result.rounds.length - importantRounds.length} hiệp khác*\n\n`;
    }

    // Đảm bảo battleLog không rỗng và không quá dài (Discord limit: 1024 chars)
    if (!battleLog || battleLog.trim().length === 0) {
      battleLog = '*Trận đấu diễn ra quá nhanh!*';
    } else if (battleLog.length > 1024) {
      battleLog = battleLog.substring(0, 1000) + '\n*...(quá dài, đã cắt bớt)*';
    }

    const resultEmbed = new EmbedBuilder()
      .setColor(result.won ? '#00FF00' : '#FF0000')
      .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
      .addFields([{
        name: '⚔️ Diễn biến trận đấu',
        value: battleLog,
        inline: false
      }])
      .setFooter({ text: `Số hiệp: ${result.rounds.length} | Quái hạ: ${result.monstersDefeated}/${monsters.length}` });

    if (result.won) {
      resultEmbed.addFields([{
        name: '🎁 Phần thưởng',
        value: `🎯 EXP: **\`+${result.expGained}\`** • 💰 Vàng: **\`+${result.goldGained}\`**`,
        inline: false
      }]);

      if (result.itemsDropped.length > 0) {
        let itemsList = '';
        for (const item of result.itemsDropped) {
          itemsList += `• **${item.name}**\n`;
        }
        resultEmbed.addFields([{
          name: '📦 Vật phẩm rơi',
          value: itemsList,
          inline: false
        }]);
      }
    } else {
      resultEmbed.addFields([{
        name: '💔 Hậu quả',
        value: '*Bạn mất 10% vàng và HP còn 1*',
        inline: false
      }]);
    }

    await battleMessage.edit({ embeds: [resultEmbed] });

    // Gửi level up notification riêng biệt
    if (result.won && result.leveledUp) {
      const levelUpEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('✨ LEVEL UP! ✨')
        .setDescription(`Chúc mừng! Bạn đã lên **Level ${result.newLevel}**!`)
        .addFields([
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
        ])
        .setFooter({ text: '💚 HP và KI đã được hồi phục đầy!' })
        .setTimestamp();

      await message.reply({ embeds: [levelUpEmbed] });
    }
  }, 2000);
}

async function handleBoss(message: Message) {
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

  // Lấy tất cả boss từ database
  const bossesResult = await query(
    'SELECT id, name, min_level, max_level, hp, attack, defense, speed, experience_reward, gold_reward, critical_chance, critical_damage FROM monsters WHERE is_boss = true ORDER BY min_level'
  );
  const bosses = bossesResult.rows;

  if (bosses.length === 0) {
    await message.reply('❌ Không có Boss nào trong hệ thống!');
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

  const menuEmbed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('👑 CHỌN BOSS ĐỂ THÁCH ĐẤU')
    .setDescription(
      `**${character.name}** (Level ${character.level})\n` +
      `❤️ HP: ${character.hp}/${character.max_hp} • ⚔️ ATK: ${character.attack} • 🛡️ DEF: ${character.defense} • ⚡ SPD: ${character.speed}\n\n` +
      `*Chọn Boss từ menu bên dưới để bắt đầu trận chiến!*`
    )
    .setFooter({ text: 'Menu sẽ tự động hết hạn sau 60 giây' });

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
        content: '❌ Boss không tồn tại!', 
        embeds: [], 
        components: [] 
      });
      return;
    }

    // Update reply để xóa menu
    await response.edit({ 
      embeds: [new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('⚔️ CHUẨN BỊ CHIẾN ĐẤU!')
        .setDescription(`Đang tạo chiến trường cho trận đấu với **${selectedBossData.name}**...`)
      ], 
      components: [] 
    });

    // Random vị trí
    const newLocation = CharacterService.getRandomLocation();
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
    const startEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('👑 THÁCH ĐẤU BOSS!')
      .setDescription(
        `📍 **${newLocation}** ✨\n\n` +
        `**${character.name}** thách đấu **👑 ${boss.name}**!`
      )
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

    // Gửi từng hiệp vào thread
    for (const round of result.rounds) {
      // Actions
      let actionsText = '';
      if (round.actions && round.actions.length > 0) {
        for (const action of round.actions) {
          actionsText += `│ ${action}\n`;
        }
      } else {
        actionsText += `│ ${round.characterAction}\n`;
        for (const monAction of round.monsterActions) {
          actionsText += `│ ${monAction}\n`;
        }
      }

      // HP bars
      const charHpPerc = Math.max(0, Math.floor((round.characterHp / character.max_hp) * 5));
      const charHpBar = '█'.repeat(charHpPerc) + '░'.repeat(5 - charHpPerc);
      const charHpStatus = `│ ❤️ ${character.name}: ${charHpBar} \`${round.characterHp}/${character.max_hp}\``;
      
      const bossState = round.monsterStates[0];
      const bossHpPerc = Math.max(0, Math.floor((bossState.hp / bossState.maxHp) * 5));
      const bossHpBar = '█'.repeat(bossHpPerc) + '░'.repeat(5 - bossHpPerc);
      const status = bossState.hp === 0 ? '💀' : '👑';
      const bossHpStatus = `│ ${status} ${bossState.name}: ${bossHpBar} \`${bossState.hp}/${bossState.maxHp}\``;

      // Tạo embed cho từng hiệp với box drawing
      const roundEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setDescription(
          `╭─ **Hiệp ${round.round}**\n` +
          actionsText +
          charHpStatus + `\n` +
          bossHpStatus + `\n` +
          `╰─────`
        );

      await thread.send({ embeds: [roundEmbed] });
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay giữa các hiệp
    }

    // Kết quả
    const resultEmbed = new EmbedBuilder()
      .setColor(result.won ? '#00FF00' : '#FF0000')
      .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
      .setDescription(
        result.won 
          ? `**${character.name}** đã đánh bại **${boss.name}**!` 
          : `**${character.name}** đã bị **${boss.name}** đánh bại!`
      )
      .setFooter({ text: `Tổng số hiệp: ${result.rounds.length}` });

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

    await thread.send({ embeds: [resultEmbed] });

    // Level up trong thread nếu có
    if (result.won && result.leveledUp) {
      const levelUpEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('✨ LEVEL UP! ✨')
        .setDescription(`🎊 Chúc mừng! **${character.name}** đã lên **Level \`${result.newLevel}\`**!`)
        .addFields({
          name: '📈 Tăng chỉ số',
          value: '```diff\n+ HP & KI: +20\n+ ATK & DEF: +5\n+ SPD: +3\n```',
          inline: false
        })
        .setFooter({ text: 'HP và KI đã được hồi phục đầy!' });

      await thread.send({ embeds: [levelUpEmbed] });
    }

    // Archive và lock thread sau 10 giây
    setTimeout(async () => {
      try {
        await thread.setArchived(true);
        await thread.setLocked(true);
      } catch (error) {
        console.error('Lỗi khi archive thread:', error);
      }
    }, 10000);

    // Update original message
    await response.edit({
      embeds: [new EmbedBuilder()
        .setColor(result.won ? '#00FF00' : '#FF0000')
        .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
        .setDescription(
          `Trận đấu với **${boss.name}** đã kết thúc!\n\n` +
          `*Chi tiết trận đấu đã được ghi lại trong thread (sẽ tự động ẩn sau 10 giây)*`
        )
      ],
      components: []
    });

  } catch (error: any) {
    if (error.message && error.message.includes('time')) {
      await response.edit({ 
        content: '⏰ Đã hết thời gian chọn Boss!', 
        embeds: [], 
        components: [] 
      });
    } else {
      console.error('Lỗi trong boss command:', error);
      await response.edit({ 
        content: '❌ Có lỗi xảy ra khi thách đấu Boss!', 
        embeds: [], 
        components: [] 
      });
    }
  }
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
    embed.addFields([{
      name: '📦 Túi đồ',
      value: '*❌ Túi đồ trống!*',
      inline: false
    }]);
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
    
    embed.addFields([{
      name: `📦 ${typeName}`,
      value: itemText,
      inline: false
    }]);
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
      
      embed.addFields([{
        name: `✅ Đã học (${learnedSkills.length})`,
        value: learnedText || 'Không có',
        inline: false
      }]);
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
      
      embed.addFields([{
        name: `🔒 Chưa học (${unlearnedSkills.length})`,
        value: unlearnedText || 'Không có',
        inline: false
      }]);
    }
  } else {
    embed.addFields([{
      name: '📝 Kỹ năng',
      value: '*Chưa có kỹ năng! Hãy lên cấp để mở khóa.*',
      inline: false
    }]);
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
