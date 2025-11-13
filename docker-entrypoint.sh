#!/bin/sh
set -e

echo "🚀 Starting Ngoc Rong Discord Bot..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until PGPASSWORD=password psql -h postgres -U postgres -d ngoc_rong_db -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Check if tables exist
TABLE_COUNT=$(PGPASSWORD=password psql -h postgres -U postgres -d ngoc_rong_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)

if [ "$TABLE_COUNT" -eq "0" ]; then
  echo "📦 Initializing database schema..."
  PGPASSWORD=password psql -h postgres -U postgres -d ngoc_rong_db -f /app/database/init.sql
  echo "✅ Schema initialized!"
  
  echo "🌱 Seeding database..."
  PGPASSWORD=password psql -h postgres -U postgres -d ngoc_rong_db -f /app/database/seed.sql
  echo "✅ Data seeded!"
else
  echo "ℹ️  Database already initialized (found $TABLE_COUNT tables)"
fi

# Start the bot
echo "🤖 Starting Discord bot..."
exec node dist/index.js
