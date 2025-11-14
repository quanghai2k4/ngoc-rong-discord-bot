/**
 * Reusable embed builders cho Discord messages
 */

import { EmbedBuilder } from 'discord.js';
import { UI_CONFIG } from '../config';
import { Character, Monster } from '../types';
import { formatHpBar } from './helpers';

/**
 * Tạo embed cho battle start
 */
export function createBattleStartEmbed(
  location: string,
  monsters: Monster[],
  isBossArea = false
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(isBossArea ? UI_CONFIG.COLORS.BOSS : UI_CONFIG.COLORS.ERROR)
    .setTitle(isBossArea ? '👑 THÁCH ĐẤU BOSS!' : '⚔️ Bắt đầu chiến đấu!')
    .setDescription(
      `📍 **${location}**${isBossArea ? ' ✨' : ''}\n\n` +
      (monsters.length === 1
        ? `Bạn gặp **${monsters[0].is_super ? '⭐ ' : ''}${monsters[0].is_boss ? '👑 ' : ''}${monsters[0].name}** (Level **\`${monsters[0].level}\`**)${monsters[0].is_super ? ' ✨ **SIÊU QUÁI!**' : ''}${monsters[0].is_boss ? ' 👑 **BOSS**' : ''}`
        : `⚠️ Bạn bị bao vây bởi **${monsters.length} quái vật**!`)
    )
    .setFooter({ text: '⏳ Đang chiến đấu...' });

  // Thêm thông tin từng quái
  for (let i = 0; i < monsters.length; i++) {
    const monster = monsters[i];
    embed.addFields({
      name: `${i + 1}. ${monster.is_super ? '⭐ ' : ''}${monster.name} (Lv.${monster.level})${monster.is_boss ? ' 👑 BOSS' : ''}${monster.is_super ? ' ✨ SIÊU' : ''}`,
      value: `❤️ HP: **\`${monster.hp}\`** • ⚔️ ATK: **\`${monster.attack}\`** • 🛡️ DEF: **\`${monster.defense}\`**`,
      inline: false
    });
  }

  return embed;
}

/**
 * Tạo embed cho battle result
 */
export function createBattleResultEmbed(
  won: boolean,
  battleLog: string,
  expGained: number,
  goldGained: number,
  itemsDropped: any[],
  totalRounds: number,
  monstersDefeated: number,
  totalMonsters: number
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(won ? UI_CONFIG.COLORS.SUCCESS : UI_CONFIG.COLORS.ERROR)
    .setTitle(won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
    .setFooter({ text: `Số hiệp: ${totalRounds} | Quái hạ: ${monstersDefeated}/${totalMonsters}` });

  // Battle log (nếu có)
  if (battleLog && battleLog.trim()) {
    embed.addFields({
      name: '⚔️ Diễn biến trận đấu',
      value: battleLog.length > UI_CONFIG.MAX_BATTLE_LOG_LENGTH 
        ? battleLog.substring(0, UI_CONFIG.BATTLE_LOG_TRUNCATE_LENGTH) + '\n*...(quá dài, đã cắt bớt)*'
        : battleLog,
      inline: false
    });
  }

  if (won) {
    embed.addFields({
      name: '🎁 Phần thưởng',
      value: `🎯 EXP: **\`+${expGained}\`** • 💰 Vàng: **\`+${goldGained}\`**`,
      inline: false
    });

    if (itemsDropped.length > 0) {
      const itemsList = itemsDropped.map(item => `• **${item.name}**`).join('\n');
      embed.addFields({
        name: '📦 Vật phẩm rơi',
        value: itemsList,
        inline: false
      });
    }
  } else {
    embed.addFields({
      name: '💔 Hậu quả',
      value: '*Bạn mất 10% vàng*',
      inline: false
    });
  }

  return embed;
}

/**
 * Tạo embed cho level up
 */
export function createLevelUpEmbed(newLevel: number, characterName?: string): EmbedBuilder {
  const description = characterName 
    ? `🎊 Chúc mừng! **${characterName}** đã lên **Level \`${newLevel}\`**!`
    : `🎊 Chúc mừng! Bạn đã lên **Level \`${newLevel}\`**!`;

  return new EmbedBuilder()
    .setColor(UI_CONFIG.COLORS.BOSS)
    .setTitle('✨ LEVEL UP! ✨')
    .setDescription(description)
    .addFields({
      name: '📈 Tăng chỉ số',
      value: '```diff\n+ HP & KI: +20\n+ ATK & DEF: +5\n+ SPD: +3\n```',
      inline: false
    })
    .setFooter({ text: 'HP và KI đã được hồi phục đầy!' })
    .setTimestamp();
}

/**
 * Tạo embed cho profile
 */
export function createProfileEmbed(
  character: Character,
  raceName: string,
  expNeeded: number
): EmbedBuilder {
  const hpBar = formatHpBar(character.hp, character.max_hp, UI_CONFIG.HP_BAR_LENGTH);
  const kiBar = formatHpBar(character.ki, character.max_ki, UI_CONFIG.HP_BAR_LENGTH);
  const expBar = formatHpBar(character.experience, expNeeded, UI_CONFIG.HP_BAR_LENGTH);

  return new EmbedBuilder()
    .setColor(UI_CONFIG.COLORS.PRIMARY)
    .setTitle(`⚔️ ${character.name}`)
    .setDescription(`**${raceName}** • Level **${character.level}** • 💰 **${character.gold}** vàng\n╰─ 📍 ${character.location}`)
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
}

/**
 * Tạo embed cho error
 */
export function createErrorEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(UI_CONFIG.COLORS.ERROR)
    .setDescription(message);
}

/**
 * Tạo embed cho success
 */
export function createSuccessEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(UI_CONFIG.COLORS.SUCCESS)
    .setTitle(title)
    .setDescription(description);
}

/**
 * Tạo embed cho boss selection menu
 */
export function createBossMenuEmbed(character: Character): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(UI_CONFIG.COLORS.BOSS)
    .setTitle('👑 CHỌN BOSS ĐỂ THÁCH ĐẤU')
    .setDescription(
      `**${character.name}** (Level ${character.level})\n` +
      `❤️ HP: ${character.hp}/${character.max_hp} • ⚔️ ATK: ${character.attack} • 🛡️ DEF: ${character.defense} • ⚡ SPD: ${character.speed}\n\n` +
      `*Chọn Boss từ menu bên dưới để bắt đầu trận chiến!*`
    )
    .setFooter({ text: 'Menu sẽ tự động hết hạn sau 60 giây' });
}

/**
 * Tạo embed cho inventory với Terminal UI style
 */
export function createInventoryEmbed(
  character: Character,
  items: any[]
): EmbedBuilder {
  // Cấu hình layout
  const INNER_WIDTH = 58;
  const LEFT_COL = 26;   // inventory
  const RIGHT_COL = 26;  // status

  const pad = (str: string, len: number): string => {
    str = String(str);
    if (str.length > len) return str.slice(0, len);
    return str + ' '.repeat(len - str.length);
  };

  const rowFull = (text = ''): string => {
    let row = String(text);
    if (row.length > INNER_WIDTH) row = row.slice(0, INNER_WIDTH);
    if (row.length < INNER_WIDTH) row += ' '.repeat(INNER_WIDTH - row.length);
    return `║${row}║`;
  };

  const rowTwoCol = (left = '', right = ''): string => {
    const l = pad(left, LEFT_COL);
    const r = pad(right, RIGHT_COL);
    let row = `${l} │ ${r}`;
    if (row.length < INNER_WIDTH) {
      row += ' '.repeat(INNER_WIDTH - row.length);
    } else if (row.length > INNER_WIDTH) {
      row = row.slice(0, INNER_WIDTH);
    }
    return `║${row}║`;
  };

  const topBorder = () => '╔' + '═'.repeat(INNER_WIDTH) + '╗';
  const midSplitTop = () => '╠' + '═'.repeat(28) + '╦' + '═'.repeat(29) + '╣';
  const midSplitBot = () => '╠' + '═'.repeat(28) + '╩' + '═'.repeat(29) + '╣';
  const bottomBorder = () => '╚' + '═'.repeat(INNER_WIDTH) + '╝';

  // Build content
  const lines: string[] = [];

  // Header
  lines.push(topBorder());
  lines.push(rowTwoCol('NGỌC RỒNG RPG v2.0', `${character.name}@Lv.${character.level}`));
  lines.push(midSplitTop());

  // Column headers
  lines.push(rowTwoCol('TÚI ĐỒ', 'THÔNG TIN'));

  // Build inventory items
  const invItems = items.length
    ? items.map((item) => {
        const equipped = item.equipped ? '[✓]' : '[ ]';
        let label = `${equipped} ${item.name}`;
        if (item.quantity > 1) label += ` x${item.quantity}`;
        
        // Stats
        const stats: string[] = [];
        if (item.hp_bonus > 0) stats.push(`HP+${item.hp_bonus}`);
        if (item.ki_bonus > 0) stats.push(`KI+${item.ki_bonus}`);
        if (item.attack_bonus > 0) stats.push(`ATK+${item.attack_bonus}`);
        if (item.defense_bonus > 0) stats.push(`DEF+${item.defense_bonus}`);
        if (item.speed_bonus > 0) stats.push(`SPD+${item.speed_bonus}`);
        
        return {
          label: label.length > 24 ? label.slice(0, 21) + '...' : label,
          stats: stats.length > 0 ? stats.join(' ') : null
        };
      })
    : [{ label: '(Túi đồ trống)', stats: null }];

  // Build status lines
  const hpPercent = Math.floor((character.hp / character.max_hp) * 10);
  const kiPercent = Math.floor((character.ki / character.max_ki) * 10);
  const hpBar = '█'.repeat(hpPercent) + '░'.repeat(10 - hpPercent);
  const kiBar = '█'.repeat(kiPercent) + '░'.repeat(10 - kiPercent);

  const expNeeded = 100 + (character.level - 1) * 50;
  const expPercent = Math.floor((character.experience / expNeeded) * 10);
  const expBar = '▓'.repeat(expPercent) + '░'.repeat(10 - expPercent);

  const statusLines = [
    `Cấp độ: ${character.level}`,
    `EXP   : [${expBar}]`,
    '',
    `HP    : [${hpBar}]`,
    `       ${character.hp}/${character.max_hp}`,
    `KI    : [${kiBar}]`,
    `       ${character.ki}/${character.max_ki}`,
    '',
    `⚔️  ATK: ${character.attack}`,
    `🛡️  DEF: ${character.defense}`,
    `⚡ SPD: ${character.speed}`,
    `💰 Gold: ${character.gold}`,
  ];

  // Flatten inventory into display lines
  const invLines: string[] = [];
  for (const item of invItems) {
    invLines.push(item.label);
    if (item.stats) {
      invLines.push(`  ${item.stats}`);
    } else {
      invLines.push(''); // Empty line nếu không có stats
    }
  }

  // Render rows
  const maxRows = Math.max(invLines.length, statusLines.length);
  
  for (let i = 0; i < maxRows; i++) {
    const leftText = invLines[i] || '';
    const rightText = statusLines[i] || '';
    lines.push(rowTwoCol(leftText, rightText));
  }

  // Split bottom
  lines.push(midSplitBot());

  // Location section
  lines.push(rowFull('VỊ TRÍ'));
  lines.push(rowFull(`📍 ${character.location}`));

  lines.push(bottomBorder());

  const ascii = lines.join('\n');

  return new EmbedBuilder()
    .setColor(UI_CONFIG.COLORS.SUCCESS)
    .setTitle('🎮 Terminal Inventory UI')
    .setDescription('```\n' + ascii + '\n```')
    .setFooter({ text: 'Sử dụng zinv để xem túi đồ' })
    .setTimestamp();
}

/**
 * Tạo embed cho skills list
 */
export function createSkillsEmbed(
  character: Character,
  raceName: string,
  skills: any[]
): EmbedBuilder {
  // Tính progress bar cho KI
  const kiPercentage = Math.floor((character.ki / character.max_ki) * 10);
  const kiBar = '█'.repeat(kiPercentage) + '░'.repeat(10 - kiPercentage);

  const embed = new EmbedBuilder()
    .setColor(UI_CONFIG.COLORS.BOSS)
    .setTitle(`⚡ Kỹ năng ${raceName}`)
    .setDescription(
      `**${character.name}** • Level **${character.level}**\n` +
      `💙 KI: \`${character.ki}\`/\`${character.max_ki}\` ${kiBar}`
    )
    .setFooter({ text: 'Skills sẽ tự động sử dụng trong combat!' });

  if (skills.length === 0) {
    embed.addFields({
      name: '📝 Kỹ năng',
      value: '*Chưa có kỹ năng! Hãy lên cấp để mở khóa.*',
      inline: false
    });
    return embed;
  }

  const learnedSkills = skills.filter(s => s.learned);
  const unlearnedSkills = skills.filter(s => !s.learned);

  // Kỹ năng đã học
  if (learnedSkills.length > 0) {
    let learnedText = '';
    for (const skill of learnedSkills) {
      const canUse = character.level >= skill.required_level;
      const icon = canUse ? '✅' : '🔒';
      
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

  // Kỹ năng chưa học
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

  return embed;
}
