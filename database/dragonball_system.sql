-- =====================================================
-- Dragon Ball Collection System
-- =====================================================

-- Table: dragon_ball_sets
-- Tracks Dragon Ball collection progress for each character
CREATE TABLE IF NOT EXISTS dragon_ball_sets (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  set_type VARCHAR(20) NOT NULL DEFAULT 'earth', -- 'earth' or 'namek'
  ball_1_item_id INTEGER REFERENCES items(id),
  ball_2_item_id INTEGER REFERENCES items(id),
  ball_3_item_id INTEGER REFERENCES items(id),
  ball_4_item_id INTEGER REFERENCES items(id),
  ball_5_item_id INTEGER REFERENCES items(id),
  ball_6_item_id INTEGER REFERENCES items(id),
  ball_7_item_id INTEGER REFERENCES items(id),
  is_complete BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(character_id, set_type)
);

-- Table: wish_types
-- Available wishes when summoning Shenron
CREATE TABLE IF NOT EXISTS wish_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  required_level INTEGER DEFAULT 1,
  dragon_type VARCHAR(20) NOT NULL DEFAULT 'earth', -- 'earth' or 'namek'
  cooldown_days INTEGER DEFAULT 30, -- Cooldown between same wish type
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: wishes
-- History of wishes granted
CREATE TABLE IF NOT EXISTS wishes (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  wish_type_id INTEGER NOT NULL REFERENCES wish_types(id),
  set_type VARCHAR(20) NOT NULL DEFAULT 'earth',
  wish_result JSONB, -- Store wish results (e.g., items received, stats gained)
  granted_at TIMESTAMP DEFAULT NOW()
);

-- Table: dragon_ball_summons
-- Track summon history (for analytics)
CREATE TABLE IF NOT EXISTS dragon_ball_summons (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  set_type VARCHAR(20) NOT NULL DEFAULT 'earth',
  balls_used JSONB NOT NULL, -- Array of item IDs used
  wish_granted INTEGER REFERENCES wishes(id),
  summoned_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dragon_ball_sets_character ON dragon_ball_sets(character_id);
CREATE INDEX IF NOT EXISTS idx_dragon_ball_sets_complete ON dragon_ball_sets(is_complete, set_type);
CREATE INDEX IF NOT EXISTS idx_wishes_character ON wishes(character_id);
CREATE INDEX IF NOT EXISTS idx_wishes_granted_at ON wishes(granted_at);
CREATE INDEX IF NOT EXISTS idx_dragon_ball_summons_character ON dragon_ball_summons(character_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dragon_ball_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Auto-check if set is complete
  IF NEW.ball_1_item_id IS NOT NULL AND 
     NEW.ball_2_item_id IS NOT NULL AND 
     NEW.ball_3_item_id IS NOT NULL AND 
     NEW.ball_4_item_id IS NOT NULL AND 
     NEW.ball_5_item_id IS NOT NULL AND 
     NEW.ball_6_item_id IS NOT NULL AND 
     NEW.ball_7_item_id IS NOT NULL THEN
    NEW.is_complete = TRUE;
    IF OLD.is_complete = FALSE OR OLD.is_complete IS NULL THEN
      NEW.completed_at = NOW();
    END IF;
  ELSE
    NEW.is_complete = FALSE;
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_dragon_ball_set ON dragon_ball_sets;
CREATE TRIGGER trigger_update_dragon_ball_set
  BEFORE UPDATE ON dragon_ball_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_dragon_ball_set_timestamp();

-- Seed wish types for Earth Dragon Balls
INSERT INTO wish_types (code, name, description, required_level, dragon_type, cooldown_days) VALUES
  ('immortality', 'Bất Tử', 'Tăng 50% Max HP vĩnh viễn cho nhân vật', 1, 'earth', 90),
  ('power', 'Sức Mạnh', 'Tăng ngay 10 levels và nhận toàn bộ stats bonus', 10, 'earth', 60),
  ('wealth', 'Giàu Có', 'Nhận ngay 1,000,000 vàng', 1, 'earth', 30),
  ('rare_item', 'Vật Phẩm Hiếm', 'Nhận ngay 1 vật phẩm Legendary ngẫu nhiên', 20, 'earth', 45),
  ('transformation', 'Biến Hình', 'Unlock ngẫu nhiên 1 transformation chưa có', 50, 'earth', 90),
  ('revival', 'Hồi Sinh', 'Restore toàn bộ HP/KI và xóa tất cả debuffs', 1, 'earth', 7),
  ('skill_mastery', 'Tinh Thông Kỹ Năng', 'Tăng tất cả skills lên max level', 30, 'earth', 60),
  ('zenkai_boost', 'Zenkai Boost', 'Tăng vĩnh viễn +20% tất cả stats', 75, 'earth', 120)
ON CONFLICT (code) DO NOTHING;

-- Seed wish types for Namek Dragon Balls (more powerful)
INSERT INTO wish_types (code, name, description, required_level, dragon_type, cooldown_days) VALUES
  ('immortality_namek', 'Bất Tử Namek', 'Tăng 100% Max HP vĩnh viễn', 50, 'namek', 180),
  ('power_namek', 'Sức Mạnh Namek', 'Tăng ngay 25 levels', 50, 'namek', 120),
  ('wealth_namek', 'Giàu Có Namek', 'Nhận ngay 5,000,000 vàng', 50, 'namek', 60),
  ('rare_item_namek', 'Vật Phẩm Thần Thoại', 'Nhận 3 vật phẩm Legendary ngẫu nhiên', 75, 'namek', 90),
  ('ultimate_power', 'Sức Mạnh Tối Thượng', 'Unlock Super Shenron transformation (5x power)', 100, 'namek', 365)
ON CONFLICT (code) DO NOTHING;

-- Comments
COMMENT ON TABLE dragon_ball_sets IS 'Tracks Dragon Ball collection progress for each character';
COMMENT ON TABLE wish_types IS 'Available wishes when summoning Shenron';
COMMENT ON TABLE wishes IS 'History of wishes granted to characters';
COMMENT ON TABLE dragon_ball_summons IS 'Track summon history for analytics';
COMMENT ON COLUMN dragon_ball_sets.set_type IS 'Type of dragon balls: earth or namek';
COMMENT ON COLUMN wish_types.cooldown_days IS 'Cooldown in days before same wish can be used again by the same character';
