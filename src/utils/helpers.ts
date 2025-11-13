/**
 * Utility functions để tránh code trùng lặp
 */

/**
 * Format HP bar cho Discord
 */
export function formatHpBar(current: number, max: number, length: number = 10): string {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
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
