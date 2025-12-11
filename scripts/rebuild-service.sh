#!/bin/bash

# Rebuild a specific service with migrations
# Usage: ./scripts/rebuild-service.sh user-service

set -e

SERVICE_NAME=${1:-user-service}

echo "🔨 Rebuilding $SERVICE_NAME..."
echo ""

# Stop the service
echo "🛑 Stopping $SERVICE_NAME..."
docker compose stop $SERVICE_NAME
docker compose rm -f $SERVICE_NAME

# Rebuild without cache
echo "📦 Building $SERVICE_NAME (no cache)..."
docker compose build --no-cache $SERVICE_NAME

# Start dependencies if needed
echo "🚀 Starting dependencies..."
docker compose up -d postgres redis rabbitmq

# Wait for dependencies
echo "⏳ Waiting for dependencies..."
sleep 10

# Start the service
echo "🎉 Starting $SERVICE_NAME..."
docker compose up -d $SERVICE_NAME

# Show logs
echo ""
echo "📋 Watching logs (Ctrl+C to exit)..."
echo ""
docker compose logs -f $SERVICE_NAME
