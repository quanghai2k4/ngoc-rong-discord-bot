-- Migration: Fix race_id to nclass_id mapping
-- Vấn đề: character_races có thứ tự sai so với skill_template nclass_id
-- Solution: Reorder races và update function mapping

BEGIN;

-- Step 1: Backup existing character data with race names
CREATE TEMP TABLE temp_character_backup AS
SELECT 
  c.*,
  cr.name as old_race_name
FROM characters c
JOIN character_races cr ON c.race_id = cr.id;

-- Step 2: Reset character_races table
TRUNCATE TABLE character_races CASCADE;
ALTER SEQUENCE character_races_id_seq RESTART WITH 1;

-- Step 3: Insert races in correct order (matching nclass_id)
INSERT INTO character_races (name, description, hp_bonus, ki_bonus, attack_bonus, defense_bonus) VALUES
('Trái đất', 'Người Trái Đất thông minh và linh hoạt', 40, 40, 12, 12),  -- id=1, nclass_id=0
('Namek', 'Người Namek với khả năng hồi phục tuyệt vời', 30, 50, 10, 15),  -- id=2, nclass_id=1
('Saiyan', 'Chiến binh mạnh mẽ từ hành tinh Vegeta', 50, 30, 15, 10);     -- id=3, nclass_id=2

-- Step 4: Restore characters with corrected race_id
INSERT INTO characters (
  id, player_id, name, level, experience, 
  hp, max_hp, ki, max_ki, 
  attack, defense, speed, gold, location,
  critical_chance, critical_damage, dodge_chance,
  race_id, created_at
)
SELECT 
  id, player_id, name, level, experience,
  hp, max_hp, ki, max_ki,
  attack, defense, speed, gold, location,
  critical_chance, critical_damage, dodge_chance,
  -- Map old race name to new race_id
  CASE old_race_name
    WHEN 'Trái đất' THEN 1
    WHEN 'Namek' THEN 2
    WHEN 'Saiyan' THEN 3
  END as race_id,
  created_at
FROM temp_character_backup;

-- Step 5: Reset character sequence
SELECT setval('characters_id_seq', COALESCE((SELECT MAX(id) FROM characters), 0) + 1, false);

-- Step 6: Update get_character_skills() function to use direct mapping
CREATE OR REPLACE FUNCTION public.get_character_skills(p_character_id integer)
 RETURNS TABLE(nclass_id integer, skill_id integer, name character varying, slot integer, current_point smallint, max_point smallint, skill_type smallint, current_level_data jsonb)
 LANGUAGE plpgsql
AS $function$
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
            ELSE (st.skill_levels->0)::JSONB
        END AS current_level_data
    FROM skill_template st
    LEFT JOIN character_skills cs
        ON cs.nclass_id = st.nclass_id
        AND cs.skill_id = st.skill_id
        AND cs.character_id = p_character_id
    WHERE st.nclass_id = (
        -- Direct mapping: race_id 1,2,3 → nclass_id 0,1,2
        SELECT c.race_id - 1
        FROM characters c
        WHERE c.id = p_character_id
    )
    ORDER BY st.slot;
END;
$function$;

-- Step 7: Verify mapping
SELECT 
  '=== VERIFICATION ===' as status,
  cr.id as race_id,
  cr.name as race_name,
  cr.id - 1 as nclass_id,
  st.name as first_skill
FROM character_races cr
LEFT JOIN skill_template st ON st.nclass_id = cr.id - 1 AND st.slot = 0
ORDER BY cr.id;

-- Step 8: Show restored characters
SELECT 
  '=== RESTORED CHARACTERS ===' as status,
  c.id,
  c.name,
  c.race_id,
  cr.name as race_name,
  c.race_id - 1 as nclass_id
FROM characters c
JOIN character_races cr ON c.race_id = cr.id;

COMMIT;

-- Cleanup temp table
DROP TABLE IF EXISTS temp_character_backup;
