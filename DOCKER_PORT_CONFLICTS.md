# Docker Port Conflict Resolution

## Problem: Port Already Allocated

### Error Message
```
Error response from daemon: failed to set up container networking: 
driver failed programming external connectivity on endpoint user-redis: 
Bind for 0.0.0.0:6379 failed: port is already allocated
```

## Root Cause

This happens when:
1. **Main docker-compose is running** - The root `docker-compose.yml` already has Redis on port 6379
2. **Individual service compose is running** - Trying to start `services/user-service/docker-compose.yml` which also wants port 6379
3. **Local Redis is running** - Redis installed locally on your machine
4. **Another container is using the port** - Previous containers weren't cleaned up

## Solutions

### Solution 1: Use Root Docker Compose (RECOMMENDED)

**Stop individual services and use the main compose file:**

```bash
# Stop any individual service compose files
cd services/user-service
docker compose down
cd ../..

# Use the root docker-compose.yml instead
docker compose up -d

# This starts ALL services with shared infrastructure
# No port conflicts because there's only ONE Redis instance
```

**Why this is better:**
- ✅ Single shared Redis (more efficient)
- ✅ Single shared PostgreSQL (more efficient)
- ✅ No port conflicts
- ✅ All services can communicate
- ✅ Easier to manage

### Solution 2: Stop Conflicting Containers

**Find and stop what's using the port:**

```bash
# List all running containers
docker ps

# Stop the main compose
docker compose down

# Or stop specific container
docker stop redis-main
docker stop user-redis

# Clean up
docker compose down -v
```

### Solution 3: Use Different Ports for Individual Services

If you MUST run services individually, they already use different ports:

**Individual service Redis ports:**
- user-service: 6379 → **6379** (conflicts with main!)
- queuing-service: 6379 → **6381**
- interaction-service: 6379 → **6382**
- communication-service: 6379 → **6383**
- etc.

**The issue:** user-service individual compose uses 6379, same as main compose.

### Solution 4: Check What's Using the Port

**Windows:**
```cmd
# Find process using port 6379
netstat -ano | findstr :6379

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Find process using port 6379
lsof -i :6379

# Kill the process
kill -9 <PID>
```

**Docker:**
```bash
# List containers using port 6379
docker ps --filter "publish=6379"

# Stop all containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)
```

## Recommended Workflow

### For Development (All Services)

```bash
# 1. Stop everything
docker compose down

# 2. Start all services
docker compose up -d

# 3. Check status
docker compose ps

# 4. View logs
docker compose logs -f
```

### For Development (Single Service)

If you want to develop on just one service:

```bash
# Option A: Start only specific services from main compose
docker compose up -d postgres redis user-service

# Option B: Use individual compose (but stop main first!)
docker compose down  # Stop main compose first!
cd services/user-service
docker compose up -d
```

### For Testing Individual Service

```bash
# 1. Ensure main compose is stopped
docker compose down

# 2. Go to service directory
cd services/user-service

# 3. Start the service
docker compose up -d

# 4. Test
curl http://localhost:3001/health

# 5. Stop when done
docker compose down

# 6. Return to root and start main compose
cd ../..
docker compose up -d
```

## Quick Fixes

### Fix 1: Clean Slate
```bash
# Stop everything
docker compose down
cd services/user-service && docker compose down && cd ../..
cd services/queuing-service && docker compose down && cd ../..

# Remove all containers
docker rm -f $(docker ps -aq)

# Start fresh
docker compose up -d
```

### Fix 2: Use Main Compose Only
```bash
# This is the simplest solution
docker compose down
docker compose up -d

# All services start with shared infrastructure
# No port conflicts!
```

### Fix 3: Change Individual Service Ports

Edit `services/user-service/docker-compose.yml`:

```yaml
# Change this:
user-redis:
  ports:
    - "6379:6379"  # CONFLICTS!

# To this:
user-redis:
  ports:
    - "6390:6379"  # Different host port
```

## Prevention

### Best Practices

1. **Choose ONE approach:**
   - Either use root `docker-compose.yml` (recommended)
   - OR use individual service compose files (not both at once)

2. **Always check what's running:**
   ```bash
   docker compose ps
   docker ps
   ```

3. **Clean up when switching:**
   ```bash
   # When switching from individual to main
   cd services/user-service && docker compose down && cd ../..
   docker compose up -d
   
   # When switching from main to individual
   docker compose down
   cd services/user-service && docker compose up -d
   ```

4. **Use helper scripts:**
   ```bash
   # These handle cleanup automatically
   ./scripts/start-all.sh
   ./scripts/stop-all.sh
   ```

## Port Reference

### Main Compose (docker-compose.yml)
- PostgreSQL: 5432
- Redis: 6379
- RabbitMQ: 5672, 15672

### Individual Service Composes
- user-service: PostgreSQL 5432, Redis 6379 ⚠️ CONFLICTS
- queuing-service: PostgreSQL 5434, Redis 6381
- interaction-service: PostgreSQL 5435, Redis 6382
- communication-service: PostgreSQL 5436, Redis 6383
- notification-service: PostgreSQL 5437, Redis 6384
- history-service: PostgreSQL 5438, Redis 6385
- moderation-service: PostgreSQL 5439, Redis 6386
- admin-service: PostgreSQL 5440, Redis 6387
- graphql-gateway: Redis 6388
- subscription-service: PostgreSQL 5441, Redis 6389

## Current Issue Resolution

**Your specific error with user-redis:**

```bash
# Step 1: Stop main compose
docker compose down

# Step 2: Check if anything is still running
docker ps

# Step 3: If containers are still running, force stop
docker stop $(docker ps -q)

# Step 4: Start main compose (RECOMMENDED)
docker compose up -d

# OR start individual service (if you must)
cd services/user-service
docker compose up -d
```

## Summary

**RECOMMENDED SOLUTION:**
```bash
# Use the main docker-compose.yml
docker compose down  # Stop everything
docker compose up -d # Start all services
```

This avoids ALL port conflicts and is the intended way to run the system! 🎉
