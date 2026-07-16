# Folder Structure Explanation

## Root Level

### `/`
Monorepo root containing workspace configuration and orchestration files.

**Key Files:**
- `package.json` - Root workspace dependencies and scripts
- `pnpm-workspace.yaml` - pnpm workspace configuration defining apps/* and packages/*
- `turbo.json` - Turborepo build pipeline configuration with caching strategies
- `tsconfig.base.json` - Base TypeScript configuration shared by all workspaces
- `eslint.config.mjs` - ESLint configuration using flat config format
- `.prettierrc` - Code formatting rules
- `.env.example` - Template for environment variables
- `docker-compose.yml` - Local development infrastructure (MongoDB, Redis, MinIO)
- `README.md` - Project documentation and setup guide

---

## Apps Directory

### `/apps`
Contains all deployable applications. Each app is a complete, independently deployable service.

### `/apps/api`
**NestJS Backend Application** - Enterprise REST API with microservice-ready architecture.

**Configuration Files:**
- `package.json` - API dependencies (NestJS, Mongoose, Redis, BullMQ, JWT, Swagger)
- `nest-cli.json` - NestJS CLI configuration
- `tsconfig.json` - TypeScript config extending base with CommonJS for NestJS
- `tsconfig.build.json` - Production build configuration
- `Dockerfile` - Multi-stage production container build

### `/apps/api/src`
API source code organized by architectural concerns.

### `/apps/api/src/core`
**Core Infrastructure** - Application-wide foundational modules that bootstrap the app.

### `/apps/api/src/core/config`
**Configuration Module** - Centralized environment variable management.
- `configuration.ts` - Configuration factory loading env vars into typed object
- `env.validation.ts` - Joi schema validating required environment variables
- `global-config.module.ts` - NestJS global module making config available everywhere

**Principle:** Single source of truth for configuration, fail-fast validation on startup.

### `/apps/api/src/core/logger`
**Logging Module** - Structured logging infrastructure.
- `global-logger.module.ts` - Pino logger setup with pretty-printing in dev, JSON in prod

**Principle:** Consistent logging across all modules with automatic request correlation.

### `/apps/api/src/common`
**Shared Application Code** - Cross-cutting concerns used throughout the app.

### `/apps/api/src/common/filters`
**Exception Filters** - Global error handling and transformation.
- `global-exception.filter.ts` - Catches all exceptions, transforms to consistent API error format

**Principle:** Consistent error responses, security (no stack traces in prod), logging.

### `/apps/api/src/modules`
**Feature Modules** - Business domain and API feature implementations.

**Organization:** Each module is self-contained with controllers, services, DTOs, entities.

### `/apps/api/src/modules/auth`
**Authentication Module** - JWT-based authentication system.
- `auth.module.ts` - Configures JWT module and Passport
- `strategies/jwt-auth.strategy.ts` - JWT token validation strategy

**Principle:** Security at module level, ready for guards and decorators.

### `/apps/api/src/modules/health`
**Health Check Module** - Infrastructure health monitoring.
- `health.controller.ts` - Terminus health check endpoint
- `health.module.ts` - Health check module configuration

**Principle:** Essential for container orchestration and load balancer probes.

### `/apps/api/src/infrastructure`
**Infrastructure Adapters** - External service integrations (databases, caches, queues).

**Principle:** Dependency inversion - business logic depends on abstractions, not implementations.

### `/apps/api/src/infrastructure/database`
**Database Module** - MongoDB connection and configuration.
- `database.module.ts` - Mongoose module setup with connection pooling

**Principle:** Single database connection, managed lifecycle, graceful shutdown.

### `/apps/api/src/infrastructure/cache`
**Cache Module** - Redis client for caching and sessions.
- `cache.module.ts` - Global Redis client provider with IORedis

**Principle:** Global singleton connection, ready for distributed caching patterns.

### `/apps/api/src/infrastructure/queue`
**Queue Module** - BullMQ job queue for async processing.
- `queue.module.ts` - BullMQ root module configured with Redis

**Principle:** Decouple long-running tasks from HTTP requests, horizontal scaling.

### `/apps/api/src/infrastructure/storage`
**Storage Module** - S3-compatible object storage client.
- `storage.module.ts` - AWS SDK S3 client provider (works with MinIO locally)

**Principle:** Cloud-agnostic storage abstraction, ready for file uploads/downloads.

---

### `/apps/web`
**React Frontend Application** - Modern SPA with Vite build tooling.

**Configuration Files:**
- `package.json` - Frontend dependencies (React 19, Vite, TypeScript)
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript config for React with JSX
- `tsconfig.node.json` - Separate config for Vite config file
- `index.html` - HTML entry point
- `Dockerfile` - Multi-stage build with Nginx serving
- `nginx.conf` - Production web server configuration with SPA routing

### `/apps/web/src`
Frontend source code.

### `/apps/web/src/app`
**Application Shell** - Root components and routing setup.
- `App.tsx` - Main application component

**Principle:** Container for feature modules, providers, routing.

### `/apps/web/src/styles`
**Global Styles** - Design system foundation and CSS variables.
- `global.css` - Reset, typography, layout primitives

**Principle:** Baseline styles before component-scoped CSS.

---

## Packages Directory

### `/packages`
**Internal Shared Libraries** - Code shared between apps, published only within workspace.

**Principle:** DRY (Don't Repeat Yourself) for types, utilities, constants used by multiple apps.

### `/packages/shared`
**Shared Types and Constants** - Cross-application contracts and constants.

**Contents:**
- `constants/app.constants.ts` - Application-wide constants (app name, API version)
- `errors/error-codes.ts` - Standardized error code enum
- `types/auth.types.ts` - JWT payload interface
- `types/api-response.types.ts` - API response format interfaces

**Principle:** Single source of truth for contracts, prevents drift between frontend/backend.

### `/packages/config`
**Configuration Types** - TypeScript interfaces for configuration objects.

**Contents:**
- `index.ts` - `AppConfiguration` interface defining config shape

**Principle:** Type safety for environment variables, IDE autocomplete, refactor safety.

### `/packages/logger`
**Logger Contracts** - Logger interface definitions.

**Contents:**
- `index.ts` - `AppLogger` interface for structured logging

**Principle:** Dependency inversion, allows swapping logger implementations.

---

## CI/CD

### `/.github/workflows`
**GitHub Actions Workflows** - Automated CI/CD pipelines.

**Contents:**
- `ci.yml` - Runs lint, typecheck, build, test on every push/PR

**Principle:** Prevent broken code from merging, ensure quality gates.

---

## Architecture Patterns Applied

### 1. **Monorepo with Workspaces**
- **Tools:** pnpm workspaces + Turborepo
- **Benefit:** Share code, unified dependency management, atomic commits across apps
- **Pattern:** One repo, multiple deployable apps, shared internal packages

### 2. **Layered Architecture (Backend)**
```
Controllers (HTTP) → Services (Business Logic) → Infrastructure (Data Access)
```
- **Principle:** Separation of concerns, each layer has single responsibility
- **Benefit:** Testable, maintainable, swappable implementations

### 3. **Feature-Based Modules**
- **Structure:** `modules/feature-name/` contains all feature code
- **Principle:** High cohesion, low coupling
- **Benefit:** Easy to find code, clear boundaries, team parallelization

### 4. **Dependency Inversion (SOLID)**
- **Pattern:** Core depends on abstractions (interfaces), infrastructure provides implementations
- **Example:** Logger interface in `packages/logger`, Pino implementation in API
- **Benefit:** Loosely coupled, testable with mocks, framework-agnostic

### 5. **Configuration as Code**
- **Pattern:** Typed configuration, validated on startup, fail-fast
- **Tools:** Joi schema, TypeScript interfaces, environment variables
- **Benefit:** Catch misconfigurations early, self-documenting

### 6. **Global Error Handling**
- **Pattern:** Single exception filter transforms all errors to consistent format
- **Benefit:** API clients get predictable error structure, security (no leaks)

### 7. **Infrastructure as Code**
- **Tools:** Docker Compose for local dev, Dockerfiles for production
- **Benefit:** Reproducible environments, onboarding in minutes

### 8. **CI/CD Pipeline**
- **Pattern:** Automated quality gates (lint, typecheck, build, test)
- **Benefit:** Prevent regressions, enforce standards, faster feedback

---

## Scalability Considerations

### Horizontal Scaling
- **Stateless API:** No session state in memory, use Redis for sessions
- **Queue-based Processing:** BullMQ allows multiple worker processes
- **Database Connection Pooling:** Mongoose manages connections efficiently

### Vertical Scaling
- **Modular Architecture:** Extract modules into microservices when needed
- **Shared Packages:** Types remain in sync across services

### Development Scaling
- **Feature Modules:** Teams can work on separate modules independently
- **Turborepo Caching:** Only rebuild changed packages
- **Monorepo:** Atomic refactors across apps

---

## Next Steps for Feature Development

### Backend
1. Add domain modules in `apps/api/src/modules/`
   - Example: `modules/users/`, `modules/content/`, `modules/publishing/`
2. Create DTOs for validation (class-validator)
3. Create database schemas in each module
4. Create services implementing business logic
5. Create controllers exposing REST endpoints
6. Add guards for authorization
7. Create queue processors for async tasks

### Frontend
1. Add feature directories in `apps/web/src/features/`
2. Add routing library (React Router)
3. Add state management (Context API, Zustand, Redux Toolkit)
4. Add UI component library
5. Add API client (Axios, Fetch wrapper)
6. Add form management (React Hook Form)
7. Add authentication flow

### Shared
1. Extend `packages/shared` with domain types
2. Add validation schemas (Zod)
3. Add utility functions
4. Add API client types

---

## Summary

This architecture provides:

✅ **Enterprise-grade structure** - Proven patterns from large-scale systems  
✅ **SOLID principles** - Clean, maintainable, testable code  
✅ **Scalability** - Ready for growth horizontally and vertically  
✅ **Developer experience** - Fast builds, clear structure, type safety  
✅ **Production-ready** - Logging, error handling, health checks, Docker  
✅ **CI/CD ready** - Automated quality gates  

**No business logic included** - Pure architectural skeleton ready for feature development.
