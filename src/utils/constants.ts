/**
 * Game constants - tránh magic numbers trong code
 * 
 * NOTE: Nhiều constants đã được di chuyển sang src/config/index.ts
 * File này giữ lại các constants cụ thể cho game mechanics
 */

// Character starting stats
export const STARTING_HP = 100;
export const STARTING_KI = 100;
export const STARTING_ATTACK = 10;
export const STARTING_DEFENSE = 10;
export const STARTING_SPEED = 10;
export const STARTING_GOLD = 100;
export const STARTING_LEVEL = 1;

// Battle mechanics
export const BASE_CRITICAL_CHANCE = 5.0;
export const BASE_CRITICAL_DAMAGE = 1.5;
export const BASE_DODGE_CHANCE = 5.0;
export const MONSTER_BASE_CRITICAL_CHANCE = 3.0;
export const MONSTER_BASE_CRITICAL_DAMAGE = 1.3;

// Monster spawn rates (probability weights)
export const SPAWN_RATE_1_MONSTER = 70;
export const SPAWN_RATE_2_MONSTERS = 25;
export const SPAWN_RATE_3_MONSTERS = 5;

// Thread settings
export const THREAD_AUTO_ARCHIVE_DURATION = 60; // minutes

// Legacy exports - use GAME_CONFIG, DB_CONFIG, etc. from config/index.ts for new code
export { GAME_CONFIG, DB_CONFIG, CACHE_CONFIG, BOT_CONFIG, UI_CONFIG } from '../config';
