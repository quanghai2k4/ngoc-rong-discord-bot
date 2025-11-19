-- Skill data for testing the new skill system
-- Dựa trên structure từ vibenro.sql
-- TODO: Import full data từ vibenro.sql sau khi test

-- Sample skills: 1 skill per race để test

INSERT INTO skill_template 
(nclass_id, skill_id, name, max_point, mana_use_type, skill_type, icon_id, dam_info, slot, skill_levels)
VALUES

-- ==========================================
-- TRÁI ĐẤT (nclass_id = 0)
-- ==========================================
(0, 0, 'Chiêu đấm Dragon', 7, 0, 1, 539, 'Tăng sức đánh: #%', 0, 
'[
  {"power_require":1000,"damage":100,"dx":32,"dy":18,"price":0,"max_fight":1,"mana_use":1,"cool_down":500,"id":0,"point":1,"info":"tại ông nội ngay lúc đầu"},
  {"power_require":10000,"damage":110,"dx":34,"dy":18,"price":10,"max_fight":1,"mana_use":2,"cool_down":500,"id":1,"point":2,"info":"tại ông nội"},
  {"power_require":22000,"damage":120,"dx":36,"dy":18,"price":50,"max_fight":1,"mana_use":4,"cool_down":500,"id":2,"point":3,"info":"tại Quy Lão Kame"},
  {"power_require":66000,"damage":130,"dx":38,"dy":18,"price":100,"max_fight":1,"mana_use":8,"cool_down":500,"id":3,"point":4,"info":"tại Quy Lão Kame"},
  {"power_require":200000,"damage":140,"dx":40,"dy":18,"price":500,"max_fight":1,"mana_use":16,"cool_down":500,"id":4,"point":5,"info":"tại Quy Lão Kame"},
  {"power_require":600000,"damage":150,"dx":42,"dy":18,"price":1000,"max_fight":1,"mana_use":32,"cool_down":500,"id":5,"point":6,"info":"tại Quy Lão Kame"},
  {"power_require":1800000,"damage":160,"dx":44,"dy":18,"price":2000,"max_fight":1,"mana_use":70,"cool_down":500,"id":6,"point":7,"info":"tại Quy Lão Kame"}
]'::jsonb),

(0, 1, 'Chiêu Kamejoko', 7, 0, 1, 540, 'Tăng sức đánh: #%', 1,
'[
  {"power_require":10000,"damage":150,"dx":160,"dy":160,"price":500,"max_fight":1,"mana_use":30,"cool_down":2000,"id":7,"point":1,"info":"(Kame joko) Học tại Sư Phụ"},
  {"power_require":20000,"damage":200,"dx":170,"dy":170,"price":1000,"max_fight":1,"mana_use":60,"cool_down":2500,"id":8,"point":2,"info":"(Kame joko) Học tại Sư Phụ"},
  {"power_require":60000,"damage":250,"dx":180,"dy":180,"price":2000,"max_fight":1,"mana_use":120,"cool_down":3000,"id":9,"point":3,"info":"(Kame joko) Học tại Sư Phụ"},
  {"power_require":180000,"damage":300,"dx":190,"dy":190,"price":4000,"max_fight":1,"mana_use":240,"cool_down":3500,"id":10,"point":4,"info":"(Kame joko) Học tại Sư Phụ"},
  {"power_require":540000,"damage":350,"dx":200,"dy":200,"price":8000,"max_fight":1,"mana_use":480,"cool_down":4000,"id":11,"point":5,"info":"(Kame joko) Học tại Sư Phụ"},
  {"power_require":1600000,"damage":400,"dx":210,"dy":210,"price":9999,"max_fight":1,"mana_use":960,"cool_down":4500,"id":12,"point":6,"info":"(Kame joko) Học tại Sư Phụ"},
  {"power_require":4800000,"damage":450,"dx":220,"dy":220,"price":9999,"max_fight":1,"mana_use":1280,"cool_down":5000,"id":13,"point":7,"info":"(Kame joko) Học tại Sư Phụ"}
]'::jsonb),

-- ==========================================
-- NAMEK (nclass_id = 1)
-- ==========================================
(1, 2, 'Chiêu đấm Demon', 7, 0, 1, 539, 'Tăng sức đánh: #%', 0,
'[
  {"power_require":1000,"damage":95,"dx":24,"dy":18,"price":0,"max_fight":1,"mana_use":1,"cool_down":400,"id":14,"point":1,"info":"(Đấm Demon 1) Học tại Sư Phụ"},
  {"power_require":10000,"damage":105,"dx":26,"dy":18,"price":10,"max_fight":1,"mana_use":2,"cool_down":400,"id":15,"point":2,"info":"(Đấm Demon 2) Học tại Sư Phụ"},
  {"power_require":22000,"damage":115,"dx":28,"dy":18,"price":50,"max_fight":1,"mana_use":4,"cool_down":400,"id":16,"point":3,"info":"(Đấm Demon 3) Học tại Sư Phụ"},
  {"power_require":66000,"damage":125,"dx":30,"dy":18,"price":100,"max_fight":1,"mana_use":8,"cool_down":400,"id":17,"point":4,"info":"(Đấm Demon 4) Học tại Sư Phụ"},
  {"power_require":200000,"damage":135,"dx":32,"dy":18,"price":1000,"max_fight":1,"mana_use":16,"cool_down":400,"id":18,"point":5,"info":"(Đấm Demon 5) Học tại Sư Phụ"},
  {"power_require":600000,"damage":145,"dx":34,"dy":18,"price":2000,"max_fight":1,"mana_use":32,"cool_down":400,"id":19,"point":6,"info":"(Đấm Demon 6) Học tại Sư Phụ"},
  {"power_require":1800000,"damage":155,"dx":36,"dy":18,"price":4000,"max_fight":1,"mana_use":70,"cool_down":400,"id":20,"point":7,"info":"(Đấm Demon 7) Học tại Sư Phụ"}
]'::jsonb),

(1, 7, 'Trị thương', 7, 1, 2, 724, 'Phục hồi #% HP và KI cho đồng đội', 2,
'[
  {"power_require":60000,"damage":50,"dx":100,"dy":100,"price":500,"max_fight":1,"mana_use":40,"cool_down":30000,"id":49,"point":1,"info":"(Phục hồi Namek 1) Học tại sư phụ"},
  {"power_require":120000,"damage":55,"dx":105,"dy":105,"price":1000,"max_fight":1,"mana_use":35,"cool_down":32000,"id":50,"point":2,"info":"(Phục hồi Namek 2) Học tại sư phụ"},
  {"power_require":360000,"damage":60,"dx":110,"dy":110,"price":2000,"max_fight":1,"mana_use":30,"cool_down":34000,"id":51,"point":3,"info":"(Phục hồi Namek 3) Học tại sư phụ"},
  {"power_require":1000000,"damage":65,"dx":115,"dy":115,"price":4000,"max_fight":1,"mana_use":25,"cool_down":38000,"id":52,"point":4,"info":"(Phục hồi Namek 4) Học tại sư phụ"},
  {"power_require":3200000,"damage":70,"dx":120,"dy":120,"price":8000,"max_fight":1,"mana_use":20,"cool_down":40000,"id":53,"point":5,"info":"(Phục hồi Namek 5) Học tại sư phụ"},
  {"power_require":10000000,"damage":75,"dx":125,"dy":125,"price":9999,"max_fight":1,"mana_use":15,"cool_down":42000,"id":54,"point":6,"info":"(Phục hồi Namek 6) Học tại sư phụ"},
  {"power_require":30000000,"damage":80,"dx":130,"dy":130,"price":9999,"max_fight":1,"mana_use":10,"cool_down":44000,"id":55,"point":7,"info":"(Phục hồi Namek 7) Học tại sư phụ"}
]'::jsonb),

-- ==========================================
-- SAIYAN (nclass_id = 2)
-- ==========================================
(2, 4, 'Chiêu đấm Galick', 7, 0, 1, 539, 'Tăng sức đánh: #%', 0,
'[
  {"power_require":1000,"damage":110,"dx":36,"dy":18,"price":0,"max_fight":1,"mana_use":1,"cool_down":500,"id":28,"point":1,"info":"(Đấm Galick 1) Học tại ông nội ngay lúc đầu"},
  {"power_require":10000,"damage":120,"dx":37,"dy":18,"price":10,"max_fight":1,"mana_use":2,"cool_down":500,"id":29,"point":2,"info":"(Đấm Galick 2) Sau khi làm nhiệm vụ tiêu diệt Heo Rừng sẽ học được tại ông nội"},
  {"power_require":22000,"damage":130,"dx":38,"dy":18,"price":50,"max_fight":1,"mana_use":4,"cool_down":500,"id":30,"point":3,"info":"(Đấm Galick 3) Học tại Sư Phụ"},
  {"power_require":66000,"damage":140,"dx":39,"dy":18,"price":100,"max_fight":1,"mana_use":8,"cool_down":500,"id":31,"point":4,"info":"(Đấm Galick 4) Học tại Sư Phụ"},
  {"power_require":200000,"damage":150,"dx":40,"dy":18,"price":1000,"max_fight":1,"mana_use":16,"cool_down":500,"id":32,"point":5,"info":"(Đấm Galick 5) Học tại Sư Phụ"},
  {"power_require":600000,"damage":160,"dx":41,"dy":18,"price":2000,"max_fight":1,"mana_use":32,"cool_down":500,"id":33,"point":6,"info":"(Đấm Galick 6) Học tại Sư Phụ"},
  {"power_require":1800000,"damage":170,"dx":42,"dy":18,"price":4000,"max_fight":1,"mana_use":70,"cool_down":500,"id":34,"point":7,"info":"(Đấm Galick 7) Học tại Sư Phụ"}
]'::jsonb),

(2, 8, 'Tái tạo năng lượng', 7, 1, 3, 720, 'Tự tái tạo HP MP #%/s', 2,
'[
  {"power_require":60000,"damage":4,"dx":0,"dy":0,"price":500,"max_fight":1,"mana_use":0,"cool_down":55000,"id":56,"point":1,"info":"(Tái tạo Xayda 1) Học tại sư phụ"},
  {"power_require":120000,"damage":5,"dx":0,"dy":0,"price":1000,"max_fight":1,"mana_use":0,"cool_down":50000,"id":57,"point":2,"info":"(Tái tạo Xayda 2) Học tại sư phụ"},
  {"power_require":360000,"damage":6,"dx":0,"dy":0,"price":2000,"max_fight":1,"mana_use":0,"cool_down":45000,"id":58,"point":3,"info":"(Tái tạo Xayda 3) Học tại sư phụ"},
  {"power_require":1000000,"damage":7,"dx":0,"dy":0,"price":4000,"max_fight":1,"mana_use":0,"cool_down":40000,"id":59,"point":4,"info":"(Tái tạo Xayda 4) Học tại sư phụ"},
  {"power_require":3200000,"damage":8,"dx":0,"dy":0,"price":8000,"max_fight":1,"mana_use":0,"cool_down":35000,"id":60,"point":5,"info":"(Tái tạo Xayda 5) Học tại sư phụ"},
  {"power_require":10000000,"damage":9,"dx":0,"dy":0,"price":9999,"max_fight":1,"mana_use":0,"cool_down":30000,"id":61,"point":6,"info":"(Tái tạo Xayda 6) Học tại sư phụ"},
  {"power_require":30000000,"damage":10,"dx":0,"dy":0,"price":9999,"max_fight":1,"mana_use":0,"cool_down":25000,"id":62,"point":7,"info":"(Tái tạo Xayda 7) Học tại sư phụ"}
]'::jsonb);

-- ==========================================
-- NOTE: This is a minimal dataset for testing
-- TODO: Add remaining skills from vibenro.sql:
--   - Trái Đất: 7 more skills (total 9)
--   - Namek: 7 more skills (total 9)
--   - Saiyan: 7 more skills (total 9)
-- ==========================================
