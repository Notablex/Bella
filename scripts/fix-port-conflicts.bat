@echo off
REM Fix port conflicts by stopping all Docker containers
REM Usage: scripts\fix-port-conflicts.bat

echo Fixing Docker port conflicts...
echo.

echo Stopping main docker-compose...
docker compose down 2>nul

echo Stopping individual service composes...
cd services\user-service 2>nul && docker compose down 2>nul && cd ..\..
cd services\queuing-service 2>nul && docker compose down 2>nul && cd ..\..
cd services\interaction-service 2>nul && docker compose down 2>nul && cd ..\..
cd services\history-service 2>nul && docker compose down 2>nul && cd ..\..
cd services\communication-service 2>nul && docker compose down 2>nul && cd ..\..
cd services\notification-service 2>nul && docker compose down 2>nul && cd ..\..
cd services\moderation-service 2>nul && docker compose down 2>nul && cd ..\..
cd services\analytics-service 2>nul && docker compose down 2>nul && cd ..\..
cd services\admin-service 2>nul && docker compose down 2>nul && cd ..\..
cd services\subscription-service 2>nul && docker compose down 2>nul && cd ..\..
cd services\graphql-gateway 2>nul && docker compose down 2>nul && cd ..\..

echo.
echo Stopping any remaining containers...
for /f "tokens=*" %%i in ('docker ps -q') do docker stop %%i 2>nul

echo.
echo Current Docker status:
docker ps

echo.
echo Port conflicts resolved!
echo.
echo Next steps:
echo   1. Start all services: docker compose up -d
echo   2. Or use script: scripts\start-all.bat
echo   3. Check status: docker compose ps
