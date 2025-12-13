# 🔧 Docker Build Fix - Subscription Service

## Issue
The `subscription-service` has TypeScript compilation errors preventing Docker build.

## Quick Fix Options

### Option 1: Comment Out Subscription Service (Recommended for Cleanup)

Edit `docker-compose.yml` and comment out the entire `subscription-service` section (lines ~550-620):

```yaml
  # subscription-service:
  #   build:
  #     context: .
  #     dockerfile: services/subscription-service/Dockerfile
  #   ...
```

Then start the stack without subscription-service:

```bash
docker compose up -d
```

### Option 2: Fix TypeScript Errors

The subscription-service has code issues that need fixing:

1. **Prisma Schema Mismatch** - Field names don't match (e.g., `trialEndsAt` vs `trialEnd`)
2. **Missing Properties** - `priceAmount`, `stripePriceId`, etc.
3. **Stripe API Version** - Using incompatible version

**To fix:**

```bash
cd services/subscription-service

# Regenerate Prisma client
npx prisma generate

# Check for schema issues
npx prisma validate

# Fix TypeScript errors in src/
```

### Option 3: Skip Build, Use Pre-built Image (If Available)

If you have a working image:

```yaml
subscription-service:
  image: kindred-subscription-service:latest  # Use existing image
  # Remove build section
```

## Recommended Approach for Cleanup

Since you're doing the legacy cleanup, I recommend **Option 1**:

1. Comment out `subscription-service` in `docker-compose.yml`
2. Complete the cleanup with 14 services (instead of 15)
3. Fix subscription-service code issues separately
4. Uncomment and rebuild when ready

## Start Stack Without Subscription Service

```bash
# Build all services except subscription
docker compose build user-service queuing-service interaction-service history-service communication-service notification-service moderation-service analytics-service admin-service graphql-gateway

# Start infrastructure + 10 services
docker compose up -d postgres redis rabbitmq user-service queuing-service interaction-service history-service communication-service notification-service moderation-service analytics-service admin-service graphql-gateway
```

## Verify

```bash
docker compose ps

# Should show 13 containers running:
# - postgres
# - redis  
# - rabbitmq
# - 10 microservices (without subscription-service)
```

## Fix Subscription Service Later

Once cleanup is complete, fix the subscription-service:

1. Review Prisma schema
2. Fix TypeScript errors
3. Update Stripe API version
4. Rebuild and test
5. Uncomment in docker-compose.yml

---

**For now: Proceed with cleanup using 14 containers instead of 15.**
