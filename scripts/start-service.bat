@echo off
REM Start a single service with all dependencies
REM Usage: scripts\start-service.bat user-service

setlocal enabledelayedexpansion

set SERVICE_NAME=%1
if "%SERVICE_NAME%"=="" set SERVICE_NAME=user-service

echo Starting %SERVICE_NAME% with dependencies...
echo.

REM Step 1: Stop any conflicting containers
echo Stopping any conflicting containers...
docker compose down 2>nul
cd services\%SERVICE_NAME% 2>nul && docker compose down 2>nul && cd ..\.. 2>nul
for /f "tokens=*" %%i in ('docker ps -q --filter "publish=6379" 2^>nul') do docker stop %%i 2>nul
for /f "tokens=*" %%i in ('docker ps -q --filter "publish=5432" 2^>nul') do docker stop %%i 2>nul

echo Conflicts cleared
echo.

REM Step 2: Start infrastructure
echo Starting shared infrastructure (PostgreSQL, Redis, RabbitMQ)...
docker compose up -d postgres redis rabbitmq

REM Step 3: Wait for infrastructure
echo Waiting for infrastructure to be ready...
timeout /t 10 /nobreak > nul

echo PostgreSQL and Redis should be ready
echo.

REM Step 4: Build and start the service
echo Building %SERVICE_NAME%...
docker compose build %SERVICE_NAME%

echo.
echo Starting %SERVICE_NAME%...
docker compose up -d %SERVICE_NAME%

echo.
echo Waiting for service to start...
timeout /t 5 /nobreak > nul

REM Step 5: Show status and logs
echo.
echo Service Status:
docker compose ps %SERVICE_NAME%

echo.
echo Recent Logs:
docker compose logs --tail=50 %SERVICE_NAME%

echo.
echo %SERVICE_NAME% is running!
echo.
echo Useful commands:
echo   View logs:    docker compose logs -f %SERVICE_NAME%
echo   Stop service: docker compose stop %SERVICE_NAME%
echo   Restart:      docker compose restart %SERVICE_NAME%
echo   Stop all:     docker compose down
