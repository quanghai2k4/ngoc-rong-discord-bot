# 🚀 Docker Deployment Guide

## 📋 Tổng Quan

Bot được deploy với **4 Docker containers**:

```
┌─────────────────────────────────────────┐
│  🐳 Docker Compose Services             │
├─────────────────────────────────────────┤
│  1. postgres     PostgreSQL 17 Alpine   │
│  2. redis        Redis 7 Alpine         │
│  3. bot          Node.js 22 Alpine      │
│  4. swagger-ui   Swagger UI (API Docs)  │
└─────────────────────────────────────────┘
```

**Architecture:**
```
┌──────────────┐
│  Discord API │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  🤖 Bot Container (Node.js)              │
│  ├─ Discord.js client                    │
│  ├─ Command handlers                     │
│  ├─ Services (19 services)               │
│  └─ Job queue (BullMQ)                   │
└──────┬──────────────────┬────────────────┘
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│ 🐘 PostgreSQL│   │ 🔴 Redis     │
│  - Game data │   │  - Cache     │
│  - Players   │   │  - Sessions  │
│  - Items     │   │  - Jobs      │
│  - Battles   │   │  - Locks     │
└──────────────┘   └──────────────┘
       │
       ▼
┌──────────────┐
│ 📘 Swagger UI│
│  - API Docs  │
│  - Port 8081 │
└──────────────┘
```

---

## 🎯 Quick Start (3 Phút)

### Bước 1: Chuẩn Bị

```bash
# Clone repository
git clone <your-repo-url>
cd nrodiscord

# Copy environment file
cp .env.example .env

# Edit .env với Discord credentials
nano .env  # hoặc vim, code, etc.
```

**Required .env variables:**
```bash
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
```

### Bước 2: Build & Deploy

```bash
# Build và start tất cả services
docker-compose up -d --build

# Xem logs
docker-compose logs -f bot
```

### Bước 3: Verify

```bash
# Check tất cả containers đang chạy
docker-compose ps

# Expected output:
# NAME                IMAGE                    STATUS
# ngoc_rong_bot       nrodiscord-bot          Up 30 seconds (healthy)
# ngoc_rong_db        postgres:17-alpine      Up 35 seconds (healthy)
# ngoc_rong_redis     redis:7-alpine          Up 35 seconds (healthy)
```

**✅ Done! Bot đã online trên Discord!**

---

## 📦 Chi Tiết Services

### 1. PostgreSQL Container

**Image:** `postgres:17-alpine`  
**Port:** `5432` (mapped to host)  
**Volume:** `postgres_data` (persistent storage)  

**Features:**
- ✅ Auto-initialization với `init.sql`
- ✅ Auto-seeding với `seed.sql`
- ✅ Health check mỗi 5 giây
- ✅ Data persistence

**Configuration:**
```yaml
environment:
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: password
  POSTGRES_DB: ngoc_rong_db

healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 5s
  timeout: 5s
  retries: 5
```

**Connect từ host:**
```bash
psql -h localhost -U postgres -d ngoc_rong_db
# Password: password
```

### 2. Redis Container

**Image:** `redis:7-alpine`  
**Port:** `6379` (mapped to host)  
**Volume:** `redis_data` (AOF persistence)  

**Features:**
- ✅ AOF persistence enabled
- ✅ Password protected
- ✅ Health check
- ✅ Data persistence

**Configuration:**
```yaml
command: redis-server --appendonly yes --requirepass redispassword

healthcheck:
  test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
  interval: 5s
  timeout: 3s
  retries: 5
```

**Connect từ host:**
```bash
redis-cli -h localhost -p 6379 -a redispassword
```

### 3. Bot Container

**Image:** Custom build (Node.js 22 Alpine)  
**Dependencies:** postgres + redis (wait for healthy)  
**Restart policy:** Always  

**Features:**
- ✅ Multi-stage build (optimize size)
- ✅ Production dependencies only
- ✅ Non-root user (security)
- ✅ Auto database migration
- ✅ Graceful shutdown

**Build stages:**
```dockerfile
# Stage 1: Builder
- Install all dependencies
- Build TypeScript → JavaScript
- ~500MB

# Stage 2: Production
- Copy built files
- Install production deps only
- Final size: ~200MB
```

### 4. Swagger UI Container

**Image:** `swaggerapi/swagger-ui:latest`  
**Port:** `8081` (mapped to host)  
**Volume:** `./openapi.yaml` (read-only mount)  

**Features:**
- ✅ Interactive API documentation
- ✅ "Try it out" functionality
- ✅ Auto-loads từ openapi.yaml
- ✅ Health check enabled
- ✅ Lightweight (~5 MB RAM)

**Configuration:**
```yaml
environment:
  SWAGGER_JSON: /app/openapi.yaml

volumes:
  - ./openapi.yaml:/app/openapi.yaml:ro

healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/"]
  interval: 10s
  timeout: 5s
  retries: 3
```

**Access:**
```bash
# Open in browser
http://localhost:8081

# Or from terminal
xdg-open http://localhost:8081  # Linux
open http://localhost:8081      # macOS
```

**Features:**
- 📘 Interactive API documentation for 20 commands
- 🧪 Test endpoints directly from browser
- 📊 View request/response schemas
- 🔍 Search functionality
- 📱 Mobile-friendly UI

---

## 🛠️ Docker Commands

### Start/Stop Services

```bash
# Start tất cả services
docker-compose up -d

# Start specific service
docker-compose up -d bot

# Stop tất cả
docker-compose down

# Stop và xóa volumes (⚠️ xóa data)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f bot
docker-compose logs -f postgres
docker-compose logs -f redis

# Last 100 lines
docker-compose logs --tail=100 bot
```

### Restart Services

```bash
# Restart bot only
docker-compose restart bot

# Restart all
docker-compose restart
```

### Rebuild After Code Changes

```bash
# Rebuild và restart bot
docker-compose up -d --build bot

# Force rebuild (no cache)
docker-compose build --no-cache bot
docker-compose up -d bot
```

### Exec Into Containers

```bash
# Bot container
docker-compose exec bot sh

# PostgreSQL
docker-compose exec postgres psql -U postgres -d ngoc_rong_db

# Redis
docker-compose exec redis redis-cli -a redispassword
```

---

## 🔍 Health Checks & Monitoring

### Check Container Health

```bash
# Docker compose status
docker-compose ps

# Detailed inspect
docker inspect ngoc_rong_bot --format='{{.State.Health.Status}}'
```

### Monitor Resource Usage

```bash
# Real-time stats
docker stats

# Output:
# CONTAINER        CPU %    MEM USAGE / LIMIT    NET I/O
# ngoc_rong_bot    5.2%     180MiB / 2GiB       1.2kB / 850B
# ngoc_rong_db     2.1%     50MiB / 2GiB        500B / 300B
# ngoc_rong_redis  1.0%     15MiB / 2GiB        200B / 100B
```

### View Container Logs

```bash
# Stream logs
docker-compose logs -f bot

# Search errors
docker-compose logs bot | grep ERROR

# Save logs to file
docker-compose logs --no-color > deployment.log
```

---

## 🗄️ Database Management

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres ngoc_rong_db > backup.sql

# Or with timestamp
docker-compose exec postgres pg_dump -U postgres ngoc_rong_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Stop bot first
docker-compose stop bot

# Restore
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d ngoc_rong_db

# Restart bot
docker-compose start bot
```

### Reset Database (⚠️ Xóa tất cả data)

```bash
# Stop bot
docker-compose stop bot

# Drop and recreate
docker-compose exec postgres psql -U postgres -c "DROP DATABASE ngoc_rong_db;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE ngoc_rong_db;"

# Re-initialize (entrypoint sẽ tự chạy init.sql + seed.sql)
docker-compose restart bot
```

### Run SQL Query

```bash
# Interactive psql
docker-compose exec postgres psql -U postgres -d ngoc_rong_db

# One-liner query
docker-compose exec postgres psql -U postgres -d ngoc_rong_db -c "SELECT COUNT(*) FROM players;"
```

---

## 📊 Redis Management

### View Redis Data

```bash
# Connect
docker-compose exec redis redis-cli -a redispassword

# List all keys
> KEYS *

# Get specific key
> GET character:123456789012345678

# Check memory usage
> INFO memory

# Monitor commands in real-time
> MONITOR
```

### Clear Redis Cache

```bash
# Clear all (⚠️ Caution)
docker-compose exec redis redis-cli -a redispassword FLUSHALL

# Clear specific pattern
docker-compose exec redis redis-cli -a redispassword --scan --pattern "character:*" | xargs docker-compose exec -T redis redis-cli -a redispassword DEL
```

---

## 🔧 Troubleshooting

### Bot Không Start

**Kiểm tra logs:**
```bash
docker-compose logs bot
```

**Common issues:**

1. **Discord token invalid**
```
Error: An invalid token was provided
→ Check DISCORD_TOKEN in .env
```

2. **Database connection failed**
```
Error: Connection refused (postgres:5432)
→ Check postgres container health:
   docker-compose ps postgres
```

3. **Port already in use**
```
Error: Bind for 0.0.0.0:5432 failed: port is already allocated
→ Stop local PostgreSQL or change port in docker-compose.yml
```

### PostgreSQL Issues

**Cannot connect:**
```bash
# Check if running
docker-compose ps postgres

# Check health
docker inspect ngoc_rong_db --format='{{.State.Health.Status}}'

# View logs
docker-compose logs postgres
```

**Out of disk space:**
```bash
# Check volume size
docker volume inspect postgres_data

# Prune unused data
docker system prune -a --volumes
```

### Redis Issues

**Connection timeout:**
```bash
# Check Redis is running
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli -a redispassword ping
# Expected: PONG
```

### Memory Issues

**Bot using too much memory:**
```bash
# Check current usage
docker stats ngoc_rong_bot

# Set memory limit in docker-compose.yml:
bot:
  deploy:
    resources:
      limits:
        memory: 512M
```

---

## 🚀 Production Deployment

### Security Best Practices

1. **Change default passwords:**
```yaml
# docker-compose.yml
environment:
  POSTGRES_PASSWORD: <strong-random-password>
  
command: redis-server --appendonly yes --requirepass <strong-redis-password>
```

2. **Use secrets (Docker Swarm):**
```yaml
secrets:
  postgres_password:
    external: true
  redis_password:
    external: true
```

3. **Don't expose ports publicly:**
```yaml
# Remove port mappings for internal services
postgres:
  # ports:  # Commented out - only accessible from bot
  #   - "5432:5432"
```

4. **Run as non-root user:** (Already configured ✅)

### Environment-Specific Configs

**Development:**
```bash
# docker-compose.dev.yml
services:
  bot:
    command: npm run dev  # Hot reload
    volumes:
      - ./src:/app/src    # Mount source code
```

**Production:**
```bash
# docker-compose.prod.yml
services:
  bot:
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Deploy to VPS

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Clone repository
git clone <your-repo> /opt/nrodiscord
cd /opt/nrodiscord

# 4. Setup environment
cp .env.example .env
nano .env  # Add production credentials

# 5. Deploy
docker-compose up -d --build

# 6. Setup auto-restart on boot
sudo systemctl enable docker
```

### Systemd Service (Auto-restart)

```bash
# Create service file
sudo nano /etc/systemd/system/nrodiscord.service
```

```ini
[Unit]
Description=Ngoc Rong Discord Bot
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/nrodiscord
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl enable nrodiscord
sudo systemctl start nrodiscord
```

---

## 📈 Monitoring & Logging

### Centralized Logging

**Option 1: Docker logs driver**
```yaml
# docker-compose.yml
services:
  bot:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**Option 2: Syslog**
```yaml
logging:
  driver: syslog
  options:
    syslog-address: "tcp://192.168.0.1:514"
```

### Metrics with Prometheus

```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
      
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t nrodiscord:latest .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push nrodiscord:latest
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/nrodiscord
            git pull
            docker-compose up -d --build
```

---

## 📋 Checklist Trước Khi Deploy

- [ ] ✅ Copy `.env.example` → `.env`
- [ ] ✅ Điền `DISCORD_TOKEN` và `DISCORD_CLIENT_ID`
- [ ] ✅ Đổi password mặc định (Postgres, Redis)
- [ ] ✅ Check disk space: `df -h`
- [ ] ✅ Test build local: `docker-compose build`
- [ ] ✅ Review `docker-compose.yml` configs
- [ ] ✅ Setup backup strategy
- [ ] ✅ Configure monitoring/alerting
- [ ] ✅ Document credentials safely
- [ ] ✅ Test rollback procedure

---

## 🆘 Emergency Procedures

### Quick Restart

```bash
# Restart everything
docker-compose restart

# Or stop → start
docker-compose stop
docker-compose up -d
```

### Rollback to Previous Version

```bash
# Pull previous commit
git log --oneline -5  # Find commit hash
git checkout <previous-commit-hash>

# Rebuild and deploy
docker-compose up -d --build
```

### Emergency Shutdown

```bash
# Graceful shutdown
docker-compose down

# Force kill (if hung)
docker-compose kill
```

---

## 📞 Support & Resources

**Documentation:**
- Docker Docs: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose
- PostgreSQL: https://www.postgresql.org/docs
- Redis: https://redis.io/docs

**Useful Commands:**
```bash
# View all Docker resources
docker system df

# Cleanup unused data
docker system prune -a

# Export/Import images
docker save nrodiscord-bot > bot.tar
docker load < bot.tar
```

---

**🎉 Happy Deploying!**
