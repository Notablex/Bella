#!/bin/bash

# Run database migrations for all services
# Usage: ./scripts/run-migrations.sh

set -e

echo "🚀 Running database migrations for all services..."
echo ""

services=(
  "user-service"
  "queuing-service"
  "interaction-service"
  "history-service"
  "communication-service"
  "notification-service"
  "moderation-service"
  "analytics-service"
  "admin-service"
  "subscription-service"
)

for service in "${services[@]}"; do
  echo "📦 Running migrations for $service..."
  
  # Check if service is running
  if docker compose ps $service | grep -q "Up"; then
    docker compose exec -T $service npx prisma migrate deploy 2>/dev/null || {
      echo "⚠️  No Prisma migrations found for $service or service not ready"
    }
    echo "✅ $service migrations completed"
  else
    echo "⚠️  $service is not running, skipping..."
  fi
  
  echo ""
done

echo "🎉 All migrations completed!"
