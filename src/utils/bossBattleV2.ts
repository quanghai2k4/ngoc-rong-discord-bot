import { EmbedBuilder } from 'discord.js';
import { Character, Monster } from '../types';
import { formatHpBar } from './helpers';
import { BattleResult } from '../services/BattleService';
import { BattleRound } from './battleDisplay';

/**
 * Boss Battle V2 - Enhanced battle display utilities
 */

export interface BattleState {
  round: number;
  totalRounds: number;
  characterHp: number;
  characterMaxHp: number;
  bossHp: number;
  bossMaxHp: number;
  lastActions: string[]; // Last 2-3 actions
  highlights: string[];
}

export interface BattleStats {
  totalDamageDealt: number;
  totalDamageTaken: number;
  criticalHits: number;
  skillsUsed: number;
  dodges: number;
  highestDamage: number;
  lowestHp: number;
}

export interface BattleHighlight {
  round: number;
  type: 'critical' | 'skill' | 'low_hp' | 'near_death' | 'dodge' | 'final_blow';
  message: string;
  icon: string;
}

/**
 * Extract highlights từ battle rounds
 */
export function extractBattleHighlights(
  rounds: BattleRound[],
  character: Character,
  boss: Monster
): BattleHighlight[] {
  const highlights: BattleHighlight[] = [];

  for (let i = 0; i < rounds.length; i++) {
    const round = rounds[i];
    const actions = round.actions || [];

    // Check for critical hits
    for (const action of actions) {
      if (action.includes('CHƯỞNG')) {
        highlights.push({
          round: round.round,
          type: 'critical',
          message: `Critical Hit! ${action}`,
          icon: '⚡'
        });
      }

      // Check for skill usage
      if (action.includes('Skill:') || action.includes('kỹ năng')) {
        highlights.push({
          round: round.round,
          type: 'skill',
          message: action,
          icon: '🌀'
        });
      }

      // Check for dodge
      if (action.includes('né tránh') || action.includes('MISS')) {
        highlights.push({
          round: round.round,
          type: 'dodge',
          message: action,
          icon: '💨'
        });
      }
    }

    // Check for low HP
    if (round.characterHp < character.max_hp * 0.3 && round.characterHp > 0) {
      highlights.push({
        round: round.round,
        type: 'low_hp',
        message: `Low HP Warning! ${round.characterHp}/${character.max_hp}`,
        icon: '❤️'
      });
    }

    // Check for near death
    if (round.characterHp < character.max_hp * 0.1 && round.characterHp > 0) {
      highlights.push({
        round: round.round,
        type: 'near_death',
        message: `CRITICAL! HP xuống dưới 10%!`,
        icon: '💀'
      });
    }

    // Final blow
    if (i === rounds.length - 1) {
      const bossState = round.monsterStates[0];
      if (bossState && bossState.hp === 0) {
        highlights.push({
          round: round.round,
          type: 'final_blow',
          message: `${character.name} hạ gục ${boss.name}!`,
          icon: '🎯'
        });
      }
    }
  }

  // Deduplicate và limit
  return highlights
    .filter((h, index, self) => 
      index === self.findIndex(t => t.type === h.type && t.round === h.round)
    )
    .slice(0, 5); // Max 5 highlights
}

/**
 * Calculate battle stats
 */
export function calculateBattleStats(
  rounds: BattleRound[],
  character: Character
): BattleStats {
  const stats: BattleStats = {
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    criticalHits: 0,
    skillsUsed: 0,
    dodges: 0,
    highestDamage: 0,
    lowestHp: character.max_hp
  };

  for (const round of rounds) {
    const actions = round.actions || [];

    for (const action of actions) {
      // Parse damage from actions
      const damageMatch = action.match(/-(\d+)\s*HP/);
      if (damageMatch) {
        const damage = parseInt(damageMatch[1]);

        if (action.includes(character.name)) {
          stats.totalDamageDealt += damage;
          if (damage > stats.highestDamage) {
            stats.highestDamage = damage;
          }
        } else {
          stats.totalDamageTaken += damage;
        }
      }

      // Count criticals
      if (action.includes('CHƯỞNG')) {
        stats.criticalHits++;
      }

      // Count skills
      if (action.includes('Skill:') || action.includes('kỹ năng')) {
        stats.skillsUsed++;
      }

      // Count dodges
      if (action.includes('né tránh') || action.includes('MISS')) {
        stats.dodges++;
      }
    }

    // Track lowest HP
    if (round.characterHp < stats.lowestHp) {
      stats.lowestHp = round.characterHp;
    }
  }

  return stats;
}

/**
 * Tạo HP bar với gradient characters (giống hunt nhưng có gradient)
 */
function createGradientHpBar(current: number, max: number, width: number = 15): string {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  
  // Gradient dựa trên HP%
  let fillChar = '█';
  if (percent <= 25) fillChar = '░'; // Critical
  else if (percent <= 50) fillChar = '▒'; // Low
  else if (percent <= 75) fillChar = '▓'; // Medium
  // else: ██ Full
  
  const bar = fillChar.repeat(filled) + '░'.repeat(empty);
  return bar;
}

/**
 * Tạo progress bar cho battle round
 */
function createProgressBar(current: number, total: number, width: number = 30): string {
  const percent = Math.max(0, Math.min(100, (current / total) * 100));
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  
  const bar = '▰'.repeat(filled) + '▱'.repeat(empty);
  return bar;
}

/**
 * Create animated battle embed (updated mỗi round) - Hunt style
 */
export function createBattleLiveEmbed(
  state: BattleState,
  character: Character,
  boss: Monster
): EmbedBuilder {
  const charHpPercent = Math.round((state.characterHp / state.characterMaxHp) * 100);
  const bossHpPercent = Math.round((state.bossHp / state.bossMaxHp) * 100);

  // Box drawing characters (rounded corners like hunt)
  const BOX = {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│',
    divider: '├',
    dividerRight: '┤'
  };

  // Build description với hunt style
  let description = '';
  
  // Header
  description += `${BOX.topLeft}${BOX.horizontal.repeat(38)}${BOX.topRight}\n`;
  description += `${BOX.vertical} ⚔️  **HIỆP ${state.round}/${state.totalRounds}**\n`;
  description += `${BOX.divider}${BOX.horizontal.repeat(38)}${BOX.dividerRight}\n`;

  // Character HP
  const charHpBar = createGradientHpBar(state.characterHp, state.characterMaxHp, 15);
  description += `${BOX.vertical} ❤️  **${character.name}** (Lv.${character.level})\n`;
  description += `${BOX.vertical}     ${charHpBar} ${charHpPercent}%\n`;
  description += `${BOX.vertical}     \`${state.characterHp}/${state.characterMaxHp}\`\n`;

  // Boss HP
  const bossHpBar = createGradientHpBar(state.bossHp, state.bossMaxHp, 15);
  const bossStatus = state.bossHp === 0 ? '💀' : '👑';
  description += `${BOX.vertical} ${bossStatus} **${boss.name}** (Lv.${boss.level})\n`;
  description += `${BOX.vertical}     ${bossHpBar} ${bossHpPercent}%\n`;
  description += `${BOX.vertical}     \`${state.bossHp}/${state.bossMaxHp}\`\n`;

  // Recent actions
  if (state.lastActions.length > 0) {
    description += `${BOX.divider}${BOX.horizontal.repeat(38)}${BOX.dividerRight}\n`;
    description += `${BOX.vertical} 📜 **Diễn biến:**\n`;
    for (const action of state.lastActions.slice(-3)) {
      description += `${BOX.vertical} • ${action}\n`;
    }
  }

  // Highlights
  if (state.highlights.length > 0) {
    description += `${BOX.divider}${BOX.horizontal.repeat(38)}${BOX.dividerRight}\n`;
    description += `${BOX.vertical} ✨ **Highlights:**\n`;
    for (const highlight of state.highlights.slice(-2)) {
      description += `${BOX.vertical} ${highlight}\n`;
    }
  }

  description += `${BOX.bottomLeft}${BOX.horizontal.repeat(38)}${BOX.bottomRight}\n\n`;

  // Progress bar (ngoài box)
  const progressBar = createProgressBar(state.round, state.totalRounds, 30);
  description += `${progressBar}`;

  const embed = new EmbedBuilder()
    .setTitle(`👑 BOSS BATTLE: ${boss.name}`)
    .setDescription(description)
    .setColor(state.characterHp < state.characterMaxHp * 0.3 ? 0xFF0000 : 0xFFD700)
    .setFooter({ text: `⚔️ Trận chiến đang diễn ra... | Round ${state.round}/${state.totalRounds}` })
    .setTimestamp();

  return embed;
}

/**
 * Create battle result embed với highlights và stats - Hunt style
 */
export function createBattleResultEmbedV2(
  result: BattleResult,
  character: Character,
  boss: Monster,
  highlights: BattleHighlight[],
  stats: BattleStats
): EmbedBuilder {
  const won = result.won;
  const color = won ? 0x00FF00 : 0xFF0000;

  // Box drawing (rounded corners)
  const BOX = {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│',
    divider: '├',
    dividerRight: '┤'
  };

  let description = '';

  // Main result box
  description += `${BOX.topLeft}${BOX.horizontal.repeat(38)}${BOX.topRight}\n`;
  if (won) {
    description += `${BOX.vertical} ⚔️  **CHIẾN THẮNG!**                    ${BOX.vertical}\n`;
  } else {
    description += `${BOX.vertical} 💀 **THẤT BẠI!**                       ${BOX.vertical}\n`;
  }
  description += `${BOX.divider}${BOX.horizontal.repeat(38)}${BOX.dividerRight}\n`;
  description += `${BOX.vertical} 👑 Boss: **${boss.name}** (Lv.${boss.level})\n`;
  description += `${BOX.vertical} 📊 Status: ${won ? '**💀 DEFEATED**' : '**👑 VICTORIOUS**'}\n`;
  description += `${BOX.vertical} ⏱️  Rounds: **${result.rounds.length} hiệp**\n`;

  // Stats section
  description += `${BOX.divider}${BOX.horizontal.repeat(38)}${BOX.dividerRight}\n`;
  description += `${BOX.vertical} 📊 **Chi tiết thống kê:**\n`;
  description += `${BOX.vertical} ⚔️  Sát thương gây: **${stats.totalDamageDealt}**\n`;
  description += `${BOX.vertical} ❤️  Sát thương nhận: **${stats.totalDamageTaken}**\n`;
  if (stats.criticalHits > 0) 
    description += `${BOX.vertical} ⚡ Critical Hits: **${stats.criticalHits}**\n`;
  if (stats.skillsUsed > 0) 
    description += `${BOX.vertical} 🌀 Skills: **${stats.skillsUsed}**\n`;
  if (stats.dodges > 0) 
    description += `${BOX.vertical} 💨 Dodges: **${stats.dodges}**\n`;
  description += `${BOX.vertical} 🎯 Đòn mạnh nhất: **${stats.highestDamage}**\n`;

  description += `${BOX.bottomLeft}${BOX.horizontal.repeat(38)}${BOX.bottomRight}`;

  const embed = new EmbedBuilder()
    .setTitle(won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
    .setDescription(description)
    .setColor(color)
    .setTimestamp();

  // Highlights (nếu có)
  if (highlights.length > 0) {
    let highlightsText = '';
    highlightsText += `${BOX.topLeft}${BOX.horizontal.repeat(38)}${BOX.topRight}\n`;
    highlightsText += `${BOX.vertical} 🎯 **Battle Highlights:**\n`;
    highlightsText += `${BOX.divider}${BOX.horizontal.repeat(38)}${BOX.dividerRight}\n`;
    for (const highlight of highlights.slice(0, 5)) {
      highlightsText += `${BOX.vertical} ${highlight.icon} R${highlight.round}: ${highlight.message}\n`;
    }
    highlightsText += `${BOX.bottomLeft}${BOX.horizontal.repeat(38)}${BOX.bottomRight}`;
    
    embed.addFields({ name: '\u200B', value: highlightsText, inline: false });
  }

  // Rewards (nếu thắng)
  if (won) {
    let rewardsText = '';
    rewardsText += `${BOX.topLeft}${BOX.horizontal.repeat(38)}${BOX.topRight}\n`;
    rewardsText += `${BOX.vertical} 🎁 **Phần thưởng:**\n`;
    rewardsText += `${BOX.divider}${BOX.horizontal.repeat(38)}${BOX.dividerRight}\n`;
    rewardsText += `${BOX.vertical} 💎 EXP: **+${result.expGained}**\n`;
    rewardsText += `${BOX.vertical} 💰 Gold: **+${result.goldGained}**\n`;

    if (result.itemsDropped.length > 0) {
      const items = result.itemsDropped.map(i => i.name).join(', ');
      rewardsText += `${BOX.vertical} 📦 Items: **${items}**\n`;
    }

    if (result.questRewards.length > 0) {
      rewardsText += `${BOX.vertical} 🏆 Quests: **${result.questRewards.length} hoàn thành**\n`;
    }
    
    rewardsText += `${BOX.bottomLeft}${BOX.horizontal.repeat(38)}${BOX.bottomRight}`;

    embed.addFields({ name: '\u200B', value: rewardsText, inline: false });
  } else {
    // Penalty
    let penaltyText = '';
    penaltyText += `${BOX.topLeft}${BOX.horizontal.repeat(38)}${BOX.topRight}\n`;
    penaltyText += `${BOX.vertical} 💔 **Hậu quả:**\n`;
    penaltyText += `${BOX.divider}${BOX.horizontal.repeat(38)}${BOX.dividerRight}\n`;
    penaltyText += `${BOX.vertical} • Mất 10% vàng\n`;
    penaltyText += `${BOX.vertical} • HP còn lại: 1\n`;
    penaltyText += `${BOX.bottomLeft}${BOX.horizontal.repeat(38)}${BOX.bottomRight}`;
    
    embed.addFields({ name: '\u200B', value: penaltyText, inline: false });
  }

  // Level up (nếu có)
  if (won && result.leveledUp && result.newLevel) {
    let levelUpText = '';
    levelUpText += `${BOX.topLeft}${BOX.horizontal.repeat(38)}${BOX.topRight}\n`;
    levelUpText += `${BOX.vertical} ⭐ **LEVEL UP!**\n`;
    levelUpText += `${BOX.vertical} Lv.${result.newLevel - 1} ───→ Lv.${result.newLevel}\n`;
    levelUpText += `${BOX.bottomLeft}${BOX.horizontal.repeat(38)}${BOX.bottomRight}`;
    
    embed.addFields({ name: '\u200B', value: levelUpText, inline: false });
  }

  embed.setFooter({ text: `⚔️ Boss Battle • ${won ? 'Victory' : 'Defeat'}` });

  return embed;
}

/**
 * Get battle state for specific round
 */
export function getBattleStateFromRounds(
  rounds: BattleRound[],
  currentRound: number,
  character: Character,
  boss: Monster
): BattleState {
  const round = rounds[currentRound];
  const bossState = round.monsterStates[0];

  // Get last actions
  const lastActions: string[] = [];
  if (round.actions && round.actions.length > 0) {
    lastActions.push(...round.actions.slice(-3));
  } else {
    if (round.characterAction) lastActions.push(round.characterAction);
    if (round.monsterActions.length > 0) lastActions.push(...round.monsterActions.slice(-2));
  }

  // Get highlights up to current round
  const allHighlights = extractBattleHighlights(rounds.slice(0, currentRound + 1), character, boss);
  const highlightMessages = allHighlights.map(h => `${h.icon} ${h.message}`);

  return {
    round: currentRound + 1,
    totalRounds: rounds.length,
    characterHp: round.characterHp,
    characterMaxHp: character.max_hp,
    bossHp: bossState.hp,
    bossMaxHp: bossState.maxHp,
    lastActions,
    highlights: highlightMessages
  };
}
