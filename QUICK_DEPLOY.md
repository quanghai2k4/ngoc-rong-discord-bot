# 🧪 Quick Test Deployment Locally

## Test Docker Compose Setup (Không cần Discord token)

```bash
# 1. Check Docker
docker --version
docker-compose --version

# 2. Validate docker-compose.yml
docker-compose config

# 3. Build images (test only)
docker-compose build

# 4. Check image sizes
docker images | grep nrodiscord
```

## Full Local Deployment

### Prerequisites

1. **Docker & Docker Compose installed**
2. **Discord Bot Token** (get from https://discord.com/developers/applications)

### Step-by-Step

```bash
# 1. Ensure you're in project directory
cd /path/to/nrodiscord

# 2. Create .env file (if not exists)
cp .env.example .env

# 3. Edit .env - ADD YOUR DISCORD CREDENTIALS
nano .env

# Required values:
# DISCORD_TOKEN=your_bot_token_here
# DISCORD_CLIENT_ID=your_client_id_here

# 4. Run deployment script
./deploy.sh

# Or manually:
docker-compose up -d --build

# 5. Watch logs
docker-compose logs -f bot
```

### Expected Output

```
✓ Docker and Docker Compose are installed
✓ Environment variables validated
✓ Disk space OK (50GB available)
✓ Stopped existing containers
✓ Docker images built successfully
✓ Services started successfully
⏳ Waiting for health checks...
✓ All services are healthy!

Service Status:
NAME                IMAGE                    STATUS
ngoc_rong_bot       nrodiscord-bot          Up 30 seconds (healthy)
ngoc_rong_db        postgres:17-alpine      Up 35 seconds (healthy)
ngoc_rong_redis     redis:7-alpine          Up 35 seconds (healthy)
ngoc_rong_swagger   swagger-ui:latest       Up 30 seconds (healthy)

🎉 Deployment Complete!
```

### Access Services

```
Discord Bot:     Online in your Discord server
Swagger UI:      http://localhost:8081
PostgreSQL:      localhost:5432
Redis:           localhost:6379
```

### Verify Bot is Online

```bash
# Check bot logs
docker-compose logs bot | tail -30

# Should see:
# ✅ PostgreSQL is ready!
# ✅ Schema initialized!
# ✅ Data seeded!
# 🤖 Starting Discord bot...
# [INFO] Bot logged in as YourBotName#1234
# [INFO] Slash commands registered successfully
```

### Test Swagger UI

```bash
# Open in browser
xdg-open http://localhost:8081  # Linux
open http://localhost:8081      # macOS

# Or curl
curl http://localhost:8081
```

### Test Commands in Discord

```
# In your Discord server:
/start     # Create character
/profile   # View profile
/hunt      # Test combat
```

## Troubleshooting

### Issue: "An invalid token was provided"

**Solution:**
```bash
# Check your .env file
cat .env | grep DISCORD_TOKEN

# Should NOT be the example value
# If it is, edit .env with real token:
nano .env
```

### Issue: Port 5432 already in use

**Solution:**
```bash
# Option 1: Stop local PostgreSQL
sudo systemctl stop postgresql

# Option 2: Change port in docker-compose.yml
# ports:
#   - "5433:5432"  # Use 5433 on host instead
```

### Issue: Bot container keeps restarting

**Solution:**
```bash
# Check logs for error
docker-compose logs bot

# Common causes:
# 1. Invalid Discord token
# 2. Database not ready
# 3. Missing environment variables

# Fix and restart:
docker-compose restart bot
```

### Issue: Cannot connect to database

**Solution:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check health
docker inspect ngoc_rong_db --format='{{.State.Health.Status}}'
# Should be: healthy

# Test connection manually
docker-compose exec postgres psql -U postgres -d ngoc_rong_db -c "SELECT 1;"
```

## Clean Up

```bash
# Stop all services
docker-compose down

# Remove volumes (⚠️ deletes all data)
docker-compose down -v

# Remove images
docker rmi nrodiscord-bot
```

## Production Deployment

See `DEPLOYMENT.md` for full production deployment guide with:
- VPS setup
- Security hardening
- Auto-restart with systemd
- Monitoring setup
- Backup strategies
