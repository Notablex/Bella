# Kindred Backend Documentation

Welcome to the Kindred backend documentation. This guide will help you understand, set up, and test the microservices.

## Quick Start

1. **Setup** → [Getting Started Guide](./setup/GETTING_STARTED.md)
2. **Test APIs** → [API Testing](./api-tests/README.md)
3. **Troubleshoot** → [Common Issues](./troubleshooting/COMMON_ISSUES.md)

## Documentation Structure

```
docs/
├── setup/              # Setup and deployment guides
├── api-tests/          # API endpoint testing guides
├── architecture/       # System architecture docs
└── troubleshooting/    # Common issues and solutions
```

## Services Overview

| Service | Port | Purpose |
|---------|------|---------|
| User Service | 3001 | Authentication, profiles, safety |
| Subscription Service | 3010 | Plans, billing, payments |
| GraphQL Gateway | 4000 | Unified API gateway |

## Quick Links

- [User Service API](./api-tests/USER_SERVICE.md)
- [Subscription Service API](./api-tests/SUBSCRIPTION_SERVICE.md)
- [Docker Setup](./setup/DOCKER_SETUP.md)
- [Database Migrations](./setup/MIGRATIONS.md)
