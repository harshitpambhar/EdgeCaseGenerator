# Test Case Generator - Docker Compose Helper Script for PowerShell
# Usage: ./docker-cmd.ps1 [command]

param(
    [Parameter(Position = 0)]
    [string]$Command,
    [Parameter(Position = 1)]
    [string]$Service
)

function Show-Help {
    Write-Host ""
    Write-Host "Test Case Generator - Docker Compose Helper" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: ./docker-cmd.ps1 [command] [service]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Green
    Write-Host "  up              Start all services"
    Write-Host "  down            Stop all services"
    Write-Host "  logs            View all service logs"
    Write-Host "  build           Build all containers"
    Write-Host "  rebuild         Rebuild all containers (no cache)"
    Write-Host "  ps              List running containers"
    Write-Host "  restart         Restart all services"
    Write-Host "  clean           Remove all containers and volumes"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  ./docker-cmd.ps1 up"
    Write-Host "  ./docker-cmd.ps1 logs"
    Write-Host "  ./docker-cmd.ps1 logs api-gateway"
    Write-Host "  ./docker-cmd.ps1 down"
    Write-Host ""
}

function Invoke-DockerCompose {
    param([string[]]$Arguments)
    & docker-compose @Arguments
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Command failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

if ([string]::IsNullOrEmpty($Command)) {
    Show-Help
    exit 1
}

switch ($Command.ToLower()) {
    "up" {
        Write-Host "Starting all services..." -ForegroundColor Green
        Invoke-DockerCompose @("up", "-d")
        Write-Host ""
        Write-Host "Services started! Waiting for health checks..." -ForegroundColor Green
        Start-Sleep -Seconds 5
        Invoke-DockerCompose @("ps")
        Write-Host ""
        Write-Host "Access the application at:" -ForegroundColor Yellow
        Write-Host "  Frontend: http://localhost:3000"
        Write-Host "  API Gateway: http://localhost:8080"
        Write-Host "  Eureka Dashboard: http://localhost:8761/eureka"
        Write-Host "  Config Server: http://localhost:8888"
        Write-Host "  ML API: http://localhost:8000"
        Write-Host ""
    }

    "down" {
        Write-Host "Stopping all services..." -ForegroundColor Green
        Invoke-DockerCompose @("down")
        Write-Host "Services stopped." -ForegroundColor Green
    }

    "logs" {
        if ([string]::IsNullOrEmpty($Service)) {
            Invoke-DockerCompose @("logs", "-f")
        }
        else {
            Invoke-DockerCompose @("logs", "-f", $Service)
        }
    }

    "build" {
        Write-Host "Building all containers..." -ForegroundColor Green
        Invoke-DockerCompose @("build")
    }

    "rebuild" {
        Write-Host "Rebuilding all containers (no cache)..." -ForegroundColor Green
        Invoke-DockerCompose @("build", "--no-cache")
    }

    "ps" {
        Invoke-DockerCompose @("ps")
    }

    "restart" {
        if ([string]::IsNullOrEmpty($Service)) {
            Write-Host "Restarting all services..." -ForegroundColor Green
            Invoke-DockerCompose @("restart")
        }
        else {
            Write-Host "Restarting $Service..." -ForegroundColor Green
            Invoke-DockerCompose @("restart", $Service)
        }
    }

    "clean" {
        Write-Host "WARNING: This will remove all containers and volumes!" -ForegroundColor Red
        $confirm = Read-Host "Continue? (y/n)"
        if ($confirm -eq "y") {
            Invoke-DockerCompose @("down", "-v")
            Write-Host "Clean complete." -ForegroundColor Green
        }
        else {
            Write-Host "Cancelled." -ForegroundColor Yellow
        }
    }

    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Show-Help
        exit 1
    }
}
