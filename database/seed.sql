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
