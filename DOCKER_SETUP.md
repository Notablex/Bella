# Docker Setup Guide

This guide explains how to run the microservices using Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2 (comes with Docker Desktop)
- At least 8GB RAM allocated to Docker
- At least 20GB free disk space

## Quick Start

### Start All Services

```bash
# Start all services in detached mode
docker compose up -d

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f user-service
```

### Stop All Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes all data)
docker compose down -v
```

## Individual Service Setup

Each service has its own `docker-compose.yml` file in its directory. You can run services independently:

```bash
# Run only user service with its dependencies
cd services/user-service
docker compose up -d

# Run only analytics service
cd services/analytics-service
docker compose up -d
```

## Service Ports

| Service | Port | Health Check |
|---------|------|--------------|
| User Service | 3001 | http://localhost:3001/health |
| Queuing Service | 3002 | http://localhost:3002/health |
| Interaction Service | 3003 | http://localhost:3003/health |
| History Service | 3004 | http://localhost:3004/health |
| Communication Service | 3005 | http://localhost:3005/health |
| Notification Service | 3006 | http://localhost:3006/health |
| Moderation Service | 3007 | http://localhost:3007/health |
| Analytics Service | 3008 | http://localhost:3008/health |
| Admin Service | 3009 | http://localhost:3009/health |
| Subscription Service | 3010 | http://localhost:3010/health |
| GraphQL Gateway | 4000 | http://localhost:4000/.well-known/apollo/server-health |

### Infrastructure Ports

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Main database |
| Redis | 6379 | Cache & sessions |
| RabbitMQ | 5672 | Message queue |
| RabbitMQ Management | 15672 | Web UI (admin/admin123) |

## Environment Variables

Create a `.env` file in the root directory:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Stripe (for subscription service)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Mixpanel (for analytics)
MIXPANEL_PROJECT_TOKEN=your_mixpanel_token
MIXPANEL_API_SECRET=your_mixpanel_secret
```

## Database Migrations

After starting services, run migrations for each service:

```bash
# User Service
docker compose exec user-service npx prisma migrate deploy

# Queuing Service
docker compose exec queuing-service npx prisma migrate deploy

# Interaction Service
docker compose exec interaction-service npx prisma migrate deploy

# ... repeat for other services
```

Or run migrations for all services:

```bash
# Create a script to run all migrations
./scripts/run-migrations.sh
```

## Useful Commands

### View Service Status

```bash
# Check all services
docker compose ps

# Check specific service
docker compose ps user-service
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f user-service

# Last 100 lines
docker compose logs --tail=100 user-service
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart user-service
```

### Execute Commands in Containers

```bash
# Open shell in user-service
docker compose exec user-service sh

# Run Prisma commands
docker compose exec user-service npx prisma studio

# Check database connection
docker compose exec postgres psql -U postgres -d users
```

### Clean Up

```bash
# Stop and remove containers
docker compose down

# Remove containers and volumes
docker compose down -v

# Remove containers, volumes, and images
docker compose down -v --rmi all

# Prune unused Docker resources
docker system prune -a --volumes
```

## Troubleshooting

### Service Won't Start

1. Check logs:
   ```bash
   docker compose logs user-service
   ```

2. Check if port is already in use:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   
   # Linux/Mac
   lsof -i :3001
   ```

3. Rebuild the service:
   ```bash
   docker compose build --no-cache user-service
   docker compose up -d user-service
   ```

### Database Connection Issues

1. Check if PostgreSQL is healthy:
   ```bash
   docker compose ps postgres
   ```

2. Test database connection:
   ```bash
   docker compose exec postgres psql -U postgres -c "SELECT 1"
   ```

3. Check database logs:
   ```bash
   docker compose logs postgres
   ```

### Redis Connection Issues

1. Check Redis health:
   ```bash
   docker compose exec redis redis-cli ping
   ```

2. View Redis logs:
   ```bash
   docker compose logs redis
   ```

### Out of Memory

1. Check Docker resource allocation in Docker Desktop settings
2. Increase memory limit to at least 8GB
3. Restart Docker Desktop

### Slow Performance

1. Check resource usage:
   ```bash
   docker stats
   ```

2. Reduce number of running services:
   ```bash
   # Run only essential services
   docker compose up -d postgres redis user-service graphql-gateway
   ```

## Development Workflow

### Hot Reload Development

For development with hot reload, use the individual service docker-compose files with volume mounts:

```yaml
# Add to service in docker-compose.yml
volumes:
  - ./services/user-service/src:/app/src
  - ./services/user-service/package.json:/app/package.json
```

### Running Tests

```bash
# Run tests in container
docker compose exec user-service npm test

# Run tests with coverage
docker compose exec user-service npm run test:coverage
```

### Debugging

1. Attach to running container:
   ```bash
   docker compose exec user-service sh
   ```

2. View real-time logs:
   ```bash
   docker compose logs -f user-service
   ```

3. Inspect container:
   ```bash
   docker compose exec user-service env
   ```

## Production Considerations

1. **Use secrets management**: Don't commit `.env` files
2. **Set resource limits**: Add memory and CPU limits to services
3. **Use health checks**: Already configured in docker-compose files
4. **Enable logging**: Configure log drivers for centralized logging
5. **Use Docker Swarm or Kubernetes**: For production orchestration
6. **Backup volumes**: Regularly backup PostgreSQL and Redis data
7. **Monitor resources**: Use Prometheus + Grafana (included in analytics-service)

## Network Architecture

All services are connected via the `realtime-connect-network` bridge network, allowing inter-service communication using service names as hostnames.

```
┌─────────────────────────────────────────────────┐
│         realtime-connect-network                │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │PostgreSQL│  │  Redis   │  │ RabbitMQ │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │              │           │
│  ┌────┴─────────────┴──────────────┴─────┐    │
│  │         All Microservices              │    │
│  │  (user, queuing, interaction, etc.)    │    │
│  └────────────────┬───────────────────────┘    │
│                   │                             │
│            ┌──────┴────────┐                   │
│            │ GraphQL Gateway│                   │
│            └───────────────┘                    │
└─────────────────────────────────────────────────┘
```

## Support

For issues or questions:
1. Check service logs: `docker compose logs <service-name>`
2. Review this documentation
3. Check individual service README files
4. Open an issue in the project repository
