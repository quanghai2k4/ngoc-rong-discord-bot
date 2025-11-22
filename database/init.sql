-- Create tables for the game

-- Players table (Discord users)
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    discord_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Character races (Saiyan, Namek, Earthling inspired by Dragon Ball)
CREATE TABLE IF NOT EXISTS character_races (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    hp_bonus INTEGER DEFAULT 0,
    ki_bonus INTEGER DEFAULT 0,
    attack_bonus INTEGER DEFAULT 0,
    defense_bonus INTEGER DEFAULT 0
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    race_id INTEGER REFERENCES character_races(id),
    name VARCHAR(255) NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    hp INTEGER DEFAULT 100,
    max_hp INTEGER DEFAULT 100,
    ki INTEGER DEFAULT 100,
    max_ki INTEGER DEFAULT 100,
    attack INTEGER DEFAULT 10,
    defense INTEGER DEFAULT 10,
    speed INTEGER DEFAULT 10,
    gold INTEGER DEFAULT 100,
    location VARCHAR(255) DEFAULT 'Làng Aru',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id)
);

-- Item types (với fixed IDs từ game gốc)
CREATE TABLE IF NOT EXISTS item_types (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Items (với fixed IDs từ Ngọc Rồng Online)
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    item_type_id INTEGER REFERENCES item_types(id),
    description TEXT,
    hp_bonus INTEGER DEFAULT 0,
    ki_bonus INTEGER DEFAULT 0,
    attack_bonus INTEGER DEFAULT 0,
    defense_bonus INTEGER DEFAULT 0,
    speed_bonus INTEGER DEFAULT 0,
    price INTEGER DEFAULT 0,
    is_consumable BOOLEAN DEFAULT FALSE,
    required_level INTEGER DEFAULT 1
);

-- Character inventory
CREATE TABLE IF NOT EXISTS character_items (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id),
    quantity INTEGER DEFAULT 1,
    equipped BOOLEAN DEFAULT FALSE,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(character_id, item_id)
);

-- Monsters/Enemies
CREATE TABLE IF NOT EXISTS monsters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level INTEGER DEFAULT 1,
    hp INTEGER DEFAULT 50,
    attack INTEGER DEFAULT 5,
    defense INTEGER DEFAULT 5,
    speed INTEGER DEFAULT 5,
    experience_reward INTEGER DEFAULT 10,
    gold_reward INTEGER DEFAULT 10,
    min_level INTEGER DEFAULT 1,
    max_level INTEGER DEFAULT 5,
    is_boss BOOLEAN DEFAULT FALSE,
    is_super BOOLEAN DEFAULT FALSE
);

-- Monster drops
CREATE TABLE IF NOT EXISTS monster_drops (
    id SERIAL PRIMARY KEY,
    monster_id INTEGER REFERENCES monsters(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id),
    drop_rate DECIMAL(5,2) DEFAULT 10.00
);

-- Quests
CREATE TABLE IF NOT EXISTS quests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    required_level INTEGER DEFAULT 1,
    experience_reward INTEGER DEFAULT 50,
    gold_reward INTEGER DEFAULT 50,
    monster_id INTEGER REFERENCES monsters(id),
    required_kills INTEGER DEFAULT 1
);

-- Character quests tracking
CREATE TABLE IF NOT EXISTS character_quests (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    quest_id INTEGER REFERENCES quests(id),
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(character_id, quest_id)
);

-- Battle logs
CREATE TABLE IF NOT EXISTS battle_logs (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    monster_id INTEGER REFERENCES monsters(id),
    won BOOLEAN NOT NULL,
    experience_gained INTEGER DEFAULT 0,
    gold_gained INTEGER DEFAULT 0,
    battle_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    skill_type VARCHAR(50) NOT NULL, -- 'attack', 'defense', 'heal', 'buff'
    race_id INTEGER REFERENCES character_races(id), -- NULL = all races can learn
    required_level INTEGER DEFAULT 1,
    ki_cost INTEGER DEFAULT 20,
    cooldown INTEGER DEFAULT 0, -- turns
    damage_multiplier DECIMAL(4,2) DEFAULT 1.5, -- for attack skills
    heal_amount INTEGER DEFAULT 0, -- for heal skills
    crit_bonus DECIMAL(4,2) DEFAULT 0.0, -- extra crit chance
    stun_chance DECIMAL(4,2) DEFAULT 0.0, -- chance to stun (0-100)
    defense_break DECIMAL(4,2) DEFAULT 0.0, -- ignore % of defense
    is_aoe BOOLEAN DEFAULT FALSE, -- Area of Effect - hits all enemies
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Character skills (learned skills)
CREATE TABLE IF NOT EXISTS character_skills (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id),
    learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(character_id, skill_id)
);

-- Monster skills
CREATE TABLE IF NOT EXISTS monster_skills (
    id SERIAL PRIMARY KEY,
    monster_id INTEGER REFERENCES monsters(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id),
    use_probability DECIMAL(4,2) DEFAULT 50.00 -- % chance to use
);

-- Add critical stats to characters
ALTER TABLE characters ADD COLUMN IF NOT EXISTS critical_chance DECIMAL(4,2) DEFAULT 5.00;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS critical_damage DECIMAL(4,2) DEFAULT 1.50;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS dodge_chance DECIMAL(4,2) DEFAULT 5.00;

-- Add critical stats to monsters  
ALTER TABLE monsters ADD COLUMN IF NOT EXISTS critical_chance DECIMAL(4,2) DEFAULT 3.00;
ALTER TABLE monsters ADD COLUMN IF NOT EXISTS critical_damage DECIMAL(4,2) DEFAULT 1.30;

-- Daily Quest Templates
CREATE TABLE IF NOT EXISTS daily_quest_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quest_type VARCHAR(50) NOT NULL, -- 'kill_monsters', 'use_skills', 'defeat_boss', 'earn_gold', 'complete_hunts'
    target_id INTEGER, -- monster_id for kill/defeat, skill_id for use_skills (NULL for generic)
    required_amount INTEGER NOT NULL,
    exp_reward INTEGER DEFAULT 0,
    gold_reward INTEGER DEFAULT 0,
    item_reward_id INTEGER REFERENCES items(id),
    min_level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Character Daily Quests (assigned quests per day)
CREATE TABLE IF NOT EXISTS character_daily_quests (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    quest_template_id INTEGER REFERENCES daily_quest_templates(id),
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE, -- Quest hoàn thành nhưng chưa nhận thưởng
    assigned_date DATE NOT NULL, -- Ngày được assign quest (UTC+7)
    completed_at TIMESTAMP,
    claimed_at TIMESTAMP,
    UNIQUE(character_id, quest_template_id, assigned_date)
);

-- XP Activity Logs (chi tiết lịch sử nhận XP)
CREATE TABLE IF NOT EXISTS xp_logs (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'hunt', 'boss', 'quest', 'daily_quest', 'achievement', 'bonus'
    xp_amount INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rank System (hệ thống xếp hạng)
CREATE TABLE IF NOT EXISTS ranks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    min_level INTEGER NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color code
    icon VARCHAR(10), -- Emoji icon
    display_order INTEGER NOT NULL
);

-- Character Stats Tracking (theo dõi thống kê tổng hợp)
CREATE TABLE IF NOT EXISTS character_stats (
    id SERIAL PRIMARY KEY,
    character_id INTEGER UNIQUE REFERENCES characters(id) ON DELETE CASCADE,
    total_xp_earned BIGINT DEFAULT 0, -- Tổng XP kiếm được (không bao giờ giảm)
    total_monsters_killed INTEGER DEFAULT 0,
    total_bosses_defeated INTEGER DEFAULT 0,
    total_quests_completed INTEGER DEFAULT 0,
    total_daily_quests_completed INTEGER DEFAULT 0,
    total_gold_earned BIGINT DEFAULT 0,
    total_damage_dealt BIGINT DEFAULT 0,
    total_damage_taken BIGINT DEFAULT 0,
    total_battles_won INTEGER DEFAULT 0,
    total_battles_lost INTEGER DEFAULT 0,
    highest_damage_dealt INTEGER DEFAULT 0,
    longest_win_streak INTEGER DEFAULT 0,
    current_win_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_characters_player_id ON characters(player_id);
CREATE INDEX idx_character_items_character_id ON character_items(character_id);
CREATE INDEX idx_character_quests_character_id ON character_quests(character_id);
CREATE INDEX idx_battle_logs_character_id ON battle_logs(character_id);
CREATE INDEX idx_character_skills_character_id ON character_skills(character_id);
CREATE INDEX idx_skills_race_id ON skills(race_id);
CREATE INDEX idx_monsters_level_range ON monsters(min_level, max_level);
CREATE INDEX idx_character_daily_quests_character_date ON character_daily_quests(character_id, assigned_date);
CREATE INDEX idx_character_daily_quests_completed ON character_daily_quests(completed, claimed);
CREATE INDEX idx_xp_logs_character_id ON xp_logs(character_id);
CREATE INDEX idx_xp_logs_created_at ON xp_logs(created_at);
CREATE INDEX idx_character_stats_total_xp ON character_stats(total_xp_earned DESC);
