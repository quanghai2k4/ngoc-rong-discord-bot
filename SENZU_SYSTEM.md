# 🌱 HỆ THỐNG CÂY ĐẬU THẦN (SENZU BEAN SYSTEM)

## 📋 Tổng quan

Mỗi nhân vật sở hữu **1 cây đậu thần tại nhà** của hành tinh chủng tộc mình. Cây có thể **nâng cấp từ cấp 1 → 10**, mỗi cấp sẽ:
- ⏱️ Giảm thời gian sản xuất
- 🌱 Tăng số lượng đậu thu hoạch
- 💚 Tăng hiệu quả hồi phục HP/KI

## 🏠 Vị trí ban đầu theo chủng tộc

| Chủng tộc | Vị trí nhà |
|-----------|------------|
| 🌍 Trái Đất | **Nhà Kame** |
| 🟢 Namek | **Làng Moori** |
| ⚡ Saiyan | **Hành Tinh Vegeta** |

## 📊 Bảng nâng cấp (10 cấp độ)

| Cấp | Giá nâng cấp | Thời gian | Đậu/lần | HP hồi | KI hồi | Yêu cầu Lv |
|-----|--------------|-----------|---------|--------|--------|------------|
| 1 | FREE | 60 phút | 1 | 50 | 50 | 1 |
| 2 | 5,000 | 50 phút | 2 | 75 | 75 | 5 |
| 3 | 15,000 | 45 phút | 2 | 100 | 100 | 8 |
| 4 | 30,000 | 40 phút | 3 | 150 | 150 | 12 |
| 5 | 60,000 | 35 phút | 3 | 200 | 200 | 15 |
| 6 | 120,000 | 30 phút | 4 | 300 | 300 | 20 |
| 7 | 250,000 | 25 phút | 4 | 400 | 400 | 25 |
| 8 | 500,000 | 20 phút | 5 | 500 | 500 | 30 |
| 9 | 1,000,000 | 15 phút | 5 | 750 | 750 | 40 |
| 10 | 2,000,000 | 10 phút | 6 | 1000 | 1000 | 50 |

**Tổng chi phí nâng cấp full:** 3,980,000 vàng

## 🎮 Lệnh Commands

### 1. `/senzu` hoặc `zsenzu`
Xem thông tin cây đậu thần:
- Cấp độ hiện tại
- Số đậu trong kho
- Thời gian sản xuất
- Thông tin nâng cấp

### 2. `/senzu harvest` hoặc `zsenzu harvest`
Thu hoạch đậu thần (khi đã đến thời gian)

### 3. `/senzu upgrade` hoặc `zsenzu upgrade`  
Nâng cấp cây đậu thần (cần đủ vàng + level)

### 4. `/senzu use <số lượng>` hoặc `zsenzu use <số lượng>`
Sử dụng đậu thần để hồi HP/KI

## 🔄 Workflow

```
1. Tạo nhân vật → Nhận cây đậu thần cấp 1
2. Đợi 60 phút → Thu hoạch 1 đậu
3. Lên level 5 + kiếm 5K vàng → Nâng cấp lên cấp 2
4. Đợi 50 phút → Thu hoạch 2 đậu
5. Lặp lại cho đến cấp 10
```

## ⚡ Ưu điểm so với hệ thống cũ

### ❌ Cũ: Đậu thần drop từ Boss
- Drop rate thấp, RNG
- Boss khó đánh
- Phải farm nhiều

### ✅ Mới: Cây đậu thần tại nhà
- **Passive income** - không cần farm
- **Upgrade progression** - mục tiêu dài hạn
- **Gold sink** - tiêu vàng hiệu quả
- **Predictable** - biết chính xác bao giờ có đậu

## 💡 Chiến lược

### Early Game (Lv 1-10)
- Thu hoạch đều đặn mỗi 60 phút
- Tiết kiệm vàng để nâng lên cấp 2-3

### Mid Game (Lv 10-25)
- Nâng cấp lên cấp 4-6
- Đậu thần giúp farm boss dễ hơn

### Late Game (Lv 25+)
- Nâng full cấp 10
- Thu hoạch 6 đậu mỗi 10 phút
- Đậu cấp 10 hồi 1000 HP/KI - rất mạnh!

## 📈 ROI (Return on Investment)

**Cấp 2:**
- Chi phí: 5,000 vàng
- Lợi ích: +1 đậu/lần, -10 phút
- Break even: ~10 lần thu hoạch (~8.3 giờ)

**Cấp 10:**
- Chi phí: 3,980,000 vàng
- Lợi ích: 6 đậu/10 phút = 36 đậu/giờ
- Value: 36 * 1000 HP/KI = 36,000 HP/KI restore/giờ
- Equivalent to 72 "Thuốc hồi HP/KI siêu lớn" (200 gold each) = 14,400 gold/giờ
- Break even: ~277 giờ hoặc ~11.5 ngày active play

## 🗄️ Database Schema

```sql
-- Cột mới trong characters table
senzu_level INTEGER DEFAULT 1           -- Cấp độ cây (1-10)
senzu_beans INTEGER DEFAULT 0           -- Số đậu trong kho
senzu_last_harvest TIMESTAMP            -- Lần cuối thu hoạch

-- Bảng config mới
senzu_upgrade_config (
  level, 
  upgrade_cost, 
  production_time, 
  beans_per_harvest,
  bean_hp_restore,
  bean_ki_restore,
  required_character_level
)
```

## 🔧 Migration

Chạy file `database/senzu_system.sql` để:
1. Thêm 3 cột mới vào `characters`
2. Cập nhật location theo chủng tộc
3. Xóa đậu thần khỏi monster drops
4. Tạo bảng `senzu_upgrade_config`
5. Insert 10 cấp độ config

## ✅ Implementation Checklist

- [x] Database migration script
- [x] Update init.sql với cột mới
- [x] SenzuService với 5 methods:
  - `getSenzuConfig(level)`
  - `canHarvest(characterId)`
  - `harvest(characterId)`
  - `upgrade(characterId)`
  - `useSenzu(characterId, quantity)`
  - `getSenzuInfo(characterId)`
- [x] Update CharacterService.create() - set location theo race
- [ ] Create `/senzu` slash command
- [ ] Create `zsenzu` prefix command
- [ ] Update types/index.ts với senzu fields
- [ ] Update help command với senzu info
- [ ] Test migration
- [ ] Test commands

