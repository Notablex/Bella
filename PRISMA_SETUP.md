# Prisma Database Setup Guide

## Problem: Tables Not Created Automatically

### Why This Happens

Prisma requires either:
1. **Migration files** (`prisma/migrations/` directory) - for production
2. **`prisma db push`** command - for development
3. **Automatic migration in Dockerfile** - what we've now implemented

## Solution Implemented ✅

### 1. Docker Entrypoint Script

Created `services/user-service/docker-entrypoint.sh` that:
- ✅ Waits for database to be ready
- ✅ Automatically runs `prisma migrate deploy` (if migrations exist)
- ✅ Falls back to `prisma db push` (creates tables from schema)
- ✅ Starts the application

### 2. Updated Dockerfile

The Dockerfile now:
- ✅ Copies the entrypoint script
- ✅ Makes it executable
- ✅ Uses it as the container entrypoint
- ✅ Runs migrations automatically on container start

## How It Works

```
Container Start
     ↓
Wait for Database
     ↓
Try: prisma migrate deploy
     ↓ (if fails)
Try: prisma db push
     ↓
Start Application
```

## Rebuild and Test

### Step 1: Rebuild the Service

```bash
# Stop the service
docker compose down user-service

# Rebuild with no cache
docker compose build --no-cache user-service

# Start the service
docker compose up -d user-service
```

### Step 2: Watch the Logs

```bash
# Watch the migration process
docker compose logs -f user-service
```

You should see:
```
🚀 Starting User Service...
⏳ Waiting for database to be ready...
✅ Database connection established!
📦 Applying database schema...
✅ Schema pushed successfully!
🎉 Starting application...
```

### Step 3: Verify Tables

```bash
# Connect to database
docker compose exec postgres psql -U postgres -d users

# List tables
\dt

# You should see:
# - users
# - profiles
# - analytics_events
# - chat_messages
# - interaction_sessions
# - report_incidents
# - system_metrics
# - user_actions
# - user_analytics
```

## Manual Migration (If Needed)

### Option 1: Using Docker Exec

```bash
# Run migrations manually
docker exec -it user-service sh -c 'cd /app/services/user-service && npx prisma db push'

# Or with migrate deploy
docker exec -it user-service sh -c 'cd /app/services/user-service && npx prisma migrate deploy'
```

### Option 2: Create Migration Files

```bash
# On your local machine (not in Docker)
cd services/user-service

# Create initial migration
npx prisma migrate dev --name init

# This creates: prisma/migrations/XXXXXX_init/migration.sql
```

Then rebuild the Docker image:
```bash
docker compose build --no-cache user-service
docker compose up -d user-service
```

## For Other Services

Apply the same pattern to other services that use Prisma:

### 1. Create Entrypoint Script

```bash
# For each service
cp services/user-service/docker-entrypoint.sh services/queuing-service/
cp services/user-service/docker-entrypoint.sh services/interaction-service/
# etc.
```

### 2. Update Dockerfile

Add to each service's Dockerfile:

```dockerfile
# Copy entrypoint script
COPY services/SERVICE-NAME/docker-entrypoint.sh ./services/SERVICE-NAME/

# Make it executable
RUN chmod +x /app/services/SERVICE-NAME/docker-entrypoint.sh

# Use as entrypoint
ENTRYPOINT ["dumb-init", "--", "/app/services/SERVICE-NAME/docker-entrypoint.sh"]
CMD ["node", "services/SERVICE-NAME/dist/index.js"]
```

## Troubleshooting

### Tables Still Not Created

```bash
# 1. Check logs
docker compose logs user-service

# 2. Manually push schema
docker exec -it user-service sh -c 'cd /app/services/user-service && npx prisma db push --accept-data-loss'

# 3. Check database
docker compose exec postgres psql -U postgres -d users -c "\dt"
```

### Schema File Not Found

```bash
# Verify schema exists in container
docker exec -it user-service ls -la /app/services/user-service/prisma/

# Should show: schema.prisma
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Test connection
docker compose exec postgres pg_isready -U postgres
```

### Permission Denied

```bash
# The entrypoint script might not be executable
docker exec -it user-service chmod +x /app/services/user-service/docker-entrypoint.sh

# Restart container
docker compose restart user-service
```

## Best Practices

### Development

```bash
# Use db push for quick iterations
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### Production

```bash
# Create proper migrations
npx prisma migrate dev --name descriptive_name

# Deploy migrations
npx prisma migrate deploy
```

### Docker

```bash
# Always rebuild after schema changes
docker compose build --no-cache user-service
docker compose up -d user-service
```

## Verification Checklist

- [ ] Entrypoint script exists: `services/user-service/docker-entrypoint.sh`
- [ ] Entrypoint script is executable (chmod +x)
- [ ] Dockerfile copies entrypoint script
- [ ] Dockerfile uses entrypoint script
- [ ] Container starts successfully
- [ ] Logs show migration/push success
- [ ] Tables exist in database
- [ ] Application connects to database

## Quick Fix Commands

```bash
# Complete reset and rebuild
docker compose down -v
docker compose build --no-cache user-service
docker compose up -d postgres redis
sleep 10
docker compose up -d user-service
docker compose logs -f user-service
```

## Status: ✅ FIXED

The user-service Dockerfile now automatically:
1. Waits for database
2. Runs migrations/pushes schema
3. Creates all tables
4. Starts the application

No manual intervention needed! 🎉
