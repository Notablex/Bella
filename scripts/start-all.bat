@echo off
REM Quick start script for Windows
REM Usage: scripts\start-all.bat

echo Starting Realtime Connect Microservices...
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file with default values...
    (
        echo # JWT Configuration
        echo JWT_SECRET=dev-secret-key-change-in-production
        echo.
        echo # Stripe ^(optional for development^)
        echo STRIPE_SECRET_KEY=sk_test_your_key
        echo STRIPE_WEBHOOK_SECRET=whsec_your_secret
        echo.
        echo # Mixpanel ^(optional for development^)
        echo MIXPANEL_PROJECT_TOKEN=your_token
        echo MIXPANEL_API_SECRET=your_secret
    ) > .env
    echo Created .env file
    echo.
)

echo Starting infrastructure services...
docker compose up -d postgres redis rabbitmq

echo Waiting for infrastructure to be ready...
timeout /t 10 /nobreak > nul

echo Starting all microservices...
docker compose up -d

echo.
echo Waiting for services to start...
timeout /t 30 /nobreak > nul

echo.
echo All services started!
echo.
echo Service URLs:
echo    User Service:         http://localhost:3001
echo    Queuing Service:      http://localhost:3002
echo    Interaction Service:  http://localhost:3003
echo    History Service:      http://localhost:3004
echo    Communication Service: http://localhost:3005
echo    Notification Service: http://localhost:3006
echo    Moderation Service:   http://localhost:3007
echo    Analytics Service:    http://localhost:3008
echo    Admin Service:        http://localhost:3009
echo    Subscription Service: http://localhost:3010
echo    GraphQL Gateway:      http://localhost:4000/graphql
echo.
echo Infrastructure:
echo    PostgreSQL:           localhost:5432
echo    Redis:                localhost:6379
echo    RabbitMQ:             localhost:5672
echo    RabbitMQ Management:  http://localhost:15672 ^(admin/admin123^)
echo.
echo View logs: docker compose logs -f
echo Stop all:  docker compose down
