# KINDRED - Dating Platform Microservices

A production-ready, containerized dating platform built with 12 microservices, GraphQL gateway, and real-time communication.

## 🚀 Quick Start (The One Command)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env and set JWT_SECRET (minimum requirement)
nano .env

# 3. Start everything
docker compose up -d

# 4. Check status
docker compose ps

# 5. View logs
docker compose logs -f
```

**That's it!** All 12 services + infrastructure will start automatically.

---

## 📋 Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **8GB RAM minimum** (16GB recommended)
- **20GB free disk space**

---

## 🏗️ Architecture Overview

### Infrastructure Layer
- **PostgreSQL 15** - Single instance, 10 databases
- **Redis 7** - Caching and session management
- **RabbitMQ 3** - Message queue for async operations

### Microservices (Ports 3001-3010)

| Service | Port | Responsibility | Health Check |
|---------|------|----------------|--------------|
| **user-service** | 3001 | Authentication, profiles, preferences | `GET /health` |
| **queuing-service** | 3002 | Matching queue, dating algorithm | `GET /health` |
| **interaction-service** | 3003 | Likes, matches, swipes | `GET /health` |
| **history-service** | 3004 | Activity logs, user history | `GET /health` |
| **communication-service** | 3005 | Real-time chat, WebSocket | `GET /health` |
| **notification-service** | 3006 | Push notifications, alerts | `GET /health` |
| **moderation-service** | 3007 | Content moderation, safety | `GET /health` |
| **analytics-service** | 3008 | Metrics, reporting, ETL | `GET /health` |
| **admin-service** | 3009 | Admin panel, management | `GET /health` |
| **subscription-service** | 3010 | Payments, billing (Stripe) | `GET /health` |

### API Gateway (Port 4000)
| Service | Port | Responsibility | Health Check |
|---------|------|----------------|--------------|
| **graphql-gateway** | 4000 | GraphQL API aggregation | `GET /.well-known/apollo/server-health` |

---

## 🔧 Common Operations

### Start All Services
```bash
docker compose up -d
```

### Start Single Service (with dependencies)
```bash
docker compose up user-service -d
```

### Stop All Services
```bash
docker compose down
```

### View Logs
```bash
# All services
docker compose logs -f

# Single service
docker compose logs -f user-service

# Last 100 lines
docker compose logs --tail=100 user-service
```

### Restart Service
```bash
docker compose restart user-service
```

### Rebuild Service
```bash
docker compose up --build user-service -d
```

### Check Service Status
```bash
docker compose ps
```

### Execute Command in Container
```bash
docker compose exec user-service sh
```

### View Resource Usage
```bash
docker stats
```

---

## 🗄️ Database Management

### Run Migrations (All Services)
```bash
# Migrations run automatically on container start
# To run manually:
docker compose exec user-service npx prisma migrate deploy
```

### Access PostgreSQL
```bash
docker compose exec postgres psql -U postgres -d users
```

### Backup Database
```bash
docker compose exec postgres pg_dump -U postgres users > backup_users.sql
```

### Restore Database
```bash
cat backup_users.sql | docker compose exec -T postgres psql -U postgres users
```

---

## 🧪 Testing API Endpoints

### 1. Health Checks
```bash
# Check all services
curl http://localhost:3001/health  # user-service
curl http://localhost:3002/health  # queuing-service
curl http://localhost:4000/.well-known/apollo/server-health  # graphql-gateway
```

### 2. User Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User",
    "dateOfBirth": "1995-01-01",
    "gender": "male"
  }'
```

### 3. User Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### 4. Get Profile (Authenticated)
```bash
# Save token from login response
TOKEN="your_jwt_token_here"

curl http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Like User (Interaction)
```bash
curl -X POST http://localhost:3003/api/interactions/like \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUserId": "user-id-to-like"
  }'
```

### 6. Send Message
```bash
curl -X POST http://localhost:3005/api/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "recipient-user-id",
    "content": "Hello! How are you?"
  }'
```

### 7. GraphQL Query (Gateway)
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "{ me { id email name profile { bio age } } }"
  }'
```

---

## 🔐 Environment Variables

### Required (Minimum)
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

### Payment Integration (Subscription Service)
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### File Storage (User & Communication Services)
```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=your-bucket
```

### Push Notifications (Notification Service)
```env
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Analytics (Analytics Service)
```env
MIXPANEL_PROJECT_TOKEN=...
MIXPANEL_API_SECRET=...
```

---

## 🐛 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker compose logs service-name

# Check if database is ready
docker compose exec postgres pg_isready -U postgres

# Restart service
docker compose restart service-name
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Change port in .env
POSTGRES_PORT=5433
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker compose ps postgres

# Check database exists
docker compose exec postgres psql -U postgres -l

# Recreate database
docker compose down -v
docker compose up -d
```

### Out of Memory
```bash
# Check resource usage
docker stats

# Increase Docker memory limit (Docker Desktop)
# Settings > Resources > Memory > 8GB+

# Or reduce service limits in docker-compose.yml
```

### Prisma Migration Fails
```bash
# Reset database (WARNING: deletes all data)
docker compose exec user-service npx prisma migrate reset

# Or manually run migrations
docker compose exec user-service npx prisma migrate deploy
```

---

## 📊 Monitoring

### RabbitMQ Management UI
```
http://localhost:15672
Username: admin
Password: admin123
```

### Service Health Dashboard
```bash
# Create a simple health check script
for port in {3001..3010} 4000; do
  echo -n "Port $port: "
  curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health
  echo
done
```

---

## 🔄 Development Workflow

### 1. Work on Single Service
```bash
# Start infrastructure + dependencies
docker compose up postgres redis rabbitmq -d

# Start your service
docker compose up user-service -d

# Watch logs
docker compose logs -f user-service

# Make changes to code...

# Rebuild and restart
docker compose up --build user-service -d
```

### 2. Run Service Locally (Outside Docker)
```bash
# Start infrastructure only
docker compose up postgres redis rabbitmq -d

# Set environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/users"
export REDIS_URL="redis://localhost:6379"
export JWT_SECRET="your-secret"

# Run service locally
cd services/user-service
npm install
npm run dev
```

---

## 🚨 Production Deployment

### Security Checklist
- [ ] Change all default passwords in `.env`
- [ ] Use strong JWT_SECRET (min 32 chars)
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up log aggregation
- [ ] Enable database backups
- [ ] Configure monitoring/alerting
- [ ] Review resource limits

### Recommended Changes for Production
```yaml
# In docker-compose.yml, update:
restart: always  # Instead of unless-stopped
```

---

## 📚 Additional Documentation

- **DEVELOPMENT.md** - Detailed development guide
- **API_SPECIFICATIONS.md** - Complete API documentation
- **DATABASE_SCHEMA.md** - Database schemas
- **ARCHITECTURE.md** - System architecture details

---

## 🆘 Support

### Common Issues
1. **"Port already in use"** - Change port in `.env`
2. **"Database connection failed"** - Wait for PostgreSQL to be ready
3. **"Out of memory"** - Increase Docker memory limit
4. **"Prisma migration failed"** - Check database connection

### Getting Help
- Check logs: `docker compose logs -f service-name`
- Check status: `docker compose ps`
- Restart: `docker compose restart service-name`
- Full reset: `docker compose down -v && docker compose up -d`

---

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ using Docker, Node.js, TypeScript, PostgreSQL, Redis, and RabbitMQ**
