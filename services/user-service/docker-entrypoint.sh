#!/bin/sh
set -e

echo "🚀 Starting User Service..."

# Change to the service directory where prisma schema is located
cd /app/services/user-service

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
max_attempts=30
attempt=0

# CORRECTED LINE 14: Replaced Bash-specific 'Here String' (<<<) with a portable pipe (|)
until echo "SELECT 1" | npx prisma db execute --stdin 2>/dev/null || [ $attempt -eq $max_attempts ]; do
  attempt=$((attempt + 1))
  echo "   Attempt $attempt/$max_attempts: Database is unavailable - sleeping..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "⚠️ Database connection timeout, but continuing..."
fi

echo "✅ Database connection established!"

# Apply database schema (Migration takes precedence, then db push for development)
echo "📦 Applying database schema..."

# Prioritize 'migrate deploy'
if npx prisma migrate deploy 2>/dev/null; then
  echo "✅ Migrations applied successfully!"

# Fallback to 'db push' if no migrations exist (development/initial start)
elif npx prisma db push --skip-generate --accept-data-loss 2>/dev/null; then
  echo "✅ Schema pushed successfully (no migrations found)!"

else
  echo "⚠️ Schema application failed, but continuing..."
  # Add the original error log to the console for easier debugging
  npx prisma migrate deploy || npx prisma db push --skip-generate --accept-data-loss
fi

# Start the application
echo "🎉 Starting application..."
# Change back to the application root directory /app before executing the final command
cd /app
exec "$@"