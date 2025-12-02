# 📚 API Documentation - Ngọc Rồng Discord Bot

> Comprehensive API documentation for all bot commands and services

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Command Categories](#command-categories)
3. [Command Reference](#command-reference)
   - [Character Management](#character-management)
   - [Combat & Hunting](#combat--hunting)
   - [Inventory & Equipment](#inventory--equipment)
   - [Shop & Economy](#shop--economy)
   - [Skills & Progression](#skills--progression)
   - [Quests & Achievements](#quests--achievements)
   - [Special Features](#special-features)
   - [Admin Commands](#admin-commands)
4. [Service APIs](#service-apis)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Overview

**Base Prefixes:** 
- Slash commands: `/`
- Text commands: `z`

**Authentication:** Discord OAuth2 (automatic via Discord user ID)

**Response Format:** Discord Embeds with rich formatting

**Database:** PostgreSQL with connection pooling

**Cache:** Redis (5 min TTL for character data)

---

## Command Categories

| Category | Commands | Description |
|----------|----------|-------------|
| **Character** | `/start`, `/profile`, `/rank` | Character creation and info |
| **Combat** | `/hunt`, `/boss` | PvE battles and boss fights |
| **Inventory** | `/inventory`, `/equip`, `/unequip`, `/use` | Item management |
| **Shop** | `/shop`, `/buy`, `/sell` | Economy and trading |
| **Skills** | `/skills`, `/learn` | Skill system |
| **Quests** | `/daily` | Daily quest management |
| **Special** | `/dragonballs`, `/summon`, `/senzu` | Unique features |
| **Leaderboard** | `/leaderboard` | Player rankings |
| **Admin** | `/admin` | Admin-only commands |

---

## Command Reference

### Character Management

#### `/start`
**Aliases:** `zstart`, `zbatdau`

**Description:** Tạo nhân vật mới và bắt đầu hành trình

**Parameters:** None

**Flow:**
1. Kiểm tra user đã có character chưa
2. Hiển thị menu chọn chủng tộc (3 buttons)
3. User chọn race → Tạo character
4. Khởi tạo stats theo race bonuses

**Response:**
```typescript
{
  success: boolean;
  character: {
    id: number;
    name: string;
    race: "Saiyan" | "Namek" | "Earthling";
    level: 1;
    hp: number; // Base + race bonus
    ki: number;
    attack: number;
    defense: number;
    speed: number;
  }
}
```

**Race Bonuses:**
| Race | HP | KI | ATK | DEF | Special |
|------|----|----|-----|-----|---------|
| 🔥 Saiyan | +50 | +30 | +15 | +10 | High damage |
| 🟢 Namek | +30 | +50 | +10 | +15 | Regeneration |
| 🌍 Earthling | +40 | +40 | +12 | +12 | Balanced |

**Errors:**
- `CHARACTER_ALREADY_EXISTS`: User đã có character

---

#### `/profile`
**Aliases:** `zprofile`, `zinfo`, `ztt`, `zthongtin`

**Description:** Xem thông tin chi tiết nhân vật

**Parameters:** 
- `user` (optional): Discord user - Xem profile người khác

**Response:**
```typescript
{
  character: {
    id: number;
    name: string;
    level: number;
    experience: number;
    next_level_xp: number;
    hp: number;
    max_hp: number;
    ki: number;
    max_ki: number;
    gold: number;
    rank: {
      name: string;
      color: string;
      icon: string;
      min_level: number;
    };
    stats: {
      total_xp_earned: number;
      total_monsters_killed: number;
      total_bosses_defeated: number;
      total_damage_dealt: number;
      current_win_streak: number;
      server_rank: number;
    };
    equipped_items: Item[];
  }
}
```

**Display Format:**
- Character info card
- Stats bars (HP, KI, EXP)
- Equipment list
- Combat stats
- Server ranking

---

#### `/rank`
**Aliases:** `zrank`

**Description:** Xem hệ thống rank và tiến độ

**Parameters:** None

**Ranks (8 tiers):**
```
1. Tân Thủ (Level 1-9)
2. Chiến Binh (Level 10-29)
3. Tinh Anh (Level 30-49)
4. Cao Thủ (Level 50-79)
5. Siêu Nhân (Level 80-119)
6. Bậc Thầy (Level 120-169)
7. Huyền Thoại (Level 170-229)
8. Thần (Level 230+)
```

**Response:**
```typescript
{
  current_rank: Rank;
  next_rank: Rank | null;
  all_ranks: Rank[];
  progress: {
    current_level: number;
    levels_to_next_rank: number;
    percentage: number;
  }
}
```

---

### Combat & Hunting

#### `/hunt`
**Aliases:** `zhunt`, `zsan`, `zdanhquai`

**Description:** Săn quái vật để kiếm EXP, vàng và items

**Parameters:**
- `quantity` (optional): 1-5 - Số lượng quái (default: 1)

**Flow:**
1. Validate character exists
2. Rate limit check (3s cooldown)
3. Select random monsters based on level
4. Execute battle simulation
5. Calculate rewards (XP, gold, drops)
6. Update character stats
7. Check & auto-claim daily quests

**Battle Mechanics:**
```typescript
// Turn order: Sắp xếp theo Speed (cao → thấp)
// Damage calculation:
baseDamage = attacker.attack - (defender.defense * 0.5);
variance = Math.random() * 0.2 + 0.9; // 90-110%
critChance = character.critical_chance || 5%;
critMultiplier = character.critical_damage || 1.5;
finalDamage = baseDamage * variance * (isCrit ? critMultiplier : 1);

// Skill usage:
if (hasSkill && currentKI >= skill.ki_cost && Math.random() < 0.65) {
  useSkill();
}

// KI regeneration: +10 per turn
```

**Response:**
```typescript
{
  won: boolean;
  rounds: BattleRound[];
  monstersDefeated: number;
  expGained: number;
  goldGained: number;
  itemsDropped: Item[];
  leveledUp: boolean;
  newLevel?: number;
  questRewards: QuestReward[];
}
```

**Example Output:**
```
⚔️ BATTLE REPORT
━━━━━━━━━━━━━━━━
Round 1:
⚡ Bạn tung Kamehameha! Gây 250 damage! 💥 CHÍ MẠNG!
👊 Sói Hoang đánh thẳng gây 45 damage!

Round 2:
⚔️ Bạn đánh thẳng vào Sói Hoang! Kết liễu! 💥

✅ VICTORY!
💰 +150 gold | ⭐ +80 XP
🎁 Items: Senzu Bean x1
```

**Drop Rates:**
- Common items: 15-30%
- Uncommon: 5-15%
- Rare: 1-5%
- Dragon Balls: 1% (from bosses)

**Errors:**
- `CHARACTER_NOT_FOUND`
- `RATE_LIMIT_EXCEEDED`: Cooldown 3s
- `INSUFFICIENT_HP`: HP < 10%

---

#### `/boss`
**Aliases:** `zboss`

**Description:** Thách đấu boss với live battle animation

**Parameters:** None

**Boss Selection:**
```typescript
// Auto-select boss based on character level
if (level < 5) → Sói Hoang Thủ Lĩnh (Lv3)
if (level < 10) → Khủng Long Bạo Chúa (Lv8)
if (level < 15) → Tên Cướp Đầu Đảng (Lv12)
if (level < 20) → Quân Đội RR Đại Úy (Lv18)
if (level < 25) → Quỷ Nhỏ Piccolo (Lv22)
else → Frieza Lính Tinh Nhuệ (Lv25)
```

**Battle Features:**
- Live animation (updates every 2s)
- Real-time HP bars
- Turn-by-turn actions
- Boss có skills mạnh hơn
- Rewards gấp 3x hunt

**Response:**
```typescript
{
  // Same as /hunt but with:
  boss: {
    name: string;
    level: number;
    hp: number;
    is_boss: true;
  };
  expGained: number; // Base * 3
  goldGained: number; // Base * 3
  special_drops: Item[]; // Rare items only from bosses
}
```

**Animation Example:**
```
╭─────────────────────────╮
│ 🐉 BOSS BATTLE         │
├─────────────────────────┤
│ 👹 Frieza Lính         │
│ HP: ████████░░ 80%     │
│                         │
│ 👤 Goku                │
│ HP: ██████████ 100%    │
│ KI: ████████░░ 85%     │
├─────────────────────────┤
│ Round 3/50             │
╰─────────────────────────╯

⚡ Bạn tung Spirit Bomb!
💥 CHÍ MẠNG! 850 damage!
👹 Frieza tung Death Beam!
💢 320 damage!
```

---

### Inventory & Equipment

#### `/inventory`
**Aliases:** `zinventory`, `zinv`, `ztui`, `ztuido`

**Description:** Xem túi đồ và items

**Parameters:**
- `filter` (optional): "weapon" | "armor" | "accessory" | "consumable"

**Response:**
```typescript
{
  items: {
    id: number;
    name: string;
    type: string;
    rarity: string;
    quantity: number;
    stats?: {
      attack?: number;
      defense?: number;
      hp?: number;
      ki?: number;
    };
    equipped: boolean;
    can_equip: boolean;
    sell_price: number;
  }[];
  total_items: number;
  total_value: number;
}
```

**Item Types:**
- 🗡️ Weapon (TYPE_ID: 0-2)
- 🛡️ Armor (TYPE_ID: 3-5)
- 💍 Accessory (TYPE_ID: 6-9)
- 🧪 Consumable (TYPE_ID: 10-14)

**Display Format:**
```
╭────────────────────────╮
│ 🎒 TÚI ĐỒ            │
├────────────────────────┤
│ 🗡️ WEAPONS           │
│ • Katana +5           │
│   ⚔️ +50 ATK         │
│   [EQUIPPED]          │
│                        │
│ 🛡️ ARMOR             │
│ • Dragon Vest x1      │
│   🛡️ +80 DEF         │
│   💰 1,500 gold      │
╰────────────────────────╯
```

---

#### `/equip`
**Aliases:** `zequip`

**Description:** Trang bị item

**Parameters:**
- `item_id` (required): number - ID của item cần equip

**Validation:**
- Item phải có trong inventory
- Item phải có thể equip (not consumable)
- Tự động unequip item cũ cùng slot

**Equipment Slots:**
```typescript
Weapon: 1 slot
Body Armor: 1 slot  
Legs Armor: 1 slot
Accessory: 2 slots (ring, necklace)
```

**Response:**
```typescript
{
  success: boolean;
  equipped_item: Item;
  old_item?: Item; // Item bị thay thế
  stats_change: {
    attack: number;
    defense: number;
    hp: number;
    ki: number;
  };
}
```

**Errors:**
- `ITEM_NOT_FOUND`
- `ITEM_NOT_EQUIPPABLE`
- `WRONG_RACE`: Item không phù hợp race

---

#### `/unequip`
**Aliases:** `zunequip`

**Description:** Tháo item đang trang bị

**Parameters:**
- `slot` (required): "weapon" | "body" | "legs" | "accessory_1" | "accessory_2"

**Response:**
```typescript
{
  success: boolean;
  unequipped_item: Item;
  stats_change: {
    attack: number;
    defense: number;
    hp: number;
    ki: number;
  };
}
```

---

#### `/use`
**Aliases:** `zuse`

**Description:** Sử dụng item tiêu hao (consumable)

**Parameters:**
- `item_id` (required): number
- `quantity` (optional): number (default: 1)

**Consumable Types:**
- 💊 Potion: Hồi HP
- 🧃 Elixir: Hồi KI
- 🌱 Senzu Bean: Hồi full HP + KI
- 📜 Scroll: Tăng stats tạm thời
- 🎁 Gift Box: Random rewards

**Response:**
```typescript
{
  success: boolean;
  item_used: Item;
  quantity_used: number;
  effects: {
    hp_restored?: number;
    ki_restored?: number;
    buff_applied?: string;
  };
  remaining_quantity: number;
}
```

---

### Shop & Economy

#### `/shop`
**Aliases:** `zshop`

**Description:** Xem danh sách items trong shop

**Parameters:**
- `category` (optional): "weapon" | "armor" | "accessory" | "consumable" | "all"
- `page` (optional): number (default: 1)

**Shop Inventory:**
```typescript
{
  items: {
    id: number;
    name: string;
    type: string;
    price: number;
    required_level?: number;
    required_race?: string;
    in_stock: boolean;
    stats: ItemStats;
  }[];
  page: number;
  total_pages: number;
  player_gold: number;
}
```

**Price Ranges:**
- Common: 100-1,000 gold
- Uncommon: 1,000-10,000 gold
- Rare: 10,000-100,000 gold
- Legendary: 100,000+ gold

---

#### `/buy`
**Aliases:** `zbuy`

**Description:** Mua item từ shop

**Parameters:**
- `item_id` (required): number
- `quantity` (optional): number (default: 1)

**Validation:**
- Check player gold
- Check level requirement
- Check race requirement
- Check inventory space (max 100 unique items)

**Response:**
```typescript
{
  success: boolean;
  item_bought: Item;
  quantity: number;
  total_cost: number;
  remaining_gold: number;
}
```

**Errors:**
- `INSUFFICIENT_GOLD`
- `LEVEL_REQUIREMENT_NOT_MET`
- `RACE_REQUIREMENT_NOT_MET`
- `INVENTORY_FULL`

---

#### `/sell`
**Aliases:** `zsell`

**Description:** Bán item từ inventory

**Parameters:**
- `item_id` (required): number
- `quantity` (optional): number (default: 1)

**Sell Price:** 50% of buy price

**Response:**
```typescript
{
  success: boolean;
  item_sold: Item;
  quantity: number;
  gold_earned: number;
  total_gold: number;
}
```

**Note:** Equipped items không thể bán (phải unequip trước)

---

### Skills & Progression

#### `/skills`
**Aliases:** `zskills`

**Description:** Xem danh sách skills đã học

**Parameters:** None

**Skill Categories:**
```typescript
Type 1: Tấn công (Attack)
Type 2: Hồi máu (Heal) 
Type 3: Hỗ trợ (Buff/Debuff)
Type 4: Đặc biệt (Special)
```

**Response:**
```typescript
{
  skills: {
    id: number;
    name: string;
    type: number;
    damage_multiplier: number;
    ki_cost: number;
    crit_bonus: number;
    defense_break: number;
    stun_chance: number;
    is_aoe: boolean;
    description: string;
  }[];
  total_skills: number;
  available_ki: number;
}
```

**Example Skills:**
```
⚡ Kamehameha
   Type: Tấn công
   Damage: 2.5x
   KI Cost: 30
   Crit Bonus: +10%
   
🌟 Spirit Bomb
   Type: Đặc biệt
   Damage: 5.0x
   KI Cost: 100
   AoE: Yes
   Stun: 50%
```

---

#### `/learn`
**Aliases:** `zlearn`

**Description:** Học skill mới

**Parameters:**
- `skill_id` (required): number

**Requirements:**
- Level requirement
- Race requirement (some skills)
- Gold cost
- Skill points

**Skill Trees:**
```
Saiyan:
- Kamehameha (Lv10, 1000 gold)
- Super Kamehameha (Lv30, 10000 gold)
- Final Flash (Lv50, 50000 gold)

Namek:
- Special Beam Cannon (Lv10)
- Regeneration (Lv20)
- Giant Form (Lv40)

Earthling:
- Solar Flare (Lv5)
- Destructo Disc (Lv25)
- Spirit Bomb (Lv60)
```

**Response:**
```typescript
{
  success: boolean;
  skill_learned: Skill;
  gold_spent: number;
  remaining_gold: number;
}
```

**Errors:**
- `SKILL_ALREADY_LEARNED`
- `LEVEL_TOO_LOW`
- `INSUFFICIENT_GOLD`
- `WRONG_RACE`

---

### Quests & Achievements

#### `/daily`
**Aliases:** `zdaily`

**Description:** Xem daily quests với interactive UI

**Parameters:**
- `action` (optional): "refresh" | "claim_all"

**Quest Types:**
```typescript
kill_monsters: Giết X quái cụ thể
defeat_boss: Đánh bại boss
use_skills: Dùng skill X lần
complete_hunts: Hoàn thành X hunts
earn_gold: Kiếm X vàng
```

**Daily Quest System:**
- Auto-assign: 5 quests mỗi ngày
- Reset: 00:00 UTC+7
- Auto-claim: Rewards tự động khi complete
- Progress tracking: Real-time

**Response:**
```typescript
{
  quests: {
    id: number;
    name: string;
    description: string;
    quest_type: string;
    progress: number;
    required_amount: number;
    completed: boolean;
    claimed: boolean;
    rewards: {
      exp: number;
      gold: number;
      item?: Item;
    };
  }[];
  completed_count: number;
  total_count: number;
}
```

**UI Features:**
- 🔄 Refresh button: Cập nhật real-time
- 🎁 Claim All button: Nhận tất cả rewards
- Progress bars cho mỗi quest
- Icons theo quest type

**Example Display:**
```
📜 Daily Quests Board
─────────────────────
Tiến độ: 3/5 hoàn thành • 1 chưa nhận

✅ ⚔️ Săn Mồi Cơ Bản
██████████ 100%
> Giết 10 quái bất kỳ
> Tiến độ: 10/10 • Hoàn thành - Chưa nhận
🎁 Phần thưởng: 500 EXP • 1,000 Gold

⏳ 👹 Boss Slayer
████░░░░░░ 40%
> Đánh bại 5 bosses
> Tiến độ: 2/5 • Đang làm
🎁 Phần thưởng: 2,000 EXP • 5,000 Gold • Senzu Bean

[🔄 Cập nhật] [🎁 Nhận tất cả (1)]
```

---

### Special Features

#### `/dragonballs`
**Aliases:** `zdragonballs`, `zdb`

**Description:** Xem Dragon Balls đã thu thập

**Parameters:** None

**Dragon Ball System:**
- 7 viên ngọc rồng: ⭐ → ⭐⭐⭐⭐⭐⭐⭐
- Drop from bosses (1% chance)
- Can trade between players
- Collect full set to summon Shenron/Porunga

**Response:**
```typescript
{
  collected_balls: number[]; // [1, 3, 5, 7]
  total_collected: number; // 4
  missing_balls: number[]; // [2, 4, 6]
  can_summon: boolean;
  summon_type?: "shenron" | "porunga";
}
```

**Display:**
```
🐉 Dragon Ball Collection
━━━━━━━━━━━━━━━━━━━━━━
⭐ Dragon Ball 1-sao: ✅
⭐⭐ Dragon Ball 2-sao: ❌
⭐⭐⭐ Dragon Ball 3-sao: ✅
⭐⭐⭐⭐ Dragon Ball 4-sao: ❌
⭐⭐⭐⭐⭐ Dragon Ball 5-sao: ✅
⭐⭐⭐⭐⭐⭐ Dragon Ball 6-sao: ❌
⭐⭐⭐⭐⭐⭐⭐ Dragon Ball 7-sao: ✅

Progress: 4/7 (57%)
Còn thiếu: 2-sao, 4-sao, 6-sao
```

---

#### `/summon`
**Aliases:** `zsummon`

**Description:** Triệu hồi Shenron/Porunga khi có đủ 7 viên

**Parameters:**
- `dragon` (required): "shenron" | "porunga"
- `wish` (required): 1-3

**Shenron Wishes (Earth Dragon):**
```
1. Immortality: +50% max HP (permanent)
2. Power: +10 levels instant
3. Wealth: +1,000,000 gold
```

**Porunga Wishes (Namek Dragon):**
```
1. Resurrection: Revive (hardcore mode)
2. Potential Unlock: +20% all stats
3. Rare Item: Random legendary item
```

**Wish Limitations:**
- 1 wish per character per 30 days
- Dragon Balls scatter sau khi summon (mất hết)
- Cooldown: 30 days

**Response:**
```typescript
{
  success: boolean;
  dragon: "shenron" | "porunga";
  wish_granted: string;
  effects: {
    hp_bonus?: number;
    levels_gained?: number;
    gold_gained?: number;
    item_received?: Item;
    stats_bonus?: number;
  };
  next_summon_available: Date;
}
```

**Animation:**
```
🐉✨ SHENRON HAS BEEN SUMMONED! ✨🐉

"Nói đi, ta sẽ thực hiện một điều ước!"

⚡ Bạn đã chọn: IMMORTALITY

🌟 Wish granted! 🌟
+50% Max HP (1,000 → 1,500)

🎆 Dragon Balls scatter across the world...
```

**Errors:**
- `INSUFFICIENT_DRAGON_BALLS`
- `WISH_ON_COOLDOWN`
- `INVALID_WISH`

---

#### `/senzu`
**Aliases:** `zsenzu`

**Description:** Quản lý cây Đậu Thần (Senzu Bean farming)

**Subcommands:**

##### `/senzu info`
Xem thông tin cây đậu thần

**Response:**
```typescript
{
  tree_level: number; // 1-10
  production_time: number; // minutes
  beans_per_harvest: number;
  bean_restore: {
    hp: number;
    ki: number;
  };
  next_harvest: Date;
  can_harvest: boolean;
  minutes_remaining: number;
  total_beans: number;
}
```

##### `/senzu harvest`
Thu hoạch đậu thần

**Cooldown:** Theo cấp cây (15-60 phút)

**Response:**
```typescript
{
  success: boolean;
  beans_harvested: number;
  total_beans: number;
  next_harvest: Date;
}
```

##### `/senzu upgrade`
Nâng cấp cây đậu thần (1→10)

**Upgrade Table:**
| Level | Cost | Time | Beans/Harvest | HP/KI Restore | Req Level |
|-------|------|------|---------------|---------------|-----------|
| 1 | FREE | 60m | 1 | 50/50 | 1 |
| 2 | 5,000 | 50m | 2 | 75/75 | 5 |
| 3 | 15,000 | 45m | 2 | 100/100 | 8 |
| 5 | 60,000 | 35m | 3 | 200/200 | 15 |
| 10 | 10,000,000 | 15m | 6 | 1000/1000 | 50 |

**Response:**
```typescript
{
  success: boolean;
  new_level: number;
  gold_spent: number;
  new_stats: {
    production_time: number;
    beans_per_harvest: number;
    restore_amount: number;
  };
}
```

**Errors:**
- `MAX_LEVEL_REACHED`
- `INSUFFICIENT_GOLD`
- `LEVEL_REQUIREMENT_NOT_MET`

##### `/senzu use`
Sử dụng đậu thần để hồi HP/KI

**Parameters:**
- `quantity` (required): 1-10

**Response:**
```typescript
{
  success: boolean;
  quantity_used: number;
  hp_restored: number;
  ki_restored: number;
  remaining_beans: number;
}
```

**Display Example:**
```
🌱 CÂY ĐẬU THẦN
━━━━━━━━━━━━━━━━
Cấp độ: ⭐⭐⭐⭐⭐ (5/10)

⏱️ Thời gian sản xuất: 35 phút
🌱 Thu hoạch: 3 đậu/lần
💚 Hiệu quả: 200 HP + 200 KI

📦 Kho: 15 đậu thần
⏰ Harvest tiếp theo: 12 phút

[🌾 Thu hoạch] [⬆️ Nâng cấp]
```

---

#### `/leaderboard`
**Aliases:** `zleaderboard`, `zlb`, `zbxh`

**Description:** Xem bảng xếp hạng server

**Parameters:**
- `type` (optional): "level" | "gold" | "kills" | "damage"
- `limit` (optional): 10-100 (default: 10)

**Leaderboard Types:**
```typescript
level: Top players by level
gold: Top richest players
kills: Top monster hunters
damage: Top damage dealers
bosses: Top boss killers
```

**Response:**
```typescript
{
  leaderboard: {
    rank: number;
    player: {
      discord_id: string;
      username: string;
      character_name: string;
    };
    value: number; // Level/Gold/Kills tùy type
    rank_info: Rank;
    race: string;
  }[];
  your_rank?: number;
  total_players: number;
}
```

**Display:**
```
🏆 SERVER LEADERBOARD - TOP LEVEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 👑 Goku (Saiyan)
   Level 89 • Thần • 1.2M XP

2. 🥈 Vegeta (Saiyan)  
   Level 85 • Huyền Thoại • 980K XP

3. 🥉 Piccolo (Namek)
   Level 78 • Cao Thủ • 750K XP

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Rank: #47 (Level 23)
```

---

### Admin Commands

#### `/admin`
**Aliases:** `zadmin`

**Permission:** Admin role only

**Subcommands:**

##### `/admin give_gold`
Cấp vàng cho player

**Parameters:**
- `user` (required): Discord user
- `amount` (required): number

##### `/admin give_xp`
Cấp XP cho player

**Parameters:**
- `user` (required): Discord user
- `amount` (required): number

##### `/admin give_item`
Cấp item cho player

**Parameters:**
- `user` (required): Discord user
- `item_id` (required): number
- `quantity` (optional): number (default: 1)

##### `/admin set_level`
Set level cho player

**Parameters:**
- `user` (required): Discord user
- `level` (required): 1-300

##### `/admin reset_character`
Reset character (xóa data)

**Parameters:**
- `user` (required): Discord user
- `confirm` (required): boolean

##### `/admin server_stats`
Xem thống kê server

**Response:**
```typescript
{
  total_players: number;
  total_characters: number;
  total_battles: number;
  total_gold_in_economy: number;
  active_players_24h: number;
  top_level: number;
  average_level: number;
}
```

**Errors:**
- `PERMISSION_DENIED`: User không phải admin

---

## Service APIs

### CharacterService

```typescript
class CharacterService {
  // Tạo character mới
  static async create(
    discordId: string,
    username: string,
    raceId: number
  ): Promise<Character>;

  // Tìm character theo player ID
  static async findByPlayerId(playerId: number): Promise<Character | null>;

  // Tìm character với Redis cache
  static async findByPlayerIdCached(
    playerId: number,
    discordId: string
  ): Promise<Character | null>;

  // Thêm EXP và auto level-up
  static async addExperience(
    characterId: number,
    exp: number
  ): Promise<Character>;

  // Update stats
  static async updateStats(
    characterId: number,
    stats: Partial<Character>,
    discordId?: string
  ): Promise<void>;

  // Invalidate cache
  static async invalidateCache(discordId: string): Promise<void>;
}
```

---

### XPService

```typescript
class XPService {
  // Tính XP cần cho level tiếp theo
  static calculateRequiredXP(currentLevel: number): number;
  // Formula: 100 * (level ^ 1.8)

  // Tính tổng XP để đạt level cụ thể
  static calculateTotalXPForLevel(targetLevel: number): number;

  // Thêm XP với auto level-up
  static async addXP(
    characterId: number,
    xpAmount: number,
    activityType: 'hunt' | 'boss' | 'quest' | 'daily_quest',
    description: string
  ): Promise<{
    levelsGained: number;
    oldLevel: number;
    newLevel: number;
    totalXP: number;
    nextLevelXP: number;
  }>;

  // Tính XP bonus theo activity
  static calculateActivityXP(
    type: 'hunt' | 'boss' | 'quest' | 'daily_quest',
    baseXP: number,
    level: number
  ): number;
  // Multipliers: hunt 1x, boss 3x, quest 2x, daily 1.5x
  // Level scaling: +2% per level

  // Get rank by level
  static async getRankByLevel(level: number): Promise<Rank | null>;

  // Get character with rank & stats
  static async getCharacterWithRank(
    characterId: number
  ): Promise<CharacterWithRank | null>;

  // Get leaderboard
  static async getLeaderboard(limit: number): Promise<CharacterWithRank[]>;
}
```

---

### BattleService

```typescript
class BattleService {
  // Execute battle
  static async battle(
    character: Character,
    monsters: Monster[]
  ): Promise<BattleResult>;

  // Battle result structure
  interface BattleResult {
    won: boolean;
    rounds: BattleRound[];
    monstersDefeated: number;
    expGained: number;
    goldGained: number;
    itemsDropped: Item[];
    characterDied: boolean;
    leveledUp: boolean;
    newLevel?: number;
    questRewards: QuestReward[];
  }

  // Battle round structure
  interface BattleRound {
    round: number;
    characterAction: string;
    monsterActions: string[];
    actions: string[]; // Turn order
    characterHp: number;
    monsterStates: MonsterState[];
    characterKi: number;
  }
}
```

**Battle Algorithm:**
1. Initialize monster instances
2. Load skills (character + monsters)
3. Calculate turn order by speed
4. Execute actions per turn:
   - Check stun status
   - AI skill selection (65% chance)
   - Calculate damage with variance
   - Apply crits, dodge, stun
   - Update HP/KI
5. Check victory/defeat
6. Calculate rewards
7. Auto-claim quest progress

---

### SenzuService

```typescript
class SenzuService {
  // Get config by level
  static async getSenzuConfig(level: number): Promise<SenzuConfig | null>;

  // Check if can harvest
  static async canHarvest(characterId: number): Promise<{
    canHarvest: boolean;
    minutesRemaining: number;
    beansReady: number;
  }>;

  // Harvest beans
  static async harvest(characterId: number): Promise<{
    success: boolean;
    message: string;
    beansHarvested: number;
    totalBeans: number;
  }>;

  // Upgrade tree
  static async upgrade(characterId: number): Promise<{
    success: boolean;
    message: string;
    newLevel?: number;
  }>;

  // Use senzu bean
  static async useSenzuBean(
    characterId: number,
    quantity: number
  ): Promise<{
    success: boolean;
    hpRestored: number;
    kiRestored: number;
    remainingBeans: number;
  }>;
}
```

---

### DragonBallService

```typescript
class DragonBallService {
  // Get collection status
  static async getCollection(characterId: number): Promise<{
    collected_balls: number[];
    total_collected: number;
    missing_balls: number[];
    can_summon: boolean;
  }>;

  // Add dragon ball
  static async addDragonBall(
    characterId: number,
    ballNumber: number
  ): Promise<boolean>;

  // Summon dragon
  static async summonDragon(
    characterId: number,
    dragonType: 'shenron' | 'porunga',
    wishNumber: number
  ): Promise<{
    success: boolean;
    wish_granted: string;
    effects: WishEffects;
    next_summon: Date;
  }>;

  // Check summon cooldown
  static async canSummon(characterId: number): Promise<boolean>;
}
```

---

### DailyQuestService

```typescript
class DailyQuestService {
  // Get character daily quests
  static async getCharacterDailyQuests(
    characterId: number
  ): Promise<DailyQuest[]>;

  // Update quest progress
  static async updateQuestProgress(
    characterId: number,
    questType: string,
    targetId: number | null,
    amount: number
  ): Promise<QuestReward[]>; // Auto-claim on complete

  // Reset daily quests (cron job)
  static async resetDailyQuests(): Promise<void>;

  // Assign random quests
  static async assignDailyQuests(characterId: number): Promise<void>;
}
```

---

### RedisService

```typescript
class RedisService {
  // Cache character data
  static async cacheCharacter(
    discordId: string,
    character: any,
    ttl: number = 300
  ): Promise<void>;

  // Get cached character
  static async getCachedCharacter(discordId: string): Promise<any | null>;

  // Invalidate character cache
  static async invalidateCharacter(discordId: string): Promise<void>;

  // Rate limiting
  static async checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }>;

  // Set/Get generic cache
  static async set(key: string, value: any, ttl?: number): Promise<void>;
  static async get(key: string): Promise<any | null>;
  static async del(key: string): Promise<void>;
}
```

---

## Error Handling

### Error Codes

```typescript
enum ErrorCode {
  // Character errors
  CHARACTER_NOT_FOUND = 'CHARACTER_NOT_FOUND',
  CHARACTER_ALREADY_EXISTS = 'CHARACTER_ALREADY_EXISTS',
  
  // Combat errors
  INSUFFICIENT_HP = 'INSUFFICIENT_HP',
  BATTLE_IN_PROGRESS = 'BATTLE_IN_PROGRESS',
  
  // Item errors
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  ITEM_NOT_EQUIPPABLE = 'ITEM_NOT_EQUIPPABLE',
  INSUFFICIENT_GOLD = 'INSUFFICIENT_GOLD',
  INVENTORY_FULL = 'INVENTORY_FULL',
  
  // Skill errors
  SKILL_NOT_FOUND = 'SKILL_NOT_FOUND',
  SKILL_ALREADY_LEARNED = 'SKILL_ALREADY_LEARNED',
  INSUFFICIENT_KI = 'INSUFFICIENT_KI',
  
  // Quest errors
  QUEST_NOT_FOUND = 'QUEST_NOT_FOUND',
  QUEST_ALREADY_COMPLETED = 'QUEST_ALREADY_COMPLETED',
  
  // Permission errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // Rate limit
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  LEVEL_REQUIREMENT_NOT_MET = 'LEVEL_REQUIREMENT_NOT_MET',
  RACE_REQUIREMENT_NOT_MET = 'RACE_REQUIREMENT_NOT_MET',
}
```

### Error Response Format

```typescript
{
  success: false,
  error: {
    code: ErrorCode,
    message: string,
    details?: any
  }
}
```

### Common Errors

**CHARACTER_NOT_FOUND:**
```json
{
  "success": false,
  "error": {
    "code": "CHARACTER_NOT_FOUND",
    "message": "❌ Bạn chưa tạo nhân vật! Dùng `/start` để bắt đầu."
  }
}
```

**RATE_LIMIT_EXCEEDED:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "⏰ Cooldown! Vui lòng đợi 2.5s",
    "details": {
      "resetAt": "2024-01-01T00:00:05.000Z"
    }
  }
}
```

**INSUFFICIENT_GOLD:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_GOLD",
    "message": "💰 Không đủ vàng! Cần 5,000 gold, bạn có 1,000 gold",
    "details": {
      "required": 5000,
      "current": 1000
    }
  }
}
```

---

## Rate Limiting

### Rate Limit Configuration

```typescript
const RATE_LIMITS = {
  hunt: {
    points: 1,
    duration: 3000, // 3 seconds
  },
  boss: {
    points: 1,
    duration: 5000, // 5 seconds
  },
  shop: {
    points: 1,
    duration: 1000, // 1 second
  },
  daily: {
    points: 1,
    duration: 2000, // 2 seconds
  },
  global: {
    points: 10,
    duration: 60000, // 10 commands per minute
  }
};
```

### Rate Limit Headers (in embed footer)

```
⏰ Cooldown: 2.5s remaining
⚡ Rate: 7/10 commands per minute
```

### Rate Limit Strategy

- **Per-user per-command**: Prevent spam
- **Global per-user**: 10 commands/minute
- **Redis-based**: Distributed rate limiting
- **Sliding window**: Fair rate limiting

---

## Database Schema

### Main Tables

```sql
-- Players
players (
  id SERIAL PRIMARY KEY,
  discord_id VARCHAR(255) UNIQUE,
  username VARCHAR(255),
  created_at TIMESTAMP
)

-- Characters
characters (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id),
  name VARCHAR(255),
  race_id INTEGER REFERENCES character_races(id),
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  hp INTEGER,
  max_hp INTEGER,
  ki INTEGER,
  max_ki INTEGER,
  gold INTEGER DEFAULT 0,
  senzu_beans INTEGER DEFAULT 0,
  senzu_level INTEGER DEFAULT 1,
  senzu_last_harvest TIMESTAMP
)

-- Items
items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  type INTEGER,
  rarity VARCHAR(50),
  attack INTEGER,
  defense INTEGER,
  hp_bonus INTEGER,
  ki_bonus INTEGER,
  buy_price INTEGER,
  sell_price INTEGER,
  required_level INTEGER
)

-- Monsters
monsters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  level INTEGER,
  hp INTEGER,
  attack INTEGER,
  defense INTEGER,
  speed INTEGER,
  experience_reward INTEGER,
  gold_reward INTEGER,
  is_boss BOOLEAN DEFAULT FALSE
)

-- Skills
skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  type INTEGER,
  damage_multiplier DECIMAL,
  ki_cost INTEGER,
  crit_bonus DECIMAL,
  defense_break DECIMAL,
  stun_chance DECIMAL,
  is_aoe BOOLEAN
)
```

---

## Performance Optimizations

### Caching Strategy

```typescript
// 1. GameDataCache (Memory)
- Monsters: Load once on startup
- Items: Load once on startup  
- Skills: Load once on startup
- TTL: Until restart

// 2. RedisCache (Distributed)
- Character data: 5 min TTL
- Quest progress: 1 min TTL
- Shop items: 10 min TTL
- Leaderboard: 5 min TTL
```

### Database Indexes

```sql
CREATE INDEX idx_players_discord_id ON players(discord_id);
CREATE INDEX idx_characters_player_id ON characters(player_id);
CREATE INDEX idx_character_items_equipped ON character_items(character_id, equipped);
CREATE INDEX idx_monsters_is_boss ON monsters(is_boss);
CREATE INDEX idx_battle_logs_date ON battle_logs(created_at DESC);
```

### Query Optimization

- Connection pooling: 30 connections
- Prepared statements: Prevent SQL injection
- Batch inserts: Battle logs, quest updates
- Lazy loading: Items loaded on demand

---

## Testing

### Unit Tests

```bash
npm test                # Run all tests
npm run test:coverage   # With coverage
npm run test:watch      # Watch mode
```

**Test Coverage:**
- XPService: 14 tests
- SenzuService: 12 tests
- Helpers: 33 tests
- **Total: 59 tests**

---

## Deployment

### Docker Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f bot

# Stop services
docker-compose down
```

**Services:**
- `bot`: Discord bot (Node.js)
- `postgres`: Database
- `redis`: Cache & rate limiting

---

## Support & Links

- **GitHub:** [Repository URL]
- **Discord Server:** [Invite link]
- **Documentation:** [Docs URL]
- **Report Issues:** GitHub Issues

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Character creation (3 races)
- ✅ Battle system (PvE + Boss)
- ✅ Items system (1,429 items)
- ✅ Dragon Ball Collection
- ✅ Senzu Bean System
- ✅ Daily Quests
- ✅ Skills & Progression
- ✅ Shop & Economy
- ✅ Leaderboard
- ✅ Unit Tests (59 tests)

---

**Last Updated:** December 3, 2025  
**API Version:** 1.0.0  
**Documentation Version:** 1.0.0
