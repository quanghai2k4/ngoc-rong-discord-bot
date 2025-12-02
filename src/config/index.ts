/**
 * Centralized configuration cho toàn bộ bot
 */

// Discord Bot Config
export const BOT_CONFIG = {
  PREFIX: 'z',
  COMMAND_TIMEOUT: 60000, // 60 seconds
  BATTLE_DELAY: 2000, // 2 seconds
  BOSS_THREAD_ARCHIVE_DELAY: 10000, // 10 seconds
  ROUND_DELAY: 500, // 500ms between rounds in boss fights
} as const;

// Game Mechanics
export const GAME_CONFIG = {
  // Level Up
  LEVEL_UP: {
    BASE_EXP: 100,
    EXP_PER_LEVEL: 50,
    HP_BONUS: 20,
    KI_BONUS: 20,
    ATTACK_BONUS: 5,
    DEFENSE_BONUS: 5,
    SPEED_BONUS: 3,
  },
  
  // Combat
  COMBAT: {
    SKILL_ACTIVATION_CHANCE: 0.65, // 65%
    KI_REGEN_PER_TURN: 10,
    DEATH_GOLD_PENALTY: 0.1, // 10%
    MIN_HP_ON_LOSS: 1,
  },
  
  // Monster Spawn
  SPAWN: {
    MIN_MONSTERS: 1,
    MAX_MONSTERS: 3,
    SUPER_MONSTER_CHANCE: 0.1, // 10%
    LEVEL_VARIANCE: 2, // +/- 2 levels
  },
} as const;

// UI Config
export const UI_CONFIG = {
  // Colors
  COLORS: {
    PRIMARY: '#0099ff',
    SUCCESS: '#00FF00',
    ERROR: '#FF0000',
    WARNING: '#FFA500',
    BOSS: '#FFD700',
  },
  
  // Progress Bars
  HP_BAR_LENGTH: 10,
  HP_BAR_SHORT_LENGTH: 5,
  
  // Field Limits
  MAX_BATTLE_LOG_LENGTH: 1024,
  MAX_EMBED_FIELDS: 25,
  
  // Display
  MAX_IMPORTANT_ROUNDS: 5,
  BATTLE_LOG_TRUNCATE_LENGTH: 1000,
} as const;

// Database Config
export const DB_CONFIG = {
  POOL: {
    MAX: 30, // Tăng từ 20 lên 30 connections
    IDLE_TIMEOUT: 10000, // Giảm từ 30s xuống 10s
    CONNECTION_TIMEOUT: 10000,
  },
  QUERY: {
    SLOW_QUERY_THRESHOLD: 100, // ms
  },
} as const;

// Cache Config
export const CACHE_CONFIG = {
  RACES_TTL: 5 * 60 * 1000, // 5 minutes
  ITEMS_TTL: 10 * 60 * 1000, // 10 minutes
  SKILLS_TTL: 10 * 60 * 1000, // 10 minutes
  STATIC_DATA_TTL: 30 * 60 * 1000, // 30 minutes - reload game data cache
  CHARACTER_TTL: 300, // 5 minutes (in seconds for Redis)
  PLAYER_CHARACTER_TTL: 300, // 5 minutes
} as const;

// Locations
export const LOCATIONS = {
  NORMAL: [
    'Rừng Tre',
    'Núi Paozu',
    'Làng Aru',
    'Sa mạc',
    'Đồng cỏ',
    'Karin',
    'Thành phố phía Tây',
  ],
  BOSS_ONLY: [
    'Tháp Karin',
    'Cung điện thần',
    'Hành tinh Namek',
    'Phòng thời gian',
  ],
} as const;

// Command Aliases
export const COMMAND_ALIASES = {
  start: ['start', 'batdau'],
  profile: ['profile', 'info', 'tt', 'thongtin'],
  hunt: ['hunt', 'san', 'danhquai'],
  boss: ['boss', 'thachdau'],
  inventory: ['inventory', 'inv', 'tui', 'tuido'],
  skills: ['skills', 'skill', 'kynang', 'kn'],
  help: ['help', 'h', 'trogiup'],
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NO_CHARACTER: '❌ Bạn chưa có nhân vật! Sử dụng `/start` để bắt đầu.',
  NO_CHARACTER_PREFIX: '❌ Bạn chưa có nhân vật! Sử dụng `zstart` để bắt đầu.',
  NO_HP: '❌ Bạn đã hết HP! Hãy nghỉ ngơi để hồi phục. 💤',
  CHARACTER_EXISTS: '❌ Bạn đã có nhân vật **{name}** rồi! Sử dụng `zprofile` để xem thông tin.',
  COMMAND_NOT_FOUND: '❌ Không tìm thấy lệnh `{command}`. Sử dụng `zhelp` để xem danh sách lệnh.',
  COMMAND_ERROR: '❌ Đã xảy ra lỗi khi thực hiện lệnh này!',
  TIMEOUT: '⏰ Đã hết thời gian! Vui lòng thử lại.',
  NO_MONSTERS: '❌ Không tìm thấy quái vật nào phù hợp với level của bạn!',
  NO_BOSS: '❌ Không có Boss nào trong hệ thống!',
  INVALID_CHOICE: '❌ Lựa chọn không hợp lệ!',
} as const;

// Helper để tính EXP cần cho level up
export function getRequiredExp(level: number): number {
  return GAME_CONFIG.LEVEL_UP.BASE_EXP + (level - 1) * GAME_CONFIG.LEVEL_UP.EXP_PER_LEVEL;
}

// Helper để check location type
export function isBossOnlyLocation(location: string): boolean {
  return (LOCATIONS.BOSS_ONLY as readonly string[]).includes(location);
}

// Helper để lấy random location
export function getRandomLocation(bossOnly = false): string {
  const pool = bossOnly ? LOCATIONS.BOSS_ONLY : LOCATIONS.NORMAL;
  return pool[Math.floor(Math.random() * pool.length)];
}
