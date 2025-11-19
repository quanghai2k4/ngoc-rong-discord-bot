/**
 * Test script để preview Boss Battle UI V2 với box drawing
 */

import { Character, Monster } from './src/types';
import { BattleState, createBattleLiveEmbed, createBattleResultEmbedV2, BattleHighlight, BattleStats } from './src/utils/bossBattleV2';
import { BattleResult } from './src/services/BattleService';

// Mock data
const mockCharacter: Character = {
  id: 1,
  player_id: 1,
  race_id: 1,
  name: 'Goku',
  level: 15,
  experience: 5000,
  hp: 850,
  max_hp: 1200,
  ki: 300,
  max_ki: 500,
  attack: 120,
  defense: 80,
  speed: 100,
  gold: 5000,
  location: 'Earth',
  critical_chance: 0.1,
  critical_damage: 1.5,
  dodge_chance: 0.05,
  created_at: new Date()
};

const mockBoss: Monster = {
  id: 1,
  name: 'Frieza',
  level: 20,
  hp: 2800,
  attack: 150,
  defense: 100,
  speed: 90,
  experience_reward: 1500,
  gold_reward: 2500,
  min_level: 15,
  max_level: 25,
  location: 'Earth',
  critical_chance: 0.15,
  critical_damage: 1.8,
  is_boss: true,
  is_super: false
};

// Test 1: Live Battle State
console.log('\n🎮 TEST 1: LIVE BATTLE DISPLAY\n');
console.log('═'.repeat(50));

const liveState: BattleState = {
  round: 5,
  totalRounds: 20,
  characterHp: 850,
  characterMaxHp: 1200,
  bossHp: 2800,
  bossMaxHp: 4500,
  lastActions: [
    'Goku tấn công Frieza -120 HP',
    'Frieza phản đòn -85 HP',
    'Goku kích hoạt Skill: Kamehameha!'
  ],
  highlights: [
    '⚡ Critical Hit! Goku CHƯỞNG -240 HP',
    '🌀 Skill: Super Kamehameha!'
  ]
};

const liveEmbed = createBattleLiveEmbed(liveState, mockCharacter, mockBoss);
console.log('\nTitle:', liveEmbed.data.title);
console.log('Color:', liveEmbed.data.color?.toString(16));
console.log('\nDescription:');
console.log(liveEmbed.data.description);
console.log('\nFooter:', liveEmbed.data.footer?.text);

// Test 2: Victory Result
console.log('\n\n🏆 TEST 2: VICTORY SCREEN\n');
console.log('═'.repeat(50));

const victoryHighlights: BattleHighlight[] = [
  { round: 3, type: 'critical', message: 'Critical Hit! Goku CHƯỞNG -240 HP', icon: '⚡' },
  { round: 7, type: 'skill', message: 'Skill: Super Kamehameha!', icon: '🌀' },
  { round: 12, type: 'low_hp', message: 'Low HP Warning! 120/1200', icon: '❤️' },
  { round: 15, type: 'dodge', message: 'Goku né tránh đòn chí mạng', icon: '💨' },
  { round: 18, type: 'final_blow', message: 'Goku hạ gục Frieza!', icon: '🎯' }
];

const victoryStats: BattleStats = {
  totalDamageDealt: 4850,
  totalDamageTaken: 1080,
  criticalHits: 3,
  skillsUsed: 5,
  dodges: 2,
  highestDamage: 340,
  lowestHp: 120
};

const victoryResult: BattleResult = {
  won: true,
  rounds: Array(18).fill({}),
  monstersDefeated: 1,
  characterDied: false,
  expGained: 1500,
  goldGained: 2500,
  itemsDropped: [
    { id: 1, name: 'Senzu Bean', type: 'consumable', rarity: 'rare' },
    { id: 2, name: 'Dragon Radar', type: 'quest', rarity: 'legendary' }
  ],
  questRewards: [
    { questName: 'Defeat Frieza', expReward: 500, goldReward: 300, itemName: null },
    { questName: 'Boss Hunter', expReward: 200, goldReward: 100, itemName: null }
  ],
  leveledUp: true,
  newLevel: 16
};

const victoryEmbed = createBattleResultEmbedV2(
  victoryResult,
  mockCharacter,
  mockBoss,
  victoryHighlights,
  victoryStats
);

console.log('\nTitle:', victoryEmbed.data.title);
console.log('Color:', victoryEmbed.data.color?.toString(16));
console.log('\nDescription:');
console.log(victoryEmbed.data.description);

if (victoryEmbed.data.fields && victoryEmbed.data.fields.length > 0) {
  console.log('\nFields:');
  for (const field of victoryEmbed.data.fields) {
    console.log(`\n${field.name}:`);
    console.log(field.value);
  }
}

console.log('\nFooter:', victoryEmbed.data.footer?.text);

// Test 3: Defeat Result
console.log('\n\n💀 TEST 3: DEFEAT SCREEN\n');
console.log('═'.repeat(50));

const defeatHighlights: BattleHighlight[] = [
  { round: 5, type: 'critical', message: 'Critical Hit! -180 HP', icon: '⚡' },
  { round: 12, type: 'near_death', message: 'CRITICAL! HP xuống dưới 10%!', icon: '💀' }
];

const defeatStats: BattleStats = {
  totalDamageDealt: 2400,
  totalDamageTaken: 1200,
  criticalHits: 1,
  skillsUsed: 3,
  dodges: 0,
  highestDamage: 180,
  lowestHp: 50
};

const defeatResult: BattleResult = {
  won: false,
  rounds: Array(12).fill({}),
  monstersDefeated: 0,
  characterDied: true,
  expGained: 0,
  goldGained: 0,
  itemsDropped: [],
  questRewards: [],
  leveledUp: false
};

const defeatEmbed = createBattleResultEmbedV2(
  defeatResult,
  mockCharacter,
  mockBoss,
  defeatHighlights,
  defeatStats
);

console.log('\nTitle:', defeatEmbed.data.title);
console.log('Color:', defeatEmbed.data.color?.toString(16));
console.log('\nDescription:');
console.log(defeatEmbed.data.description);

if (defeatEmbed.data.fields && defeatEmbed.data.fields.length > 0) {
  console.log('\nFields:');
  for (const field of defeatEmbed.data.fields) {
    console.log(`\n${field.name}:`);
    console.log(field.value);
  }
}

console.log('\nFooter:', defeatEmbed.data.footer?.text);

console.log('\n\n✅ UI PREVIEW COMPLETE!\n');
console.log('═'.repeat(50));
console.log('Check BOSS_UI_PREVIEW.md for full documentation');
console.log('═'.repeat(50));
