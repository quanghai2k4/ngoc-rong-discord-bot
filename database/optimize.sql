-- Tối ưu database performance

-- 1. Thêm indexes quan trọng còn thiếu
CREATE INDEX IF NOT EXISTS idx_players_discord_id ON players(discord_id);
CREATE INDEX IF NOT EXISTS idx_character_items_equipped ON character_items(character_id, equipped) WHERE equipped = TRUE;
CREATE INDEX IF NOT EXISTS idx_character_quests_completed ON character_quests(character_id, completed);
CREATE INDEX IF NOT EXISTS idx_monsters_is_boss ON monsters(is_boss, min_level, max_level);
CREATE INDEX IF NOT EXISTS idx_battle_logs_date ON battle_logs(battle_date DESC);

-- 2. Thêm partial indexes cho queries thường dùng
CREATE INDEX IF NOT EXISTS idx_monsters_normal ON monsters(min_level, max_level) WHERE is_boss = FALSE;
CREATE INDEX IF NOT EXISTS idx_monsters_boss ON monsters(min_level, max_level) WHERE is_boss = TRUE;

-- 3. Optimize sequential scans với ANALYZE
ANALYZE players;
ANALYZE characters;
ANALYZE monsters;
ANALYZE character_items;
ANALYZE items;
ANALYZE skills;
ANALYZE character_skills;

-- 4. Tạo materialized view cho stats (nếu cần trong tương lai)
-- CREATE MATERIALIZED VIEW IF NOT EXISTS character_stats_summary AS
-- SELECT 
--   c.id,
--   c.name,
--   c.level,
--   c.attack + COALESCE(SUM(i.attack_bonus), 0) as total_attack,
--   c.defense + COALESCE(SUM(i.defense_bonus), 0) as total_defense
-- FROM characters c
-- LEFT JOIN character_items ci ON c.id = ci.character_id AND ci.equipped = TRUE
-- LEFT JOIN items i ON ci.item_id = i.id
-- GROUP BY c.id;

-- 5. Thêm check constraints để đảm bảo data integrity
ALTER TABLE characters ADD CONSTRAINT check_hp_positive CHECK (hp >= 0);
ALTER TABLE characters ADD CONSTRAINT check_hp_max CHECK (hp <= max_hp);
ALTER TABLE characters ADD CONSTRAINT check_ki_positive CHECK (ki >= 0);
ALTER TABLE characters ADD CONSTRAINT check_ki_max CHECK (ki <= max_ki);
ALTER TABLE characters ADD CONSTRAINT check_level_positive CHECK (level > 0);

-- 6. Thêm composite index cho joins thường dùng
CREATE INDEX IF NOT EXISTS idx_character_items_lookup ON character_items(character_id, item_id, equipped);
CREATE INDEX IF NOT EXISTS idx_character_skills_lookup ON character_skills(character_id, skill_id);

-- 7. Index cho monster drops joins
CREATE INDEX IF NOT EXISTS idx_monster_drops_monster ON monster_drops(monster_id, drop_rate DESC);
