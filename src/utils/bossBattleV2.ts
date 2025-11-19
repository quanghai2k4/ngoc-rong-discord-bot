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
 * Tạo HP bar với box drawing characters
 */
function createBoxHpBar(current: number, max: number, width: number = 20): string {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  
  // Chọn màu dựa trên HP%
  let fillChar = '█';
  if (percent <= 25) fillChar = '░'; // Cực kỳ nguy hiểm
  else if (percent <= 50) fillChar = '▒'; // Nguy hiểm
  else if (percent <= 75) fillChar = '▓'; // Trung bình
  
  const bar = fillChar.repeat(filled) + '░'.repeat(empty);
  return `│${bar}│`;
}

/**
 * Tạo progress bar cho battle round
 */
function createProgressBar(current: number, total: number, width: number = 20): string {
  const percent = Math.max(0, Math.min(100, (current / total) * 100));
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  
  const bar = '▰'.repeat(filled) + '▱'.repeat(empty);
  return bar;
}

/**
 * Create animated battle embed (updated mỗi round)
 */
export function createBattleLiveEmbed(
  state: BattleState,
  character: Character,
  boss: Monster
): EmbedBuilder {
  const progress = (state.round / state.totalRounds) * 100;
  const charHpPercent = Math.round((state.characterHp / state.characterMaxHp) * 100);
  const bossHpPercent = Math.round((state.bossHp / state.bossMaxHp) * 100);

  // Build description với box drawing
  let description = '';
  
  // Header box
  description += `╔═══════════════════════════════════╗\n`;
  description += `║   ⚔️  HIỆP ${state.round}/${state.totalRounds}  •  ${progress.toFixed(0)}% Complete   ║\n`;
  description += `╚═══════════════════════════════════╝\n\n`;

  // Character status box
  description += `┌─ 👤 ${character.name} (Lv.${character.level}) ${'─'.repeat(Math.max(0, 22 - character.name.length))}\n`;
  description += `│ ❤️  HP: ${state.characterHp}/${state.characterMaxHp} (${charHpPercent}%)\n`;
  description += `│ ${createBoxHpBar(state.characterHp, state.characterMaxHp, 25)}\n`;
  description += `└${'─'.repeat(38)}\n\n`;

  // Boss status box
  description += `┌─ 👑 ${boss.name} (Lv.${boss.level}) ${'─'.repeat(Math.max(0, 22 - boss.name.length))}\n`;
  description += `│ ❤️  HP: ${state.bossHp}/${state.bossMaxHp} (${bossHpPercent}%)\n`;
  description += `│ ${createBoxHpBar(state.bossHp, state.bossMaxHp, 25)}\n`;
  description += `└${'─'.repeat(38)}\n\n`;

  // Recent actions box
  if (state.lastActions.length > 0) {
    description += `┌─ 📜 Diễn biến trận đấu ${'─'.repeat(15)}\n`;
    for (const action of state.lastActions.slice(-3)) {
      description += `│ • ${action}\n`;
    }
    description += `└${'─'.repeat(38)}\n`;
  }

  // Highlights box
  if (state.highlights.length > 0) {
    description += `\n┌─ ✨ Highlights ${'─'.repeat(21)}\n`;
    for (const highlight of state.highlights.slice(-2)) {
      description += `│ ${highlight}\n`;
    }
    description += `└${'─'.repeat(38)}\n`;
  }

  // Progress indicator
  description += `\n${createProgressBar(state.round, state.totalRounds, 30)}\n`;

  const embed = new EmbedBuilder()
    .setTitle(`👑 BOSS BATTLE`)
    .setDescription(`\`\`\`\n${description}\`\`\``)
    .setColor(state.characterHp < state.characterMaxHp * 0.3 ? 0xFF0000 : 0xFFD700)
    .setFooter({ text: `⚔️ Trận chiến đang diễn ra... | Round ${state.round}/${state.totalRounds}` })
    .setTimestamp();

  return embed;
}

/**
 * Create battle result embed với highlights và stats
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
  const title = won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!';

  let description = '';

  // Result banner
  if (won) {
    description += `╔═══════════════════════════════════╗\n`;
    description += `║       🎉  CHIẾN THẮNG!  🎉        ║\n`;
    description += `╚═══════════════════════════════════╝\n\n`;
  } else {
    description += `╔═══════════════════════════════════╗\n`;
    description += `║        💀  THẤT BẠI!  💀          ║\n`;
    description += `╚═══════════════════════════════════╝\n\n`;
  }

  // Battle summary box
  description += `┌─ 📋 Tổng kết trận đấu ${'─'.repeat(14)}\n`;
  description += `│ 👑 Boss: ${boss.name} (Lv.${boss.level})\n`;
  description += `│ 📊 Status: ${won ? '💀 DEFEATED' : '👑 VICTORIOUS'}\n`;
  description += `│ ⏱️  Rounds: ${result.rounds.length} hiệp\n`;
  description += `└${'─'.repeat(38)}\n\n`;

  // Highlights box
  if (highlights.length > 0) {
    description += `┌─ 🎯 Battle Highlights ${'─'.repeat(14)}\n`;
    for (const highlight of highlights.slice(0, 5)) {
      description += `│ ${highlight.icon} R${highlight.round}: ${highlight.message}\n`;
    }
    description += `└${'─'.repeat(38)}\n\n`;
  }

  // Stats box
  description += `┌─ 📊 Chi tiết thống kê ${'─'.repeat(15)}\n`;
  description += `│ ⚔️  Sát thương gây ra: ${stats.totalDamageDealt}\n`;
  description += `│ ❤️  Sát thương nhận: ${stats.totalDamageTaken}\n`;
  if (stats.criticalHits > 0) 
    description += `│ ⚡ Critical Hits: ${stats.criticalHits}\n`;
  if (stats.skillsUsed > 0) 
    description += `│ 🌀 Skills sử dụng: ${stats.skillsUsed}\n`;
  if (stats.dodges > 0) 
    description += `│ 💨 Né tránh: ${stats.dodges}\n`;
  description += `│ 🎯 Đòn mạnh nhất: ${stats.highestDamage}\n`;
  description += `└${'─'.repeat(38)}\n`;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(`\`\`\`\n${description}\`\`\``)
    .setColor(color)
    .setTimestamp();

  // Rewards box (nếu thắng)
  if (won) {
    let rewardsText = '```\n';
    rewardsText += `┌─ 🎁 Phần thưởng ${'─'.repeat(20)}\n`;
    rewardsText += `│ 💎 EXP: +${result.expGained}\n`;
    rewardsText += `│ 💰 Gold: +${result.goldGained}\n`;

    if (result.itemsDropped.length > 0) {
      const items = result.itemsDropped.map(i => i.name).join(', ');
      rewardsText += `│ 📦 Items: ${items}\n`;
    }

    if (result.questRewards.length > 0) {
      rewardsText += `│ 🏆 Quests: ${result.questRewards.length} hoàn thành\n`;
    }
    
    rewardsText += `└${'─'.repeat(38)}\n`;
    rewardsText += '```';

    embed.addFields({ name: '\u200B', value: rewardsText, inline: false });
  } else {
    let penaltyText = '```\n';
    penaltyText += `┌─ 💔 Hậu quả ${'─'.repeat(24)}\n`;
    penaltyText += `│ • Mất 10% vàng\n`;
    penaltyText += `│ • HP còn lại: 1\n`;
    penaltyText += `└${'─'.repeat(38)}\n`;
    penaltyText += '```';
    
    embed.addFields({ name: '\u200B', value: penaltyText, inline: false });
  }

  // Level up banner
  if (won && result.leveledUp && result.newLevel) {
    let levelUpText = '```\n';
    levelUpText += `╔═══════════════════════════════════╗\n`;
    levelUpText += `║        ⭐ LEVEL UP! ⭐           ║\n`;
    levelUpText += `║      Lv.${result.newLevel - 1} ───→ Lv.${result.newLevel}              ║\n`;
    levelUpText += `╚═══════════════════════════════════╝\n`;
    levelUpText += '```';
    
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
