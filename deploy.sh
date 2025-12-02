#!/bin/bash

# 🚀 Ngoc Rong Discord Bot - Deployment Script
# Fast deployment script for production

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Ngọc Rồng Discord Bot - Deploy Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed!"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed!"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

print_success "Docker and Docker Compose are installed"

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found!"
    echo ""
    read -p "Do you want to copy from .env.example? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.example .env
        print_success "Created .env from .env.example"
        print_warning "⚠️  IMPORTANT: Edit .env and add your Discord credentials!"
        echo ""
        read -p "Press Enter to open .env in editor (or Ctrl+C to exit)..."
        ${EDITOR:-nano} .env
    else
        print_error "Deployment cancelled - .env file is required"
        exit 1
    fi
fi

# Validate required environment variables
print_step "Validating environment variables..."

if ! grep -q "DISCORD_TOKEN=.*[^example]" .env; then
    print_error "DISCORD_TOKEN not set in .env!"
    exit 1
fi

if ! grep -q "DISCORD_CLIENT_ID=.*[^example]" .env; then
    print_error "DISCORD_CLIENT_ID not set in .env!"
    exit 1
fi

print_success "Environment variables validated"

# Check disk space
print_step "Checking disk space..."
AVAILABLE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 2 ]; then
    print_warning "Low disk space: ${AVAILABLE_SPACE}GB available"
    print_warning "Recommended: At least 2GB free space"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "Disk space OK (${AVAILABLE_SPACE}GB available)"
fi

# Stop existing containers (if any)
print_step "Stopping existing containers..."
if docker-compose ps -q &> /dev/null; then
    docker-compose down
    print_success "Stopped existing containers"
else
    print_success "No existing containers to stop"
fi

# Build images
print_step "Building Docker images..."
echo ""
if docker-compose build --progress=plain; then
    print_success "Docker images built successfully"
else
    print_error "Failed to build Docker images"
    exit 1
fi

# Start services
echo ""
print_step "Starting services..."
echo ""
if docker-compose up -d; then
    print_success "Services started successfully"
else
    print_error "Failed to start services"
    exit 1
fi

# Wait for services to be healthy
echo ""
print_step "Waiting for services to be healthy..."
echo ""

MAX_WAIT=60
WAITED=0

while [ $WAITED -lt $MAX_WAIT ]; do
    HEALTHY_COUNT=$(docker-compose ps | grep -c "(healthy)" || true)
    
    if [ "$HEALTHY_COUNT" -eq 3 ]; then
        print_success "All services are healthy!"
        break
    fi
    
    echo -ne "\r⏳ Waiting for health checks... ${WAITED}s / ${MAX_WAIT}s"
    sleep 2
    WAITED=$((WAITED + 2))
done

echo ""

if [ $WAITED -ge $MAX_WAIT ]; then
    print_warning "Health check timeout - checking service status..."
    docker-compose ps
    echo ""
    print_warning "Some services may not be healthy yet. Check logs:"
    echo "  docker-compose logs -f"
else
    echo ""
fi

# Show service status
print_step "Service Status:"
echo ""
docker-compose ps
echo ""

# Show bot logs (last 20 lines)
print_step "Bot Logs (last 20 lines):"
echo ""
docker-compose logs --tail=20 bot
echo ""

# Final instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "Deployment Complete! 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Useful Commands:"
echo ""
echo "  View logs:           docker-compose logs -f bot"
echo "  Stop services:       docker-compose down"
echo "  Restart bot:         docker-compose restart bot"
echo "  Service status:      docker-compose ps"
echo "  Database shell:      docker-compose exec postgres psql -U postgres -d ngoc_rong_db"
echo "  Redis shell:         docker-compose exec redis redis-cli -a redispassword"
echo ""
echo "📚 Documentation: ./DEPLOYMENT.md"
echo ""
