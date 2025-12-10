@echo off
REM Stop all services (Windows)
REM Usage: scripts\stop-all.bat [clean]

echo Stopping all services...

if "%1"=="clean" (
    echo WARNING: This will remove all containers and volumes!
    set /p confirm="Are you sure? (y/N): "
    if /i "%confirm%"=="y" (
        docker compose down -v
        echo All services stopped and data cleaned
    ) else (
        echo Cancelled
        exit /b 1
    )
) else (
    docker compose down
    echo All services stopped ^(data preserved^)
    echo To remove all data, run: scripts\stop-all.bat clean
)
