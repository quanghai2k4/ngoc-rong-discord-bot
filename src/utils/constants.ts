/**
 * Game constants - tránh magic numbers trong code
 */

// Character stats
export const STARTING_HP = 100;
export const STARTING_KI = 100;
export const STARTING_ATTACK = 10;
export const STARTING_DEFENSE = 10;
export const STARTING_SPEED = 10;
export const STARTING_GOLD = 100;
export const STARTING_LEVEL = 1;

// Level up bonuses
export const HP_PER_LEVEL = 20;
export const KI_PER_LEVEL = 20;
export const ATTACK_PER_LEVEL = 5;
export const DEFENSE_PER_LEVEL = 5;
export const SPEED_PER_LEVEL = 3;

// Experience
export const BASE_EXP_PER_LEVEL = 100;
export const EXP_INCREASE_PER_LEVEL = 50;

// Battle
export const BASE_CRITICAL_CHANCE = 5.0;
export const BASE_CRITICAL_DAMAGE = 1.5;
export const BASE_DODGE_CHANCE = 5.0;
export const MONSTER_BASE_CRITICAL_CHANCE = 3.0;
export const MONSTER_BASE_CRITICAL_DAMAGE = 1.3;

// Monster spawn rates
export const SPAWN_RATE_1_MONSTER = 70;
export const SPAWN_RATE_2_MONSTERS = 25;
export const SPAWN_RATE_3_MONSTERS = 5;

// Thread settings
export const THREAD_AUTO_ARCHIVE_DURATION = 60; // minutes
export const THREAD_DELETE_DELAY = 10000; // milliseconds (10 seconds)

// Cache settings
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Database pool settings
export const DB_POOL_MAX_CONNECTIONS = 20;
export const DB_POOL_IDLE_TIMEOUT = 30000; // 30 seconds
export const DB_POOL_CONNECTION_TIMEOUT = 2000; // 2 seconds
export const DB_SLOW_QUERY_THRESHOLD = 100; // milliseconds

// Discord interaction timeouts
export const INTERACTION_TIMEOUT = 60000; // 60 seconds
export const BUTTON_TIMEOUT = 60000; // 60 seconds

// HP bar display
export const HP_BAR_LENGTH = 10;
