# Quick Command Reference

## 🚨 Port Conflict? Run This First!

```bash
# Stop everything and start fresh
docker compose down
docker stop $(docker ps -q) 2>/dev/null || true
docker compose up -d
```

## 🚀 Starting Services

### Start All Services (Recommended)
```bash
# Using script
./scripts/start-all.sh          # Linux/Mac
scripts\start-all.bat           # Windows

# Using Docker Compose
docker compose up -d

# Using Make
make start
```

### Start Specific Services Only
```bash
# Start only user service and its dependencies
docker compose up -d postgres redis user-service

# Start multiple specific services
docker compose up -d postgres redis user-service queuing-service
```

## 🛑 Stopping Services

### Stop All Services
```bash
# Using script
./scripts/stop-all.sh           # Linux/Mac
scripts\stop-all.bat            # Windows

# Using Docker Compose
docker compose down

# Using Make
make stop
```

### Stop and Remove All Data
```bash
# Using script
./scripts/stop-all.sh --clean   # Linux/Mac
scripts\stop-all.bat clean      # Windows

# Using Docker Compose
docker compose down -v

# Using Make
make clean
```

## 🔍 Checking Status

### View Running Services
```bash
docker compose ps
# or
make ps
```

### Check Service Health
```bash
./scripts/health-check.sh
# or
make health
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f user-service

# Last 100 lines
docker compose logs --tail=100 user-service

# Using Make
make logs
make logs-user
```

## 🔄 Restarting Services

### Restart All Services
```bash
docker compose restart
# or
make restart
```

### Restart Specific Service
```bash
docker compose restart user-service
# or
make restart-user
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Stop everything
docker compose down
docker stop $(docker ps -q) 2>/dev/null || true

# Check what's running
docker ps

# Start fresh
docker compose up -d
```

### Service Won't Start
```bash
# Check logs
docker compose logs user-service

# Rebuild service
docker compose build --no-cache user-service
docker compose up -d user-service
```

### Database Issues
```bash
# Check PostgreSQL
docker compose exec postgres pg_isready -U postgres

# Restart PostgreSQL
docker compose restart postgres

# View PostgreSQL logs
docker compose logs postgres
```

### Redis Issues
```bash
# Check Redis
docker compose exec redis redis-cli ping

# Restart Redis
docker compose restart redis

# View Redis logs
docker compose logs redis
```

## 🗄️ Database Operations

### Run Migrations
```bash
# All services
./scripts/run-migrations.sh

# Specific service
docker compose exec user-service npx prisma migrate deploy
```

### Access Database
```bash
# PostgreSQL
docker compose exec postgres psql -U postgres -d users

# Redis
docker compose exec redis redis-cli
```

### Backup Database
```bash
# PostgreSQL backup
docker compose exec postgres pg_dump -U postgres users > backup.sql

# Restore
docker compose exec -T postgres psql -U postgres users < backup.sql
```

## 🧹 Cleanup

### Remove Stopped Containers
```bash
docker container prune -f
```

### Remove Unused Images
```bash
docker image prune -a -f
```

### Remove Unused Volumes
```bash
docker volume prune -f
```

### Complete Cleanup
```bash
docker system prune -a --volumes -f
```

## 🔨 Building

### Build All Services
```bash
docker compose build
# or
make build
```

### Build Specific Service
```bash
docker compose build user-service
```

### Build Without Cache
```bash
docker compose build --no-cache user-service
```

## 📊 Monitoring

### Resource Usage
```bash
docker stats
```

### Disk Usage
```bash
docker system df
```

### Network Inspection
```bash
docker network ls
docker network inspect realtime-connect-network
```

## 🧪 Testing

### Test Service Endpoint
```bash
# Health check
curl http://localhost:3001/health

# GraphQL
curl http://localhost:4000/graphql
```

### Run Tests in Container
```bash
docker compose exec user-service npm test
```

## 🌐 Access URLs

### Services
- User Service: http://localhost:3001
- Queuing Service: http://localhost:3002
- Interaction Service: http://localhost:3003
- History Service: http://localhost:3004
- Communication Service: http://localhost:3005
- Notification Service: http://localhost:3006
- Moderation Service: http://localhost:3007
- Analytics Service: http://localhost:3008
- Admin Service: http://localhost:3009
- Subscription Service: http://localhost:3010
- GraphQL Gateway: http://localhost:4000/graphql

### Infrastructure
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- RabbitMQ: localhost:5672
- RabbitMQ Management: http://localhost:15672 (admin/admin123)

## 💡 Pro Tips

```bash
# Watch logs in real-time
docker compose logs -f --tail=50

# Execute command in running container
docker compose exec user-service sh

# Copy files from container
docker compose cp user-service:/app/logs ./local-logs

# View environment variables
docker compose exec user-service env

# Check container resource limits
docker inspect user-service | grep -A 10 Resources
```

## 🆘 Emergency Commands

### Everything is Broken
```bash
# Nuclear option - reset everything
docker compose down -v
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker system prune -a --volumes -f
docker compose up -d
```

### Service is Stuck
```bash
# Force kill and restart
docker compose kill user-service
docker compose rm -f user-service
docker compose up -d user-service
```

### Out of Disk Space
```bash
# Clean up everything unused
docker system prune -a --volumes -f

# Check space
docker system df
```

## 📝 Cheat Sheet

| Task | Command |
|------|---------|
| Start all | `docker compose up -d` |
| Stop all | `docker compose down` |
| View logs | `docker compose logs -f` |
| Check status | `docker compose ps` |
| Restart service | `docker compose restart <service>` |
| Rebuild service | `docker compose build <service>` |
| Run migrations | `./scripts/run-migrations.sh` |
| Health check | `./scripts/health-check.sh` |
| Clean all | `docker compose down -v` |

---

**Need more help?** Check:
- `DOCKER_SETUP.md` - Full documentation
- `DOCKER_PORT_CONFLICTS.md` - Port conflict solutions
- `DOCKER_QUICKSTART.md` - Quick start guide
