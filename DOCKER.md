# Docker Configuration

Production-ready Docker setup for AI Publishing Company monorepo.

## Quick Start

### Development
```bash
make dev
```

### Production
```bash
make prod
```

### Infrastructure Only
```bash
make infra
```

## Files

- `docker-compose.yml` - Infrastructure only (MongoDB, Redis, MinIO)
- `docker-compose.dev.yml` - Development environment with hot reload
- `docker-compose.prod.yml` - Production environment with security hardening
- `Makefile` - Common Docker commands
- `docker/` - Configuration files for services

## Services

### MongoDB
- **Port**: 27017
- **Volume**: Persistent data storage
- **Health Check**: Built-in ping command
- **Production**: Authentication enabled, custom config

### Redis
- **Port**: 6379
- **Volume**: Persistent data with AOF
- **Health Check**: Redis ping
- **Production**: Password protected, memory limits

### MinIO (S3)
- **Port**: 9000 (API), 9001 (Console)
- **Volume**: Persistent object storage
- **Health Check**: Health endpoint
- **Console**: http://localhost:9001

### API (NestJS)
- **Port**: 3000
- **Health Check**: /api/v1/health
- **Production**: Multi-stage build, non-root user

### Web (React)
- **Port**: 80 (production), 5173 (development)
- **Health Check**: Nginx status
- **Production**: Nginx with caching, gzip, security headers

## Environment Variables

Copy `.env.example` to `.env` for development:
```bash
cp .env.example .env
```

For production, create `.env.production` from `.env.production.example`.

## Make Commands

```bash
make help           # Show all commands
make dev            # Start development
make dev-down       # Stop development
make prod           # Start production
make prod-build     # Build production images
make infra          # Infrastructure only
make clean          # Remove all containers and volumes
make logs           # View logs
make ps             # Show running containers
make health         # Check health status
```

## Development Mode

Hot reload enabled for both API and Web:
- Source code mounted as volumes
- Changes reflected immediately
- No image rebuild required

## Production Mode

Optimized for production:
- Multi-stage builds for smaller images
- Non-root users for security
- Health checks for all services
- Logging configuration
- Resource limits
- Security hardening

## Volumes

Development and production use separate volumes to prevent data conflicts.

**Development:**
- `mongodb_dev_data`
- `redis_dev_data`
- `minio_dev_data`

**Production:**
- `mongodb_prod_data`
- `redis_prod_data`
- `minio_prod_data`

## Networks

All services run on isolated bridge networks:
- `ai-publishing-dev-network` (development)
- `ai-publishing-prod-network` (production)
- `ai-publishing-network` (infrastructure)

## Health Checks

All services include health checks:
- MongoDB: Database ping
- Redis: Redis CLI ping
- MinIO: Health endpoint
- API: Health controller endpoint
- Web: Nginx status

## Security

Production configuration includes:
- Non-root users
- Read-only root filesystem where possible
- Security headers
- Password protection for all services
- Network isolation
- Log rotation

## Monitoring

View logs:
```bash
make dev-logs    # Development
make prod-logs   # Production
```

Check health:
```bash
make health
```

## Troubleshooting

**Container won't start:**
```bash
docker-compose logs <service-name>
```

**Clear everything:**
```bash
make clean
```

**Rebuild from scratch:**
```bash
make clean
make prod-build
make prod
```
