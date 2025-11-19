/**
 * Utility functions để tránh code trùng lặp
 */

/**
 * Định dạng thanh HP/KI/EXP
 */
export function formatHpBar(current: number, max: number, length: number = 10): string {
  const percentage = Math.floor((current / max) * length);
  const filled = '█'.repeat(percentage);
  const empty = '░'.repeat(length - percentage);
  return filled + empty;
}

/**
 * Box drawing characters
 */
export const BOX = {
  // Single line
  TOP_LEFT: '┌',
  TOP_RIGHT: '┐',
  BOTTOM_LEFT: '└',
  BOTTOM_RIGHT: '┘',
  HORIZONTAL: '─',
  VERTICAL: '│',
  T_DOWN: '┬',
  T_UP: '┴',
  T_RIGHT: '├',
  T_LEFT: '┤',
  CROSS: '┼',
  
  // Heavy line
  HEAVY_TOP_LEFT: '┏',
  HEAVY_TOP_RIGHT: '┓',
  HEAVY_BOTTOM_LEFT: '┗',
  HEAVY_BOTTOM_RIGHT: '┛',
  HEAVY_HORIZONTAL: '━',
  HEAVY_VERTICAL: '┃',
  
  // Double line
  DOUBLE_TOP_LEFT: '╔',
  DOUBLE_TOP_RIGHT: '╗',
  DOUBLE_BOTTOM_LEFT: '╚',
  DOUBLE_BOTTOM_RIGHT: '╝',
  DOUBLE_HORIZONTAL: '═',
  DOUBLE_VERTICAL: '║',
  
  // Rounded corners (hunt style)
  ROUNDED_TOP_LEFT: '╭',
  ROUNDED_TOP_RIGHT: '╮',
  ROUNDED_BOTTOM_LEFT: '╰',
  ROUNDED_BOTTOM_RIGHT: '╯',
};

/**
 * Tạo horizontal divider
 */
export function createDivider(length: number = 40, char: string = BOX.HORIZONTAL): string {
  return char.repeat(length);
}

/**
 * Tạo progress bar với box drawing
 */
export function createProgressBar(current: number, max: number, length: number = 20, showPercentage: boolean = true): string {
  const percentage = Math.min(100, Math.floor((current / max) * 100));
  const filledLength = Math.floor((percentage / 100) * length);
  const emptyLength = length - filledLength;
  
  const filled = '█'.repeat(filledLength);
  const empty = '░'.repeat(emptyLength);
  const bar = `${filled}${empty}`;
  
  if (showPercentage) {
    return `${bar} ${percentage}%`;
  }
  return bar;
}

/**
 * Tạo box với title và content
 */
export function createBox(title: string, content: string, width: number = 40): string {
  const titleLine = `${BOX.TOP_LEFT}${BOX.HORIZONTAL.repeat(2)} ${title} ${BOX.HORIZONTAL.repeat(Math.max(0, width - title.length - 6))}${BOX.TOP_RIGHT}`;
  const contentLines = content.split('\n').map(line => `${BOX.VERTICAL} ${line.padEnd(width - 2)} ${BOX.VERTICAL}`);
  const bottomLine = `${BOX.BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(width)}${BOX.BOTTOM_RIGHT}`;
  
  return [titleLine, ...contentLines, bottomLine].join('\n');
}

/**
 * Tạo fancy divider với text
 */
export function createFancyDivider(text: string = '', length: number = 40, style: 'single' | 'heavy' | 'double' = 'single'): string {
  const chars = {
    single: { h: BOX.HORIZONTAL, tl: BOX.T_RIGHT, tr: BOX.T_LEFT },
    heavy: { h: BOX.HEAVY_HORIZONTAL, tl: BOX.T_RIGHT, tr: BOX.T_LEFT },
    double: { h: BOX.DOUBLE_HORIZONTAL, tl: '╠', tr: '╣' }
  };
  
  const { h, tl, tr } = chars[style];
  
  if (!text) {
    return h.repeat(length);
  }
  
  const padding = Math.max(0, length - text.length - 4);
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;
  
  return `${h.repeat(leftPad)} ${text} ${h.repeat(rightPad)}`;
}

/**
 * Format số với dấu phẩy (1000 -> 1,000)
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Truncate text nếu quá dài
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Random integer trong range [min, max]
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random element từ array
 */
export function randomElement<T>(array: T[]): T | null {
  if (array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle array (Fisher-Yates)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Tính exp cần thiết cho level tiếp theo
 */
export function expForNextLevel(currentLevel: number): number {
  return 100 + (currentLevel - 1) * 50;
}

/**
 * Kiểm tra có critical hit không
 */
export function rollCritical(critChance: number): boolean {
  return Math.random() * 100 < critChance;
}

/**
 * Kiểm tra có dodge không
 */
export function rollDodge(dodgeChance: number): boolean {
  return Math.random() * 100 < dodgeChance;
}

/**
 * Format số lớn thành dạng compact (1000 -> 1K, 1000000 -> 1M)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
  }
  return num.toString();
}

/**
 * Format cooldown từ ms sang giây hoặc phút
 */
export function formatCooldown(ms: number): string {
  if (ms >= 60000) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return seconds > 0 ? `${minutes}m${seconds}s` : `${minutes}m`;
  }
  const seconds = (ms / 1000).toFixed(1);
  return seconds.endsWith('.0') ? `${Math.floor(ms / 1000)}s` : `${seconds}s`;
}

/**
 * Lấy icon theo skill type
 */
export function getSkillTypeIcon(skillType: number): string {
  switch (skillType) {
    case 1: return '⚔️'; // Attack
    case 2: return '💚'; // Heal
    case 3: return '✨'; // Buff/Debuff
    case 4: return '💣'; // Special
    default: return '❓';
  }
}

/**
 * Lấy tên skill type
 */
export function getSkillTypeName(skillType: number): string {
  switch (skillType) {
    case 1: return 'Tấn công';
    case 2: return 'Hồi máu';
    case 3: return 'Hỗ trợ';
    case 4: return 'Đặc biệt';
    default: return 'Khác';
  }
}
