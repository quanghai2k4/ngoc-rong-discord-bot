import { EmbedBuilder } from 'discord.js';
import { UI_CONFIG } from '../config';
import { Character, Monster, CharacterSkillView } from '../types';
import { 
  formatHpBar, 
  formatCompactNumber, 
  formatCooldown,
  getSkillTypeIcon,
  getSkillTypeName 
} from './helpers';

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
 * Tạo embed cho inventory
 */
export function createInventoryEmbed(
  character: Character,
  items: any[]
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(UI_CONFIG.COLORS.SUCCESS)
    .setTitle(`🎒 Túi đồ của ${character.name}`)
    .setDescription(`💰 Vàng: **\`${character.gold}\`**`);

  if (items.length === 0) {
    embed.addFields({
      name: '📦 Túi đồ',
      value: '*❌ Túi đồ trống!*',
      inline: false
    });
    return embed;
  }

  // Group items by type
  const itemsByType = items.reduce((acc: any, item: any) => {
    if (!acc[item.type_name]) {
      acc[item.type_name] = [];
    }
    acc[item.type_name].push(item);
    return acc;
  }, {});

  // Format each type
  for (const [typeName, typeItems] of Object.entries(itemsByType)) {
    let itemText = '';
    (typeItems as any[]).forEach((item, idx, arr) => {
      const isLast = idx === arr.length - 1;
      const prefix = isLast ? '╰─' : '├─';
      
      // Stats (nếu có)
      const stats = [];
      if (item.hp_bonus > 0) stats.push(`❤️ **+${item.hp_bonus}**`);
      if (item.ki_bonus > 0) stats.push(`💙 **+${item.ki_bonus}**`);
      if (item.attack_bonus > 0) stats.push(`⚔️ **+${item.attack_bonus}**`);
      if (item.defense_bonus > 0) stats.push(`🛡️ **+${item.defense_bonus}**`);
      if (item.speed_bonus > 0) stats.push(`⚡ **+${item.speed_bonus}**`);
      
      // Item line: name + quantity + stats (tất cả cùng 1 dòng)
      let line = `${prefix} ${item.equipped ? '✅' : '⬜'} \`${item.name}\` **×${item.quantity}**`;
      if (stats.length > 0) {
        line += ` • *${stats.join(' • ')}*`;
      }
      itemText += line + '\n';
    });
    
    embed.addFields({
      name: `📦 ${typeName}`,
      value: itemText.trim(),
      inline: false
    });
  }

  return embed;
}

/**
 * Tạo embed cho skills list với skill leveling system (GROUPED BY TYPE)
 */
export function createSkillsEmbed(
  character: Character,
  raceName: string,
  skills: CharacterSkillView[]
): EmbedBuilder {
  const BOX = {
    ROUNDED_TOP_LEFT: '╭',
    ROUNDED_TOP_RIGHT: '╮',
    ROUNDED_BOTTOM_LEFT: '╰',
    ROUNDED_BOTTOM_RIGHT: '╯',
    HORIZONTAL: '─',
    VERTICAL: '│',
    T_RIGHT: '├',
    T_LEFT: '┤',
  };

  // Tính progress bar cho KI
  const kiPercentage = Math.floor((character.ki / character.max_ki) * 15);
  const kiBar = '█'.repeat(kiPercentage) + '░'.repeat(15 - kiPercentage);

  // Header với hunt style
  let description = `${BOX.ROUNDED_TOP_LEFT}${BOX.HORIZONTAL.repeat(40)}${BOX.ROUNDED_TOP_RIGHT}\n`;
  description += `${BOX.VERTICAL} ⚡ **${raceName}** Lv.**${character.level}** • 💙\`${character.ki}/${character.max_ki}\` ${kiBar}\n`;

  if (skills.length === 0) {
    description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(40)}${BOX.T_LEFT}\n`;
    description += `${BOX.VERTICAL} *Chưa có kỹ năng! Hãy lên cấp để mở.*\n`;
    description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(40)}${BOX.ROUNDED_BOTTOM_RIGHT}`;
    
    return new EmbedBuilder()
      .setColor(UI_CONFIG.COLORS.BOSS)
      .setTitle(`⚡ Kỹ năng của ${character.name}`)
      .setDescription(description)
      .setFooter({ text: 'Dùng /learn <tên skill> để học skill mới!' });
  }

  // Group skills by type
  const skillsByType = new Map<number, CharacterSkillView[]>();
  for (const skill of skills) {
    if (!skillsByType.has(skill.skill_type)) {
      skillsByType.set(skill.skill_type, []);
    }
    skillsByType.get(skill.skill_type)!.push(skill);
  }

  // Sort types: Attack (1), Heal (2), Buff (3), Special (4)
  const sortedTypes = Array.from(skillsByType.keys()).sort((a, b) => a - b);

  for (const skillType of sortedTypes) {
    const typeSkills = skillsByType.get(skillType)!;
    const learned = typeSkills.filter(s => s.current_point > 0).length;
    const total = typeSkills.length;
    
    const typeIcon = getSkillTypeIcon(skillType);
    const typeName = getSkillTypeName(skillType).toUpperCase();
    
    description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(40)}${BOX.T_LEFT}\n`;
    description += `${BOX.VERTICAL} ${typeIcon} **${typeName}** (${learned}/${total} học)\n`;

    for (const skill of typeSkills) {
      const isLearned = skill.current_point > 0;
      const levelData = isLearned ? skill.current_level_data : skill.current_level_data;
      
      // Get first level data for unlearned skills
      const displayData = levelData;
      
      if (isLearned && displayData) {
        // Learned skill - show current stats
        const isMaxLevel = skill.current_point >= skill.max_point;
        const icon = isMaxLevel ? '⭐' : '✅';
        
        // Shorten name if too long
        const shortName = skill.name.length > 20 ? skill.name.substring(0, 18) + '..' : skill.name;
        
        description += `${BOX.VERTICAL} ${icon} ${shortName} \`${skill.current_point}/${skill.max_point}\``;
        description += ` 💙\`${displayData.mana_use}\``;
        
        if (skill.skill_type === 1) { // Attack
          description += ` 💥\`${displayData.damage}%\``;
        } else if (skill.skill_type === 2) { // Heal
          description += ` 💚\`+${displayData.damage}\``;
        } else if (skill.skill_type === 3) { // Buff
          description += ` ✨\`${displayData.damage}%\``;
        } else if (skill.skill_type === 4) { // Special
          description += ` 💣\`${displayData.damage}%\``;
        }
        
        description += ` ⏱️\`${formatCooldown(displayData.cool_down)}\`\n`;
        
      } else if (displayData) {
        // Unlearned skill - show requirements
        const shortName = skill.name.length > 24 ? skill.name.substring(0, 22) + '..' : skill.name;
        description += `${BOX.VERTICAL} 🔒 ${shortName}\n`;
        description += `${BOX.VERTICAL}    💰\`${formatCompactNumber(displayData.price)}\` • ⭐\`${formatCompactNumber(displayData.power_require)}\``;
        
        // Show effect preview
        if (skill.skill_type === 1) { // Attack
          description += ` • 💥\`${displayData.damage}%\``;
        } else if (skill.skill_type === 2) { // Heal
          description += ` • 💚\`+${displayData.damage}\``;
        } else if (skill.skill_type === 3) { // Buff
          description += ` • ✨\`${displayData.damage}%\``;
        } else if (skill.skill_type === 4) { // Special
          description += ` • 💣\`${displayData.damage}%\``;
        }
        description += '\n';
      }
    }
  }

  description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(40)}${BOX.ROUNDED_BOTTOM_RIGHT}`;

  return new EmbedBuilder()
    .setColor(UI_CONFIG.COLORS.BOSS)
    .setTitle(`⚡ Kỹ năng của ${character.name}`)
    .setDescription(description)
    .setFooter({ text: 'Dùng /learn <tên skill> để học skill mới!' });
}

/**
 * Tạo embed cho quest rewards (auto-claimed)
 */
export function createQuestRewardsEmbed(questRewards: any[]): EmbedBuilder {
  const BOX = {
    ROUNDED_TOP_LEFT: '╭',
    ROUNDED_TOP_RIGHT: '╮',
    ROUNDED_BOTTOM_LEFT: '╰',
    ROUNDED_BOTTOM_RIGHT: '╯',
    HORIZONTAL: '─',
    VERTICAL: '│',
    T_RIGHT: '├',
    T_LEFT: '┤',
  };

  let description = `${BOX.ROUNDED_TOP_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_TOP_RIGHT}\n`;
  description += `${BOX.VERTICAL} 🎁 **PHẦN THƯỞNG TỰ ĐỘNG NHẬN**          ${BOX.VERTICAL}\n`;
  description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;

  questRewards.forEach((reward, index) => {
    description += `${BOX.VERTICAL} ✅ **${reward.questName}**\n`;
    
    const rewardText = [];
    if (reward.exp > 0) rewardText.push(`⭐ EXP: **+${reward.exp}**`);
    if (reward.gold > 0) rewardText.push(`💰 Vàng: **+${reward.gold}**`);
    if (reward.itemName) rewardText.push(`🎁 Vật phẩm: **${reward.itemName}**`);
    
    description += `${BOX.VERTICAL}    ${rewardText.join(' • ')}\n`;
    
    if (index < questRewards.length - 1) {
      description += `${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(38)}${BOX.T_LEFT}\n`;
    }
  });

  description += `${BOX.ROUNDED_BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(38)}${BOX.ROUNDED_BOTTOM_RIGHT}`;

  return new EmbedBuilder()
    .setColor(UI_CONFIG.COLORS.SUCCESS)
    .setTitle('🎊 Daily Quest Rewards')
    .setDescription(description)
    .setFooter({ text: 'Phần thưởng đã tự động được cộng vào!' })
    .setTimestamp();
}

