# Docker Entrypoint Guide

## What Changed?

All microservices now use dedicated `docker-entrypoint.sh` scripts instead of inline commands in docker-compose.yml.

## Structure

Each service has its own entrypoint script at:
```
services/<service-name>/docker-entrypoint.sh
```

## Entrypoint Script Template

```bash
#!/bin/sh
set -e

echo "🚀 Starting <service-name> entrypoint..."

# Run database migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete!"
echo "🎯 Starting <service-name>..."

# Start the application
exec node dist/index.js
```

## Key Features

### 1. Error Handling
- `set -e`: Exit immediately if any command fails
- Prevents services from starting with failed migrations

### 2. Proper Process Management
- `exec`: Replaces shell process with Node.js process
- Ensures proper signal handling (SIGTERM, SIGINT)
- Allows graceful shutdowns

### 3. Logging
- Clear startup messages
- Migration status feedback
- Easy debugging

## Dockerfile Integration

Each Dockerfile now includes:

```dockerfile
# Copy entrypoint script
COPY services/<service-name>/docker-entrypoint.sh ./services/<service-name>/
RUN chmod +x ./services/<service-name>/docker-entrypoint.sh

# Set entrypoint
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "docker-entrypoint.sh"]
```

### Why dumb-init?

- Proper signal forwarding to child processes
- Reaps zombie processes
- Ensures clean container shutdowns
- Industry best practice for containerized Node.js apps

## Customizing Entrypoint Scripts

### Adding Pre-Migration Steps

```bash
#!/bin/sh
set -e

echo "🚀 Starting service entrypoint..."

# Wait for external service
echo "⏳ Waiting for Redis..."
until nc -z redis 6379; do
  sleep 1
done

# Run migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

# Seed database (optional)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run seed
fi

echo "✅ Initialization complete!"
echo "🎯 Starting service..."

exec node dist/index.js
```

### Adding Health Checks

```bash
#!/bin/sh
set -e

echo "🚀 Starting service entrypoint..."

# Run migrations
npx prisma migrate deploy

# Verify database connection
echo "🔍 Verifying database connection..."
node -e "require('./dist/utils/db-check.js')"

echo "✅ All checks passed!"
echo "🎯 Starting service..."

exec node dist/index.js
```

### Environment-Specific Logic

```bash
#!/bin/sh
set -e

echo "🚀 Starting service entrypoint..."

if [ "$NODE_ENV" = "production" ]; then
  echo "📦 Running migrations..."
  npx prisma migrate deploy
else
  echo "🔧 Development mode - skipping migrations"
fi

echo "🎯 Starting service..."
exec node dist/index.js
```

## Debugging

### View Entrypoint Logs

```bash
# View logs for specific service
docker compose logs -f user-service

# View only entrypoint output
docker compose logs user-service | grep "🚀\|📦\|✅\|🎯"
```

### Test Entrypoint Locally

```bash
# Enter container
docker compose exec user-service sh

# Run entrypoint manually
cd /app/services/user-service
sh docker-entrypoint.sh
```

### Override Entrypoint for Debugging

```yaml
# docker-compose.override.yml
services:
  user-service:
    entrypoint: ["sh"]
    command: ["-c", "sleep infinity"]
```

Then exec into container:
```bash
docker compose up -d user-service
docker compose exec user-service sh
# Now you can run commands manually
```

## Common Issues

### Issue: Permission Denied

**Error:**
```
sh: can't open 'docker-entrypoint.sh': Permission denied
```

**Solution:**
```bash
# Make script executable
chmod +x services/user-service/docker-entrypoint.sh

# Rebuild image
docker compose build user-service
```

### Issue: Migration Fails

**Error:**
```
Error: P1001: Can't reach database server
```

**Solution:**
- Check DATABASE_URL environment variable
- Ensure postgres service is healthy
- Verify network connectivity

### Issue: Script Not Found

**Error:**
```
sh: docker-entrypoint.sh: not found
```

**Solution:**
- Verify COPY command in Dockerfile
- Check working directory (WORKDIR)
- Ensure script is in correct location

## Best Practices

### 1. Keep Scripts Simple
- Focus on initialization tasks
- Avoid complex logic
- Use separate scripts for complex operations

### 2. Fail Fast
- Use `set -e` to exit on errors
- Validate critical dependencies
- Don't start service if initialization fails

### 3. Log Everything
- Clear, descriptive messages
- Use emojis for visual scanning
- Include timestamps for debugging

### 4. Use exec
- Always use `exec` for final command
- Ensures proper signal handling
- Prevents zombie processes

### 5. Make Scripts Idempotent
- Safe to run multiple times
- Check before creating resources
- Handle existing state gracefully

## Testing

### Test Entrypoint Script

```bash
# Build image
docker compose build user-service

# Run with logs
docker compose up user-service

# Expected output:
# 🚀 Starting user-service entrypoint...
# 📦 Running Prisma migrations...
# ✅ Migrations complete!
# 🎯 Starting user-service...
# Server listening on port 3001
```

### Test Migration Failure

```bash
# Temporarily break DATABASE_URL
docker compose run -e DATABASE_URL=invalid user-service

# Should fail and exit
# Container should not start
```

### Test Signal Handling

```bash
# Start service
docker compose up -d user-service

# Send SIGTERM
docker compose stop user-service

# Check logs for graceful shutdown
docker compose logs user-service
```

## Migration from Old Setup

### Before (docker-compose.yml)
```yaml
command: >
  sh -c "
    echo 'Running migrations...' &&
    cd /app/services/user-service &&
    npx prisma migrate deploy &&
    echo 'Starting user-service...' &&
    node dist/index.js
  "
```

### After (docker-entrypoint.sh)
```bash
#!/bin/sh
set -e
echo "🚀 Starting user-service entrypoint..."
npx prisma migrate deploy
echo "🎯 Starting user-service..."
exec node dist/index.js
```

### Benefits
- ✅ Cleaner docker-compose.yml
- ✅ Easier to version control
- ✅ Better error handling
- ✅ Proper signal handling
- ✅ Reusable across environments
- ✅ Easier to test and debug

## Additional Resources

- [Docker ENTRYPOINT vs CMD](https://docs.docker.com/engine/reference/builder/#entrypoint)
- [dumb-init Documentation](https://github.com/Yelp/dumb-init)
- [Shell Script Best Practices](https://google.github.io/styleguide/shellguide.html)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
