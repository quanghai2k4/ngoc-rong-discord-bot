-- Migration: Skill System theo NRO gốc
-- Thay thế old skills system bằng skill_template với level progression

-- ==========================================
-- BACKUP OLD DATA (optional - comment out if not needed)
-- ==========================================
-- CREATE TABLE IF NOT EXISTS skills_backup AS SELECT * FROM skills;
-- CREATE TABLE IF NOT EXISTS character_skills_backup AS SELECT * FROM character_skills;

-- ==========================================
-- DROP OLD TABLES
-- ==========================================
DROP TABLE IF EXISTS character_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;

-- ==========================================
-- CREATE NEW SKILL TEMPLATE TABLE
-- ==========================================
CREATE TABLE skill_template (
    nclass_id INTEGER NOT NULL,           -- Race class ID (0=Trái Đất, 1=Namek, 2=Saiyan)
    skill_id INTEGER NOT NULL,            -- Skill ID within race
    name VARCHAR(100) NOT NULL,           -- Tên skill
    max_point SMALLINT DEFAULT 7,         -- Max level (default 7)
    mana_use_type SMALLINT DEFAULT 0,     -- Loại tiêu hao KI
    skill_type SMALLINT NOT NULL,         -- Type: 1=Attack, 2=Heal, 3=Buff/Debuff, 4=Special
    icon_id INTEGER,                      -- Icon ID (for client display)
    dam_info VARCHAR(255),                -- Mô tả damage/effect: "Tăng sức đánh: #%"
    slot INTEGER NOT NULL,                -- Vị trí skill slot (0-8)
    skill_levels JSONB NOT NULL,          -- JSON array chứa data cho từng level
    
    PRIMARY KEY (nclass_id, skill_id)
);

-- Create index for efficient queries
CREATE INDEX idx_skill_template_class ON skill_template(nclass_id);
CREATE INDEX idx_skill_template_slot ON skill_template(nclass_id, slot);

-- ==========================================
-- CREATE CHARACTER SKILLS TABLE
-- ==========================================
CREATE TABLE character_skills (
    id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    nclass_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    current_point SMALLINT DEFAULT 1,     -- Current level (1-max_point)
    learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (nclass_id, skill_id) REFERENCES skill_template(nclass_id, skill_id),
    UNIQUE(character_id, nclass_id, skill_id)
);

CREATE INDEX idx_character_skills_char ON character_skills(character_id);
CREATE INDEX idx_character_skills_skill ON character_skills(nclass_id, skill_id);

-- ==========================================
-- HELPER VIEW: Map nclass_id to race_id
-- ==========================================
CREATE OR REPLACE VIEW race_skill_mapping AS
SELECT 
    0 AS nclass_id, 
    (SELECT id FROM character_races WHERE name = 'Trái đất') AS race_id,
    'Trái Đất' AS race_name
UNION ALL
SELECT 
    1 AS nclass_id,
    (SELECT id FROM character_races WHERE name = 'Namek') AS race_id,
    'Namek' AS race_name  
UNION ALL
SELECT 
    2 AS nclass_id,
    (SELECT id FROM character_races WHERE name = 'Saiyan') AS race_id,
    'Saiyan' AS race_name;

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function: Get skill info at specific level
CREATE OR REPLACE FUNCTION get_skill_at_level(
    p_nclass_id INTEGER,
    p_skill_id INTEGER,
    p_level INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_skill_data JSONB;
BEGIN
    SELECT skill_levels->>(p_level - 1)
    INTO v_skill_data
    FROM skill_template
    WHERE nclass_id = p_nclass_id 
      AND skill_id = p_skill_id;
    
    RETURN v_skill_data::JSONB;
END;
$$ LANGUAGE plpgsql;

-- Function: Get all skills for a character with current levels
CREATE OR REPLACE FUNCTION get_character_skills(p_character_id INTEGER)
RETURNS TABLE (
    nclass_id INTEGER,
    skill_id INTEGER,
    name VARCHAR,
    slot INTEGER,
    current_point SMALLINT,
    max_point SMALLINT,
    skill_type SMALLINT,
    current_level_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        st.nclass_id,
        st.skill_id,
        st.name,
        st.slot,
        COALESCE(cs.current_point, 0::SMALLINT) AS current_point,
        st.max_point,
        st.skill_type,
        CASE 
            WHEN cs.current_point IS NOT NULL AND cs.current_point > 0 
            THEN (st.skill_levels->(cs.current_point - 1))::JSONB
            ELSE NULL
        END AS current_level_data
    FROM skill_template st
    LEFT JOIN character_skills cs 
        ON cs.nclass_id = st.nclass_id 
        AND cs.skill_id = st.skill_id
        AND cs.character_id = p_character_id
    WHERE st.nclass_id = (
        SELECT CASE 
            WHEN cr.name = 'Trái đất' THEN 0
            WHEN cr.name = 'Namek' THEN 1
            WHEN cr.name = 'Saiyan' THEN 2
        END
        FROM characters c
        JOIN character_races cr ON c.race_id = cr.id
        WHERE c.id = p_character_id
    )
    ORDER BY st.slot;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE skill_template IS 'Skill templates theo NRO gốc với level progression';
COMMENT ON TABLE character_skills IS 'Character skills với current level cho mỗi skill';
COMMENT ON FUNCTION get_skill_at_level IS 'Get skill stats at specific level';
COMMENT ON FUNCTION get_character_skills IS 'Get all skills for character with current levels';
