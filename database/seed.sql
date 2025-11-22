-- Seed initial data với Fixed Item IDs từ Ngọc Rồng Online

-- Insert character races with explicit IDs starting from 0
-- race_id = nclass_id: 0=Trái đất, 1=Namek, 2=Saiyan
INSERT INTO character_races (id, name, description, hp_bonus, ki_bonus, attack_bonus, defense_bonus) VALUES
(0, 'Trái đất', 'Người Trái Đất thông minh và linh hoạt', 40, 40, 12, 12),
(1, 'Namek', 'Người Namek với khả năng hồi phục tuyệt vời', 30, 50, 10, 15),
(2, 'Saiyan', 'Chiến binh mạnh mẽ từ hành tinh Vegeta', 50, 30, 15, 10);

-- Set sequence to next available value
SELECT setval('character_races_id_seq', 3, false);

-- ==========================================
-- ITEM TYPES - Fixed IDs từ game gốc
-- ==========================================
INSERT INTO item_types (id, name, description) VALUES
(0, 'Armor', 'Áo giáp phòng thủ'),        -- TYPE = 0
(1, 'Pants', 'Quần bảo vệ'),              -- TYPE = 1
(2, 'Gloves', 'Găng tay tấn công'),       -- TYPE = 2
(3, 'Boots', 'Giày tăng tốc'),            -- TYPE = 3
(4, 'Radar', 'Rada tìm ngọc'),            -- TYPE = 4
(5, 'Amulet', 'Bùa hộ mệnh'),             -- TYPE = 5
(6, 'Consumable', 'Vật phẩm tiêu hao'),   -- TYPE = 6
(7, 'Book', 'Sách học kỹ năng'),          -- TYPE = 7
(8, 'Mount', 'Phương tiện'),              -- TYPE = 8
(12, 'Quest', 'Vật phẩm nhiệm vụ'),       -- TYPE = 12
(14, 'Flag', 'Cờ trang trí'),             -- TYPE = 14
(15, 'Special', 'Vật phẩm đặc biệt');     -- TYPE = 15

-- ==========================================
-- ITEMS - ÁO GIÁP (TYPE 0)
-- ==========================================
INSERT INTO items (id, name, item_type_id, description, hp_bonus, ki_bonus, attack_bonus, defense_bonus, speed_bonus, price, is_consumable, required_level) VALUES
-- Trái Đất
(0, 'Áo vải 3 lỗ', 0, 'Giúp giảm sát thương', 0, 0, 0, 2, 0, 500, FALSE, 1),
(3, 'Áo vải dày', 0, 'Giúp giảm sát thương', 0, 0, 0, 4, 0, 10000, FALSE, 3),
-- Namek
(1, 'Áo sợi len', 0, 'Giúp giảm sát thương', 0, 0, 0, 2, 0, 500, FALSE, 1),
(4, 'Áo len Pico', 0, 'Giúp giảm sát thương', 0, 0, 0, 4, 0, 10000, FALSE, 3),
-- Xayda
(2, 'Áo vải thô', 0, 'Giúp giảm sát thương', 0, 0, 0, 2, 0, 500, FALSE, 1),
(5, 'Áo giáp sắt', 0, 'Giúp giảm sát thương', 0, 0, 0, 4, 0, 10000, FALSE, 1);

-- ==========================================
-- ITEMS - QUẦN (TYPE 1)
-- ==========================================
INSERT INTO items (id, name, item_type_id, description, hp_bonus, ki_bonus, attack_bonus, defense_bonus, speed_bonus, price, is_consumable, required_level) VALUES
-- Trái Đất
(6, 'Quần vải đen', 1, 'Giúp tăng HP', 30, 0, 0, 0, 0, 400, FALSE, 1),
(9, 'Quần vải dày', 1, 'Giúp tăng HP', 150, 0, 0, 0, 0, 8000, FALSE, 3),
-- Namek
(7, 'Quần sợi len', 1, 'Giúp tăng HP', 25, 0, 0, 0, 0, 400, FALSE, 1),
(10, 'Quần vải thô Pico', 1, 'Giúp tăng HP', 120, 0, 0, 0, 0, 8000, FALSE, 3),
-- Xayda
(8, 'Quần vải thô', 1, 'Giúp tăng HP', 20, 0, 0, 0, 0, 400, FALSE, 1),
(11, 'Quần giáp sắt', 1, 'Giúp tăng HP', 100, 0, 0, 0, 0, 8000, FALSE, 3);

-- ==========================================
-- ITEMS - GĂNG TAY (TYPE 2)
-- ==========================================
INSERT INTO items (id, name, item_type_id, description, hp_bonus, ki_bonus, attack_bonus, defense_bonus, speed_bonus, price, is_consumable, required_level) VALUES
-- Trái Đất
(21, 'Găng vải đen', 2, 'Giúp tăng sức đánh', 0, 0, 3, 0, 0, 700, FALSE, 1),
(24, 'Găng tay thêu', 2, 'Giúp tăng sức đánh', 0, 0, 6, 0, 0, 3000, FALSE, 3),
-- Namek  
(22, 'Găng sợi len', 2, 'Giúp tăng sức đánh', 0, 0, 3, 0, 0, 700, FALSE, 1),
(25, 'Găng tay len', 2, 'Giúp tăng sức đánh', 0, 0, 6, 0, 0, 3000, FALSE, 3),
-- Xayda
(23, 'Găng vải thô', 2, 'Giúp tăng sức đánh', 0, 0, 3, 0, 0, 700, FALSE, 1),
(26, 'Găng kim loại', 2, 'Giúp tăng sức đánh', 0, 0, 6, 0, 0, 3000, FALSE, 3);

-- ==========================================
-- ITEMS - GIÀY (TYPE 3)
-- ==========================================
INSERT INTO items (id, name, item_type_id, description, hp_bonus, ki_bonus, attack_bonus, defense_bonus, speed_bonus, price, is_consumable, required_level) VALUES
-- Trái Đất
(27, 'Giày vải đen', 3, 'Giúp tăng KI', 0, 10, 0, 0, 0, 300, FALSE, 1),
(30, 'Giày vải dày', 3, 'Giúp tăng KI', 0, 25, 0, 0, 0, 3000, FALSE, 3),
-- Namek
(28, 'Giày sợi len', 3, 'Giúp tăng KI', 0, 10, 0, 0, 0, 300, FALSE, 1),
(31, 'Giày Pico', 3, 'Giúp tăng KI', 0, 25, 0, 0, 0, 3000, FALSE, 3),
-- Xayda
(29, 'Giày vải thô', 3, 'Giúp tăng KI', 0, 10, 0, 0, 0, 300, FALSE, 1),
(32, 'Giày kim loại', 3, 'Giúp tăng KI', 0, 25, 0, 0, 0, 3000, FALSE, 3);

-- ==========================================
-- ITEMS - RADA (TYPE 4)
-- ==========================================
INSERT INTO items (id, name, item_type_id, description, hp_bonus, ki_bonus, attack_bonus, defense_bonus, speed_bonus, price, is_consumable, required_level) VALUES
(12, 'Rada cấp 1', 4, 'Giúp tăng Chí Mạng', 0, 0, 0, 0, 0, 600, FALSE, 1);

-- ==========================================
-- ITEMS - CONSUMABLES (TYPE 6)
-- ==========================================
INSERT INTO items (id, name, item_type_id, description, hp_bonus, ki_bonus, attack_bonus, defense_bonus, speed_bonus, price, is_consumable, required_level) VALUES
-- Đậu Thần
(13, 'Đậu thần cấp 1', 6, 'Thức ăn phục hồi HP và KI', 50, 50, 0, 0, 0, 10, TRUE, 1),
(188, 'Đậu thần cấp 2', 6, 'Thức ăn phục hồi HP và KI', 100, 100, 0, 0, 0, 20, TRUE, 5),
(189, 'Đậu thần cấp 3', 6, 'Thức ăn phục hồi HP và KI', 200, 200, 0, 0, 0, 50, TRUE, 10),
-- Thuốc hồi phục
(190, 'Thuốc hồi HP nhỏ', 6, 'Hồi phục 50 HP', 50, 0, 0, 0, 0, 20, TRUE, 1),
(191, 'Thuốc hồi KI nhỏ', 6, 'Hồi phục 50 KI', 0, 50, 0, 0, 0, 20, TRUE, 1),
(192, 'Thuốc hồi HP lớn', 6, 'Hồi phục 200 HP', 200, 0, 0, 0, 0, 80, TRUE, 5),
(193, 'Thuốc hồi KI lớn', 6, 'Hồi phục 200 KI', 0, 200, 0, 0, 0, 80, TRUE, 5),
(194, 'Thuốc hồi HP siêu lớn', 6, 'Hồi phục 500 HP', 500, 0, 0, 0, 0, 200, TRUE, 10),
(195, 'Thuốc hồi KI siêu lớn', 6, 'Hồi phục 500 KI', 0, 500, 0, 0, 0, 200, TRUE, 10);

-- ==========================================
-- ITEMS - NGỌC RỒNG (TYPE 12)
-- ==========================================
INSERT INTO items (id, name, item_type_id, description, hp_bonus, ki_bonus, attack_bonus, defense_bonus, speed_bonus, price, is_consumable, required_level) VALUES
(14, 'Ngọc Rồng 1 sao', 12, 'Thu thập để ước rồng thần', 0, 0, 0, 0, 0, 0, FALSE, 0),
(15, 'Ngọc Rồng 2 sao', 12, 'Thu thập để ước rồng thần', 0, 0, 0, 0, 0, 0, FALSE, 0),
(16, 'Ngọc Rồng 3 sao', 12, 'Thu thập để ước rồng thần', 0, 0, 0, 0, 0, 0, FALSE, 0),
(17, 'Ngọc Rồng 4 sao', 12, 'Thu thập để ước rồng thần', 0, 0, 0, 0, 0, 0, FALSE, 0),
(18, 'Ngọc Rồng 5 sao', 12, 'Thu thập để ước rồng thần', 0, 0, 0, 0, 0, 0, FALSE, 0),
(19, 'Ngọc Rồng 6 sao', 12, 'Thu thập để ước rồng thần', 0, 0, 0, 0, 0, 0, FALSE, 0),
(20, 'Ngọc Rồng 7 sao', 12, 'Thu thập để ước rồng thần', 0, 0, 0, 0, 0, 0, FALSE, 0);

-- ==========================================
-- VŨ KHÍ CAO CẤP (Higher level items)
-- ==========================================
INSERT INTO items (id, name, item_type_id, description, hp_bonus, ki_bonus, attack_bonus, defense_bonus, speed_bonus, price, is_consumable, required_level) VALUES
-- Weapons (dùng làm gloves với attack bonus cao)
(127, 'Găng tay chiến binh', 2, 'Găng tay của chiến binh Z', 0, 0, 50, 0, 0, 50000, FALSE, 15),
(128, 'Găng tay thần', 2, 'Găng tay thiêng liêng', 0, 0, 80, 0, 0, 100000, FALSE, 20),
-- Armor cao cấp
(136, 'Áo giáp chiến binh', 0, 'Bộ giáp chiến binh Z', 0, 0, 0, 40, 0, 50000, FALSE, 15),
(137, 'Áo choàng thần', 0, 'Áo choàng của Kaio Shin', 0, 0, 0, 60, 0, 100000, FALSE, 20),
-- Quần cao cấp
(140, 'Quần chiến binh', 1, 'Quần của chiến binh Z', 300, 0, 0, 0, 0, 45000, FALSE, 15),
(141, 'Quần thần', 1, 'Quần thiêng liêng', 500, 0, 0, 0, 0, 90000, FALSE, 20);

-- ==========================================
-- MONSTERS
-- ==========================================
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

-- ==========================================
-- MONSTER DROPS - Updated với Fixed IDs
-- ==========================================
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES
-- Level 1-5 monsters (drop thuốc hồi nhỏ)
(1, 190, 30.00),   -- Sói Hoang drops Thuốc hồi HP nhỏ (ID 190)
(2, 190, 28.00),   -- Rắn Độc drops Thuốc hồi HP nhỏ
(3, 191, 25.00),   -- Gấu Hoang drops Thuốc hồi KI nhỏ (ID 191)
(4, 190, 25.00),   -- Khủng Long Nhỏ drops Thuốc hồi HP nhỏ
(5, 191, 22.00),   -- Thỏ Dữ drops Thuốc hồi KI nhỏ

-- Level 4-8 monsters (drop thuốc hồi lớn + gear cấp thấp)
(6, 192, 20.00),   -- Tên Cướp drops Thuốc hồi HP lớn (ID 192)
(7, 192, 18.00),   -- Lính Canh drops Thuốc hồi HP lớn
(8, 193, 20.00),   -- Ninja Tập Sự drops Thuốc hồi KI lớn (ID 193)
(9, 21, 15.00),    -- Cướp Biển drops Găng vải đen (ID 21)
(10, 21, 12.00),   -- Sát Thủ Tập Sự drops Găng vải đen

-- Level 7-12 monsters (drop armor + gloves)
(11, 0, 15.00),    -- Quân Đội RR drops Áo vải 3 lỗ (ID 0)
(12, 0, 13.00),    -- Lính Mũ Xanh drops Áo vải 3 lỗ
(13, 24, 12.00),   -- Lính Mũ Đỏ drops Găng tay thêu (ID 24)
(14, 24, 10.00),   -- Cyborg drops Găng tay thêu
(15, 193, 15.00),  -- Android Cũ drops Thuốc hồi KI lớn

-- Level 10-16 monsters (drop better gear)
(16, 24, 10.00),   -- Quỷ Nhỏ drops Găng tay thêu
(17, 3, 12.00),    -- Quỷ Trung drops Áo vải dày (ID 3)
(18, 26, 10.00),   -- Quỷ Đại drops Găng kim loại (ID 26)
(19, 3, 15.00),    -- Ma Vương Nhỏ drops Áo vải dày

-- Level 15-25 monsters (drop high-level gear)
(20, 3, 8.00),     -- Frieza Lính drops Áo vải dày
(21, 26, 8.00),    -- Zarbon Lính drops Găng kim loại
(22, 136, 10.00),  -- Dodoria Lính drops Áo giáp chiến binh (ID 136)
(23, 136, 8.00),   -- Ginyu Lính drops Áo giáp chiến binh
(24, 127, 7.00),   -- Saiyan Hạ Cấp drops Găng tay chiến binh (ID 127)

-- Boss drops (higher rate, Đậu Thần + rare items)
(25, 13, 50.00),   -- Mèo Karin drops Đậu thần cấp 1 (ID 13)
(26, 13, 45.00),   -- Yajirobe drops Đậu thần cấp 1
(27, 136, 40.00),  -- Thần Karin drops Áo giáp chiến binh
(28, 137, 35.00),  -- Korin Sama drops Áo choàng thần (ID 137)
(29, 13, 42.00);   -- Ông Già Gohan drops Đậu thần cấp 1

-- ==========================================
-- QUESTS
-- ==========================================
INSERT INTO quests (name, description, required_level, experience_reward, gold_reward, monster_id, required_kills) VALUES
('Tiêu Diệt Sói Hoang', 'Giúp dân làng tiêu diệt 5 con sói hoang', 1, 50, 100, 1, 5),
('Săn Rắn Độc', 'Dọn sạch rắn độc trong rừng', 2, 80, 120, 2, 8),
('Trừ Khử Tên Cướp', 'Bảo vệ ngôi làng khỏi băng cướp', 5, 300, 400, 6, 10),
('Đột Kích RR', 'Tấn công căn cứ Ruy Băng Đỏ', 8, 600, 800, 11, 8),
('Chiến Đấu Với Quỷ', 'Đánh bại quân quỷ của Piccolo', 10, 1000, 1200, 16, 5),
('Thử Thách Karin', 'Leo lên Tháp Karin và thách đấu', 10, 1500, 2000, 28, 1);

-- ==========================================
-- SKILLS
-- ==========================================
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

-- ==========================================
-- MONSTER SKILLS
-- ==========================================
-- Assign Ki Blast (skill_id = 13) to all monsters
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

-- ==========================================
-- DAILY QUEST TEMPLATES
-- ==========================================
INSERT INTO daily_quest_templates (name, description, quest_type, target_id, required_amount, exp_reward, gold_reward, item_reward_id, min_level) VALUES
-- Kill Monsters Quests
('Săn Ốc Sên', 'Đánh bại 10 con Ốc Sên', 'kill_monsters', 1, 10, 50, 100, NULL, 1),
('Tiêu Diệt Khủng Long Xanh', 'Đánh bại 8 con Khủng Long Xanh', 'kill_monsters', 2, 8, 80, 150, NULL, 2),
('Tiêu Diệt Khủng Long Đỏ', 'Đánh bại 8 con Khủng Long Đỏ', 'kill_monsters', 3, 8, 100, 180, NULL, 3),
('Diệt Quỷ Đất', 'Đánh bại 12 con Quỷ Đất', 'kill_monsters', 4, 12, 120, 200, NULL, 3),
('Săn Kỉ Nhân', 'Đánh bại 10 con Kỉ Nhân', 'kill_monsters', 7, 10, 200, 400, NULL, 5),
('Tiêu Diệt Lính Fide', 'Đánh bại 15 Lính Fide', 'kill_monsters', 10, 15, 350, 600, NULL, 8),
('Săn Khỉ Lính', 'Đánh bại 12 con Khỉ Lính', 'kill_monsters', 14, 12, 500, 800, NULL, 10),
('Diệt Quái Vật Đại Lục', 'Đánh bại 20 Quái Vật bất kỳ', 'kill_monsters', NULL, 20, 300, 500, NULL, 5),

-- Boss Quests
('Hạ Gục Mèo Karin', 'Đánh bại Boss Mèo Karin', 'defeat_boss', 25, 1, 500, 1000, 13, 10),
('Thử Thách Yajirobe', 'Đánh bại Boss Yajirobe', 'defeat_boss', 26, 1, 800, 1500, 13, 15),
('Chiến Thắng Boss', 'Đánh bại 1 Boss bất kỳ', 'defeat_boss', NULL, 1, 400, 800, NULL, 8),

-- Skill Usage Quests  
('Luyện Tập Kamehameha', 'Sử dụng skill Kamehameha 5 lần', 'use_skills', 13, 5, 100, 150, NULL, 3),
('Rèn Luyện Kỹ Năng', 'Sử dụng bất kỳ skill nào 10 lần', 'use_skills', NULL, 10, 150, 200, NULL, 3),

-- Gold & Hunt Quests
('Kiếm Vàng', 'Kiếm được 1000 vàng từ chiến đấu', 'earn_gold', NULL, 1000, 100, 0, NULL, 1),
('Hoàn Thành Trận Chiến', 'Hoàn thành 5 trận săn bắt', 'complete_hunts', NULL, 5, 120, 250, NULL, 1),
('Chiến Binh Không Mệt Mỏi', 'Hoàn thành 10 trận săn bắt', 'complete_hunts', NULL, 10, 250, 500, NULL, 5),
('Thợ Săn Tiền Thưởng', 'Hoàn thành 15 trận săn bắt', 'complete_hunts', NULL, 15, 400, 800, NULL, 8);
-- Full skill data imported from vibenro.sql
-- Generated by extract_skills.py

-- Xóa data cũ
TRUNCATE TABLE skill_template CASCADE;

-- Import skills cho từng hành tinh

-- ==========================================
-- TRÁI ĐẤT (nclass_id = 0)
-- 9 skills
-- ==========================================

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(0, 0, 'Chiêu đấm Dragon', 7, 0, 1, 539, 'Tăng sức đánh: #%', 0,
'[{"power_require": 1000, "damage": 100, "dx": 32, "dy": 18, "price": 0, "max_fight": 1, "mana_use": 1, "cool_down": 500, "id": 0, "point": 1, "info": "tại ông nội ngay lúc đầu"}, {"power_require": 10000, "damage": 110, "dx": 34, "dy": 18, "price": 10, "max_fight": 1, "mana_use": 2, "cool_down": 500, "id": 1, "point": 2, "info": "tại ông nội"}, {"power_require": 22000, "damage": 120, "dx": 36, "dy": 18, "price": 50, "max_fight": 1, "mana_use": 4, "cool_down": 500, "id": 2, "point": 3, "info": "tại Quy Lão Kame"}, {"power_require": 66000, "damage": 130, "dx": 38, "dy": 18, "price": 100, "max_fight": 1, "mana_use": 8, "cool_down": 500, "id": 3, "point": 4, "info": "tại Quy Lão Kame"}, {"power_require": 200000, "damage": 140, "dx": 40, "dy": 18, "price": 500, "max_fight": 1, "mana_use": 16, "cool_down": 500, "id": 4, "point": 5, "info": "tại Quy Lão Kame"}, {"power_require": 600000, "damage": 150, "dx": 42, "dy": 18, "price": 1000, "max_fight": 1, "mana_use": 32, "cool_down": 500, "id": 5, "point": 6, "info": "tại Quy Lão Kame"}, {"power_require": 1800000, "damage": 160, "dx": 44, "dy": 18, "price": 2000, "max_fight": 1, "mana_use": 70, "cool_down": 500, "id": 6, "point": 7, "info": "tại Quy Lão Kame"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(0, 1, 'Chiêu Kamejoko', 7, 0, 1, 540, 'Tăng sức đánh: #%', 1,
'[{"power_require": 10000, "damage": 150, "dx": 160, "dy": 160, "price": 500, "max_fight": 1, "mana_use": 30, "cool_down": 2000, "id": 7, "point": 1, "info": "(Kame joko) Học tại Sư Phụ"}, {"power_require": 20000, "damage": 200, "dx": 170, "dy": 170, "price": 1000, "max_fight": 1, "mana_use": 60, "cool_down": 2500, "id": 8, "point": 2, "info": "(Kame joko) Học tại Sư Phụ"}, {"power_require": 60000, "damage": 250, "dx": 180, "dy": 180, "price": 2000, "max_fight": 1, "mana_use": 120, "cool_down": 3000, "id": 9, "point": 3, "info": "(Kame joko) Học tại Sư Phụ"}, {"power_require": 180000, "damage": 300, "dx": 190, "dy": 190, "price": 4000, "max_fight": 1, "mana_use": 240, "cool_down": 3500, "id": 10, "point": 4, "info": "(Kame joko) Học tại Sư Phụ"}, {"power_require": 540000, "damage": 350, "dx": 200, "dy": 200, "price": 8000, "max_fight": 1, "mana_use": 480, "cool_down": 4000, "id": 11, "point": 5, "info": "(Kame joko) Học tại Sư Phụ"}, {"power_require": 1600000, "damage": 400, "dx": 210, "dy": 210, "price": 9999, "max_fight": 1, "mana_use": 960, "cool_down": 4500, "id": 12, "point": 6, "info": "(Kame joko) Học tại Sư Phụ"}, {"power_require": 4800000, "damage": 450, "dx": 220, "dy": 220, "price": 9999, "max_fight": 1, "mana_use": 1280, "cool_down": 5000, "id": 13, "point": 7, "info": "(Kame joko) Học tại Sư Phụ"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(0, 6, 'Thái Dương Hạ San', 7, 1, 3, 717, 'Thời gian tác dụng: # mili giây', 2,
'[{"power_require": 60000, "damage": 3000, "dx": 150, "dy": 150, "price": 500, "max_fight": 1, "mana_use": 45, "cool_down": 60000, "id": 42, "point": 1, "info": "(TDHS 1) Học tại Quy Lão Kame"}, {"power_require": 120000, "damage": 4000, "dx": 180, "dy": 180, "price": 1000, "max_fight": 1, "mana_use": 40, "cool_down": 55000, "id": 43, "point": 2, "info": "(TDHS 2) Học tại Quy Lão Kame"}, {"power_require": 360000, "damage": 5000, "dx": 210, "dy": 210, "price": 2000, "max_fight": 1, "mana_use": 35, "cool_down": 50000, "id": 44, "point": 3, "info": "(TDHS 3) Học tại Quy Lão Kame"}, {"power_require": 1000000, "damage": 6000, "dx": 240, "dy": 240, "price": 4000, "max_fight": 1, "mana_use": 30, "cool_down": 45000, "id": 45, "point": 4, "info": "(TDHS 4) Học tại Thần Vũ Trụ"}, {"power_require": 3200000, "damage": 7000, "dx": 270, "dy": 270, "price": 8000, "max_fight": 1, "mana_use": 25, "cool_down": 40000, "id": 46, "point": 5, "info": "(TDHS 5) Học tại Thần Vũ Trụ"}, {"power_require": 10000000, "damage": 8000, "dx": 300, "dy": 300, "price": 9999, "max_fight": 1, "mana_use": 20, "cool_down": 35000, "id": 47, "point": 6, "info": "(TDHS 6) Học tại Thần Vũ Trụ"}, {"power_require": 30000000, "damage": 9000, "dx": 330, "dy": 330, "price": 9999, "max_fight": 1, "mana_use": 15, "cool_down": 30000, "id": 48, "point": 7, "info": "(TDHS 7) Học tại Thần Vũ Trụ"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(0, 9, 'Kaioken', 7, 0, 1, 716, 'Tăng sức đánh: #%', 3,
'[{"power_require": 150000000, "damage": 160, "dx": 32, "dy": 32, "price": 9999, "max_fight": 1, "mana_use": 9000, "cool_down": 500, "id": 63, "point": 1, "info": "(Kaioken 1)"}, {"power_require": 200000000, "damage": 170, "dx": 32, "dy": 32, "price": 9999, "max_fight": 1, "mana_use": 13000, "cool_down": 500, "id": 64, "point": 2, "info": "(Kaioken 2)"}, {"power_require": 250000000, "damage": 180, "dx": 32, "dy": 32, "price": 9999, "max_fight": 1, "mana_use": 15000, "cool_down": 500, "id": 65, "point": 3, "info": "(Kaioken 3)"}, {"power_require": 300000000, "damage": 190, "dx": 32, "dy": 32, "price": 9999, "max_fight": 1, "mana_use": 18000, "cool_down": 500, "id": 66, "point": 4, "info": "(Kaioken 4)"}, {"power_require": 350000000, "damage": 200, "dx": 32, "dy": 32, "price": 9999, "max_fight": 1, "mana_use": 21000, "cool_down": 500, "id": 67, "point": 5, "info": "(Kaioken 5)"}, {"power_require": 400000000, "damage": 210, "dx": 32, "dy": 32, "price": 9999, "max_fight": 1, "mana_use": 24000, "cool_down": 500, "id": 68, "point": 6, "info": "(Kaioken 6)"}, {"power_require": 450000000, "damage": 220, "dx": 32, "dy": 32, "price": 9999, "max_fight": 1, "mana_use": 27000, "cool_down": 500, "id": 69, "point": 7, "info": "(Kaioken 7)"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(0, 10, 'Quả cầu kênh khi', 7, 1, 1, 711, 'Gây sát thương #%', 4,
'[{"power_require": 500000000, "damage": 500, "dx": 300, "dy": 300, "price": 9999, "max_fight": 1, "mana_use": 50, "cool_down": 360000, "id": 70, "point": 1, "info": "(Quả cầu kênh khi 1)"}, {"power_require": 600000000, "damage": 600, "dx": 400, "dy": 400, "price": 9999, "max_fight": 1, "mana_use": 55, "cool_down": 350000, "id": 71, "point": 2, "info": "(Quả cầu kênh khi 2)"}, {"power_require": 700000000, "damage": 700, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 60, "cool_down": 340000, "id": 72, "point": 3, "info": "(Quả cầu kênh khi 3)"}, {"power_require": 800000000, "damage": 800, "dx": 600, "dy": 600, "price": 9999, "max_fight": 1, "mana_use": 65, "cool_down": 330000, "id": 73, "point": 4, "info": "(Quả cầu kênh khi 4)"}, {"power_require": 900000000, "damage": 900, "dx": 700, "dy": 700, "price": 9999, "max_fight": 1, "mana_use": 70, "cool_down": 320000, "id": 74, "point": 5, "info": "(Quả cầu kênh khi 5)"}, {"power_require": 1000000000, "damage": 1000, "dx": 800, "dy": 800, "price": 9999, "max_fight": 1, "mana_use": 75, "cool_down": 310000, "id": 75, "point": 6, "info": "(Quả cầu kênh khi 6)"}, {"power_require": 1100000000, "damage": 1100, "dx": 900, "dy": 900, "price": 9999, "max_fight": 1, "mana_use": 80, "cool_down": 300000, "id": 76, "point": 7, "info": "(Quả cầu kênh khi 7)"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(0, 20, 'Dịch chuyển tức thời', 7, 0, 1, 3783, 'Dịch chuyển tức thời và gây choáng kẻ thù', 5,
'[{"power_require": 10000000, "damage": 1000, "dx": 5000, "dy": 5000, "price": 9999, "max_fight": 1, "mana_use": 5000, "cool_down": 20000, "id": 128, "point": 1, "info": "Dịch chuyển tức thời"}, {"power_require": 25000000, "damage": 1500, "dx": 5000, "dy": 5000, "price": 9999, "max_fight": 1, "mana_use": 7000, "cool_down": 19000, "id": 129, "point": 2, "info": "Dịch chuyển tức thời"}, {"power_require": 50000000, "damage": 2000, "dx": 5000, "dy": 5000, "price": 9999, "max_fight": 1, "mana_use": 10000, "cool_down": 18000, "id": 130, "point": 3, "info": "Dịch chuyển tức thời"}, {"power_require": 125000000, "damage": 2500, "dx": 5000, "dy": 5000, "price": 9999, "max_fight": 1, "mana_use": 15000, "cool_down": 17000, "id": 131, "point": 4, "info": "Dịch chuyển tức thời"}, {"power_require": 625000000, "damage": 3000, "dx": 5000, "dy": 5000, "price": 9999, "max_fight": 1, "mana_use": 20000, "cool_down": 16000, "id": 132, "point": 5, "info": "Dịch chuyển tức thời"}, {"power_require": 3125000000, "damage": 3500, "dx": 5000, "dy": 5000, "price": 9999, "max_fight": 1, "mana_use": 25000, "cool_down": 15000, "id": 133, "point": 6, "info": "Dịch chuyển tức thời"}, {"power_require": 15625000000, "damage": 4000, "dx": 5000, "dy": 5000, "price": 9999, "max_fight": 1, "mana_use": 30000, "cool_down": 14000, "id": 134, "point": 7, "info": "Dịch chuyển tức thời"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(0, 22, 'Thôi miên', 7, 0, 1, 3782, 'Ru ngủ kẻ thù # giây', 6,
'[{"power_require": 10000000, "damage": 5, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 10000, "cool_down": 30000, "id": 142, "point": 1, "info": "Thôi Miên"}, {"power_require": 25000000, "damage": 6, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 10000, "cool_down": 32000, "id": 143, "point": 2, "info": "Thôi Miên"}, {"power_require": 50000000, "damage": 7, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 10000, "cool_down": 34000, "id": 144, "point": 3, "info": "Thôi Miên"}, {"power_require": 125000000, "damage": 8, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 10000, "cool_down": 36000, "id": 145, "point": 4, "info": "Thôi Miên"}, {"power_require": 625000000, "damage": 9, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 10000, "cool_down": 38000, "id": 146, "point": 5, "info": "Thôi Miên"}, {"power_require": 3125000000, "damage": 10, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 10000, "cool_down": 40000, "id": 147, "point": 6, "info": "Thôi Miên"}, {"power_require": 15625000000, "damage": 11, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 10000, "cool_down": 42000, "id": 148, "point": 7, "info": "Thôi Miên"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(0, 19, 'Khiên năng lượng', 7, 1, 3, 3784, 'Vô hiệu các đòn tấn công', 7,
'[{"power_require": 10000000, "damage": 15, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 51, "cool_down": 75000, "id": 121, "point": 1, "info": "Khiên năng lượng 1"}, {"power_require": 25000000, "damage": 20, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 48, "cool_down": 80000, "id": 122, "point": 2, "info": "Khiên năng lượng 2"}, {"power_require": 50000000, "damage": 25, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 45, "cool_down": 85000, "id": 123, "point": 3, "info": "Khiên năng lượng 3"}, {"power_require": 125000000, "damage": 30, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 42, "cool_down": 90000, "id": 124, "point": 4, "info": "Khiên năng lượng 4"}, {"power_require": 625000000, "damage": 35, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 39, "cool_down": 95000, "id": 125, "point": 5, "info": "Khiên năng lượng 5"}, {"power_require": 3125000000, "damage": 40, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 36, "cool_down": 100000, "id": 126, "point": 6, "info": "Khiên năng lượng 6"}, {"power_require": 15625000000, "damage": 45, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 33, "cool_down": 105000, "id": 127, "point": 7, "info": "Khiên năng lượng 7"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(0, 24, 'Super Kamejoko', 9, 1, 4, 11162, 'Tăng sức đánh: #%', 7,
'[{"power_require": 60000000000, "damage": 550, "dx": 190, "dy": 25, "price": 9999, "max_fight": 1, "mana_use": 80, "cool_down": 170000, "id": 156, "point": 1, "info": "Chưởng 1"}, {"power_require": 60000000000, "damage": 600, "dx": 200, "dy": 30, "price": 9999, "max_fight": 1, "mana_use": 75, "cool_down": 160000, "id": 157, "point": 2, "info": "Chưởng 2"}, {"power_require": 60000000000, "damage": 650, "dx": 210, "dy": 35, "price": 9999, "max_fight": 1, "mana_use": 70, "cool_down": 150000, "id": 158, "point": 3, "info": "Chưởng 3"}, {"power_require": 60000000000, "damage": 700, "dx": 230, "dy": 40, "price": 9999, "max_fight": 1, "mana_use": 65, "cool_down": 140000, "id": 159, "point": 4, "info": "Chưởng 4"}, {"power_require": 60000000000, "damage": 750, "dx": 250, "dy": 45, "price": 9999, "max_fight": 1, "mana_use": 60, "cool_down": 130000, "id": 160, "point": 5, "info": "Chưởng 5"}, {"power_require": 60000000000, "damage": 800, "dx": 270, "dy": 50, "price": 9999, "max_fight": 1, "mana_use": 55, "cool_down": 120000, "id": 161, "point": 6, "info": "Chưởng 6"}, {"power_require": 60000000000, "damage": 850, "dx": 290, "dy": 55, "price": 9999, "max_fight": 1, "mana_use": 50, "cool_down": 110000, "id": 162, "point": 7, "info": "Chưởng 7"}, {"power_require": 60000000000, "damage": 900, "dx": 310, "dy": 60, "price": 9999, "max_fight": 1, "mana_use": 45, "cool_down": 100000, "id": 163, "point": 8, "info": "Chưởng 8"}, {"power_require": 60000000000, "damage": 950, "dx": 330, "dy": 65, "price": 9999, "max_fight": 1, "mana_use": 40, "cool_down": 90000, "id": 164, "point": 9, "info": "Chưởng 9"}, {"power_require": 60000000000, "damage": 1000, "dx": 350, "dy": 70, "price": 9999, "max_fight": 1, "mana_use": 35, "cool_down": 80000, "id": 165, "point": 10, "info": "Chưởng 10"}]'::jsonb);

-- ==========================================
-- NAMEK (nclass_id = 1)
-- 9 skills
-- ==========================================

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(1, 2, 'Chiêu đấm Demon', 7, 0, 1, 539, 'Tăng sức đánh: #%', 0,
'[{"power_require": 1000, "damage": 95, "dx": 24, "dy": 18, "price": 0, "max_fight": 1, "mana_use": 1, "cool_down": 400, "id": 14, "point": 1, "info": "(Đấm Demon 1) Học tại Sư Phụ"}, {"power_require": 10000, "damage": 105, "dx": 26, "dy": 18, "price": 10, "max_fight": 1, "mana_use": 2, "cool_down": 400, "id": 15, "point": 2, "info": "(Đấm Demon 2) Học tại Sư Phụ"}, {"power_require": 22000, "damage": 115, "dx": 28, "dy": 18, "price": 50, "max_fight": 1, "mana_use": 4, "cool_down": 400, "id": 16, "point": 3, "info": "(Đấm Demon 3) Học tại Sư Phụ"}, {"power_require": 66000, "damage": 125, "dx": 30, "dy": 18, "price": 100, "max_fight": 1, "mana_use": 8, "cool_down": 400, "id": 17, "point": 4, "info": "(Đấm Demon 4) Học tại Sư Phụ"}, {"power_require": 200000, "damage": 135, "dx": 32, "dy": 18, "price": 1000, "max_fight": 1, "mana_use": 16, "cool_down": 400, "id": 18, "point": 5, "info": "(Đấm Demon 5) Học tại Sư Phụ"}, {"power_require": 600000, "damage": 145, "dx": 34, "dy": 18, "price": 2000, "max_fight": 1, "mana_use": 32, "cool_down": 400, "id": 19, "point": 6, "info": "(Đấm Demon 6) Học tại Sư Phụ"}, {"power_require": 1800000, "damage": 155, "dx": 36, "dy": 18, "price": 4000, "max_fight": 1, "mana_use": 70, "cool_down": 400, "id": 20, "point": 7, "info": "(Đấm Demon 7) Học tại Sư Phụ"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(1, 3, 'Chiêu Masenko', 7, 0, 1, 540, 'Tăng sức đánh: #%', 1,
'[{"power_require": 10000, "damage": 100, "dx": 140, "dy": 140, "price": 500, "max_fight": 1, "mana_use": 8, "cool_down": 800, "id": 21, "point": 1, "info": "(Masenko 1) Học tại Sư Phụ sau khi làm nhiệm vụ tìm truyện Doremon"}, {"power_require": 20000, "damage": 110, "dx": 150, "dy": 150, "price": 1000, "max_fight": 1, "mana_use": 16, "cool_down": 790, "id": 22, "point": 2, "info": "(Masenko 2) Học tại Sư Phụ"}, {"power_require": 60000, "damage": 120, "dx": 160, "dy": 160, "price": 2000, "max_fight": 1, "mana_use": 32, "cool_down": 780, "id": 23, "point": 3, "info": "(Masenko 3) Học tại Sư Phụ"}, {"power_require": 180000, "damage": 130, "dx": 170, "dy": 170, "price": 4000, "max_fight": 1, "mana_use": 64, "cool_down": 760, "id": 24, "point": 4, "info": "(Masenko 4) Học tại Sư Phụ"}, {"power_require": 540000, "damage": 140, "dx": 180, "dy": 180, "price": 8000, "max_fight": 1, "mana_use": 128, "cool_down": 740, "id": 25, "point": 5, "info": "(Masenko 5) Học tại Sư Phụ"}, {"power_require": 1600000, "damage": 150, "dx": 190, "dy": 190, "price": 9999, "max_fight": 1, "mana_use": 256, "cool_down": 720, "id": 26, "point": 6, "info": "(Masenko 6) Học tại Sư Phụ"}, {"power_require": 4800000, "damage": 160, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 512, "cool_down": 700, "id": 27, "point": 7, "info": "(Masenko 7) Học tại Sư Phụ"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(1, 7, 'Trị thương', 7, 1, 2, 724, 'Phục hồi #% HP và KI cho đồng đội', 2,
'[{"power_require": 60000, "damage": 50, "dx": 100, "dy": 100, "price": 500, "max_fight": 1, "mana_use": 40, "cool_down": 30000, "id": 49, "point": 1, "info": "(Phục hồi Namek 1) Học tại sư phụ"}, {"power_require": 120000, "damage": 55, "dx": 105, "dy": 105, "price": 1000, "max_fight": 1, "mana_use": 35, "cool_down": 32000, "id": 50, "point": 2, "info": "(Phục hồi Namek 2) Học tại sư phụ"}, {"power_require": 360000, "damage": 60, "dx": 110, "dy": 110, "price": 2000, "max_fight": 1, "mana_use": 30, "cool_down": 34000, "id": 51, "point": 3, "info": "(Phục hồi Namek 3) Học tại sư phụ"}, {"power_require": 1000000, "damage": 65, "dx": 115, "dy": 115, "price": 4000, "max_fight": 1, "mana_use": 25, "cool_down": 38000, "id": 52, "point": 4, "info": "(Phục hồi Namek 4) Học tại sư phụ"}, {"power_require": 3200000, "damage": 70, "dx": 120, "dy": 120, "price": 8000, "max_fight": 1, "mana_use": 20, "cool_down": 40000, "id": 53, "point": 5, "info": "(Phục hồi Namek 5) Học tại sư phụ"}, {"power_require": 10000000, "damage": 75, "dx": 125, "dy": 125, "price": 9999, "max_fight": 1, "mana_use": 15, "cool_down": 42000, "id": 54, "point": 6, "info": "(Phục hồi Namek 6) Học tại sư phụ"}, {"power_require": 30000000, "damage": 80, "dx": 130, "dy": 130, "price": 9999, "max_fight": 1, "mana_use": 10, "cool_down": 44000, "id": 55, "point": 7, "info": "(Phục hồi Namek 7) Học tại sư phụ"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(1, 11, 'Makankosappo', 7, 2, 1, 723, 'Gây sát thương #%', 3,
'[{"power_require": 150000000, "damage": 70, "dx": 20000, "dy": 20000, "price": 9999, "max_fight": 1, "mana_use": 0, "cool_down": 360000, "id": 77, "point": 1, "info": "(Makankosappo 1)"}, {"power_require": 200000000, "damage": 80, "dx": 20000, "dy": 20000, "price": 9999, "max_fight": 1, "mana_use": 0, "cool_down": 350000, "id": 78, "point": 2, "info": "(Makankosappo 2)"}, {"power_require": 250000000, "damage": 90, "dx": 20000, "dy": 20000, "price": 9999, "max_fight": 1, "mana_use": 0, "cool_down": 340000, "id": 79, "point": 3, "info": "(Makankosappo 3)"}, {"power_require": 300000000, "damage": 100, "dx": 20000, "dy": 20000, "price": 9999, "max_fight": 1, "mana_use": 0, "cool_down": 330000, "id": 80, "point": 4, "info": "(Makankosappo 4)"}, {"power_require": 350000000, "damage": 110, "dx": 20000, "dy": 20000, "price": 9999, "max_fight": 1, "mana_use": 0, "cool_down": 320000, "id": 81, "point": 5, "info": "(Makankosappo 5)"}, {"power_require": 400000000, "damage": 120, "dx": 20000, "dy": 20000, "price": 9999, "max_fight": 1, "mana_use": 0, "cool_down": 310000, "id": 82, "point": 6, "info": "(Makankosappo 6)"}, {"power_require": 450000000, "damage": 130, "dx": 20000, "dy": 20000, "price": 9999, "max_fight": 1, "mana_use": 0, "cool_down": 300000, "id": 83, "point": 7, "info": "(Makankosappo 7)"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(1, 12, 'Đẻ trứng', 7, 1, 3, 722, 'Tạo quái đi theo hỗ trợ', 4,
'[{"power_require": 500000000, "damage": 50, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 20, "cool_down": 360000, "id": 84, "point": 1, "info": "(Đẻ trứng 1)"}, {"power_require": 600000000, "damage": 55, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 30, "cool_down": 390000, "id": 85, "point": 2, "info": "(Đẻ trứng 2)"}, {"power_require": 700000000, "damage": 60, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 40, "cool_down": 420000, "id": 86, "point": 3, "info": "(Đẻ trứng 3)"}, {"power_require": 800000000, "damage": 65, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 50, "cool_down": 450000, "id": 87, "point": 4, "info": "(Đẻ trứng 4)"}, {"power_require": 900000000, "damage": 70, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 60, "cool_down": 480000, "id": 88, "point": 5, "info": "(Đẻ trứng 5)"}, {"power_require": 1000000000, "damage": 75, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 70, "cool_down": 510000, "id": 89, "point": 6, "info": "(Đẻ trứng 6)"}, {"power_require": 1100000000, "damage": 80, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 80, "cool_down": 540000, "id": 90, "point": 7, "info": "(Đẻ trứng 7)"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(1, 17, 'Liên hoàn', 7, 0, 1, 3778, 'Tăng sức đánh: #%', 5,
'[{"power_require": 10000000, "damage": 160, "dx": 30, "dy": 30, "price": 9999, "max_fight": 1, "mana_use": 100, "cool_down": 350, "id": 107, "point": 1, "info": "(Combo 1)"}, {"power_require": 25000000, "damage": 165, "dx": 35, "dy": 35, "price": 9999, "max_fight": 1, "mana_use": 200, "cool_down": 345, "id": 108, "point": 2, "info": "(Combo 2)"}, {"power_require": 50000000, "damage": 170, "dx": 40, "dy": 40, "price": 9999, "max_fight": 1, "mana_use": 300, "cool_down": 340, "id": 109, "point": 3, "info": "(Combo 3)"}, {"power_require": 125000000, "damage": 175, "dx": 45, "dy": 45, "price": 9999, "max_fight": 1, "mana_use": 400, "cool_down": 335, "id": 110, "point": 4, "info": "(Combo 4)"}, {"power_require": 625000000, "damage": 180, "dx": 50, "dy": 50, "price": 9999, "max_fight": 1, "mana_use": 500, "cool_down": 330, "id": 111, "point": 5, "info": "(Combo 5)"}, {"power_require": 3125000000, "damage": 185, "dx": 55, "dy": 55, "price": 9999, "max_fight": 1, "mana_use": 600, "cool_down": 335, "id": 112, "point": 6, "info": "(Combo 6)"}, {"power_require": 15625000000, "damage": 190, "dx": 60, "dy": 60, "price": 9999, "max_fight": 1, "mana_use": 700, "cool_down": 330, "id": 113, "point": 7, "info": "(Combo 7)"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(1, 18, 'Biến Sôcôla', 7, 1, 1, 3780, 'Biến quái thành Sôcôla', 6,
'[{"power_require": 10000000, "damage": 15, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 22, "cool_down": 30000, "id": 114, "point": 1, "info": "Biến Sôcôla 1"}, {"power_require": 25000000, "damage": 17, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 20, "cool_down": 29000, "id": 115, "point": 2, "info": "Biến Sôcôla 2"}, {"power_require": 50000000, "damage": 19, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 18, "cool_down": 28000, "id": 116, "point": 3, "info": "Biến Sôcôla 3"}, {"power_require": 125000000, "damage": 21, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 16, "cool_down": 27000, "id": 117, "point": 4, "info": "Biến Sôcôla 4"}, {"power_require": 625000000, "damage": 23, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 14, "cool_down": 26000, "id": 118, "point": 5, "info": "Biến Sôcôla 5"}, {"power_require": 3125000000, "damage": 25, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 12, "cool_down": 25000, "id": 119, "point": 6, "info": "Biến Sôcôla 6"}, {"power_require": 15625000000, "damage": 27, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 10, "cool_down": 24000, "id": 120, "point": 7, "info": "Biến Sôcôla 7"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(1, 19, 'Khiên năng lượng', 7, 1, 3, 3784, 'Vô hiệu các đòn tấn công', 7,
'[{"power_require": 10000000, "damage": 15, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 51, "cool_down": 75000, "id": 121, "point": 1, "info": "Khiên năng lượng 1"}, {"power_require": 25000000, "damage": 20, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 48, "cool_down": 80000, "id": 122, "point": 2, "info": "Khiên năng lượng 2"}, {"power_require": 50000000, "damage": 25, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 45, "cool_down": 85000, "id": 123, "point": 3, "info": "Khiên năng lượng 3"}, {"power_require": 125000000, "damage": 30, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 42, "cool_down": 90000, "id": 124, "point": 4, "info": "Khiên năng lượng 4"}, {"power_require": 625000000, "damage": 35, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 39, "cool_down": 95000, "id": 125, "point": 5, "info": "Khiên năng lượng 5"}, {"power_require": 3125000000, "damage": 40, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 36, "cool_down": 100000, "id": 126, "point": 6, "info": "Khiên năng lượng 6"}, {"power_require": 15625000000, "damage": 45, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 33, "cool_down": 105000, "id": 127, "point": 7, "info": "Khiên năng lượng 7"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(1, 26, 'Ma phong ba', 10, 1, 4, 11194, 'Nhốt đối thủ vào bình chứa', 8,
'[{"power_require": 60000000000, "damage": 550, "dx": 83, "dy": 83, "price": 9999, "max_fight": 1, "mana_use": 80, "cool_down": 170000, "id": 166, "point": 1, "info": "Chưởng 1"}, {"power_require": 60000000000, "damage": 600, "dx": 95, "dy": 95, "price": 9999, "max_fight": 1, "mana_use": 75, "cool_down": 160000, "id": 167, "point": 2, "info": "Chưởng 2"}, {"power_require": 60000000000, "damage": 650, "dx": 107, "dy": 107, "price": 9999, "max_fight": 1, "mana_use": 70, "cool_down": 150000, "id": 168, "point": 3, "info": "Chưởng 3"}, {"power_require": 60000000000, "damage": 700, "dx": 119, "dy": 119, "price": 9999, "max_fight": 1, "mana_use": 65, "cool_down": 140000, "id": 169, "point": 4, "info": "Chưởng 4"}, {"power_require": 60000000000, "damage": 750, "dx": 130, "dy": 130, "price": 9999, "max_fight": 1, "mana_use": 60, "cool_down": 130000, "id": 170, "point": 5, "info": "Chưởng 5"}, {"power_require": 60000000000, "damage": 800, "dx": 142, "dy": 142, "price": 9999, "max_fight": 1, "mana_use": 55, "cool_down": 120000, "id": 171, "point": 6, "info": "Chưởng 6"}, {"power_require": 60000000000, "damage": 850, "dx": 154, "dy": 154, "price": 9999, "max_fight": 1, "mana_use": 50, "cool_down": 110000, "id": 172, "point": 7, "info": "Chưởng 7"}, {"power_require": 60000000000, "damage": 900, "dx": 165, "dy": 165, "price": 9999, "max_fight": 1, "mana_use": 45, "cool_down": 100000, "id": 173, "point": 8, "info": "Chưởng 8"}, {"power_require": 60000000000, "damage": 950, "dx": 177, "dy": 177, "price": 9999, "max_fight": 1, "mana_use": 40, "cool_down": 90000, "id": 174, "point": 9, "info": "Chưởng 9"}, {"power_require": 60000000000, "damage": 1000, "dx": 188, "dy": 188, "price": 9999, "max_fight": 1, "mana_use": 35, "cool_down": 80000, "id": 175, "point": 10, "info": "Chưởng 10"}]'::jsonb);

-- ==========================================
-- SAIYAN (nclass_id = 2)
-- 9 skills
-- ==========================================

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(2, 4, 'Chiêu đấm Galick', 7, 0, 1, 539, 'Tăng sức đánh: #%', 0,
'[{"power_require": 1000, "damage": 110, "dx": 36, "dy": 18, "price": 0, "max_fight": 1, "mana_use": 1, "cool_down": 500, "id": 28, "point": 1, "info": "(Đấm Galick 1) Học tại ông nội ngay lúc đầu"}, {"power_require": 10000, "damage": 120, "dx": 37, "dy": 18, "price": 10, "max_fight": 1, "mana_use": 2, "cool_down": 500, "id": 29, "point": 2, "info": "(Đấm Galick 2) Sau khi làm nhiệm vụ tiêu diệt Heo Rừng sẽ học được tại ông nội"}, {"power_require": 22000, "damage": 130, "dx": 38, "dy": 18, "price": 50, "max_fight": 1, "mana_use": 4, "cool_down": 500, "id": 30, "point": 3, "info": "(Đấm Galick 3) Học tại Sư Phụ"}, {"power_require": 66000, "damage": 140, "dx": 39, "dy": 18, "price": 100, "max_fight": 1, "mana_use": 8, "cool_down": 500, "id": 31, "point": 4, "info": "(Đấm Galick 4) Học tại Sư Phụ"}, {"power_require": 200000, "damage": 150, "dx": 40, "dy": 18, "price": 1000, "max_fight": 1, "mana_use": 16, "cool_down": 500, "id": 32, "point": 5, "info": "(Đấm Galick 5) Học tại Sư Phụ"}, {"power_require": 600000, "damage": 160, "dx": 41, "dy": 18, "price": 2000, "max_fight": 1, "mana_use": 32, "cool_down": 500, "id": 33, "point": 6, "info": "(Đấm Galick 6) Học tại Sư Phụ"}, {"power_require": 1800000, "damage": 170, "dx": 42, "dy": 18, "price": 4000, "max_fight": 1, "mana_use": 70, "cool_down": 500, "id": 34, "point": 7, "info": "(Đấm Galick 7) Học tại Sư Phụ"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(2, 5, 'Chiêu Antomic', 7, 0, 1, 540, 'Tăng sức đánh: #%', 1,
'[{"power_require": 10000, "damage": 110, "dx": 150, "dy": 150, "price": 500, "max_fight": 1, "mana_use": 18, "cool_down": 1000, "id": 35, "point": 1, "info": "(Antomic 1) Học tại Sư Phụ sau khi làm nhiệm vụ tìm truyện Doremon"}, {"power_require": 20000, "damage": 140, "dx": 160, "dy": 160, "price": 1000, "max_fight": 1, "mana_use": 34, "cool_down": 1200, "id": 36, "point": 2, "info": "(Antomic 2) Học tại Sư Phụ"}, {"power_require": 60000, "damage": 170, "dx": 170, "dy": 170, "price": 2000, "max_fight": 1, "mana_use": 68, "cool_down": 1400, "id": 37, "point": 3, "info": "(Antomic 3) Học tại Sư Phụ"}, {"power_require": 180000, "damage": 200, "dx": 180, "dy": 180, "price": 4000, "max_fight": 1, "mana_use": 136, "cool_down": 1600, "id": 38, "point": 4, "info": "(Antomic 4) Học tại Sư Phụ"}, {"power_require": 540000, "damage": 230, "dx": 190, "dy": 190, "price": 8000, "max_fight": 1, "mana_use": 258, "cool_down": 1800, "id": 39, "point": 5, "info": "(Antomic 5) Học tại Sư Phụ"}, {"power_require": 1600000, "damage": 260, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 514, "cool_down": 2000, "id": 40, "point": 6, "info": "(Antomic 6) Học tại Sư Phụ"}, {"power_require": 4800000, "damage": 290, "dx": 210, "dy": 210, "price": 9999, "max_fight": 1, "mana_use": 1026, "cool_down": 2200, "id": 41, "point": 7, "info": "(Antomic 7) Học tại Sư Phụ"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(2, 8, 'Tái tạo năng lượng', 7, 1, 3, 720, 'Tự tái tạo HP MP #%/s', 2,
'[{"power_require": 60000, "damage": 4, "dx": 0, "dy": 0, "price": 500, "max_fight": 1, "mana_use": 0, "cool_down": 55000, "id": 56, "point": 1, "info": "(Tái tạo Xayda 1) Học tại sư phụ"}, {"power_require": 120000, "damage": 5, "dx": 0, "dy": 0, "price": 1000, "max_fight": 1, "mana_use": 0, "cool_down": 50000, "id": 57, "point": 2, "info": "(Tái tạo Xayda 2) Học tại sư phụ"}, {"power_require": 360000, "damage": 6, "dx": 0, "dy": 0, "price": 2000, "max_fight": 1, "mana_use": 0, "cool_down": 45000, "id": 58, "point": 3, "info": "(Tái tạo Xayda 3) Học tại sư phụ"}, {"power_require": 1000000, "damage": 7, "dx": 0, "dy": 0, "price": 4000, "max_fight": 1, "mana_use": 0, "cool_down": 40000, "id": 59, "point": 4, "info": "(Tái tạo Xayda 4) Học tại sư phụ"}, {"power_require": 3200000, "damage": 8, "dx": 0, "dy": 0, "price": 8000, "max_fight": 1, "mana_use": 0, "cool_down": 35000, "id": 60, "point": 5, "info": "(Tái tạo Xayda 5) Học tại sư phụ"}, {"power_require": 10000000, "damage": 9, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 0, "cool_down": 30000, "id": 61, "point": 6, "info": "(Tái tạo Xayda 6) Học tại sư phụ"}, {"power_require": 30000000, "damage": 10, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 0, "cool_down": 25000, "id": 62, "point": 7, "info": "(Tái tạo Xayda 7) Học tại sư phụ"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(2, 13, 'Biến hình', 7, 1, 3, 718, 'Tăng sức đánh, HP và tốc độ', 3,
'[{"power_require": 250000000, "damage": 100, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 10, "cool_down": 300000, "id": 91, "point": 1, "info": "(Biến hình 1)"}, {"power_require": 350000000, "damage": 100, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 10, "cool_down": 310000, "id": 92, "point": 2, "info": "(Biến hình 2)"}, {"power_require": 450000000, "damage": 100, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 10, "cool_down": 320000, "id": 93, "point": 3, "info": "(Biến hình 3)"}, {"power_require": 550000000, "damage": 100, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 10, "cool_down": 330000, "id": 94, "point": 4, "info": "(Biến hình 4)"}, {"power_require": 650000000, "damage": 100, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 10, "cool_down": 340000, "id": 95, "point": 5, "info": "(Biến hình 5)"}, {"power_require": 750000000, "damage": 100, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 10, "cool_down": 350000, "id": 96, "point": 6, "info": "(Biến hình 6)"}, {"power_require": 850000000, "damage": 100, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 10, "cool_down": 360000, "id": 97, "point": 7, "info": "(Biến hình 7)"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(2, 14, 'Tự phát nổ', 7, 1, 3, 2248, 'Hy sinh, gây sát thương lớn cho kẻ thù', 4,
'[{"power_require": 250000000, "damage": 100, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 50, "cool_down": 120000, "id": 98, "point": 1, "info": "(Tự phát nổ 1)"}, {"power_require": 300000000, "damage": 105, "dx": 300, "dy": 300, "price": 9999, "max_fight": 1, "mana_use": 50, "cool_down": 120000, "id": 99, "point": 2, "info": "(Tự phát nổ 2)"}, {"power_require": 350000000, "damage": 110, "dx": 400, "dy": 400, "price": 9999, "max_fight": 1, "mana_use": 50, "cool_down": 120000, "id": 100, "point": 3, "info": "(Tự phát nổ 3)"}, {"power_require": 400000000, "damage": 115, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 50, "cool_down": 120000, "id": 101, "point": 4, "info": "(Tự phát nổ 4)"}, {"power_require": 450000000, "damage": 120, "dx": 600, "dy": 600, "price": 9999, "max_fight": 1, "mana_use": 50, "cool_down": 120000, "id": 102, "point": 5, "info": "(Tự phát nổ 5)"}, {"power_require": 500000000, "damage": 125, "dx": 700, "dy": 700, "price": 9999, "max_fight": 1, "mana_use": 50, "cool_down": 120000, "id": 103, "point": 6, "info": "(Tự phát nổ 6)"}, {"power_require": 550000000, "damage": 130, "dx": 900, "dy": 900, "price": 9999, "max_fight": 1, "mana_use": 50, "cool_down": 120000, "id": 104, "point": 7, "info": "(Tự phát nổ 7)"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(2, 21, 'Huýt sáo', 7, 0, 3, 3781, 'Tăng tạm thời +#%HP cho mọi người xung quanh và +1 đòn chí mạng', 5,
'[{"power_require": 10000000, "damage": 40, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 50, "cool_down": 210000, "id": 135, "point": 1, "info": "Huýt sáo"}, {"power_require": 25000000, "damage": 50, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 45, "cool_down": 205000, "id": 136, "point": 2, "info": "Huýt sáo"}, {"power_require": 50000000, "damage": 60, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 40, "cool_down": 200000, "id": 137, "point": 3, "info": "Huýt sáo"}, {"power_require": 125000000, "damage": 70, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 35, "cool_down": 195000, "id": 138, "point": 4, "info": "Huýt sáo"}, {"power_require": 625000000, "damage": 80, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 30, "cool_down": 190000, "id": 139, "point": 5, "info": "Huýt sáo"}, {"power_require": 3125000000, "damage": 90, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 25, "cool_down": 185000, "id": 140, "point": 6, "info": "Huýt sáo"}, {"power_require": 15625000000, "damage": 100, "dx": 500, "dy": 500, "price": 9999, "max_fight": 1, "mana_use": 20, "cool_down": 180000, "id": 141, "point": 7, "info": "Huýt sáo"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(2, 23, 'Trói', 7, 0, 1, 3779, 'Trói kẻ thù', 6,
'[{"power_require": 10000000, "damage": 5, "dx": 150, "dy": 150, "price": 9999, "max_fight": 1, "mana_use": 5000, "cool_down": 15000, "id": 149, "point": 1, "info": "Trói"}, {"power_require": 25000000, "damage": 10, "dx": 150, "dy": 150, "price": 9999, "max_fight": 1, "mana_use": 10000, "cool_down": 20000, "id": 150, "point": 2, "info": "Trói"}, {"power_require": 50000000, "damage": 15, "dx": 150, "dy": 150, "price": 9999, "max_fight": 1, "mana_use": 15000, "cool_down": 25000, "id": 151, "point": 3, "info": "Trói"}, {"power_require": 125000000, "damage": 20, "dx": 150, "dy": 150, "price": 9999, "max_fight": 1, "mana_use": 20000, "cool_down": 30000, "id": 152, "point": 4, "info": "Trói"}, {"power_require": 625000000, "damage": 25, "dx": 150, "dy": 150, "price": 9999, "max_fight": 1, "mana_use": 25000, "cool_down": 35000, "id": 153, "point": 5, "info": "Trói"}, {"power_require": 3125000000, "damage": 30, "dx": 150, "dy": 150, "price": 9999, "max_fight": 1, "mana_use": 30000, "cool_down": 40000, "id": 154, "point": 6, "info": "Trói"}, {"power_require": 15625000000, "damage": 35, "dx": 150, "dy": 150, "price": 9999, "max_fight": 1, "mana_use": 32000, "cool_down": 45000, "id": 155, "point": 7, "info": "Trói"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(2, 19, 'Khiên năng lượng', 7, 1, 3, 3784, 'Vô hiệu các đòn tấn công', 7,
'[{"power_require": 10000000, "damage": 15, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 51, "cool_down": 75000, "id": 121, "point": 1, "info": "Khiên năng lượng 1"}, {"power_require": 25000000, "damage": 20, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 48, "cool_down": 80000, "id": 122, "point": 2, "info": "Khiên năng lượng 2"}, {"power_require": 50000000, "damage": 25, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 45, "cool_down": 85000, "id": 123, "point": 3, "info": "Khiên năng lượng 3"}, {"power_require": 125000000, "damage": 30, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 42, "cool_down": 90000, "id": 124, "point": 4, "info": "Khiên năng lượng 4"}, {"power_require": 625000000, "damage": 35, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 39, "cool_down": 95000, "id": 125, "point": 5, "info": "Khiên năng lượng 5"}, {"power_require": 3125000000, "damage": 40, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 36, "cool_down": 100000, "id": 126, "point": 6, "info": "Khiên năng lượng 6"}, {"power_require": 15625000000, "damage": 45, "dx": 0, "dy": 0, "price": 9999, "max_fight": 1, "mana_use": 33, "cool_down": 105000, "id": 127, "point": 7, "info": "Khiên năng lượng 7"}]'::jsonb);

INSERT INTO skill_template
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES
(2, 25, 'Cađíc liên hoàn chưởng', 10, 1, 4, 11193, 'Tăng sức đánh: #%', 8,
'[{"power_require": 60000000000, "damage": 550, "dx": 120, "dy": 120, "price": 9999, "max_fight": 1, "mana_use": 80, "cool_down": 170000, "id": 176, "point": 1, "info": "Chưởng 1"}, {"power_require": 60000000000, "damage": 600, "dx": 130, "dy": 130, "price": 9999, "max_fight": 1, "mana_use": 75, "cool_down": 160000, "id": 177, "point": 2, "info": "Chưởng 2"}, {"power_require": 60000000000, "damage": 650, "dx": 140, "dy": 140, "price": 9999, "max_fight": 1, "mana_use": 70, "cool_down": 150000, "id": 178, "point": 3, "info": "Chưởng 3"}, {"power_require": 60000000000, "damage": 700, "dx": 150, "dy": 150, "price": 9999, "max_fight": 1, "mana_use": 65, "cool_down": 140000, "id": 179, "point": 4, "info": "Chưởng 4"}, {"power_require": 60000000000, "damage": 750, "dx": 160, "dy": 160, "price": 9999, "max_fight": 1, "mana_use": 60, "cool_down": 130000, "id": 180, "point": 5, "info": "Chưởng 5"}, {"power_require": 60000000000, "damage": 800, "dx": 170, "dy": 170, "price": 9999, "max_fight": 1, "mana_use": 55, "cool_down": 120000, "id": 181, "point": 6, "info": "Chưởng 6"}, {"power_require": 60000000000, "damage": 850, "dx": 180, "dy": 180, "price": 9999, "max_fight": 1, "mana_use": 50, "cool_down": 110000, "id": 182, "point": 7, "info": "Chưởng 7"}, {"power_require": 60000000000, "damage": 900, "dx": 190, "dy": 190, "price": 9999, "max_fight": 1, "mana_use": 45, "cool_down": 100000, "id": 183, "point": 8, "info": "Chưởng 8"}, {"power_require": 60000000000, "damage": 950, "dx": 200, "dy": 200, "price": 9999, "max_fight": 1, "mana_use": 40, "cool_down": 90000, "id": 184, "point": 9, "info": "Chưởng 9"}, {"power_require": 60000000000, "damage": 1000, "dx": 210, "dy": 210, "price": 9999, "max_fight": 1, "mana_use": 35, "cool_down": 80000, "id": 185, "point": 10, "info": "Chưởng 10"}]'::jsonb);

-- Done!
-- Total skills imported:
--   TRÁI ĐẤT: 9 skills
--   NAMEK: 9 skills
--   SAIYAN: 9 skills

-- ==========================================
-- RANK SYSTEM - Hệ thống xếp hạng
-- ==========================================
INSERT INTO ranks (id, name, min_level, color, icon, display_order) VALUES
(1, 'Tân Thủ', 1, '#8B4513', '🥉', 1),
(2, 'Chiến Binh', 10, '#C0C0C0', '🥈', 2),
(3, 'Cao Thủ', 25, '#FFD700', '🥇', 3),
(4, 'Siêu Chiến Binh', 50, '#00CED1', '💎', 4),
(5, 'Huyền Thoại', 75, '#9B59B6', '👑', 5),
(6, 'Bậc Thầy', 100, '#E74C3C', '🔥', 6),
(7, 'Siêu Saiyan', 150, '#F39C12', '⚡', 7),
(8, 'Thần', 200, '#3498DB', '✨', 8);

-- Set sequence to next available value
SELECT setval('ranks_id_seq', 9, false);
