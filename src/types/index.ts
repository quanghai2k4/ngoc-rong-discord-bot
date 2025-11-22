export interface Player {
  id: number;
  discord_id: string;
  username: string;
  created_at: Date;
  last_login: Date;
}

export interface CharacterRace {
  id: number;
  name: string;
  description: string;
  hp_bonus: number;
  ki_bonus: number;
  attack_bonus: number;
  defense_bonus: number;
}

export interface Character {
  id: number;
  player_id: number;
  race_id: number;
  name: string;
  level: number;
  experience: number;
  hp: number;
  max_hp: number;
  ki: number;
  max_ki: number;
  attack: number;
  defense: number;
  speed: number;
  gold: number;
  location: string;
  critical_chance: number;
  critical_damage: number;
  dodge_chance: number;
  created_at: Date;
}

export interface Item {
  id: number;
  name: string;
  item_type_id: number;
  description: string;
  hp_bonus: number;
  ki_bonus: number;
  attack_bonus: number;
  defense_bonus: number;
  speed_bonus: number;
  price: number;
  is_consumable: boolean;
  required_level: number;
}

export interface CharacterItem {
  id: number;
  character_id: number;
  item_id: number;
  quantity: number;
  equipped: boolean;
  obtained_at: Date;
}

export interface Monster {
  id: number;
  name: string;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  experience_reward: number;
  gold_reward: number;
  min_level: number;
  max_level: number;
  location: string;
  critical_chance: number;
  critical_damage: number;
  is_boss: boolean;
  is_super: boolean;
}

export interface Quest {
  id: number;
  name: string;
  description: string;
  required_level: number;
  experience_reward: number;
  gold_reward: number;
  monster_id: number;
  required_kills: number;
}

export interface CharacterQuest {
  id: number;
  character_id: number;
  quest_id: number;
  progress: number;
  completed: boolean;
  started_at: Date;
  completed_at?: Date;
}

// Skill level data structure (từng level của skill)
export interface SkillLevelData {
  power_require: number;  // SM required to learn this level
  damage: number;         // Damage % or effect value
  dx: number;             // Display offset X
  dy: number;             // Display offset Y
  price: number;          // Gold cost to learn
  max_fight: number;      // ???
  mana_use: number;       // KI cost to use
  cool_down: number;      // Cooldown in milliseconds
  id: number;             // Global skill level ID
  point: number;          // Level number (1-7 or 1-max_point)
  info: string;           // Description where to learn
}

// Skill template (base skill definition)
export interface SkillTemplate {
  nclass_id: number;      // Race class (0=Trái Đất, 1=Namek, 2=Saiyan)
  skill_id: number;       // Skill ID within race
  name: string;           // Skill name
  max_point: number;      // Max level (default 7)
  mana_use_type: number;  // KI usage type (0, 1, 2)
  skill_type: number;     // 1=Attack, 2=Heal, 3=Buff/Debuff, 4=Special
  icon_id: number;        // Icon ID for display
  dam_info: string;       // Description format e.g. "Tăng sức đánh: #%"
  slot: number;           // Skill slot position (0-8)
  skill_levels: SkillLevelData[];  // Array of level data
}

// Character's learned skill with current level
export interface CharacterSkill {
  id: number;
  character_id: number;
  nclass_id: number;
  skill_id: number;
  current_point: number;  // Current level (1-max_point)
  learned_at: Date;
}

// Combined view: skill template + character's progress
export interface CharacterSkillView {
  nclass_id: number;
  skill_id: number;
  name: string;
  slot: number;
  current_point: number;  // 0 if not learned
  max_point: number;
  skill_type: number;
  current_level_data: SkillLevelData | null;  // null if not learned
}

// Legacy type alias for backward compatibility (deprecated)
export interface Skill extends SkillTemplate {
  id: number;  // Maps to skill_id
  description: string;  // Maps to dam_info
  race_id: number | null;  // Derived from nclass_id
  required_level: number;  // Derived from power_require
  ki_cost: number;  // From current level mana_use
  cooldown: number;  // From current level cool_down
  damage_multiplier: number;  // From current level damage
  heal_amount: number;  // From current level damage (if heal type)
  crit_bonus: number;  // Not in new system
  stun_chance: number;  // Not in new system
  defense_break: number;  // Not in new system
  is_aoe: boolean;  // Not in new system
  created_at: Date;  // Not in new system
}

// Rank System
export interface Rank {
  id: number;
  name: string;
  min_level: number;
  color: string;
  icon: string;
  display_order: number;
}

// XP Log
export interface XPLog {
  id: number;
  character_id: number;
  activity_type: 'hunt' | 'boss' | 'quest' | 'daily_quest' | 'achievement' | 'bonus';
  xp_amount: number;
  description: string;
  created_at: Date;
}

// Character Stats
export interface CharacterStats {
  id: number;
  character_id: number;
  total_xp_earned: number;
  total_monsters_killed: number;
  total_bosses_defeated: number;
  total_quests_completed: number;
  total_daily_quests_completed: number;
  total_gold_earned: number;
  total_damage_dealt: number;
  total_damage_taken: number;
  total_battles_won: number;
  total_battles_lost: number;
  highest_damage_dealt: number;
  longest_win_streak: number;
  current_win_streak: number;
  created_at: Date;
  updated_at: Date;
}

// Combined Character with Rank
export interface CharacterWithRank extends Character {
  rank: Rank;
  stats: CharacterStats;
  total_xp: number;
  server_rank: number;
}
