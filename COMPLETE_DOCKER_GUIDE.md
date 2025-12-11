# Complete Docker Guide - Everything You Need

## 🎯 Quick Start (Choose Your Path)

### Path 1: Start ALL Services
```bash
# Linux/Mac
./scripts/start-all.sh

# Windows
scripts\start-all.bat

# Or
docker compose up -d
```

### Path 2: Start SINGLE Service (Recommended for Development)
```bash
# Linux/Mac
./scripts/start-service.sh user-service

# Windows
scripts\start-service.bat user-service

# Or using Make
make dev-user
```

## 📚 All Documentation Files

| File | Purpose |
|------|---------|
| **DOCKER_QUICKSTART.md** | 5-minute quick start guide |
| **START_SINGLE_SERVICE.md** | How to start one service (solves port conflicts) |
| **DOCKER_SETUP.md** | Comprehensive Docker usage guide |
| **DOCKER_PORT_CONFLICTS.md** | Port conflict troubleshooting |
| **PRISMA_SETUP.md** | Automatic database migrations |
| **DOCKER_FIXES.md** | OpenSSL and other fixes |
| **QUICK_COMMANDS.md** | Command reference card |
| **DOCKER_COMPOSE_SUMMARY.md** | Architecture overview |

## 🚀 Common Tasks

### Start Development

**Single Service (Recommended):**
```bash
./scripts/start-service.sh user-service
```

**All Services:**
```bash
./scripts/start-all.sh
```

### View Logs
```bash
docker compose logs -f user-service
```

### Stop Everything
```bash
docker compose down
```

### Fix Port Conflicts
```bash
./scripts/fix-port-conflicts.sh
```

### Rebuild Service
```bash
./scripts/rebuild-service.sh user-service
```

### Check Health
```bash
./scripts/health-check.sh
```

## 🛠️ All Available Scripts

### Linux/Mac Scripts
| Script | Purpose |
|--------|---------|
| `start-all.sh` | Start all services |
| `stop-all.sh` | Stop all services |
| `start-service.sh` | Start single service (no conflicts) |
| `rebuild-service.sh` | Rebuild and restart service |
| `fix-port-conflicts.sh` | Fix port conflicts |
| `health-check.sh` | Check all services health |
| `run-migrations.sh` | Run Prisma migrations |

### Windows Scripts
| Script | Purpose |
|--------|---------|
| `start-all.bat` | Start all services |
| `stop-all.bat` | Stop all services |
| `start-service.bat` | Start single service (no conflicts) |
| `rebuild-service.bat` | Rebuild and restart service |
| `fix-port-conflicts.bat` | Fix port conflicts |

### Make Commands
```bash
make start          # Start all services
make stop           # Stop all services
make logs           # View all logs
make health         # Check health
make migrate        # Run migrations
make clean          # Remove everything
make dev-user       # Start user-service
make dev-queuing    # Start queuing-service
make dev service=X  # Start any service
```

## 🔧 Problem Solutions

### Problem: Port Already Allocated
**Solution:**
```bash
./scripts/start-service.sh user-service
```
This script automatically handles port conflicts.

### Problem: Tables Not Created
**Solution:**
The Dockerfile now automatically runs migrations. Just rebuild:
```bash
./scripts/rebuild-service.sh user-service
```

### Problem: Service Won't Start
**Solution:**
```bash
# Check logs
docker compose logs user-service

# Rebuild
docker compose build --no-cache user-service
docker compose up -d user-service
```

### Problem: Database Connection Failed
**Solution:**
```bash
# Check PostgreSQL
docker compose ps postgres
docker compose logs postgres

# Restart
docker compose restart postgres
```

## 📊 Service Ports

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
| GraphQL Gateway | 4000 | http://localhost:4000/graphql |
| PostgreSQL | 5432 | - |
| Redis | 6379 | - |
| RabbitMQ | 5672, 15672 | http://localhost:15672 |

## 🎓 Best Practices

### For Development
1. Use `start-service.sh` for single service development
2. Use `docker compose logs -f` to watch logs
3. Use `docker compose restart` to restart after code changes
4. Use `rebuild-service.sh` after Dockerfile changes

### For Testing
1. Use `start-all.sh` to test all services together
2. Use `health-check.sh` to verify all services
3. Use `docker compose ps` to check status

### For Cleanup
1. Use `docker compose down` to stop services
2. Use `docker compose down -v` to remove data
3. Use `docker system prune` to clean up disk space

## 🆘 Emergency Commands

### Everything is Broken
```bash
# Stop everything
docker compose down -v
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Clean up
docker system prune -a --volumes -f

# Start fresh
./scripts/start-all.sh
```

### Port Conflicts
```bash
./scripts/fix-port-conflicts.sh
./scripts/start-service.sh user-service
```

### Database Issues
```bash
docker compose down -v
docker compose up -d postgres redis
sleep 10
./scripts/start-service.sh user-service
```

## 📖 Learning Path

1. **Start Here:** `DOCKER_QUICKSTART.md`
2. **Single Service:** `START_SINGLE_SERVICE.md`
3. **Port Issues:** `DOCKER_PORT_CONFLICTS.md`
4. **Database Setup:** `PRISMA_SETUP.md`
5. **Full Guide:** `DOCKER_SETUP.md`
6. **Commands:** `QUICK_COMMANDS.md`

## ✅ Checklist

Before starting development:
- [ ] Docker Desktop is running
- [ ] At least 8GB RAM allocated to Docker
- [ ] `.env` file exists in root directory
- [ ] Scripts are executable (`chmod +x scripts/*.sh`)

To start development:
- [ ] Run `./scripts/start-service.sh user-service`
- [ ] Check logs: `docker compose logs -f user-service`
- [ ] Test endpoint: `curl http://localhost:3001/health`
- [ ] Start coding!

## 🎉 Summary

**One command to rule them all:**
```bash
./scripts/start-service.sh user-service
```

This command:
- ✅ Stops conflicting containers
- ✅ Starts infrastructure
- ✅ Builds your service
- ✅ Runs migrations automatically
- ✅ Starts your service
- ✅ Shows status and logs

**No more manual steps. Just code!** 🚀

---

**Need help?** Check the specific guide for your issue:
- Port conflicts → `DOCKER_PORT_CONFLICTS.md`
- Database issues → `PRISMA_SETUP.md`
- General usage → `DOCKER_SETUP.md`
- Quick commands → `QUICK_COMMANDS.md`
