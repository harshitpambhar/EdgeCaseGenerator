# API Gateway

Production-ready Spring Cloud Gateway for AI-Powered Intelligent Test Case Generator microservices architecture.

## Overview

This is the central API Gateway that routes requests to various microservices while providing:
- JWT Authentication and Authorization
- Rate Limiting (Redis-based)
- Request/Response Logging with Correlation IDs
- CORS Configuration
- Circuit Breaking and Resilience
- Prometheus Metrics
- Health Checks

## Architecture

### Technology Stack
- **Java 21** with Spring Boot 3.5.9
- **Spring Cloud Gateway** for routing
- **Netflix Eureka** for service discovery
- **Spring Cloud Config** for centralized configuration
- **Redis** for rate limiting and caching
- **JWT** for authentication
- **Prometheus** for metrics
- **Docker** for containerization

### Service Communication Flow

```
Client Request
    ↓
API Gateway (8080)
    ↓
   ├─ RequestIdFilter → Generates correlation IDs
   ├─ LoggingFilter → Logs request/response
   ├─ JwtAuthenticationFilter → Validates JWT tokens
   ├─ RateLimitingFilter → Applies Redis-based limits
   └─ Routes to downstream services
    ↓
Auth Service (8001)
User Service (8002)
Job Service (8003)
Project Service (8004)
```

## Features

### 1. JWT Authentication
- Intercepts protected routes
- Validates Bearer tokens against auth-service
- Adds user context headers: `X-User-Id`, `X-User-Email`, `X-User-Role`
- Returns 401 for invalid tokens
- Public routes: `/api/auth/**`, `/actuator/**`, `/eureka/**`

### 2. Rate Limiting
- Redis-backed rate limiting
- **Per User**: 1000 requests/minute
- **Per IP**: 10000 requests/minute
- Returns 429 with retry-after header
- Configurable via environment variables

### 3. Request Tracking
- Auto-generates `X-Request-Id` UUID for each request
- Maintains correlation across service calls
- Stores in MDC for structured logging
- Exposed in response headers

### 4. Dynamic Routing
Uses Eureka service discovery for dynamic routing:
- `/api/auth/**` → auth-service
- `/api/users/**` → user-service
- `/api/jobs/**` → job-service
- `/api/projects/**` → project-service

### 5. CORS Configuration
- Supports cross-origin requests from:
  - `http://localhost:5173` (frontend dev)
  - `http://localhost:3000` (alternative frontend)
  - `http://localhost:8080` (local API)
- Exposes security headers: Authorization, X-Request-Id, X-RateLimit-*

### 6. Monitoring & Metrics
- Prometheus endpoints: `/actuator/metrics`, `/actuator/prometheus`
- Health checks: `/actuator/health`, `/actuator/health/liveness`, `/actuator/health/readiness`
- Gateway metrics: routes, requests, response times
- Redis health monitoring

## Configuration

### Environment Variables

```bash
# Server
API_GATEWAY_PORT=8080

# Eureka
EUREKA_DEFAULT_ZONE=http://localhost:8761/eureka/
EUREKA_CLIENT_ENABLED=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TIMEOUT=3000ms

# JWT
JWT_SECRET=your-secret-key-change-in-production-very-important
JWT_EXPIRATION=86400

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_USER=1000
RATE_LIMIT_PER_IP=10000
RATE_LIMIT_WINDOW=1

# Logging
LOG_LEVEL=INFO
ZIPKIN_EXPORT_ENABLED=false

# Config Server
CONFIG_SERVER_URL=http://localhost:8888
```

### application.yml

Main configuration includes:
- Spring Cloud Gateway routes
- Eureka registration
- Redis connection
- JWT configuration
- Rate limiting parameters
- CORS settings
- Management endpoints

## Running Locally

### Prerequisites
- Java 21+
- Maven 3.8+
- Redis running on localhost:6379
- Eureka Server on localhost:8761

### Build
```bash
cd backend/api_gateway
./mvnw clean package
```

### Run
```bash
# Using Maven
./mvnw spring-boot:run

# Using JAR
java -jar target/api-gateway-0.0.1-SNAPSHOT.jar

# With environment variables
API_GATEWAY_PORT=8080 EUREKA_DEFAULT_ZONE=http://localhost:8761/eureka/ java -jar target/api-gateway-0.0.1-SNAPSHOT.jar
```

### Run with PowerShell
```powershell
./start.ps1
```

## Docker Deployment

### Build Docker Image
```bash
# From api_gateway directory
docker build -t api-gateway:latest .

# Or use docker-compose
cd ../
docker-compose up -d api-gateway
```

### Docker Configuration
- Base Image: Eclipse Temurin 21 Alpine
- Multi-stage build for optimized image size
- Non-root user (app:app) for security
- Health checks enabled
- JVM optimized for containers

## API Endpoints

### Gateway Health
```
GET /actuator/health
GET /actuator/health/liveness
GET /actuator/health/readiness
```

### Metrics
```
GET /actuator/metrics
GET /actuator/prometheus
```

### Gateway Routes
```
GET /actuator/gateway/routes
```

### Service Endpoints (through gateway)
```
# Auth Service
GET /api/auth/health
POST /api/auth/login
POST /api/auth/validate

# User Service (protected)
GET /api/users/profile
PUT /api/users/profile
GET /api/users/{id}

# Job Service (protected)
GET /api/jobs
POST /api/jobs
GET /api/jobs/{id}

# Project Service (protected)
GET /api/projects
POST /api/projects
GET /api/projects/{id}
```

## Filters

### 1. RequestIdFilter
- Location: `com.microservices.api_gateway.filter`
- Generates/propagates X-Request-Id
- Stores correlation IDs in MDC
- Adds to response headers

### 2. LoggingFilter
- Logs request method, URI, response status
- Tracks execution time
- Warns if response time > 5 seconds
- Uses correlation ID for tracing

### 3. JwtAuthenticationFilter
- Validates Bearer tokens
- Extracts user claims (id, email, role)
- Adds X-User-* headers to downstream requests
- Returns 401 for invalid/missing tokens

### 4. RateLimitingFilter
- Redis-based rate limiting
- Tracks per-user and per-IP requests
- Returns 429 with retry-after
- Adds X-RateLimit-* headers to response

### 5. ErrorHandlingFilter (Global)
- Standardized JSON error responses
- Consistent error format with timestamp, status, error, message
- Handles all exception types

## Security

### Authentication
- **Type**: JWT (JSON Web Tokens)
- **Header**: `Authorization: Bearer <token>`
- **Validation**: Called to auth-service endpoint
- **Storage**: No session storage (stateless)

### Authorization
- Public paths: `/api/auth/**`, `/actuator/**`
- Protected paths: All other `/api/**` routes
- CSRF: Disabled for stateless API

### Headers
- CORS headers properly configured
- Security headers in response
- Request ID for audit trail

### Transport
- HTTPS ready (configure in deployment)
- Secure cookie flags (when applicable)
- Input validation on all routes

## Testing

### Unit Tests
```bash
./mvnw test -Dtest=JwtAuthenticationFilterTests
./mvnw test -Dtest=RateLimitingFilterTests
```

### Integration Tests
```bash
./mvnw test -Dtest=ApiGatewayIntegrationTests
```

### Run All Tests
```bash
./mvnw test
```

## Monitoring

### Prometheus Metrics
Access at: `http://localhost:8080/actuator/prometheus`

Key metrics:
- `spring_cloud_gateway_requests_total` - Total gateway requests
- `spring_cloud_gateway_requests_seconds` - Request duration
- `spring_cloud_gateway_routes_count` - Number of routes
- `redis_commands_duration_seconds` - Redis operation timing

### Logs
- Log files: `logs/api-gateway.log`
- Correlation ID in all entries: `[%X{requestId}]`
- Log level: DEBUG for gateway, INFO for others

## Troubleshooting

### 401 Unauthorized
- Check JWT token validity
- Verify token format: `Bearer <token>`
- Ensure token hasn't expired
- Check auth-service is running

### 429 Too Many Requests
- Check rate limit configuration
- Verify Redis is running
- Clear Redis cache if needed: `redis-cli FLUSHDB`
- Check rate limit headers in response

### 503 Service Unavailable
- Verify Eureka server is running
- Check service registration in Eureka dashboard
- Verify service network connectivity
- Check service logs

### Redis Connection Error
- Verify Redis is running: `redis-cli ping`
- Check REDIS_HOST and REDIS_PORT
- Verify Docker network if using containers

## Production Deployment

### Environment Setup
1. Change JWT secret to strong value
2. Configure Redis with auth and persistence
3. Enable HTTPS/TLS
4. Configure proper CORS origins
5. Set up centralized logging
6. Configure monitoring/alerting
7. Enable authentication for actuator endpoints

### Docker Compose (Production)
```yaml
api-gateway:
  image: api-gateway:latest
  ports:
    - "8080:8080"
  environment:
    EUREKA_DEFAULT_ZONE: http://eureka-server:8761/eureka/
    REDIS_HOST: redis
    JWT_SECRET: ${JWT_SECRET}
  depends_on:
    - eureka-server
    - redis
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
    interval: 30s
    timeout: 3s
    retries: 3
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api-gateway
        image: api-gateway:latest
        ports:
        - containerPort: 8080
        env:
        - name: EUREKA_DEFAULT_ZONE
          value: http://eureka-server:8761/eureka/
        - name: REDIS_HOST
          value: redis-service
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 30
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 10
```

## Contributing

1. Follow Spring Boot best practices
2. Use constructor injection
3. Add Lombok annotations
4. Write unit tests for new filters
5. Update documentation
6. Maintain logging standards

## License

Internal - AI-Powered Intelligent Test Case Generator Project

## Support

For issues and questions, refer to the main project documentation or contact the development team.
