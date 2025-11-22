-- Monster Drops Migration
-- Auto-generated drop rates based on monster levels and item types
-- Total monsters: 29 (24 normal + 5 bosses)

-- ==========================================
-- Xóa drop rates cũ
-- ==========================================
DELETE FROM monster_drops;

-- ==========================================
-- Insert drop rates mới
-- ==========================================
-- Sói Hoang (Level 1)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (1, 13, 25.0);  -- Sói Hoang -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (1, 60, 20.0);  -- Sói Hoang -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (1, 61, 15.0);  -- Sói Hoang -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (1, 6, 12.0);  -- Sói Hoang -> Quần vải đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (1, 27, 12.0);  -- Sói Hoang -> Giày nhựa
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (1, 35, 9.6);  -- Sói Hoang -> Quần thun đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (1, 30, 9.6);  -- Sói Hoang -> Giày cao su
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (1, 9, 7.2);  -- Sói Hoang -> Quần vải dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (1, 39, 7.2);  -- Sói Hoang -> Giày nhựa đế dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (1, 36, 4.8);  -- Sói Hoang -> Quần thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (1, 52, 4.8);  -- Sói Hoang -> Quần giáp đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (1, 40, 4.8);  -- Sói Hoang -> Giày cao su đế dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (1, 56, 4.8);  -- Sói Hoang -> Giày đồng

-- Rắn Độc (Level 2)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (2, 60, 25.0);  -- Rắn Độc -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (2, 13, 20.0);  -- Rắn Độc -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (2, 61, 20.0);  -- Rắn Độc -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (2, 62, 15.0);  -- Rắn Độc -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (2, 33, 12.0);  -- Rắn Độc -> Áo thun 3 lỗ
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (2, 24, 12.0);  -- Rắn Độc -> Găng thun đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (2, 0, 9.6);  -- Rắn Độc -> Áo vải 3 lỗ
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (2, 3, 9.6);  -- Rắn Độc -> Áo vải dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (2, 21, 9.6);  -- Rắn Độc -> Găng vải đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (2, 37, 9.6);  -- Rắn Độc -> Găng vải dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (2, 34, 7.2);  -- Rắn Độc -> Áo thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (2, 50, 7.2);  -- Rắn Độc -> Áo giáp đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (2, 38, 7.2);  -- Rắn Độc -> Găng thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (2, 54, 7.2);  -- Rắn Độc -> Găng đồng

-- Gấu Hoang (Level 2)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (3, 60, 25.0);  -- Gấu Hoang -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (3, 13, 20.0);  -- Gấu Hoang -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (3, 61, 20.0);  -- Gấu Hoang -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (3, 62, 15.0);  -- Gấu Hoang -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (3, 33, 12.0);  -- Gấu Hoang -> Áo thun 3 lỗ
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (3, 24, 12.0);  -- Gấu Hoang -> Găng thun đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (3, 0, 9.6);  -- Gấu Hoang -> Áo vải 3 lỗ
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (3, 3, 9.6);  -- Gấu Hoang -> Áo vải dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (3, 21, 9.6);  -- Gấu Hoang -> Găng vải đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (3, 37, 9.6);  -- Gấu Hoang -> Găng vải dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (3, 34, 7.2);  -- Gấu Hoang -> Áo thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (3, 50, 7.2);  -- Gấu Hoang -> Áo giáp đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (3, 38, 7.2);  -- Gấu Hoang -> Găng thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (3, 54, 7.2);  -- Gấu Hoang -> Găng đồng

-- Khủng Long Nhỏ (Level 3)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 61, 25.0);  -- Khủng Long Nhỏ -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 60, 20.0);  -- Khủng Long Nhỏ -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 62, 20.0);  -- Khủng Long Nhỏ -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 13, 15.0);  -- Khủng Long Nhỏ -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 63, 15.0);  -- Khủng Long Nhỏ -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 9, 12.0);  -- Khủng Long Nhỏ -> Quần vải dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 39, 12.0);  -- Khủng Long Nhỏ -> Giày nhựa đế dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 35, 9.6);  -- Khủng Long Nhỏ -> Quần thun đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 36, 9.6);  -- Khủng Long Nhỏ -> Quần thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 52, 9.6);  -- Khủng Long Nhỏ -> Quần giáp đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 30, 9.6);  -- Khủng Long Nhỏ -> Giày cao su
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 40, 9.6);  -- Khủng Long Nhỏ -> Giày cao su đế dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 56, 9.6);  -- Khủng Long Nhỏ -> Giày đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 6, 7.2);  -- Khủng Long Nhỏ -> Quần vải đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (4, 27, 7.2);  -- Khủng Long Nhỏ -> Giày nhựa

-- Thỏ Dữ (Level 3)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 61, 25.0);  -- Thỏ Dữ -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 60, 20.0);  -- Thỏ Dữ -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 62, 20.0);  -- Thỏ Dữ -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 13, 15.0);  -- Thỏ Dữ -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 63, 15.0);  -- Thỏ Dữ -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 9, 12.0);  -- Thỏ Dữ -> Quần vải dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 39, 12.0);  -- Thỏ Dữ -> Giày nhựa đế dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 35, 9.6);  -- Thỏ Dữ -> Quần thun đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 36, 9.6);  -- Thỏ Dữ -> Quần thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 52, 9.6);  -- Thỏ Dữ -> Quần giáp đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 30, 9.6);  -- Thỏ Dữ -> Giày cao su
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 40, 9.6);  -- Thỏ Dữ -> Giày cao su đế dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 56, 9.6);  -- Thỏ Dữ -> Giày đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 6, 7.2);  -- Thỏ Dữ -> Quần vải đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (5, 27, 7.2);  -- Thỏ Dữ -> Giày nhựa

-- Tên Cướp (Level 5)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 63, 25.0);  -- Tên Cướp -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 62, 20.0);  -- Tên Cướp -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 64, 20.0);  -- Tên Cướp -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 61, 15.0);  -- Tên Cướp -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 65, 15.0);  -- Tên Cướp -> Đậu thần cấp 7
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 60, 10.0);  -- Tên Cướp -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 36, 9.6);  -- Tên Cướp -> Quần thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 52, 9.6);  -- Tên Cướp -> Quần giáp đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 40, 9.6);  -- Tên Cướp -> Giày cao su đế dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 56, 9.6);  -- Tên Cướp -> Giày đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 9, 7.2);  -- Tên Cướp -> Quần vải dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 39, 7.2);  -- Tên Cướp -> Giày nhựa đế dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 13, 5.0);  -- Tên Cướp -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 35, 4.8);  -- Tên Cướp -> Quần thun đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (6, 30, 4.8);  -- Tên Cướp -> Giày cao su

-- Lính Canh (Level 5)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 63, 25.0);  -- Lính Canh -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 62, 20.0);  -- Lính Canh -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 64, 20.0);  -- Lính Canh -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 61, 15.0);  -- Lính Canh -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 65, 15.0);  -- Lính Canh -> Đậu thần cấp 7
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 60, 10.0);  -- Lính Canh -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 36, 9.6);  -- Lính Canh -> Quần thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 52, 9.6);  -- Lính Canh -> Quần giáp đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 40, 9.6);  -- Lính Canh -> Giày cao su đế dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 56, 9.6);  -- Lính Canh -> Giày đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 9, 7.2);  -- Lính Canh -> Quần vải dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 39, 7.2);  -- Lính Canh -> Giày nhựa đế dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 13, 5.0);  -- Lính Canh -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 35, 4.8);  -- Lính Canh -> Quần thun đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (7, 30, 4.8);  -- Lính Canh -> Giày cao su

-- Ninja Tập Sự (Level 6)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (8, 64, 25.0);  -- Ninja Tập Sự -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (8, 63, 20.0);  -- Ninja Tập Sự -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (8, 65, 20.0);  -- Ninja Tập Sự -> Đậu thần cấp 7
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (8, 62, 15.0);  -- Ninja Tập Sự -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (8, 61, 10.0);  -- Ninja Tập Sự -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (8, 34, 7.2);  -- Ninja Tập Sự -> Áo thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (8, 50, 7.2);  -- Ninja Tập Sự -> Áo giáp đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (8, 38, 7.2);  -- Ninja Tập Sự -> Găng thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (8, 54, 7.2);  -- Ninja Tập Sự -> Găng đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (8, 13, 5.0);  -- Ninja Tập Sự -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (8, 60, 5.0);  -- Ninja Tập Sự -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (8, 3, 4.8);  -- Ninja Tập Sự -> Áo vải dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (8, 37, 4.8);  -- Ninja Tập Sự -> Găng vải dày

-- Cướp Biển (Level 6)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (9, 64, 25.0);  -- Cướp Biển -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (9, 63, 20.0);  -- Cướp Biển -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (9, 65, 20.0);  -- Cướp Biển -> Đậu thần cấp 7
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (9, 62, 15.0);  -- Cướp Biển -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (9, 61, 10.0);  -- Cướp Biển -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (9, 34, 7.2);  -- Cướp Biển -> Áo thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (9, 50, 7.2);  -- Cướp Biển -> Áo giáp đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (9, 38, 7.2);  -- Cướp Biển -> Găng thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (9, 54, 7.2);  -- Cướp Biển -> Găng đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (9, 13, 5.0);  -- Cướp Biển -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (9, 60, 5.0);  -- Cướp Biển -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (9, 3, 4.8);  -- Cướp Biển -> Áo vải dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (9, 37, 4.8);  -- Cướp Biển -> Găng vải dày

-- Sát Thủ Tập Sự (Level 7)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (10, 65, 25.0);  -- Sát Thủ Tập Sự -> Đậu thần cấp 7
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (10, 64, 20.0);  -- Sát Thủ Tập Sự -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (10, 63, 15.0);  -- Sát Thủ Tập Sự -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (10, 62, 10.0);  -- Sát Thủ Tập Sự -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (10, 13, 5.0);  -- Sát Thủ Tập Sự -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (10, 60, 5.0);  -- Sát Thủ Tập Sự -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (10, 61, 5.0);  -- Sát Thủ Tập Sự -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (10, 36, 4.8);  -- Sát Thủ Tập Sự -> Quần thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (10, 52, 4.8);  -- Sát Thủ Tập Sự -> Quần giáp đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (10, 40, 4.8);  -- Sát Thủ Tập Sự -> Giày cao su đế dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (10, 56, 4.8);  -- Sát Thủ Tập Sự -> Giày đồng

-- Quân Đội RR (Level 8)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (11, 65, 20.0);  -- Quân Đội RR -> Đậu thần cấp 7
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (11, 64, 15.0);  -- Quân Đội RR -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (11, 63, 10.0);  -- Quân Đội RR -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (11, 13, 5.0);  -- Quân Đội RR -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (11, 60, 5.0);  -- Quân Đội RR -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (11, 61, 5.0);  -- Quân Đội RR -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (11, 62, 5.0);  -- Quân Đội RR -> Đậu thần cấp 4

-- Lính Mũ Xanh (Level 8)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (12, 65, 20.0);  -- Lính Mũ Xanh -> Đậu thần cấp 7
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (12, 64, 15.0);  -- Lính Mũ Xanh -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (12, 63, 10.0);  -- Lính Mũ Xanh -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (12, 13, 5.0);  -- Lính Mũ Xanh -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (12, 60, 5.0);  -- Lính Mũ Xanh -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (12, 61, 5.0);  -- Lính Mũ Xanh -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (12, 62, 5.0);  -- Lính Mũ Xanh -> Đậu thần cấp 4

-- Lính Mũ Đỏ (Level 9)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (13, 65, 15.0);  -- Lính Mũ Đỏ -> Đậu thần cấp 7
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (13, 64, 10.0);  -- Lính Mũ Đỏ -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (13, 13, 5.0);  -- Lính Mũ Đỏ -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (13, 60, 5.0);  -- Lính Mũ Đỏ -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (13, 61, 5.0);  -- Lính Mũ Đỏ -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (13, 62, 5.0);  -- Lính Mũ Đỏ -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (13, 63, 5.0);  -- Lính Mũ Đỏ -> Đậu thần cấp 5

-- Cyborg (Level 10)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (14, 65, 10.0);  -- Cyborg -> Đậu thần cấp 7
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (14, 13, 5.0);  -- Cyborg -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (14, 60, 5.0);  -- Cyborg -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (14, 61, 5.0);  -- Cyborg -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (14, 62, 5.0);  -- Cyborg -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (14, 63, 5.0);  -- Cyborg -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (14, 64, 5.0);  -- Cyborg -> Đậu thần cấp 6

-- Android Cũ (Level 10)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (15, 65, 10.0);  -- Android Cũ -> Đậu thần cấp 7
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (15, 13, 5.0);  -- Android Cũ -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (15, 60, 5.0);  -- Android Cũ -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (15, 61, 5.0);  -- Android Cũ -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (15, 62, 5.0);  -- Android Cũ -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (15, 63, 5.0);  -- Android Cũ -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (15, 64, 5.0);  -- Android Cũ -> Đậu thần cấp 6

-- Quỷ Nhỏ (Level 10)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (16, 65, 10.0);  -- Quỷ Nhỏ -> Đậu thần cấp 7
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (16, 13, 5.0);  -- Quỷ Nhỏ -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (16, 60, 5.0);  -- Quỷ Nhỏ -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (16, 61, 5.0);  -- Quỷ Nhỏ -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (16, 62, 5.0);  -- Quỷ Nhỏ -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (16, 63, 5.0);  -- Quỷ Nhỏ -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (16, 64, 5.0);  -- Quỷ Nhỏ -> Đậu thần cấp 6

-- Quỷ Trung (Level 12)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (17, 13, 5.0);  -- Quỷ Trung -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (17, 60, 5.0);  -- Quỷ Trung -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (17, 61, 5.0);  -- Quỷ Trung -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (17, 62, 5.0);  -- Quỷ Trung -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (17, 63, 5.0);  -- Quỷ Trung -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (17, 64, 5.0);  -- Quỷ Trung -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (17, 65, 5.0);  -- Quỷ Trung -> Đậu thần cấp 7

-- Quỷ Đại (Level 14)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (18, 13, 5.0);  -- Quỷ Đại -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (18, 60, 5.0);  -- Quỷ Đại -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (18, 61, 5.0);  -- Quỷ Đại -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (18, 62, 5.0);  -- Quỷ Đại -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (18, 63, 5.0);  -- Quỷ Đại -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (18, 64, 5.0);  -- Quỷ Đại -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (18, 65, 5.0);  -- Quỷ Đại -> Đậu thần cấp 7

-- Ma Vương Nhỏ (Level 15)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (19, 13, 5.0);  -- Ma Vương Nhỏ -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (19, 60, 5.0);  -- Ma Vương Nhỏ -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (19, 61, 5.0);  -- Ma Vương Nhỏ -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (19, 62, 5.0);  -- Ma Vương Nhỏ -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (19, 63, 5.0);  -- Ma Vương Nhỏ -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (19, 64, 5.0);  -- Ma Vương Nhỏ -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (19, 65, 5.0);  -- Ma Vương Nhỏ -> Đậu thần cấp 7

-- Frieza Lính (Level 15)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (20, 13, 5.0);  -- Frieza Lính -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (20, 60, 5.0);  -- Frieza Lính -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (20, 61, 5.0);  -- Frieza Lính -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (20, 62, 5.0);  -- Frieza Lính -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (20, 63, 5.0);  -- Frieza Lính -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (20, 64, 5.0);  -- Frieza Lính -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (20, 65, 5.0);  -- Frieza Lính -> Đậu thần cấp 7

-- Zarbon Lính (Level 17)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (21, 13, 5.0);  -- Zarbon Lính -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (21, 60, 5.0);  -- Zarbon Lính -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (21, 61, 5.0);  -- Zarbon Lính -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (21, 62, 5.0);  -- Zarbon Lính -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (21, 63, 5.0);  -- Zarbon Lính -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (21, 64, 5.0);  -- Zarbon Lính -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (21, 65, 5.0);  -- Zarbon Lính -> Đậu thần cấp 7

-- Dodoria Lính (Level 18)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (22, 13, 5.0);  -- Dodoria Lính -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (22, 60, 5.0);  -- Dodoria Lính -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (22, 61, 5.0);  -- Dodoria Lính -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (22, 62, 5.0);  -- Dodoria Lính -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (22, 63, 5.0);  -- Dodoria Lính -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (22, 64, 5.0);  -- Dodoria Lính -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (22, 65, 5.0);  -- Dodoria Lính -> Đậu thần cấp 7

-- Ginyu Lính (Level 20)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (23, 13, 5.0);  -- Ginyu Lính -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (23, 60, 5.0);  -- Ginyu Lính -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (23, 61, 5.0);  -- Ginyu Lính -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (23, 62, 5.0);  -- Ginyu Lính -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (23, 63, 5.0);  -- Ginyu Lính -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (23, 64, 5.0);  -- Ginyu Lính -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (23, 65, 5.0);  -- Ginyu Lính -> Đậu thần cấp 7

-- Saiyan Hạ Cấp (Level 22)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (24, 13, 5.0);  -- Saiyan Hạ Cấp -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (24, 60, 5.0);  -- Saiyan Hạ Cấp -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (24, 61, 5.0);  -- Saiyan Hạ Cấp -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (24, 62, 5.0);  -- Saiyan Hạ Cấp -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (24, 63, 5.0);  -- Saiyan Hạ Cấp -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (24, 64, 5.0);  -- Saiyan Hạ Cấp -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (24, 65, 5.0);  -- Saiyan Hạ Cấp -> Đậu thần cấp 7

-- Mèo Karin (BOSS)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 61, 50.0);  -- Mèo Karin -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 60, 40.0);  -- Mèo Karin -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 62, 40.0);  -- Mèo Karin -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 13, 30.0);  -- Mèo Karin -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 63, 30.0);  -- Mèo Karin -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 3, 30.0);  -- Mèo Karin -> Áo vải dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 37, 30.0);  -- Mèo Karin -> Găng vải dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 9, 30.0);  -- Mèo Karin -> Quần vải dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 39, 30.0);  -- Mèo Karin -> Giày nhựa đế dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 33, 24.0);  -- Mèo Karin -> Áo thun 3 lỗ
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 34, 24.0);  -- Mèo Karin -> Áo thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 50, 24.0);  -- Mèo Karin -> Áo giáp đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 24, 24.0);  -- Mèo Karin -> Găng thun đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 38, 24.0);  -- Mèo Karin -> Găng thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 54, 24.0);  -- Mèo Karin -> Găng đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 35, 24.0);  -- Mèo Karin -> Quần thun đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 36, 24.0);  -- Mèo Karin -> Quần thun dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 52, 24.0);  -- Mèo Karin -> Quần giáp đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 30, 24.0);  -- Mèo Karin -> Giày cao su
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 40, 24.0);  -- Mèo Karin -> Giày cao su đế dày
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 56, 24.0);  -- Mèo Karin -> Giày đồng
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 58, 20.0);  -- Mèo Karin -> Rada cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 0, 18.0);  -- Mèo Karin -> Áo vải 3 lỗ
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 21, 18.0);  -- Mèo Karin -> Găng vải đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 6, 18.0);  -- Mèo Karin -> Quần vải đen
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 27, 18.0);  -- Mèo Karin -> Giày nhựa
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 57, 16.0);  -- Mèo Karin -> Rada cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 59, 16.0);  -- Mèo Karin -> Rada cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (25, 12, 12.0);  -- Mèo Karin -> Rada cấp 1

-- Yajirobe (BOSS)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (26, 65, 40.0);  -- Yajirobe -> Đậu thần cấp 7
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (26, 64, 30.0);  -- Yajirobe -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (26, 63, 20.0);  -- Yajirobe -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (26, 13, 10.0);  -- Yajirobe -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (26, 60, 10.0);  -- Yajirobe -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (26, 61, 10.0);  -- Yajirobe -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (26, 62, 10.0);  -- Yajirobe -> Đậu thần cấp 4

-- Thần Karin (BOSS)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (27, 13, 10.0);  -- Thần Karin -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (27, 60, 10.0);  -- Thần Karin -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (27, 61, 10.0);  -- Thần Karin -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (27, 62, 10.0);  -- Thần Karin -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (27, 63, 10.0);  -- Thần Karin -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (27, 64, 10.0);  -- Thần Karin -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (27, 65, 10.0);  -- Thần Karin -> Đậu thần cấp 7

-- Korin Sama (BOSS)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (28, 13, 10.0);  -- Korin Sama -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (28, 60, 10.0);  -- Korin Sama -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (28, 61, 10.0);  -- Korin Sama -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (28, 62, 10.0);  -- Korin Sama -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (28, 63, 10.0);  -- Korin Sama -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (28, 64, 10.0);  -- Korin Sama -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (28, 65, 10.0);  -- Korin Sama -> Đậu thần cấp 7

-- Ông Già Gohan (BOSS)
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (29, 13, 10.0);  -- Ông Già Gohan -> Đậu thần cấp 1
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (29, 60, 10.0);  -- Ông Già Gohan -> Đậu thần cấp 2
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (29, 61, 10.0);  -- Ông Già Gohan -> Đậu thần cấp 3
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (29, 62, 10.0);  -- Ông Già Gohan -> Đậu thần cấp 4
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (29, 63, 10.0);  -- Ông Già Gohan -> Đậu thần cấp 5
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (29, 64, 10.0);  -- Ông Già Gohan -> Đậu thần cấp 6
INSERT INTO monster_drops (monster_id, item_id, drop_rate) VALUES (29, 65, 10.0);  -- Ông Già Gohan -> Đậu thần cấp 7

-- Total drop entries: 293
