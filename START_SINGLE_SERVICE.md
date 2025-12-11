# Start Single Service - Quick Guide

## 🚀 One Command to Start Any Service

### The Problem
When you try to start a service, you get port conflicts because:
- Main docker-compose is running (uses port 6379 for Redis)
- Individual service docker-compose also wants port 6379
- Result: `Bind for 0.0.0.0:6379 failed: port is already allocated`

### The Solution ✅

Use the `start-service` script that:
1. ✅ Stops all conflicting containers
2. ✅ Starts shared infrastructure (PostgreSQL, Redis, RabbitMQ)
3. ✅ Waits for infrastructure to be ready
4. ✅ Builds your service
5. ✅ Starts your service
6. ✅ Shows logs and status

## Usage

### Linux/Mac
```bash
# Make script executable (first time only)
chmod +x scripts/start-service.sh

# Start user-service
./scripts/start-service.sh user-service

# Start any other service
./scripts/start-service.sh queuing-service
./scripts/start-service.sh interaction-service
./scripts/start-service.sh communication-service
```

### Windows
```cmd
# Start user-service
scripts\start-service.bat user-service

# Start any other service
scripts\start-service.bat queuing-service
scripts\start-service.bat interaction-service
scripts\start-service.bat communication-service
```

### Using Make (Linux/Mac)
```bash
# Start user-service
make dev-user

# Start queuing-service
make dev-queuing

# Start any service
make dev service=user-service
make dev service=analytics-service
```

## What It Does

```
┌─────────────────────────────────────────┐
│ 1. Stop Conflicting Containers         │
│    - Stops main docker-compose          │
│    - Stops individual service compose   │
│    - Stops containers using ports       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 2. Start Shared Infrastructure          │
│    - PostgreSQL (port 5432)             │
│    - Redis (port 6379)                  │
│    - RabbitMQ (ports 5672, 15672)       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 3. Wait for Infrastructure              │
│    - Checks PostgreSQL is ready         │
│    - Checks Redis is ready              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 4. Build Your Service                   │
│    - Runs docker compose build          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 5. Start Your Service                   │
│    - Runs docker compose up -d          │
│    - Runs migrations automatically      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 6. Show Status & Logs                   │
│    - Service status                     │
│    - Recent logs                        │
│    - Helpful commands                   │
└─────────────────────────────────────────┘
```

## Example Output

```bash
$ ./scripts/start-service.sh user-service

🚀 Starting user-service with dependencies...

🛑 Stopping any conflicting containers...
✅ Conflicts cleared

📦 Starting shared infrastructure (PostgreSQL, Redis, RabbitMQ)...
⏳ Waiting for infrastructure to be ready...
✅ PostgreSQL ready
✅ Redis ready

🔨 Building user-service...
[+] Building 45.2s (23/23) FINISHED

🎉 Starting user-service...
[+] Running 1/1
 ✔ Container user-service  Started

⏳ Waiting for service to start...

📊 Service Status:
NAME            IMAGE                    STATUS         PORTS
user-service    kindred-user-service     Up 5 seconds   0.0.0.0:3001->3001/tcp

📋 Recent Logs:
🚀 Starting User Service...
⏳ Waiting for database to be ready...
✅ Database connection established!
📦 Applying database schema...
✅ Schema pushed successfully!
🎉 Starting application...
User service started on 0.0.0.0:3001

✅ user-service is running!

📍 Service URL: 

Useful commands:
  View logs:    docker compose logs -f user-service
  Stop service: docker compose stop user-service
  Restart:      docker compose restart user-service
  Stop all:     docker compose down
```

## Available Services

| Service | Command | Port |
|---------|---------|------|
| User Service | `./scripts/start-service.sh user-service` | 3001 |
| Queuing Service | `./scripts/start-service.sh queuing-service` | 3002 |
| Interaction Service | `./scripts/start-service.sh interaction-service` | 3003 |
| History Service | `./scripts/start-service.sh history-service` | 3004 |
| Communication Service | `./scripts/start-service.sh communication-service` | 3005 |
| Notification Service | `./scripts/start-service.sh notification-service` | 3006 |
| Moderation Service | `./scripts/start-service.sh moderation-service` | 3007 |
| Analytics Service | `./scripts/start-service.sh analytics-service` | 3008 |
| Admin Service | `./scripts/start-service.sh admin-service` | 3009 |
| Subscription Service | `./scripts/start-service.sh subscription-service` | 3010 |
| GraphQL Gateway | `./scripts/start-service.sh graphql-gateway` | 4000 |

## After Starting

### View Logs
```bash
docker compose logs -f user-service
```

### Check Health
```bash
curl http://localhost:3001/health
```

### Stop Service
```bash
docker compose stop user-service
```

### Restart Service
```bash
docker compose restart user-service
```

### Stop Everything
```bash
docker compose down
```

## Troubleshooting

### Still Getting Port Conflicts?

```bash
# Nuclear option - stop everything
docker stop $(docker ps -q) 2>/dev/null || true
docker compose down

# Then start your service
./scripts/start-service.sh user-service
```

### Service Won't Start?

```bash
# Check logs
docker compose logs user-service

# Rebuild without cache
docker compose build --no-cache user-service
./scripts/start-service.sh user-service
```

### Database Connection Failed?

```bash
# Check PostgreSQL
docker compose ps postgres
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres

# Try again
./scripts/start-service.sh user-service
```

## Comparison: Old vs New

### ❌ Old Way (Causes Port Conflicts)
```bash
cd services/user-service
docker compose up -d
# Error: port 6379 already allocated!
```

### ✅ New Way (No Conflicts)
```bash
./scripts/start-service.sh user-service
# Works perfectly! Handles everything automatically.
```

## Quick Reference

```bash
# Start a service (handles everything)
./scripts/start-service.sh user-service

# View logs
docker compose logs -f user-service

# Stop service
docker compose stop user-service

# Stop all
docker compose down

# Restart service
docker compose restart user-service
```

## Why This Works

1. **Stops conflicts first** - Ensures no containers are using the ports
2. **Uses main compose** - Starts infrastructure from root docker-compose.yml
3. **Waits for readiness** - Ensures database is ready before starting service
4. **Automatic migrations** - Service runs migrations on startup
5. **Shows status** - You see exactly what's happening

## Summary

**One command does everything:**
```bash
./scripts/start-service.sh user-service
```

No more:
- ❌ Port conflicts
- ❌ Manual database setup
- ❌ Forgetting to start dependencies
- ❌ Running migrations manually

Just:
- ✅ One command
- ✅ Everything works
- ✅ Automatic migrations
- ✅ Ready to develop

🎉 Happy coding!
