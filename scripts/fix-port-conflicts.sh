#!/bin/bash

# Fix port conflicts by stopping all Docker containers and starting fresh
# Usage: ./scripts/fix-port-conflicts.sh

set -e

echo "🔧 Fixing Docker port conflicts..."
echo ""

# Stop main docker-compose
echo "📦 Stopping main docker-compose..."
docker compose down 2>/dev/null || true

# Stop individual service composes
echo "📦 Stopping individual service composes..."
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
  "graphql-gateway"
)

for service in "${services[@]}"; do
  if [ -f "services/$service/docker-compose.yml" ]; then
    echo "   Stopping $service..."
    (cd "services/$service" && docker compose down 2>/dev/null) || true
  fi
done

# Stop any remaining containers
echo "🛑 Stopping any remaining containers..."
docker stop $(docker ps -q) 2>/dev/null || true

# Show current status
echo ""
echo "📊 Current Docker status:"
docker ps

echo ""
echo "✅ Port conflicts resolved!"
echo ""
echo "Next steps:"
echo "  1. Start all services: docker compose up -d"
echo "  2. Or use script: ./scripts/start-all.sh"
echo "  3. Check health: ./scripts/health-check.sh"
