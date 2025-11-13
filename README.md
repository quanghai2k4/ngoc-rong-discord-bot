# 🐉 Ngọc Rồng Discord Bot

Discord RPG Bot lấy cảm hứng từ game Ngọc Rồng Online (Dragon Ball Online), được xây dựng với TypeScript, Discord.js, PostgreSQL và Docker.

## ✨ Tính năng

- 🎮 **Hệ thống nhân vật**: Tạo nhân vật với 3 chủng tộc khác nhau (Saiyan, Namek, Earthling)
- ⚔️ **Chiến đấu PvE**: Săn quái vật để kiếm kinh nghiệm và vàng
- 📊 **Hệ thống level**: Tăng cấp và nâng chỉ số
- 🎒 **Inventory**: Quản lý vật phẩm và trang bị
- 💎 **Items**: Vũ khí, áo giáp, phụ kiện và vật phẩm tiêu hao
- 🎁 **Monster drops**: Quái vật có thể rơi vật phẩm
- 📍 **Nhiều khu vực**: Rừng Karin, Sa Mạc, Căn Cứ RR, Hành Tinh Namek...

## 🏗️ Công nghệ sử dụng

- **TypeScript**: Ngôn ngữ lập trình chính
- **Discord.js v14**: Thư viện Discord bot
- **PostgreSQL**: Database
- **Docker & Docker Compose**: Containerization
- **Node.js**: Runtime environment

## 📋 Yêu cầu

- Node.js 20+
- Docker & Docker Compose
- Discord Bot Token

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone <your-repo-url>
cd nrodiscord
```

### 2. Tạo Discord Bot

1. Truy cập [Discord Developer Portal](https://discord.com/developers/applications)
2. Tạo một application mới
3. Vào tab "Bot" và tạo bot
4. Copy Bot Token
5. **Bật các Privileged Gateway Intents:**
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent (BẮT BUỘC cho prefix commands)
6. Vào tab "OAuth2" > "URL Generator"
   - Chọn scope: `bot`, `applications.commands`
   - Chọn permissions: `Send Messages`, `Use Slash Commands`, `Embed Links`, `Read Message History`
   - Copy URL và invite bot vào server của bạn

### 3. Cấu hình môi trường

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DATABASE_URL=postgresql://postgres:password@localhost:5432/ngoc_rong_db
NODE_ENV=development
```

### 4. Chạy với Docker

```bash
# Build và start services
docker-compose up -d

# Xem logs
docker-compose logs -f bot

# Stop services
docker-compose down
```

### 5. Chạy local (không dùng Docker)

```bash
# Cài đặt dependencies
npm install

# Khởi động PostgreSQL (hoặc dùng Docker chỉ cho PostgreSQL)
docker-compose up -d postgres

# Build TypeScript
npm run build

# Chạy bot
npm start

# Hoặc chạy development mode
npm run dev
```

## 🎮 Commands

Bot hỗ trợ cả Slash Commands (/) và Prefix Commands (z)

### 📝 Prefix Commands (z)

- `zstart` / `zbatdau` - Bắt đầu hành trình, tạo nhân vật
- `zprofile` / `zinfo` / `ztt` / `zthongtin` - Xem thông tin nhân vật
- `zhunt` / `zsan` / `zdanhquai` - Đi săn quái vật để kiếm EXP và vàng
- `zinventory` / `zinv` / `ztui` / `ztuido` - Xem túi đồ
- `zhelp` / `zh` / `ztrogiup` - Hiển thị hướng dẫn

### ⚡ Slash Commands (/)

- `/start` - Bắt đầu hành trình, tạo nhân vật
- `/profile` - Xem thông tin nhân vật
- `/hunt` - Đi săn quái vật
- `/inventory` - Xem túi đồ

## 📊 Database Schema

### Tables chính:

- **players**: Thông tin người chơi (Discord users)
- **characters**: Nhân vật game
- **character_races**: Các chủng tộc (Saiyan, Namek, Earthling)
- **items**: Vật phẩm trong game
- **character_items**: Inventory của nhân vật
- **monsters**: Quái vật
- **monster_drops**: Vật phẩm rơi từ quái
- **quests**: Nhiệm vụ
- **character_quests**: Tiến độ nhiệm vụ
- **battle_logs**: Lịch sử chiến đấu

## 🎨 Chủng tộc

### 🔥 Saiyan
- HP Bonus: +50
- KI Bonus: +30
- Attack Bonus: +15
- Defense Bonus: +10
- Đặc điểm: Chiến binh mạnh mẽ với sức tấn công cao

### 🟢 Namek
- HP Bonus: +30
- KI Bonus: +50
- Attack Bonus: +10
- Defense Bonus: +15
- Đặc điểm: Khả năng hồi phục và phòng thủ tốt

### 🌍 Earthling
- HP Bonus: +40
- KI Bonus: +40
- Attack Bonus: +12
- Defense Bonus: +12
- Đặc điểm: Cân bằng, linh hoạt

## 🗺️ Khu vực & Quái vật

- **Rừng Karin**: Sói Hoang (Lv1), Khủng Long (Lv3)
- **Sa Mạc**: Tên Cướp (Lv5)
- **Căn Cứ RR**: Quân Đội Ruy Băng Đỏ (Lv8)
- **Cung Điện Piccolo**: Quỷ Nhỏ (Lv10)
- **Hành Tinh Namek**: Frieza Lính (Lv15)

## ⚔️ Hệ thống chiến đấu

- Chiến đấu tự động theo lượt
- Damage tính dựa trên Attack và Defense
- Speed quyết định ai đánh trước
- Nhận EXP và Gold khi thắng
- Có tỷ lệ nhận vật phẩm từ quái
- Phạt mất 10% vàng khi thua

## 📈 Hệ thống Level

- Mỗi level cần: 100 + (level - 1) * 50 EXP
- Mỗi lần lên cấp:
  - Max HP: +20
  - Max KI: +20
  - Attack: +5
  - Defense: +5
  - Speed: +3

## 🛠️ Development

### Project structure

```
nrodiscord/
├── src/
│   ├── commands/          # Slash commands
│   ├── handlers/          # Prefix command handlers
│   ├── database/          # Database connection
│   ├── services/          # Business logic
│   ├── types/            # TypeScript types
│   └── index.ts          # Bot entry point
├── database/
│   ├── init.sql          # Database schema
│   └── seed.sql          # Initial data
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

### Scripts

```bash
npm run build      # Build TypeScript
npm run start      # Run production
npm run dev        # Run development
npm run watch      # Watch TypeScript changes
```

## 🔄 Database Migration

Khi database đã chạy, bạn có thể seed data:

```bash
# Connect to PostgreSQL container
docker exec -i ngoc_rong_db psql -U postgres -d ngoc_rong_db < database/seed.sql
```

## 🤝 Contributing

Contributions are welcome! Tạo Pull Request hoặc báo lỗi qua Issues.

## 📝 License

MIT License

## 🙏 Credits

Lấy cảm hứng từ game Ngọc Rồng Online và series Dragon Ball.

---

Made with ❤️ for Dragon Ball fans
