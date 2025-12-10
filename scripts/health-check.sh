#!/bin/bash

# Health check script for all services
# Usage: ./scripts/health-check.sh

set -e

echo "🏥 Checking health of all services..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Services and their health endpoints
declare -A services=(
  ["user-service"]="http://localhost:3001/health"
  ["queuing-service"]="http://localhost:3002/health"
  ["interaction-service"]="http://localhost:3003/health"
  ["history-service"]="http://localhost:3004/health"
  ["communication-service"]="http://localhost:3005/health"
  ["notification-service"]="http://localhost:3006/health"
  ["moderation-service"]="http://localhost:3007/health"
  ["analytics-service"]="http://localhost:3008/health"
  ["admin-service"]="http://localhost:3009/health"
  ["subscription-service"]="http://localhost:3010/health"
  ["graphql-gateway"]="http://localhost:4000/.well-known/apollo/server-health"
)

# Infrastructure services
declare -A infrastructure=(
  ["PostgreSQL"]="5432"
  ["Redis"]="6379"
  ["RabbitMQ"]="5672"
)

echo "Infrastructure Services:"
echo "----------------------"
for service in "${!infrastructure[@]}"; do
  port="${infrastructure[$service]}"
  if nc -z localhost $port 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $service (port $port) - ${GREEN}UP${NC}"
  else
    echo -e "${RED}✗${NC} $service (port $port) - ${RED}DOWN${NC}"
  fi
done

echo ""
echo "Microservices:"
echo "-------------"

healthy=0
unhealthy=0

for service in "${!services[@]}"; do
  endpoint="${services[$service]}"
  
  # Check if service is running in Docker
  if docker compose ps $service 2>/dev/null | grep -q "Up"; then
    # Try to curl the health endpoint
    if curl -sf "$endpoint" > /dev/null 2>&1; then
      echo -e "${GREEN}✓${NC} $service - ${GREEN}HEALTHY${NC}"
      ((healthy++))
    else
      echo -e "${YELLOW}⚠${NC} $service - ${YELLOW}STARTING${NC} (container up, endpoint not ready)"
      ((unhealthy++))
    fi
  else
    echo -e "${RED}✗${NC} $service - ${RED}DOWN${NC}"
    ((unhealthy++))
  fi
done

echo ""
echo "Summary:"
echo "--------"
echo -e "Healthy: ${GREEN}$healthy${NC}"
echo -e "Unhealthy/Starting: ${YELLOW}$unhealthy${NC}"

if [ $unhealthy -eq 0 ]; then
  echo -e "\n${GREEN}🎉 All services are healthy!${NC}"
  exit 0
else
  echo -e "\n${YELLOW}⚠️  Some services are not ready yet${NC}"
  exit 1
fi
