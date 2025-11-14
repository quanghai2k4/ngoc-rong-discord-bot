/**
 * Battle display utilities - shared logic cho battle visualization
 */

import { UI_CONFIG } from '../config';
import { Character, Monster } from '../types';
import { formatHpBar } from './helpers';

export interface BattleRound {
  round: number;
  characterAction: string;
  monsterActions: string[];
  actions?: string[];
  characterHp: number;
  monsterStates: Array<{
    name: string;
    hp: number;
    maxHp: number;
  }>;
}

/**
 * Format một round thành battle log string
 */
export function formatBattleRound(
  round: BattleRound,
  character: Character
): string {
  let log = `╭─ **Hiệp ${round.round}**\n`;
  
  // Hiển thị actions theo thứ tự (nếu có array actions)
  if (round.actions && round.actions.length > 0) {
    for (const action of round.actions) {
      log += `│ ${action}\n`;
    }
  } else {
    // Fallback: hiển thị theo cách cũ
    log += `│ ${round.characterAction}\n`;
    for (const monAction of round.monsterActions) {
      log += `│ ${monAction}\n`;
    }
  }
  
  // HP bars
  const charHpBar = formatHpBar(round.characterHp, character.max_hp, UI_CONFIG.HP_BAR_SHORT_LENGTH);
  log += `│ ❤️ Bạn: ${charHpBar} \`${round.characterHp}/${character.max_hp}\`\n`;
  
  // Monster HP bars
  for (const monState of round.monsterStates) {
    const monHpBar = formatHpBar(monState.hp, monState.maxHp, UI_CONFIG.HP_BAR_SHORT_LENGTH);
    const status = monState.hp === 0 ? '💀' : '🔥';
    log += `│ ${status} ${monState.name}: ${monHpBar} \`${monState.hp}/${monState.maxHp}\`\n`;
  }
  
  log += `╰─────\n\n`;
  
  return log;
}

/**
 * Filter important rounds từ battle
 */
export function getImportantRounds(
  rounds: BattleRound[],
  character: Character,
  isBossFight: boolean
): BattleRound[] {
  if (isBossFight) {
    // Boss fight: hiển thị hiệp đầu + hiệp cuối + hiệp quan trọng
    return rounds.filter((round, index) =>
      index === 0 ||
      index >= rounds.length - 3 ||
      round.characterHp < character.max_hp * 0.3 ||
      round.monsterStates.some(m => m.hp < m.maxHp * 0.3 && m.hp > 0)
    );
  } else {
    // Hunt thường: chỉ hiệp cuối
    return rounds.slice(-1);
  }
}

/**
 * Tạo full battle log từ rounds
 */
export function createBattleLog(
  rounds: BattleRound[],
  character: Character,
  monsters: Monster[],
  showFull = false
): string {
  const hasBoss = monsters.some(m => m.is_boss || m.is_super);
  const importantRounds = showFull 
    ? rounds 
    : getImportantRounds(rounds, character, hasBoss);
  
  let battleLog = '';
  
  // Nếu không có boss/super -> tóm tắt ngắn gọn
  if (!hasBoss && !showFull) {
    // Chỉ hiển thị tổng kết nhanh
    return '';
  }
  
  // Format important rounds
  const displayRounds = importantRounds.slice(0, UI_CONFIG.MAX_IMPORTANT_ROUNDS);
  for (const round of displayRounds) {
    battleLog += formatBattleRound(round, character);
  }
  
  // Thêm note nếu có hiệp bị ẩn
  if (hasBoss && importantRounds.length < rounds.length) {
    battleLog += `*...và ${rounds.length - importantRounds.length} hiệp khác*\n\n`;
  }
  
  // Ensure not empty and not too long
  if (!battleLog || battleLog.trim().length === 0) {
    battleLog = '*Trận đấu diễn ra quá nhanh!*';
  } else if (battleLog.length > UI_CONFIG.MAX_BATTLE_LOG_LENGTH) {
    battleLog = battleLog.substring(0, UI_CONFIG.BATTLE_LOG_TRUNCATE_LENGTH) + '\n*...(quá dài, đã cắt bớt)*';
  }
  
  return battleLog;
}

/**
 * Tạo summary cho normal hunt (không phải boss)
 */
export function createHuntSummary(
  won: boolean,
  monsters: Monster[],
  totalRounds: number
): string {
  if (won) {
    const monsterNames = monsters.map(m => m.name).join(', ');
    let summary = `⚔️ Bạn đã **kết liễu** ${monsters.length > 1 ? `**${monsters.length} quái**: ` : ''}**${monsterNames}**!\n\n`;
    summary += `⏱️ Chiến đấu kết thúc sau **${totalRounds}** hiệp`;
    return summary;
  } else {
    return `💀 Bạn đã bị đánh bại sau **${totalRounds}** hiệp chiến đấu`;
  }
}
