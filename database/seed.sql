-- Seed initial data

-- Insert character races
INSERT INTO character_races (name, description, hp_bonus, ki_bonus, attack_bonus, defense_bonus) VALUES
('Saiyan', 'Chiến binh mạnh mẽ từ hành tinh Vegeta', 50, 30, 15, 10),
('Namek', 'Người Namek với khả năng hồi phục tuyệt vời', 30, 50, 10, 15),
('Trái đất', 'Người Trái Đất thông minh và linh hoạt', 40, 40, 12, 12);

-- Insert item types
INSERT INTO item_types (name, description) VALUES
('Weapon', 'Vũ khí tấn công'),
('Armor', 'Áo giáp phòng thủ'),
('Accessory', 'Phụ kiện hỗ trợ'),
('Consumable', 'Vật phẩm tiêu hao');

-- Insert weapons
INSERT INTO items (name, item_type_id, description, attack_bonus, price, required_level) VALUES
('Gậy Như Ý', 1, 'Cây gậy thần kỳ có thể thay đổi kích thước', 20, 500, 1),
('Kiếm Z', 1, 'Thanh kiếm của các chiến binh Z', 40, 1500, 5),
('Gậy Thiên Sứ', 1, 'Vũ khí của thiên sứ', 80, 5000, 10);

-- Insert armors
INSERT INTO items (name, item_type_id, description, defense_bonus, price, required_level) VALUES
('Áo Giáp Saiyan', 2, 'Bộ giáp chiến đấu của người Saiyan', 30, 800, 3),
('Áo Choàng Kaio', 2, 'Áo choàng của Kaio Shin', 60, 3000, 8),
('Áo Giáp Thần', 2, 'Bộ giáp thiêng liêng', 100, 10000, 15);

-- Insert consumables
INSERT INTO items (name, item_type_id, description, hp_bonus, ki_bonus, price, is_consumable, required_level) VALUES
('Đậu Thần', 4, 'Hồi phục toàn bộ HP và KI', 9999, 9999, 100, TRUE, 1),
('Thuốc Hồi HP Nhỏ', 4, 'Hồi phục 50 HP', 50, 0, 20, TRUE, 1),
('Thuốc Hồi KI Nhỏ', 4, 'Hồi phục 50 KI', 0, 50, 20, TRUE, 1),
('Thuốc Hồi HP Lớn', 4, 'Hồi phục 200 HP', 200, 0, 80, TRUE, 5),
('Thuốc Hồi KI Lớn', 4, 'Hồi phục 200 KI', 0, 200, 80, TRUE, 5);

-- Insert monsters
INSERT INTO monsters (name, level, hp, attack, defense, speed, experience_reward, gold_reward, location) VALUES
('Sói Hoang', 1, 50, 8, 5, 10, 10, 15, 'Rừng Karin'),
('Khủng Long', 3, 100, 15, 10, 8, 30, 40, 'Rừng Karin'),
('Tên Cướp', 5, 150, 25, 15, 12, 60, 80, 'Sa Mạc'),
('Quân Đội Ruy Băng Đỏ', 8, 250, 40, 25, 15, 120, 150, 'Căn Cứ RR'),
('Quỷ Nhỏ', 10, 350, 55, 30, 18, 200, 250, 'Cung Điện Piccolo'),
('Frieza Lính', 15, 600, 80, 50, 25, 400, 500, 'Hành Tinh Namek');

-- Insert monster drops
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES
(1, 7, 30.00),  -- Sói Hoang drops Thuốc Hồi HP Nhỏ
(2, 7, 25.00),  -- Khủng Long drops Thuốc Hồi HP Nhỏ
(2, 8, 25.00),  -- Khủng Long drops Thuốc Hồi KI Nhỏ
(3, 9, 20.00),  -- Tên Cướp drops Thuốc Hồi HP Lớn
(4, 4, 15.00),  -- Quân Đội RR drops Áo Giáp Saiyan
(5, 2, 10.00),  -- Quỷ Nhỏ drops Kiếm Z
(6, 5, 8.00);   -- Frieza Lính drops Áo Choàng Kaio

-- Insert quests
INSERT INTO quests (name, description, required_level, experience_reward, gold_reward, monster_id, required_kills) VALUES
('Tiêu Diệt Sói Hoang', 'Giúp dân làng tiêu diệt 5 con sói hoang', 1, 50, 100, 1, 5),
('Săn Khủng Long', 'Thu thập nguyên liệu từ 3 con khủng long', 3, 150, 200, 2, 3),
('Trừ Khử Tên Cướp', 'Bảo vệ ngôi làng khỏi băng cướp', 5, 300, 400, 3, 10),
('Đột Kích RR', 'Tấn công căn cứ Ruy Băng Đỏ', 8, 600, 800, 4, 8),
('Chiến Đấu Với Quỷ', 'Đánh bại quân quỷ của Piccolo', 10, 1000, 1200, 5, 5);

-- Insert skills (race-specific and universal)
-- Saiyan skills (race_id = 1)
INSERT INTO skills (name, description, skill_type, race_id, required_level, ki_cost, damage_multiplier, crit_bonus, defense_break) VALUES
('Kamehameha', '🌊 Sóng năng lượng kinh điển! Gây sát thương lớn', 'attack', NULL, 3, 30, 2.0, 10.0, 0.2),
('Galick Gun', '💜 Kỹ năng đặc trưng của hoàng tử Saiyan', 'attack', 1, 5, 35, 2.2, 15.0, 0.3),
('Final Flash', '⚡ Tấn công tối thượng! Phá vỡ mọi phòng thủ', 'attack', 1, 10, 50, 3.0, 20.0, 0.5),
('Super Saiyan Rage', '💥 Bùng nổ sức mạnh Saiyan! Tăng toàn bộ sát thương', 'buff', 1, 8, 40, 0.0, 25.0, 0.0);

-- Namek skills (race_id = 2)
INSERT INTO skills (name, description, skill_type, race_id, required_level, ki_cost, damage_multiplier, heal_amount) VALUES
('Makankosappo', '🎯 Súng quỷ xuyên thấu! Chính xác chết người', 'attack', 2, 5, 40, 2.5, 0),
('Masenko', '💚 Tia năng lượng Namek mạnh mẽ', 'attack', 2, 3, 30, 1.8, 0),
('Regeneration', '🌟 Hồi phục năng lượng sống bằng sức mạnh Namek', 'heal', 2, 4, 25, 0.0, 100),
('Mystic Attack', '🔮 Kỹ năng thần bí của người Namek', 'attack', 2, 10, 45, 2.8, 0);

-- Earthling skills (race_id = 3)
INSERT INTO skills (name, description, skill_type, race_id, required_level, ki_cost, damage_multiplier, stun_chance) VALUES
('Kienzan', '💿 Đĩa cưa năng lượng! Có thể gây choáng', 'attack', 3, 5, 35, 2.0, 30.0),
('Solar Flare', '☀️ Chiêu lóa mắt! Gây choáng địch', 'attack', 3, 3, 20, 1.0, 80.0),
('Tri-Beam', '📐 Kỹ năng ba mắt! Tiêu tốn nhiều năng lượng', 'attack', 3, 8, 45, 2.6, 15.0),
('Wolf Fang Fist', '🐺 Đấm liên hoàn sói dữ', 'attack', 3, 4, 25, 1.6, 5.0);

-- Universal skills (all races)
INSERT INTO skills (name, description, skill_type, race_id, required_level, ki_cost, damage_multiplier, crit_bonus) VALUES
('Ki Blast', '💨 Tấn công năng lượng cơ bản', 'attack', NULL, 1, 15, 1.3, 5.0),
('Spirit Bomb', '🌍 Nguyên khí đạn! Thu thập năng lượng vũ trụ', 'attack', NULL, 15, 80, 4.0, 30.0),
('Kaio-ken', '🔴 Tăng tốc chiến đấu gấp bội', 'buff', NULL, 7, 35, 0.0, 15.0);

-- Auto-learn basic skills for each race when character is created
-- These will be handled in CharacterService when creating character

-- Assign skills to monsters
-- Monsters at each location will have appropriate skills
INSERT INTO monster_skills (monster_id, skill_id, use_probability) VALUES
-- Rừng Karin monsters (basic skills)
(1, 13, 20.0),  -- Sói Hoang uses Ki Blast (20%)
(2, 13, 30.0),  -- Khủng Long uses Ki Blast (30%)

-- Sa Mạc (intermediate)
(3, 13, 40.0),  -- Tên Cướp uses Ki Blast (40%)
(3, 12, 25.0),  -- Tên Cướp uses Wolf Fang Fist (25%)

-- Căn Cứ RR (advanced)
(4, 1, 35.0),   -- Quân RR uses Kamehameha (35%)
(4, 10, 30.0),  -- Quân RR uses Solar Flare (30%)

-- Cung Điện Piccolo (strong)
(5, 6, 40.0),   -- Quỷ Nhỏ uses Masenko (40%)
(5, 1, 35.0),   -- Quỷ Nhỏ uses Kamehameha (35%)

-- Hành Tinh Namek (very strong)
(6, 2, 40.0),   -- Frieza Lính uses Galick Gun (40%)
(6, 1, 45.0),   -- Frieza Lính uses Kamehameha (45%)
(6, 9, 30.0);   -- Frieza Lính uses Kienzan (30%)
