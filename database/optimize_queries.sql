-- Tối ưu thêm cho slow queries

-- 1. Đảm bảo UNIQUE constraint có index tối ưu (đã có sẵn từ UNIQUE)
-- PostgreSQL tự động tạo unique index cho UNIQUE(character_id, item_id)

-- 2. Analyze tables để cập nhật query planner statistics
ANALYZE character_items;
ANALYZE battle_logs;
ANALYZE characters;
ANALYZE monsters;

-- 3. Kiểm tra và reindex nếu cần (optional, chạy khi cần thiết)
-- REINDEX TABLE character_items;
-- REINDEX TABLE battle_logs;

-- 4. Vacuum để thu hồi space và cập nhật statistics
VACUUM ANALYZE character_items;
VACUUM ANALYZE battle_logs;

-- 5. Thêm index cho battle_logs nếu query theo monster_id
CREATE INDEX IF NOT EXISTS idx_battle_logs_monster ON battle_logs(monster_id);

-- 6. Kiểm tra index usage
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

