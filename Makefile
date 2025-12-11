.PHONY: help start stop restart logs health migrate clean build

# Default target
help:
	@echo "Realtime Connect - Docker Compose Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  start       - Start all services"
	@echo "  stop        - Stop all services"
	@echo "  restart     - Restart all services"
	@echo "  logs        - View logs from all services"
	@echo "  health      - Check health of all services"
	@echo "  migrate     - Run database migrations"
	@echo "  clean       - Stop services and remove volumes"
	@echo "  build       - Rebuild all services"
	@echo "  ps          - Show running services"
	@echo ""
	@echo "Service-specific:"
	@echo "  logs-user   - View user-service logs"
	@echo "  restart-user - Restart user-service"
	@echo ""

# Start all services
start:
	@echo "Starting all services..."
	@docker compose up -d
	@echo "Services started! Run 'make health' to check status"

# Stop all services
stop:
	@echo "Stopping all services..."
	@docker compose down
	@echo "Services stopped"

# Restart all services
restart:
	@echo "Restarting all services..."
	@docker compose restart
	@echo "Services restarted"

# View logs
logs:
	@docker compose logs -f

# Check health
health:
	@bash scripts/health-check.sh

# Run migrations
migrate:
	@bash scripts/run-migrations.sh

# Clean everything
clean:
	@echo "WARNING: This will remove all containers and volumes!"
	@read -p "Are you sure? (y/N) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		echo "Cleaned!"; \
	else \
		echo "Cancelled"; \
	fi

# Rebuild all services
build:
	@echo "Rebuilding all services..."
	@docker compose build --no-cache
	@echo "Build complete"

# Show running services
ps:
	@docker compose ps

# Service-specific commands
logs-user:
	@docker compose logs -f user-service

logs-queuing:
	@docker compose logs -f queuing-service

logs-interaction:
	@docker compose logs -f interaction-service

logs-graphql:
	@docker compose logs -f graphql-gateway

restart-user:
	@docker compose restart user-service

restart-queuing:
	@docker compose restart queuing-service

restart-interaction:
	@docker compose restart interaction-service

# Infrastructure commands
logs-postgres:
	@docker compose logs -f postgres

logs-redis:
	@docker compose logs -f redis

logs-rabbitmq:
	@docker compose logs -f rabbitmq

# Development commands - Start single service with dependencies
dev-user:
	@bash scripts/start-service.sh user-service

dev-queuing:
	@bash scripts/start-service.sh queuing-service

dev-interaction:
	@bash scripts/start-service.sh interaction-service

dev-communication:
	@bash scripts/start-service.sh communication-service

dev-notification:
	@bash scripts/start-service.sh notification-service

# Start any service
dev:
	@bash scripts/start-service.sh $(service)
