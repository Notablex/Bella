@echo off
REM Rebuild a specific service with migrations
REM Usage: scripts\rebuild-service.bat user-service

set SERVICE_NAME=%1
if "%SERVICE_NAME%"=="" set SERVICE_NAME=user-service

echo Rebuilding %SERVICE_NAME%...
echo.

echo Stopping %SERVICE_NAME%...
docker compose stop %SERVICE_NAME%
docker compose rm -f %SERVICE_NAME%

echo Building %SERVICE_NAME% (no cache)...
docker compose build --no-cache %SERVICE_NAME%

echo Starting dependencies...
docker compose up -d postgres redis rabbitmq

echo Waiting for dependencies...
timeout /t 10 /nobreak > nul

echo Starting %SERVICE_NAME%...
docker compose up -d %SERVICE_NAME%

echo.
echo Watching logs (Ctrl+C to exit)...
echo.
docker compose logs -f %SERVICE_NAME%
