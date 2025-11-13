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
  location: string;
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
