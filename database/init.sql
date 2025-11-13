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
    location VARCHAR(255) DEFAULT 'Trái Đất',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id)
);

-- Item types
CREATE TABLE IF NOT EXISTS item_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Items
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
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
    location VARCHAR(255) DEFAULT 'Trái Đất'
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

-- Create indexes for better performance
CREATE INDEX idx_characters_player_id ON characters(player_id);
CREATE INDEX idx_character_items_character_id ON character_items(character_id);
CREATE INDEX idx_character_quests_character_id ON character_quests(character_id);
CREATE INDEX idx_battle_logs_character_id ON battle_logs(character_id);
