# Ngọc Rồng Discord Bot

Bot RPG lấy vibe Ngọc Rồng Online, viết bằng TypeScript + Discord.js + PostgreSQL + Docker. Dễ setup, dễ chơi, không màu mè.

## Tính năng chính

* Tạo nhân vật theo 3 hệ: Saiyan, Namek, Earthling
* PvE: vô săn quái cày EXP, cày vàng
* Hệ thống level và chỉ số
* Inventory: quản lý vật phẩm và trang bị
* Vật phẩm: vũ khí, giáp, phụ kiện, đồ tiêu hao
* Monster drops: quái vật có thể rơi vật phẩm
* Nhiều khu vực trong game (Rừng Karin, Sa Mạc, Căn Cứ RR, Namek...)

## Công nghệ đang chạy

* TypeScript
* Discord.js v14
* PostgreSQL
* Docker & Docker Compose
* Node.js

## Cần chuẩn bị

* Node.js 20+
* Docker & Docker Compose
* Discord Bot Token

## Cách setup nhanh

### 1. Clone repository

```bash
git clone <your-repo-url>
cd nrodiscord
```

### 2. Tạo Discord Bot

1. Truy cập Discord Developer Portal
2. Tạo Application mới
3. Vào tab Bot và tạo bot
4. Copy Bot Token
5. Bật các Privileged Gateway Intents:

   * Presence Intent
   * Server Members Intent
   * Message Content Intent (cần cho prefix)
6. Vào tab OAuth2 → URL Generator

   * Chọn scope: bot, applications.commands
   * Chọn permissions: Send Messages, Use Slash Commands, Embed Links, Read Message History
   * Copy URL và invite bot vào server

### 3. Cấu hình môi trường

```bash
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DATABASE_URL=postgresql://postgres:password@localhost:5432/ngoc_rong_db
NODE_ENV=development
```

### 4. Chạy bằng Docker

```bash
docker-compose up -d
docker-compose logs -f bot
docker-compose down
```

### 5. Chạy local (không dùng Docker)

```bash
npm install
docker-compose up -d postgres
npm run build
npm start
# Development mode
npm run dev
```

## Commands — dùng thế nào

Bot hỗ trợ Slash Commands (/) và Prefix Commands (z).

### Prefix Commands (z)

* `zstart` / `zbatdau`: tạo nhân vật
* `zprofile` / `zinfo`: xem thông tin nhân vật
* `zhunt`: săn quái kiếm EXP và vàng
* `zinventory` / `zinv`: xem túi đồ
* `zhelp`: hướng dẫn

### Slash Commands (/)

* `/start`: tạo nhân vật
* `/profile`: xem thông tin nhân vật
* `/hunt`: săn quái
* `/inventory`: xem túi đồ

## Database — cấu trúc chính

### Tables chính

* players
* characters
* character_races
* items
* character_items
* monsters
* monster_drops
* quests
* character_quests
* battle_logs

## Chủng tộc — mô tả nhanh

### Saiyan

* HP +50
* KI +30
* Attack +15
* Defense +10
* Mạnh về tấn công

### Namek

* HP +30
* KI +50
* Attack +10
* Defense +15
* Hồi phục và phòng thủ tốt

### Earthling

* HP +40
* KI +40
* Attack +12
* Defense +12
* Cân bằng

## Khu vực & quái

* Rừng Karin: Sói Hoang (Lv1), Khủng Long (Lv3)
* Sa Mạc: Tên Cướp (Lv5)
* Căn Cứ RR: Quân Đội Ruy Băng Đỏ (Lv8)
* Cung Điện Piccolo: Quỷ Nhỏ (Lv10)
* Hành Tinh Namek: Frieza lính (Lv15)

## Combat — hoạt động ra sao

* Chiến đấu theo lượt
* Damage dựa trên Attack và Defense
* Speed quyết định lượt đánh
* Thắng nhận EXP và Gold
* Có tỉ lệ rơi vật phẩm
* Thua mất 10% vàng

## Level — tăng sao cho lẹ

* EXP mỗi level: `100 + (level - 1) * 50`
* Mỗi lần lên cấp:

  * HP +20
  * KI +20
  * Attack +5
  * Defense +5
  * Speed +3

## Dev — cấu trúc project

### Project structure

```
nrodiscord/
├── src/
│   ├── commands/
│   ├── handlers/
│   ├── database/
│   ├── services/
│   ├── types/
│   └── index.ts
├── database/
│   ├── init.sql
│   └── seed.sql
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

### Scripts

```bash
npm run build
npm run start
npm run dev
npm run watch
npm run lint
npm run lint:fix
npm run clean
npm run docker:up
npm run docker:down
npm run docker:logs
npm run db:optimize
```

## Database Migration

```bash
docker exec -i ngoc_rong_db psql -U postgres -d ngoc_rong_db < database/seed.sql
npm run db:optimize
```

## Tối ưu hiệu năng

### Database

* Indexes
* Partial indexes
* Composite indexes
* VACUUM & ANALYZE

### Caching

* Cache static data (monsters, items, skills)
* TTL-based cache
* CacheService cho dynamic queries

### Code Quality

* Logger Service
* Environment validation
* ESLint
* TypeScript strict mode

## Credits

Dựa trên Ngọc Rồng Online và Dragon Ball.
