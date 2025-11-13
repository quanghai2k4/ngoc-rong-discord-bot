# Development Guide

## Setup

### 1. Khởi động Database (Docker)
```bash
docker-compose up -d postgres
```

### 2. Chạy Bot Local với Hot-Reload
```bash
npm run dev
```

Bot sẽ tự động restart khi bạn sửa file trong `src/`

### 3. Dừng Hot-Reload
Nhấn `Ctrl+C` trong terminal hoặc gõ `rs` để restart thủ công

## Lệnh Hữu Ích

### Database
```bash
# Kiểm tra database đang chạy
docker-compose ps

# Dừng database
docker-compose stop postgres

# Xem logs database
docker-compose logs -f postgres

# Kết nối vào PostgreSQL
psql postgresql://postgres:password@localhost:5432/ngoc_rong_db
```

### Development
```bash
# Chạy bot với hot-reload (recommended)
npm run dev

# Build TypeScript
npm run build

# Chạy production build
npm start

# Watch TypeScript compilation
npm run watch
```

## File Cấu Hình

- `.env` - Environment variables (DISCORD_TOKEN, DATABASE_URL, etc.)
- `nodemon.json` - Hot-reload configuration
- `tsconfig.json` - TypeScript compiler options

## Notes

- Database chạy trong Docker tại `localhost:5432`
- Bot chạy local với `ts-node` và auto-reload khi code thay đổi
- Không cần rebuild mỗi lần sửa code
