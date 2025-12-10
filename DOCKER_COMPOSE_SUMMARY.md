# Docker Compose Setup - Summary

## ✅ What Was Created

### 1. Individual Service Docker Compose Files
Each service now has its own `docker-compose.yml` in its directory:

- ✅ `services/user-service/docker-compose.yml`
- ✅ `services/queuing-service/docker-compose.yml`
- ✅ `services/interaction-service/docker-compose.yml`
- ✅ `services/history-service/docker-compose.yml`
- ✅ `services/communication-service/docker-compose.yml`
- ✅ `services/notification-service/docker-compose.yml`
- ✅ `services/moderation-service/docker-compose.yml`
- ✅ `services/admin-service/docker-compose.yml`
- ✅ `services/analytics-service/docker-compose.yml` (already existed)
- ✅ `services/graphql-gateway/docker-compose.yml`
- ✅ `services/subscription-service/docker-compose.yml`

**Features of individual compose files:**
- Each service has its own PostgreSQL database
- Each service has its own Redis instance
- Unique ports for databases (5432-5441) and Redis (6379-6389)
- Isolated networks with bridge to `app-network`
- Health checks for all services
- `restart: unless-stopped` policy

### 2. Root Docker Compose File
✅ `docker-compose.yml` - Orchestrates all services together

**Features:**
- Single shared PostgreSQL instance (more efficient)
- Single shared Redis instance
- RabbitMQ for message queuing
- All services on common `realtime-connect-network`
- Proper service dependencies with health checks
- Environment variables for inter-service communication
- All services restart automatically

### 3. Database Initialization
✅ `init-databases.sql` - Creates all databases on first PostgreSQL startup

Creates databases:
- users
- queuing
- interactions
- history
- communications
- notifications
- moderation
- analytics
- admin
- subscriptions

### 4. Helper Scripts

#### Linux/Mac Scripts:
- ✅ `scripts/start-all.sh` - Start all services with health checks
- ✅ `scripts/stop-all.sh` - Stop services (with optional cleanup)
- ✅ `scripts/run-migrations.sh` - Run Prisma migrations for all services
- ✅ `scripts/health-check.sh` - Check health of all services

#### Windows Scripts:
- ✅ `scripts/start-all.bat` - Start all services (Windows)
- ✅ `scripts/stop-all.bat` - Stop services (Windows)

### 5. Documentation
- ✅ `DOCKER_SETUP.md` - Comprehensive Docker usage guide
- ✅ `.env.example` - Environment variables template
- ✅ `DOCKER_COMPOSE_SUMMARY.md` - This file

## 🚀 Quick Start

### Option 1: Start All Services (Recommended)

**Linux/Mac:**
```bash
chmod +x scripts/*.sh
./scripts/start-all.sh
```

**Windows:**
```cmd
scripts\start-all.bat
```

**Manual:**
```bash
docker compose up -d
```

### Option 2: Start Individual Service

```bash
cd services/user-service
docker compose up -d
```

## 📊 Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Docker Network                          │
│              realtime-connect-network                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Shared Infrastructure                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  │
│  │  │PostgreSQL│  │  Redis   │  │ RabbitMQ │      │  │
│  │  │  :5432   │  │  :6379   │  │  :5672   │      │  │
│  │  └──────────┘  └──────────┘  └──────────┘      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Microservices                        │  │
│  │                                                   │  │
│  │  User (3001)        Queuing (3002)               │  │
│  │  Interaction (3003) History (3004)               │  │
│  │  Communication (3005) Notification (3006)        │  │
│  │  Moderation (3007)  Analytics (3008)             │  │
│  │  Admin (3009)       Subscription (3010)          │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              API Gateway                          │  │
│  │         GraphQL Gateway (4000)                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Configuration

### Environment Variables

Create `.env` in root directory:

```env
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
MIXPANEL_PROJECT_TOKEN=...
```

See `.env.example` for all available options.

### Port Mapping

| Service | Container Port | Host Port |
|---------|---------------|-----------|
| User Service | 3001 | 3001 |
| Queuing Service | 3002 | 3002 |
| Interaction Service | 3003 | 3003 |
| History Service | 3004 | 3004 |
| Communication Service | 3005 | 3005 |
| Notification Service | 3006 | 3006 |
| Moderation Service | 3007 | 3007 |
| Analytics Service | 3008 | 3008 |
| Admin Service | 3009 | 3009 |
| Subscription Service | 3010 | 3010 |
| GraphQL Gateway | 4000 | 4000 |
| PostgreSQL | 5432 | 5432 |
| Redis | 6379 | 6379 |
| RabbitMQ | 5672 | 5672 |
| RabbitMQ Management | 15672 | 15672 |

## 📝 Common Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f user-service

# Check service status
docker compose ps

# Restart a service
docker compose restart user-service

# Stop all services
docker compose down

# Stop and remove all data
docker compose down -v

# Rebuild a service
docker compose build --no-cache user-service

# Run migrations
./scripts/run-migrations.sh

# Health check
./scripts/health-check.sh
```

## 🔍 Troubleshooting

### Services won't start
```bash
# Check logs
docker compose logs <service-name>

# Rebuild
docker compose build --no-cache <service-name>
docker compose up -d <service-name>
```

### Port already in use
```bash
# Find process using port (Windows)
netstat -ano | findstr :3001

# Find process using port (Linux/Mac)
lsof -i :3001

# Kill process or change port in docker-compose.yml
```

### Database connection failed
```bash
# Check PostgreSQL health
docker compose exec postgres pg_isready -U postgres

# View PostgreSQL logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Out of memory
- Increase Docker memory limit in Docker Desktop settings
- Minimum recommended: 8GB RAM

## 🎯 Next Steps

1. **Start services**: `./scripts/start-all.sh` or `docker compose up -d`
2. **Run migrations**: `./scripts/run-migrations.sh`
3. **Check health**: `./scripts/health-check.sh`
4. **Test endpoints**: Visit http://localhost:3001/health
5. **Access GraphQL**: Visit http://localhost:4000/graphql
6. **View RabbitMQ**: Visit http://localhost:15672 (admin/admin123)

## 📚 Additional Resources

- Full documentation: `DOCKER_SETUP.md`
- Service-specific docs: Check each service's README
- Architecture: `ARCHITECTURE.md`
- API docs: `API_SPECIFICATIONS.md`

## ✨ Features

✅ Individual service isolation
✅ Shared infrastructure for efficiency
✅ Health checks for all services
✅ Automatic restarts
✅ Database initialization
✅ Inter-service communication
✅ Message queue support
✅ Comprehensive logging
✅ Easy scaling
✅ Development and production ready

## 🤝 Support

For issues:
1. Check logs: `docker compose logs <service>`
2. Review `DOCKER_SETUP.md`
3. Run health check: `./scripts/health-check.sh`
4. Check individual service README files
