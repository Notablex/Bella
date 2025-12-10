# Docker Quick Start Guide

Get all microservices running in under 5 minutes!

## Prerequisites

- Docker Desktop installed and running
- At least 8GB RAM allocated to Docker
- At least 20GB free disk space

## 🚀 Quick Start (3 Steps)

### Step 1: Clone and Navigate
```bash
cd /path/to/Kindred-main
```

### Step 2: Create Environment File
```bash
# Copy the example file
cp .env.example .env

# Or create manually with minimum config
echo "JWT_SECRET=dev-secret-key-change-in-production" > .env
```

### Step 3: Start Everything
```bash
# Linux/Mac
chmod +x scripts/*.sh
./scripts/start-all.sh

# Windows
scripts\start-all.bat

# Or using Docker Compose directly
docker compose up -d

# Or using Make
make start
```

That's it! 🎉

## ✅ Verify Installation

### Check Service Health
```bash
# Using script
./scripts/health-check.sh

# Or manually
curl http://localhost:3001/health  # User Service
curl http://localhost:4000/graphql # GraphQL Gateway
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f user-service

# Using Make
make logs
make logs-user
```

### Check Running Services
```bash
docker compose ps

# Or
make ps
```

## 🌐 Access Services

Once started, access services at:

| Service | URL | Description |
|---------|-----|-------------|
| **GraphQL Gateway** | http://localhost:4000/graphql | Main API endpoint |
| **User Service** | http://localhost:3001 | User management |
| **Queuing Service** | http://localhost:3002 | Matchmaking queue |
| **Interaction Service** | http://localhost:3003 | Video/chat sessions |
| **RabbitMQ Management** | http://localhost:15672 | Message queue UI (admin/admin123) |

Full list in [DOCKER_COMPOSE_SUMMARY.md](DOCKER_COMPOSE_SUMMARY.md)

## 🛠️ Common Tasks

### Run Database Migrations
```bash
./scripts/run-migrations.sh

# Or for specific service
docker compose exec user-service npx prisma migrate deploy
```

### View Service Logs
```bash
# Real-time logs
docker compose logs -f user-service

# Last 100 lines
docker compose logs --tail=100 user-service
```

### Restart a Service
```bash
docker compose restart user-service

# Or
make restart-user
```

### Stop Everything
```bash
docker compose down

# Or
make stop
./scripts/stop-all.sh
```

### Clean Everything (Remove Data)
```bash
docker compose down -v

# Or
make clean
./scripts/stop-all.sh --clean
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Find what's using the port (Windows)
netstat -ano | findstr :3001

# Find what's using the port (Linux/Mac)
lsof -i :3001

# Solution: Stop the process or change port in docker-compose.yml
```

### Service Won't Start
```bash
# Check logs
docker compose logs user-service

# Rebuild service
docker compose build --no-cache user-service
docker compose up -d user-service
```

### Database Connection Error
```bash
# Check PostgreSQL
docker compose exec postgres pg_isready -U postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Out of Memory
1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase Memory to at least 8GB
4. Click "Apply & Restart"

## 📚 Available Commands

### Using Scripts (Recommended)
```bash
./scripts/start-all.sh      # Start everything
./scripts/stop-all.sh       # Stop everything
./scripts/health-check.sh   # Check health
./scripts/run-migrations.sh # Run migrations
```

### Using Make (If available)
```bash
make start    # Start all services
make stop     # Stop all services
make logs     # View logs
make health   # Check health
make migrate  # Run migrations
make clean    # Remove everything
make help     # Show all commands
```

### Using Docker Compose Directly
```bash
docker compose up -d              # Start all
docker compose down               # Stop all
docker compose ps                 # List services
docker compose logs -f            # View logs
docker compose restart <service>  # Restart service
docker compose build <service>    # Rebuild service
```

## 🎯 Next Steps

1. ✅ Services are running
2. 📝 Run migrations: `./scripts/run-migrations.sh`
3. 🧪 Test API: `curl http://localhost:3001/health`
4. 🚀 Start developing!

## 📖 More Information

- **Full Docker Guide**: [DOCKER_SETUP.md](DOCKER_SETUP.md)
- **Architecture Overview**: [DOCKER_COMPOSE_SUMMARY.md](DOCKER_COMPOSE_SUMMARY.md)
- **API Documentation**: [API_SPECIFICATIONS.md](API_SPECIFICATIONS.md)
- **Project README**: [README.md](README.md)

## 🆘 Need Help?

1. Check logs: `docker compose logs <service-name>`
2. Review [DOCKER_SETUP.md](DOCKER_SETUP.md) troubleshooting section
3. Run health check: `./scripts/health-check.sh`
4. Check individual service README files

## 💡 Pro Tips

- Use `make` commands for convenience
- Keep Docker Desktop running in the background
- Allocate enough RAM (8GB minimum)
- Use `docker compose logs -f` to watch logs in real-time
- Run `./scripts/health-check.sh` after starting services
- Use individual service compose files for development

## 🎉 Success!

If you see all services healthy in the health check, you're ready to go!

```bash
./scripts/health-check.sh
```

Expected output:
```
✓ user-service - HEALTHY
✓ queuing-service - HEALTHY
✓ interaction-service - HEALTHY
...
🎉 All services are healthy!
```

Happy coding! 🚀
