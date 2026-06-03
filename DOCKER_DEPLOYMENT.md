# Test Case Generator - Docker Deployment Guide

## Overview

This document provides instructions for running the entire Test Case Generator project in Docker containers.

## Architecture

The application is composed of the following services running in a single container network:

### Backend Services (Java/Spring Boot)
- **PostgreSQL Database** - Port 5432
- **Eureka Service Registry** - Port 8761
- **Config Server** - Port 8888
- **Auth Service** - Port 8081
- **User Service** - Port 8082
- **Job Service** - Port 8083
- **API Gateway** - Port 8080

### Frontend & ML Services
- **Frontend (React + Vite)** - Port 3000
- **ML/Python API Service** - Port 8000

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (included with Docker Desktop)
- At least 4GB available RAM for containers
- No conflicting services using ports 3000, 5432, 8000, 8080, 8081, 8082, 8083, 8761, 8888

## Quick Start

### 1. Build and Start All Services

```bash
# Navigate to the project root directory
cd /path/to/EdgeCaseGenerator

# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# For specific service logs
docker-compose logs -f api-gateway
docker-compose logs -f frontend
```

### 2. Verify Services Are Running

```bash
# List all running containers
docker-compose ps

# Check health of services
docker-compose ps | grep "healthy"
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Eureka Dashboard**: http://localhost:8761/eureka
- **Config Server**: http://localhost:8888
- **ML API**: http://localhost:8000

## Environment Variables

The `.env` file in the project root is used to configure environment variables. Key variables:

```env
DB_USERNAME=postgres          # PostgreSQL username
DB_PASSWORD=postgres          # PostgreSQL password
JWT_SECRET=your-secret-key    # JWT token secret
INTERNAL_API_KEY=api-key      # Internal service API key
```

**Note**: The `.env` file is NOT modified during Docker setup.

## Stopping Services

```bash
# Stop all containers (keeps volume data)
docker-compose down

# Stop and remove all volumes (DELETES DATABASE)
docker-compose down -v

# Restart specific service
docker-compose restart api-gateway
```

## Common Operations

### Rebuild All Services

```bash
# Rebuild all containers (useful after code changes)
docker-compose build --no-cache
docker-compose up -d
```

### Rebuild Specific Service

```bash
# Rebuild only the frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Rebuild only the API gateway
docker-compose build --no-cache api-gateway
docker-compose up -d api-gateway
```

### View Service Logs

```bash
# Real-time logs for all services
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Follow logs for specific service
docker-compose logs -f ml-api
```

### Access Database Container

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d admin_db

# View database tables
\dt
```

### Service Startup Order

Services have health checks and dependencies configured:

1. **PostgreSQL** - Started first
2. **Eureka Server** - Started after PostgreSQL
3. **Config Server** - Started after PostgreSQL
4. **Auth Service, User Service** - Wait for all above
5. **Job Service** - Waits for registry services
6. **API Gateway** - Waits for auth/user services
7. **Frontend** - Waits for API Gateway healthy
8. **ML API** - Started last

## Troubleshooting

### Port Already in Use

```bash
# Find process using port (example: port 8080)
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill process or use different ports by modifying docker-compose.yml
```

### Container Not Starting

```bash
# Check service logs
docker-compose logs service-name

# Rebuild specific service
docker-compose build --no-cache service-name

# Restart
docker-compose up -d service-name
```

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker-compose ps postgres

# Verify database exists
docker-compose exec postgres psql -U postgres -l

# Check other services can reach database
docker-compose exec api-gateway ping postgres
```

### Frontend Cannot Connect to API

1. Verify API Gateway is running: `docker-compose ps api-gateway`
2. Check frontend logs: `docker-compose logs frontend`
3. Verify CORS configuration in `backend/config_repo/api_gateway.yml`
4. Check frontend console (browser Developer Tools)

## File Structure

```
EdgeCaseGenerator/
├── docker-compose.yml          # Main composition file
├── DockerfilePython             # Python/ML services Dockerfile
├── frontend/
│   └── Dockerfile              # Frontend React app Dockerfile
├── backend/
│   ├── api_gateway/
│   │   └── Dockerfile          # API Gateway Dockerfile
│   ├── auth_service/
│   │   └── Dockerfile          # Auth Service Dockerfile
│   ├── user_service/
│   │   └── Dockerfile          # User Service Dockerfile
│   ├── job-service/
│   │   └── Dockerfile          # Job Service Dockerfile
│   ├── config_server/
│   │   └── Dockerfile          # Config Server Dockerfile
│   ├── eureka_server/
│   │   └── Dockerfile          # Eureka Server Dockerfile
│   └── config_repo/
│       ├── application.yml      # Base Spring config
│       ├── api_gateway.yml      # API Gateway config
│       ├── auth_service.yml     # Auth Service config
│       ├── job_service.yml      # Job Service config
│       └── ...
├── .env                        # Environment variables
└── requirements.txt            # Python dependencies
```

## Configuration Changes for Docker

The following changes were made to support Docker deployment:

### 1. Configuration Files Updated
- `backend/config_repo/application.yml` - Uses `eureka-server` instead of `localhost:8761`
- `backend/config_repo/api_gateway.yml` - Updated CORS origins and uses service names
- `backend/config_repo/auth_service.yml` - Uses `config-server` instead of `localhost:8888`
- `backend/config_repo/job_service.yml` - Uses `postgres` instead of `localhost:5432`

### 2. Frontend API Configuration
- `frontend/src/services/api.js` - Updated to use `http://api-gateway:8080/api` as default
- `frontend/Dockerfile` - Configures `VITE_API_URL` at build time

### 3. Docker Networking
All services are on a shared bridge network `tcg-network`, enabling service-to-service communication using service names.

## Performance Notes

- Initial build may take 5-10 minutes (Java compilation)
- Service startup sequence respects health checks (~30-60 seconds for full stack)
- PostgreSQL initialization may take additional time on first run
- Frontend is pre-built and served statically for better performance

## Production Considerations

For production deployment:

1. **Security**
   - Change default PostgreSQL credentials in `.env`
   - Use environment-specific secrets management
   - Enable HTTPS/SSL termination via reverse proxy

2. **Scaling**
   - Use Kubernetes or Docker Swarm for multi-node deployment
   - Implement load balancing for stateless services
   - Configure database connection pooling

3. **Monitoring**
   - Add container health monitoring
   - Implement centralized logging (ELK stack)
   - Set up metrics collection (Prometheus)

4. **Backup**
   - Regularly backup PostgreSQL volume
   - Implement database replication for HA

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f service-name`
2. Review Eureka dashboard: http://localhost:8761
3. Check Config Server: http://localhost:8888
