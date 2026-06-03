# Test Case Generator - Docker Quick Start Guide

## One-Command Start

### Windows (PowerShell)
```powershell
cd "T:\D-drive\main-TCG-2\EdgeCaseGenerator"
./docker-cmd.ps1 up
```

### Windows (Command Prompt)
```cmd
cd T:\D-drive\main-TCG-2\EdgeCaseGenerator
docker-cmd.bat up
```

### macOS/Linux
```bash
cd /path/to/EdgeCaseGenerator
docker-compose up -d
```

## What This Does

The docker setup creates **ONE complete application container environment** with:

✅ **Frontend** (React + Vite)
- Accessible at: http://localhost:3000
- Pre-built and optimized for production

✅ **API Gateway** (Spring Boot)
- Accessible at: http://localhost:8080
- Routes all backend requests
- Handles CORS for frontend

✅ **Core Services** (5 Java Microservices)
- Auth Service (8081)
- User Service (8082)
- Job Service (8083)
- Config Server (8888)
- Eureka Registry (8761)

✅ **Database** (PostgreSQL)
- Internal port: 5432
- Automatically initialized

✅ **AI/ML Services** (Python FastAPI)
- Accessible at: http://localhost:8000
- Test execution, analysis, code generation

## Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Web UI |
| API Gateway | http://localhost:8080 | Backend API |
| Eureka | http://localhost:8761/eureka | Service Registry |
| Config | http://localhost:8888 | Config Management |
| ML API | http://localhost:8000 | AI Services |
| Database | localhost:5432 | PostgreSQL |

## Useful Commands

```bash
# View all services status
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api-gateway
docker-compose logs -f frontend

# Restart specific service
docker-compose restart api-gateway

# Stop everything
docker-compose down

# Stop and delete all data
docker-compose down -v

# Rebuild after code changes
docker-compose build --no-cache
docker-compose up -d
```

## Environment Variables

All configuration is in the project root `.env` file:

```env
DB_USERNAME=postgres          # Database login
DB_PASSWORD=postgres          # Database password
JWT_SECRET=your-secret-key    # JWT signing key
INTERNAL_API_KEY=api-key      # Service-to-service auth
```

## Changes Made for Docker

### Configuration Files Updated
- `backend/config_repo/application.yml` - Service registry URL
- `backend/config_repo/api_gateway.yml` - CORS and service routing
- `backend/config_repo/auth_service.yml` - Config server URL
- `backend/config_repo/job_service.yml` - Database and registry URLs
- `frontend/src/services/api.js` - API endpoint URL

### New Dockerfiles Created
- `frontend/Dockerfile` - React build & serve
- `DockerfilePython` - Python ML services
- `backend/*/Dockerfile` - Java microservices (6 services)

### New Files Created
- `docker-compose.yml` - Complete orchestration
- `.dockerignore` - Build optimization
- `docker-cmd.ps1` - PowerShell helper
- `docker-cmd.bat` - Windows CMD helper
- `DOCKER_DEPLOYMENT.md` - Full documentation
- `DOCKER_QUICK_START.md` - This file

## Health Checks

All services have health checks configured. Check status with:

```bash
docker-compose ps
```

Look for "healthy" status in the output.

## Troubleshooting

### Services won't start
1. Check Docker is running: `docker ps`
2. View logs: `docker-compose logs -f`
3. Check port conflicts: Port 3000, 5432, 8000, 8080, etc.

### Frontend can't reach API
1. Check API Gateway is healthy: `docker-compose ps api-gateway`
2. Verify CORS: Check logs `docker-compose logs -f api-gateway`
3. Check network: `docker-compose exec frontend ping api-gateway`

### Database issues
1. Check PostgreSQL: `docker-compose ps postgres`
2. Connect directly: `docker-compose exec postgres psql -U postgres`
3. View logs: `docker-compose logs -f postgres`

### Rebuild everything
```bash
docker-compose down -v        # Remove everything
docker-compose build --no-cache  # Rebuild
docker-compose up -d          # Start fresh
```

## Sharing the Project

**To share this project with others:**

1. Ensure they have Docker Desktop installed
2. Share the entire `EdgeCaseGenerator` directory
3. They run: `docker-compose up -d`
4. App available at http://localhost:3000

**That's it!** No manual backend compilation, no dependency conflicts, no localhost hardcoding.

## Performance Notes

- **First build**: 5-10 minutes (Java compilation)
- **Startup**: ~30-60 seconds (service health checks)
- **Running**: All services pre-built and optimized
- **Memory**: ~2-3 GB typical usage

## Next Steps

1. Run: `./docker-cmd.ps1 up` (or `docker-cmd.bat up`)
2. Wait for all services to show "healthy"
3. Open http://localhost:3000 in browser
4. Log in and start generating test cases!

## Need Help?

- View full docs: See `DOCKER_DEPLOYMENT.md`
- Check service logs: `docker-compose logs -f [service-name]`
- Restart specific service: `docker-compose restart [service-name]`
- View all services: `docker-compose ps`
