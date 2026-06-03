@echo off
REM Test Case Generator - Docker Compose Helper Script for Windows

setlocal enabledelayedexpansion

if "%1"=="" (
    echo.
    echo Test Case Generator - Docker Compose Helper
    echo.
    echo Usage: docker-cmd.bat [command] [options]
    echo.
    echo Commands:
    echo   up              Start all services
    echo   down            Stop all services
    echo   logs            View all service logs
    echo   build           Build all containers
    echo   rebuild         Rebuild all containers (no cache)
    echo   ps              List running containers
    echo   restart         Restart all services
    echo   clean           Remove all containers and volumes
    echo.
    echo Examples:
    echo   docker-cmd.bat up
    echo   docker-cmd.bat logs
    echo   docker-cmd.bat down
    echo.
    exit /b 1
)

if "%1"=="up" (
    echo Starting all services...
    docker-compose up -d
    echo.
    echo Services started! Waiting for health checks...
    timeout /t 5
    docker-compose ps
    echo.
    echo Access the application at:
    echo   Frontend: http://localhost:3000
    echo   API Gateway: http://localhost:8080
    echo   Eureka Dashboard: http://localhost:8761/eureka
    echo.
    exit /b 0
)

if "%1"=="down" (
    echo Stopping all services...
    docker-compose down
    echo Services stopped.
    exit /b 0
)

if "%1"=="logs" (
    if "%2"=="" (
        docker-compose logs -f
    ) else (
        docker-compose logs -f %2
    )
    exit /b 0
)

if "%1"=="build" (
    echo Building all containers...
    docker-compose build
    exit /b 0
)

if "%1"=="rebuild" (
    echo Rebuilding all containers (no cache)...
    docker-compose build --no-cache
    exit /b 0
)

if "%1"=="ps" (
    docker-compose ps
    exit /b 0
)

if "%1"=="restart" (
    if "%2"=="" (
        echo Restarting all services...
        docker-compose restart
    ) else (
        echo Restarting %2...
        docker-compose restart %2
    )
    exit /b 0
)

if "%1"=="clean" (
    echo WARNING: This will remove all containers and volumes!
    set /p confirm="Continue? (y/n): "
    if "!confirm!"=="y" (
        docker-compose down -v
        echo Clean complete.
    ) else (
        echo Cancelled.
    )
    exit /b 0
)

echo Unknown command: %1
exit /b 1
