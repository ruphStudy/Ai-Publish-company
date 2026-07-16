.PHONY: help dev prod down clean logs build

help:
	@echo "AI Publishing Company - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Start development environment"
	@echo "  make dev-down         - Stop development environment"
	@echo "  make dev-logs         - View development logs"
	@echo ""
	@echo "Production:"
	@echo "  make prod             - Start production environment"
	@echo "  make prod-down        - Stop production environment"
	@echo "  make prod-logs        - View production logs"
	@echo "  make prod-build       - Build production images"
	@echo ""
	@echo "Infrastructure:"
	@echo "  make infra            - Start infrastructure only (MongoDB, Redis, MinIO)"
	@echo "  make infra-down       - Stop infrastructure"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean            - Remove all containers, volumes, and images"
	@echo "  make ps               - Show running containers"
	@echo "  make health           - Check health status of all services"

# Development
dev:
	docker-compose -f docker-compose.dev.yml up -d

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Production
prod:
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

prod-build:
	docker-compose -f docker-compose.prod.yml build --no-cache

# Infrastructure only
infra:
	docker-compose up -d mongodb redis minio

infra-down:
	docker-compose down

# Utilities
down:
	docker-compose down
	docker-compose -f docker-compose.dev.yml down
	docker-compose -f docker-compose.prod.yml down

clean: down
	docker-compose down -v --rmi all
	docker-compose -f docker-compose.dev.yml down -v --rmi all
	docker-compose -f docker-compose.prod.yml down -v --rmi all

ps:
	docker-compose ps
	docker-compose -f docker-compose.dev.yml ps
	docker-compose -f docker-compose.prod.yml ps

logs:
	docker-compose logs -f

health:
	@echo "Checking health status..."
	@docker ps --format "table {{.Names}}\t{{.Status}}" | grep ai-publishing

build:
	docker-compose build --no-cache
