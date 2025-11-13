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
INSERT INTO monsters (name, level, hp, attack, defense, speed, experience_reward, gold_reward, min_level, max_level, is_boss) VALUES
-- Quái thường Level 1-5 (Newbie area)
('Sói Hoang', 1, 50, 8, 5, 10, 10, 15, 1, 3, FALSE),
('Rắn Độc', 2, 60, 10, 6, 12, 15, 20, 1, 3, FALSE),
('Gấu Hoang', 2, 80, 12, 8, 8, 20, 25, 1, 4, FALSE),
('Khủng Long Nhỏ', 3, 100, 15, 10, 10, 30, 40, 2, 5, FALSE),
('Thỏ Dữ', 3, 70, 13, 7, 15, 25, 30, 2, 5, FALSE),

-- Quái thường Level 4-8 (Beginner area)
('Tên Cướp', 5, 150, 25, 15, 12, 60, 80, 4, 8, FALSE),
('Lính Canh', 5, 140, 22, 18, 10, 55, 75, 4, 8, FALSE),
('Ninja Tập Sự', 6, 170, 28, 16, 18, 70, 90, 5, 9, FALSE),
('Cướp Biển', 6, 160, 26, 17, 14, 65, 85, 5, 9, FALSE),
('Sát Thủ Tập Sự', 7, 190, 32, 20, 20, 85, 110, 6, 10, FALSE),

-- Quái thường Level 7-12 (Intermediate area)
('Quân Đội RR', 8, 250, 40, 25, 15, 120, 150, 7, 12, FALSE),
('Lính Mũ Xanh', 8, 240, 38, 28, 13, 115, 145, 7, 12, FALSE),
('Lính Mũ Đỏ', 9, 280, 45, 30, 16, 140, 170, 8, 13, FALSE),
('Cyborg', 10, 300, 48, 32, 18, 160, 200, 9, 14, FALSE),
('Android Cũ', 10, 320, 50, 35, 20, 170, 210, 9, 14, FALSE),

-- Quái thường Level 10-16 (Advanced area)
('Quỷ Nhỏ', 10, 350, 55, 30, 18, 200, 250, 10, 16, FALSE),
('Quỷ Trung', 12, 420, 65, 40, 22, 250, 300, 11, 17, FALSE),
('Quỷ Đại', 14, 500, 75, 50, 25, 300, 400, 13, 19, FALSE),
('Ma Vương Nhỏ', 15, 550, 80, 55, 28, 350, 450, 14, 20, FALSE),

-- Quái thường Level 15-25 (Expert area)
('Frieza Lính', 15, 600, 80, 50, 25, 400, 500, 15, 25, FALSE),
('Zarbon Lính', 17, 700, 95, 60, 30, 500, 650, 16, 26, FALSE),
('Dodoria Lính', 18, 750, 100, 65, 28, 550, 700, 17, 27, FALSE),
('Ginyu Lính', 20, 900, 120, 80, 35, 700, 900, 19, 29, FALSE),
('Saiyan Hạ Cấp', 22, 1000, 130, 90, 40, 850, 1100, 21, 30, FALSE),

-- Boss (is_boss = TRUE) - Xuất hiện ở Rừng Karin và Tháp Karin
('Mèo Karin', 3, 200, 20, 15, 20, 100, 200, 1, 5, TRUE),
('Yajirobe', 8, 500, 50, 40, 25, 300, 500, 5, 10, TRUE),
('Thần Karin', 15, 1000, 90, 70, 35, 800, 1500, 10, 20, TRUE),
('Korin Sama', 25, 2000, 150, 120, 50, 2000, 4000, 20, 30, TRUE),
('Ông Già Gohan', 12, 800, 70, 55, 30, 600, 1000, 8, 15, TRUE);

-- Insert monster drops (item_id reference: xem items ở trên)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES
-- Level 1-5 monsters
(1, 7, 30.00),   -- Sói Hoang drops Thuốc Hồi HP Nhỏ
(2, 7, 28.00),   -- Rắn Độc drops Thuốc Hồi HP Nhỏ
(3, 8, 25.00),   -- Gấu Hoang drops Thuốc Hồi KI Nhỏ
(4, 7, 25.00),   -- Khủng Long Nhỏ drops Thuốc Hồi HP Nhỏ
(5, 8, 22.00),   -- Thỏ Dữ drops Thuốc Hồi KI Nhỏ

-- Level 4-8 monsters
(6, 9, 20.00),   -- Tên Cướp drops Thuốc Hồi HP Lớn
(7, 9, 18.00),   -- Lính Canh drops Thuốc Hồi HP Lớn
(8, 10, 20.00),  -- Ninja Tập Sự drops Thuốc Hồi KI Lớn
(9, 1, 15.00),   -- Cướp Biển drops Gậy Như Ý
(10, 1, 12.00),  -- Sát Thủ Tập Sự drops Gậy Như Ý

-- Level 7-12 monsters
(11, 4, 15.00),  -- Quân Đội RR drops Áo Giáp Saiyan
(12, 4, 13.00),  -- Lính Mũ Xanh drops Áo Giáp Saiyan
(13, 2, 12.00),  -- Lính Mũ Đỏ drops Kiếm Z
(14, 2, 10.00),  -- Cyborg drops Kiếm Z
(15, 10, 15.00), -- Android Cũ drops Thuốc Hồi KI Lớn

-- Level 10-16 monsters
(16, 2, 10.00),  -- Quỷ Nhỏ drops Kiếm Z
(17, 5, 12.00),  -- Quỷ Trung drops Áo Choàng Kaio
(18, 3, 10.00),  -- Quỷ Đại drops Gậy Thiên Sứ
(19, 5, 15.00),  -- Ma Vương Nhỏ drops Áo Choàng Kaio

-- Level 15-25 monsters
(20, 5, 8.00),   -- Frieza Lính drops Áo Choàng Kaio
(21, 3, 8.00),   -- Zarbon Lính drops Gậy Thiên Sứ
(22, 6, 10.00),  -- Dodoria Lính drops Áo Giáp Thần
(23, 6, 8.00),   -- Ginyu Lính drops Áo Giáp Thần
(24, 3, 7.00),   -- Saiyan Hạ Cấp drops Gậy Thiên Sứ

-- Boss drops (higher rate, better items)
(25, 6, 50.00),  -- Mèo Karin drops Đậu Thần
(26, 6, 45.00),  -- Yajirobe drops Đậu Thần
(27, 6, 40.00),  -- Thần Karin drops Áo Giáp Thần
(28, 6, 35.00),  -- Korin Sama drops Áo Giáp Thần
(29, 6, 42.00);  -- Ông Già Gohan drops Đậu Thần

-- Insert quests
INSERT INTO quests (name, description, required_level, experience_reward, gold_reward, monster_id, required_kills) VALUES
('Tiêu Diệt Sói Hoang', 'Giúp dân làng tiêu diệt 5 con sói hoang', 1, 50, 100, 1, 5),
('Săn Rắn Độc', 'Dọn sạch rắn độc trong rừng', 2, 80, 120, 2, 8),
('Trừ Khử Tên Cướp', 'Bảo vệ ngôi làng khỏi băng cướp', 5, 300, 400, 6, 10),
('Đột Kích RR', 'Tấn công căn cứ Ruy Băng Đỏ', 8, 600, 800, 11, 8),
('Chiến Đấu Với Quỷ', 'Đánh bại quân quỷ của Piccolo', 10, 1000, 1200, 16, 5),
('Thử Thách Karin', 'Leo lên Tháp Karin và thách đấu', 10, 1500, 2000, 28, 1);

-- Insert skills (race-specific and universal)
-- Saiyan skills (race_id = 1)
INSERT INTO skills (name, description, skill_type, race_id, required_level, ki_cost, damage_multiplier, crit_bonus, defense_break, is_aoe) VALUES
('Kamehameha', '🌊 Sóng năng lượng kinh điển! Gây sát thương lớn', 'attack', NULL, 3, 30, 2.0, 10.0, 0.2, TRUE),
('Galick Gun', '💜 Kỹ năng đặc trưng của hoàng tử Saiyan', 'attack', 1, 5, 35, 2.2, 15.0, 0.3, FALSE),
('Final Flash', '⚡ Tấn công tối thượng! Phá vỡ mọi phòng thủ', 'attack', 1, 10, 50, 3.0, 20.0, 0.5, TRUE),
('Super Saiyan Rage', '💥 Bùng nổ sức mạnh Saiyan! Tăng toàn bộ sát thương', 'buff', 1, 8, 40, 0.0, 25.0, 0.0, FALSE);

-- Namek skills (race_id = 2)
INSERT INTO skills (name, description, skill_type, race_id, required_level, ki_cost, damage_multiplier, heal_amount, is_aoe) VALUES
('Makankosappo', '🎯 Súng quỷ xuyên thấu! Chính xác chết người', 'attack', 2, 5, 40, 2.5, 0, FALSE),
('Masenko', '💚 Tia năng lượng Namek mạnh mẽ', 'attack', 2, 3, 30, 1.8, 0, FALSE),
('Regeneration', '🌟 Hồi phục năng lượng sống bằng sức mạnh Namek', 'heal', 2, 4, 25, 0.0, 100, FALSE),
('Mystic Attack', '🔮 Kỹ năng thần bí của người Namek', 'attack', 2, 10, 45, 2.8, 0, FALSE);

-- Earthling skills (race_id = 3)
INSERT INTO skills (name, description, skill_type, race_id, required_level, ki_cost, damage_multiplier, stun_chance, is_aoe) VALUES
('Kienzan', '💿 Đĩa cưa năng lượng! Có thể gây choáng', 'attack', 3, 5, 35, 2.0, 30.0, FALSE),
('Solar Flare', '☀️ Chiêu lóa mắt! Gây choáng địch', 'attack', 3, 3, 20, 1.0, 80.0, FALSE),
('Tri-Beam', '📐 Kỹ năng ba mắt! Tiêu tốn nhiều năng lượng', 'attack', 3, 8, 45, 2.6, 15.0, TRUE),
('Wolf Fang Fist', '🐺 Đấm liên hoàn sói dữ', 'attack', 3, 4, 25, 1.6, 5.0, FALSE);

-- Universal skills (all races)
INSERT INTO skills (name, description, skill_type, race_id, required_level, ki_cost, damage_multiplier, crit_bonus, is_aoe) VALUES
('Ki Blast', '💨 Tấn công năng lượng cơ bản', 'attack', NULL, 1, 15, 1.3, 5.0, FALSE),
('Spirit Bomb', '🌍 Nguyên khí đạn! Thu thập năng lượng vũ trụ', 'attack', NULL, 15, 80, 4.0, 30.0, TRUE),
('Kaio-ken', '🔴 Tăng tốc chiến đấu gấp bội', 'buff', NULL, 7, 35, 0.0, 15.0, FALSE);

-- Auto-learn basic skills for each race when character is created
-- These will be handled in CharacterService when creating character

-- Assign skills to monsters
-- Skill ID 13 = Ki Blast (universal basic attack)
INSERT INTO monster_skills (monster_id, skill_id, use_probability) VALUES
-- Level 1-5 monsters
(1, 13, 15.0),   -- Sói Hoang
(2, 13, 18.0),   -- Rắn Độc
(3, 13, 20.0),   -- Gấu Hoang
(4, 13, 22.0),   -- Khủng Long Nhỏ
(5, 13, 25.0),   -- Thỏ Dữ

-- Level 4-8 monsters
(6, 13, 30.0),   -- Tên Cướp
(7, 13, 28.0),   -- Lính Canh
(8, 13, 35.0),   -- Ninja Tập Sự
(9, 13, 32.0),   -- Cướp Biển
(10, 13, 38.0),  -- Sát Thủ Tập Sự

-- Level 7-12 monsters
(11, 13, 40.0),  -- Quân Đội RR
(12, 13, 42.0),  -- Lính Mũ Xanh
(13, 13, 45.0),  -- Lính Mũ Đỏ
(14, 13, 48.0),  -- Cyborg
(15, 13, 50.0),  -- Android Cũ

-- Level 10-16 monsters
(16, 13, 50.0),  -- Quỷ Nhỏ
(17, 13, 55.0),  -- Quỷ Trung
(18, 13, 58.0),  -- Quỷ Đại
(19, 13, 60.0),  -- Ma Vương Nhỏ

-- Level 15-25 monsters
(20, 13, 60.0),  -- Frieza Lính
(21, 13, 62.0),  -- Zarbon Lính
(22, 13, 65.0),  -- Dodoria Lính
(23, 13, 68.0),  -- Ginyu Lính
(24, 13, 70.0),  -- Saiyan Hạ Cấp

-- Boss monsters (higher skill usage)
(25, 13, 75.0),  -- Mèo Karin
(26, 13, 80.0),  -- Yajirobe
(27, 13, 85.0),  -- Thần Karin
(28, 13, 90.0),  -- Korin Sama
(29, 13, 82.0);  -- Ông Già Gohan
