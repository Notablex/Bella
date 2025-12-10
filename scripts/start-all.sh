#!/bin/bash

# Quick start script for all services
# Usage: ./scripts/start-all.sh

set -e

echo "🚀 Starting Realtime Connect Microservices..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "⚠️  .env file not found. Creating from template..."
  cat > .env << 'EOF'
# JWT Configuration
JWT_SECRET=dev-secret-key-change-in-production

# Stripe (optional for development)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Mixpanel (optional for development)
MIXPANEL_PROJECT_TOKEN=your_token
MIXPANEL_API_SECRET=your_secret
EOF
  echo "✅ Created .env file with default values"
  echo ""
fi

# Start infrastructure first
echo "📦 Starting infrastructure services (PostgreSQL, Redis, RabbitMQ)..."
docker compose up -d postgres redis rabbitmq

echo "⏳ Waiting for infrastructure to be ready..."
sleep 10

# Check if infrastructure is healthy
echo "🏥 Checking infrastructure health..."
until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
  echo "   Waiting for PostgreSQL..."
  sleep 2
done
echo "✅ PostgreSQL is ready"

until docker compose exec -T redis redis-cli ping > /dev/null 2>&1; do
  echo "   Waiting for Redis..."
  sleep 2
done
echo "✅ Redis is ready"

until docker compose exec -T rabbitmq rabbitmq-diagnostics ping > /dev/null 2>&1; do
  echo "   Waiting for RabbitMQ..."
  sleep 2
done
echo "✅ RabbitMQ is ready"

echo ""
echo "📦 Starting all microservices..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to start (this may take a minute)..."
sleep 30

echo ""
echo "🏥 Running health checks..."
./scripts/health-check.sh || true

echo ""
echo "✅ All services started!"
echo ""
echo "📋 Service URLs:"
echo "   User Service:         http://localhost:3001"
echo "   Queuing Service:      http://localhost:3002"
echo "   Interaction Service:  http://localhost:3003"
echo "   History Service:      http://localhost:3004"
echo "   Communication Service: http://localhost:3005"
echo "   Notification Service: http://localhost:3006"
echo "   Moderation Service:   http://localhost:3007"
echo "   Analytics Service:    http://localhost:3008"
echo "   Admin Service:        http://localhost:3009"
echo "   Subscription Service: http://localhost:3010"
echo "   GraphQL Gateway:      http://localhost:4000/graphql"
echo ""
echo "🔧 Infrastructure:"
echo "   PostgreSQL:           localhost:5432"
echo "   Redis:                localhost:6379"
echo "   RabbitMQ:             localhost:5672"
echo "   RabbitMQ Management:  http://localhost:15672 (admin/admin123)"
echo ""
echo "📝 View logs: docker compose logs -f"
echo "🛑 Stop all:  docker compose down"
