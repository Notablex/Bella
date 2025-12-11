#!/bin/bash

# Start a single service with all dependencies
# Usage: ./scripts/start-service.sh user-service

set -e

SERVICE_NAME=${1:-user-service}

echo "🚀 Starting $SERVICE_NAME with dependencies..."
echo ""

# Step 1: Stop any conflicting containers
echo "🛑 Stopping any conflicting containers..."
docker compose down 2>/dev/null || true
cd services/$SERVICE_NAME 2>/dev/null && docker compose down 2>/dev/null && cd ../.. || true
docker stop $(docker ps -q --filter "publish=6379") 2>/dev/null || true
docker stop $(docker ps -q --filter "publish=5432") 2>/dev/null || true

echo "✅ Conflicts cleared"
echo ""

# Step 2: Start infrastructure from main compose
echo "📦 Starting shared infrastructure (PostgreSQL, Redis, RabbitMQ)..."
docker compose up -d postgres redis rabbitmq

# Step 3: Wait for infrastructure
echo "⏳ Waiting for infrastructure to be ready..."
sleep 5

# Check PostgreSQL
until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
  echo "   Waiting for PostgreSQL..."
  sleep 2
done
echo "✅ PostgreSQL ready"

# Check Redis
until docker compose exec -T redis redis-cli ping > /dev/null 2>&1; do
  echo "   Waiting for Redis..."
  sleep 2
done
echo "✅ Redis ready"

echo ""

# Step 4: Build and start the service
echo "🔨 Building $SERVICE_NAME..."
docker compose build $SERVICE_NAME

echo ""
echo "🎉 Starting $SERVICE_NAME..."
docker compose up -d $SERVICE_NAME

echo ""
echo "⏳ Waiting for service to start..."
sleep 5

# Step 5: Show status and logs
echo ""
echo "📊 Service Status:"
docker compose ps $SERVICE_NAME

echo ""
echo "📋 Recent Logs:"
docker compose logs --tail=50 $SERVICE_NAME

echo ""
echo "✅ $SERVICE_NAME is running!"
echo ""
echo "📍 Service URL: http://localhost:$(docker compose port $SERVICE_NAME $(docker compose port $SERVICE_NAME | cut -d: -f1 2>/dev/null || echo 3001) 2>/dev/null | cut -d: -f2 || echo 3001)"
echo ""
echo "Useful commands:"
echo "  View logs:    docker compose logs -f $SERVICE_NAME"
echo "  Stop service: docker compose stop $SERVICE_NAME"
echo "  Restart:      docker compose restart $SERVICE_NAME"
echo "  Stop all:     docker compose down"
