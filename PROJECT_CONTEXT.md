# PROJECT CONTEXT

> **For AI Coding Assistants**: This document provides essential context for understanding and contributing to the AI Publishing Company monorepo project.

---

## 1. Project Overview

**AI Publishing Company** is an enterprise-grade monorepo platform designed to support content publishing operations powered by AI technologies. The system is built as a full-stack TypeScript application using modern web technologies with a focus on scalability, maintainability, and production readiness.

**Current Status**: Foundation phase - Core infrastructure and base modules established.

**Repository Type**: Monorepo (pnpm workspaces + Turborepo)

**Key Characteristics**:
- Enterprise-grade architecture
- SOLID principles throughout
- Feature-based modular design
- Production-ready infrastructure
- Cloud-native with Docker containerization
- Full type safety with TypeScript

---

## 2. Business Vision

Create a scalable, AI-powered publishing platform that enables enterprises to manage, organize, and distribute content efficiently. The platform will provide:

- Content categorization and organization
- User authentication and role-based access control
- Audit logging and compliance tracking
- Health monitoring and observability
- Scalable infrastructure for future AI features

---

## 3. Phase 1 Goal

**Objective**: Establish a solid architectural foundation with core infrastructure.

**Deliverables**:
- ✅ Monorepo structure with proper tooling
- ✅ Backend API with NestJS
- ✅ Frontend SPA with React + Vite
- ✅ Database integration (MongoDB)
- ✅ Cache layer (Redis)
- ✅ Queue system (BullMQ)
- ✅ Storage layer (S3-compatible)
- ✅ Authentication system (JWT)
- ✅ Global error handling
- ✅ Logging infrastructure
- ✅ Configuration management
- ✅ Health check endpoints
- ✅ Docker containerization
- ✅ API documentation (Swagger)
- ✅ **Category Module** - CRUD operations with full feature set

**Current State**: Phase 1 infrastructure complete. Category module fully implemented.

---

## 4. Current Scope

### **Implemented Modules**

#### **Core Infrastructure**
- Global Configuration Module
- Global Logger Module (Pino)
- Database Module (MongoDB/Mongoose)
- Cache Module (Redis/IORedis)
- Queue Module (BullMQ)
- Storage Module (S3-compatible)

#### **Feature Modules**
- **Auth Module** - JWT authentication, role-based access control
- **Health Module** - Infrastructure health checks (Terminus)
- **Audit Module** - User action tracking
- **Example Module** - Reference implementation for guards/decorators
- **Category Module** ✅ - Full CRUD implementation with:
  - Create, Read, Update, Delete (soft delete)
  - Pagination, search, sorting, filtering
  - Slug generation
  - Duplicate prevention
  - Active/Inactive status
  - Display ordering
  - Audit fields
  - MongoDB indexes for performance
  - Swagger documentation
  - Role-based access (ADMIN, EDITOR, VIEWER)

#### **Shared Packages**
- `@ai-publishing/shared` - Types, constants, error codes
- `@ai-publishing/config` - Configuration interfaces
- `@ai-publishing/logger` - Logger contracts

### **API Endpoints Available**
- `POST /api/v1/categories` - Create category
- `GET /api/v1/categories` - List categories (paginated)
- `GET /api/v1/categories/:id` - Get category by ID
- `GET /api/v1/categories/slug/:slug` - Get category by slug
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Soft delete category
- `POST /api/v1/categories/:id/restore` - Restore deleted category
- `GET /api/v1/health` - Health check endpoint
- Authentication endpoints (login, register, refresh token)

---

## 5. Out of Scope

**Not Implemented Yet**:
- Subcategory module (entity exists but no business logic)
- Content/article management
- AI-powered features (content generation, summarization, etc.)
- User management CRUD (basic auth exists)
- File upload functionality
- Email notifications
- Search engine integration
- Analytics dashboard
- Multi-tenancy
- Internationalization (i18n)
- Rate limiting
- API versioning strategy beyond v1
- WebSocket real-time features
- GraphQL API

**Do Not Implement** unless explicitly requested:
- Business logic beyond basic CRUD
- Complex AI features
- Payment processing
- Third-party integrations (social media, CMS, etc.)

---

## 6. Technology Stack

### **Frontend**
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: CSS (prepared for Tailwind CSS)
- **Server**: Nginx (production)

### **Backend**
- **Framework**: NestJS 10
- **Runtime**: Node.js
- **Language**: TypeScript (CommonJS for NestJS)
- **API Documentation**: Swagger/OpenAPI

### **Database & Storage**
- **Database**: MongoDB 8.x
- **ODM**: Mongoose
- **Cache**: Redis 7.x (IORedis client)
- **Queue**: BullMQ 5.x
- **Object Storage**: S3-compatible (MinIO for local dev)

### **Authentication & Security**
- **Strategy**: JWT (JSON Web Tokens)
- **Library**: Passport.js with passport-jwt
- **Hashing**: bcrypt

### **Infrastructure**
- **Containerization**: Docker + Docker Compose
- **Monorepo**: pnpm workspaces
- **Build Pipeline**: Turborepo
- **Logging**: Pino (JSON structured logging)
- **Health Checks**: @nestjs/terminus
- **Validation**: class-validator, class-transformer, Joi

### **Development Tools**
- **TypeScript**: Shared tsconfig.base.json
- **Linting**: ESLint (flat config)
- **Code Formatting**: Prettier (implied)
- **CI/CD**: GitHub Actions ready (workflows defined)

---

## 7. Project Architecture Summary

### **Architecture Pattern**
**Layered Architecture** with **Repository Pattern**

```
┌─────────────────────────────────────┐
│         Controller Layer            │ ← HTTP/REST endpoints
│         (Presentation)              │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Service Layer               │ ← Business logic
│         (Domain)                    │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Repository Layer               │ ← Data access
│      (Persistence)                  │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Entity/Schema Layer            │ ← Database models
│      (Data)                         │
└─────────────────────────────────────┘
```

### **Module Organization**
- **Core Modules** (`/core`): Application-wide infrastructure (config, logger)
- **Common Modules** (`/common`): Shared utilities (filters, interceptors, middleware)
- **Feature Modules** (`/modules`): Business domain logic (auth, category, health)
- **Infrastructure Modules** (`/infrastructure`): External service adapters (database, cache, queue, storage)

### **Design Principles Applied**
- **SOLID Principles**: Enforced throughout codebase
- **Dependency Inversion**: Business logic depends on abstractions, not implementations
- **Separation of Concerns**: Each layer has single responsibility
- **Feature-Based Structure**: Self-contained modules
- **Fail-Fast Validation**: Configuration validated on startup
- **Global Error Handling**: Consistent error responses via exception filter

---

## 8. Folder Structure Overview

```
/ (root)
├── apps/                          # Deployable applications
│   ├── api/                       # NestJS backend
│   │   └── src/
│   │       ├── core/              # Core infrastructure
│   │       │   ├── config/        # Configuration module
│   │       │   └── logger/        # Logging module
│   │       ├── common/            # Cross-cutting concerns
│   │       │   ├── filters/       # Exception filters
│   │       │   ├── interceptors/  # Request/response interceptors
│   │       │   └── middleware/    # Middleware (correlation ID)
│   │       ├── modules/           # Feature modules
│   │       │   ├── auth/          # JWT authentication
│   │       │   ├── category/      # ✅ Category CRUD (COMPLETE)
│   │       │   ├── audit/         # Audit logging
│   │       │   ├── health/        # Health checks
│   │       │   └── example/       # Reference implementation
│   │       ├── infrastructure/    # External services
│   │       │   ├── database/      # MongoDB connection
│   │       │   ├── cache/         # Redis client
│   │       │   ├── queue/         # BullMQ setup
│   │       │   └── storage/       # S3 client
│   │       ├── app.module.ts      # Root module
│   │       └── main.ts            # Bootstrap
│   └── web/                       # React frontend
│       └── src/
│           ├── app/               # Application shell
│           ├── components/        # React components
│           ├── pages/             # Page components
│           ├── hooks/             # Custom React hooks
│           ├── lib/               # Utilities (API client)
│           ├── config/            # Frontend config
│           └── styles/            # Global styles
├── packages/                      # Shared libraries
│   ├── shared/                    # Types, constants, error codes
│   ├── config/                    # Configuration types
│   └── logger/                    # Logger contracts
├── docker/                        # Docker configurations
│   ├── mongodb/                   # MongoDB config
│   ├── redis/                     # Redis config
│   └── nginx/                     # Nginx config
├── docker-compose.yml             # Local infrastructure
├── turbo.json                     # Build pipeline config
├── pnpm-workspace.yaml            # Workspace definition
└── package.json                   # Root dependencies
```

---

## 9. Development Principles

### **Code Quality**
1. **Type Safety First**: Everything is typed, no `any` without justification
2. **Explicit Over Implicit**: Clear naming, no magic
3. **Validation Everywhere**: DTOs validated with class-validator
4. **Fail Fast**: Validate configuration on startup, throw early
5. **DRY (Don't Repeat Yourself)**: Share code via packages

### **Module Design**
1. **Self-Contained**: Each module includes all its dependencies
2. **Single Responsibility**: One module = one domain concern
3. **Explicit Dependencies**: Use dependency injection
4. **Interface Segregation**: Small, focused interfaces
5. **Exportable**: Modules export services for reuse

### **Database**
1. **Schema First**: Define Mongoose schemas with validation
2. **Indexes for Performance**: Add indexes for common queries
3. **Soft Delete Default**: Mark as deleted, don't remove
4. **Lean Queries**: Use `.lean()` for read operations
5. **Audit Fields**: Track who/when created/updated/deleted

### **API Design**
1. **RESTful Conventions**: Standard HTTP methods and status codes
2. **Consistent Responses**: Use standard API response format
3. **Pagination**: All list endpoints support pagination
4. **Filtering & Sorting**: Flexible query parameters
5. **Swagger Documentation**: Document all endpoints

### **Security**
1. **Authentication Required**: All endpoints require JWT (except public)
2. **Role-Based Access**: Use guards and decorators
3. **Input Validation**: Never trust client input
4. **Error Sanitization**: Don't leak stack traces in production
5. **Correlation IDs**: Track requests across services

---

## 10. Cost Optimization Principles

### **Performance**
1. **Minimize Database Queries**: Use lean(), batch operations, avoid N+1
2. **Cache Strategically**: Redis for frequently accessed data
3. **Index Optimization**: Create indexes based on query patterns
4. **Field Selection**: Only fetch required fields
5. **Parallel Operations**: Use Promise.all() for independent queries

### **Infrastructure**
1. **Horizontal Scaling**: Stateless API design
2. **Connection Pooling**: Reuse database/cache connections
3. **Lazy Loading**: Load modules/data only when needed
4. **Docker Multi-Stage Builds**: Smaller production images
5. **Turborepo Caching**: Avoid rebuilding unchanged packages

### **Logging**
1. **Structured Logging**: JSON format for easy parsing
2. **Log Levels**: Use appropriate levels (error, warn, info, debug)
3. **Log Sampling**: Don't log every request in production
4. **Correlation IDs**: Group related logs

---

## 11. Coding Philosophy

### **When Adding Features**
1. Read ARCHITECTURE.md first to understand conventions
2. Follow existing patterns (use example module as reference)
3. Create DTOs for all inputs/outputs
4. Add validation to all DTOs
5. Implement repository for data access
6. Implement service for business logic
7. Implement controller for HTTP endpoints
8. Add Swagger documentation
9. Export from module index.ts
10. Update module README.md

### **File Naming Conventions**
- **Entities**: `*.entity.ts` (e.g., `category.entity.ts`)
- **DTOs**: `*.dto.ts` (e.g., `create-category.dto.ts`)
- **Services**: `*.service.ts` (e.g., `category.service.ts`)
- **Controllers**: `*.controller.ts` (e.g., `category.controller.ts`)
- **Repositories**: `*.repository.ts` (e.g., `category.repository.ts`)
- **Modules**: `*.module.ts` (e.g., `category.module.ts`)
- **Guards**: `*.guard.ts` (e.g., `jwt-auth.guard.ts`)
- **Decorators**: `*.decorator.ts` (e.g., `roles.decorator.ts`)

### **Import Organization**
1. External packages (NestJS, third-party)
2. Internal packages (`@ai-publishing/*`)
3. Relative imports (same module)
4. Blank line between groups

### **Error Handling**
- Use NestJS built-in exceptions (`NotFoundException`, `ConflictException`, etc.)
- Let global exception filter handle transformation
- Don't catch errors unless you can handle them meaningfully
- Always provide descriptive error messages

---

## 12. Future Roadmap (Phase 2+)

### **Planned Modules** (Not Yet Implemented)
- **Subcategory Module**: Child categories with parent relationships
- **Content/Article Module**: Publishing content management
- **User Management Module**: Full user CRUD with profile management
- **Media Module**: File upload and management
- **Comment Module**: User commenting system
- **Tag Module**: Content tagging and taxonomy
- **Notification Module**: Email and in-app notifications

### **Planned Features**
- AI content generation
- AI content summarization
- Advanced search (Elasticsearch integration)
- Analytics and reporting
- Multi-language support (i18n)
- Rate limiting and throttling
- API key management
- Webhook system
- Export/import functionality
- Advanced audit logging with versioning

### **Infrastructure Improvements**
- Kubernetes deployment manifests
- Automated database migrations
- Blue-green deployment strategy
- API gateway integration
- Service mesh (if microservices split)
- Observability (Prometheus, Grafana)
- Distributed tracing

---

## 13. AI Usage Rules

### **When Assisting with This Project**

#### **DO**
✅ Follow the existing architecture and patterns  
✅ Use ARCHITECTURE.md as the source of truth  
✅ Implement features using the layered architecture (Controller → Service → Repository → Entity)  
✅ Create DTOs for all inputs and outputs  
✅ Add validation to all DTOs using class-validator  
✅ Add Swagger documentation to all endpoints  
✅ Use TypeScript strictly (no `any` unless necessary)  
✅ Follow NestJS best practices and conventions  
✅ Add MongoDB indexes for new entities  
✅ Implement soft delete by default  
✅ Add audit fields (createdBy, updatedBy, deletedBy)  
✅ Use role-based access control (guards and decorators)  
✅ Write concise, production-ready code  
✅ Check existing modules (auth, category) as reference implementations  

#### **DON'T**
❌ Invent business logic or features not requested  
❌ Modify the core architecture without explicit approval  
❌ Create files outside the established folder structure  
❌ Skip validation or error handling  
❌ Use `any` type excessively  
❌ Implement features marked as "Out of Scope"  
❌ Skip Swagger documentation  
❌ Create hard deletes (use soft delete)  
❌ Skip role-based access control  
❌ Ignore existing naming conventions  

#### **Code Generation Guidelines**
1. **Read First**: Check existing implementations before generating code
2. **Consistency**: Match existing code style and patterns
3. **Complete**: Generate all necessary files (DTO, service, repository, controller, module)
4. **Production-Ready**: Include error handling, validation, documentation
5. **Explain**: Provide brief explanations of architectural decisions

#### **When Uncertain**
- Ask clarifying questions before implementing
- Reference the example module or category module
- Suggest multiple approaches with trade-offs
- Defer to ARCHITECTURE.md for architectural decisions

---

## 14. Current Sprint Information

### **Sprint Status**: Foundation Complete

**Last Completed**:
- ✅ Category Module fully implemented (2026-07-12)
  - CRUD operations
  - Pagination, search, sorting, filtering
  - Soft delete and restore
  - Duplicate prevention
  - MongoDB indexes
  - Swagger documentation
  - Role-based access control

**Next Priorities** (Not Started):
- Subcategory Module implementation
- User Management Module
- Content/Article Module foundation

**Blockers**: None

**Technical Debt**: None identified

---

## 15. Definition of Done

A feature module is considered **Done** when:

### **Code**
- [ ] Entity/Schema created with proper validation and indexes
- [ ] DTOs created for Create, Update, Query, Response
- [ ] Repository created with all necessary database operations
- [ ] Service created with business logic
- [ ] Controller created with HTTP endpoints
- [ ] Module registered and exported properly
- [ ] All imports use barrel exports (index.ts)

### **Quality**
- [ ] TypeScript compiles without errors
- [ ] All DTOs have class-validator decorators
- [ ] No `any` types (or justified with comments)
- [ ] Error handling implemented
- [ ] Input validation on all endpoints
- [ ] Duplicate prevention where applicable

### **Security**
- [ ] Authentication guards applied
- [ ] Role-based access control implemented
- [ ] Input sanitization via validation
- [ ] Audit fields populated (createdBy, updatedBy, deletedBy)

### **Documentation**
- [ ] Swagger documentation on all endpoints
- [ ] Module README.md created with:
  - Overview
  - Features
  - API endpoints
  - Usage examples
  - Database schema
- [ ] JSDoc comments on complex logic

### **Performance**
- [ ] MongoDB indexes added for common queries
- [ ] Lean queries used for read operations
- [ ] Field selection implemented (exclude internal fields)
- [ ] Pagination implemented on list endpoints

### **Testing Readiness**
- [ ] Can test via Swagger UI
- [ ] Can test via curl/Postman
- [ ] Example requests documented in README
- [ ] Edge cases considered (duplicates, not found, validation errors)

---

## 16. Key Terminology

### **Architecture Terms**
- **Monorepo**: Single repository containing multiple apps and packages
- **Workspace**: A package or app within the monorepo (pnpm workspaces)
- **Layered Architecture**: Separation of concerns (Controller → Service → Repository → Entity)
- **Repository Pattern**: Abstraction layer for data access

### **NestJS Concepts**
- **Module**: Self-contained unit of code with providers, controllers, imports, exports
- **Provider**: Injectable service class (services, repositories)
- **Controller**: Handles HTTP requests and responses
- **Guard**: Authorization/authentication check before route handler
- **Decorator**: Metadata annotation (@Get, @Post, @Roles, etc.)
- **Pipe**: Data transformation and validation (ValidationPipe)
- **Filter**: Exception handling (GlobalExceptionFilter)
- **Interceptor**: Pre/post-processing of requests/responses
- **Middleware**: Runs before route handler (CorrelationIdMiddleware)

### **Database Terms**
- **Schema**: Mongoose model definition
- **Entity**: Domain object (often same as Schema in this project)
- **Soft Delete**: Mark record as deleted without removing from database
- **Hard Delete**: Permanently remove record from database
- **Lean Query**: Return plain JavaScript objects instead of Mongoose documents
- **Index**: Database optimization for faster queries

### **API Terms**
- **DTO (Data Transfer Object)**: Object that defines request/response shape with validation
- **Pagination**: Breaking large result sets into pages
- **Slug**: URL-friendly unique identifier (e.g., "tech-innovation")
- **Bearer Token**: JWT authentication token in Authorization header
- **Correlation ID**: Unique identifier tracking request across services

### **Module-Specific Terms**
- **Category**: Top-level content classification
- **Subcategory**: Child category (not yet implemented)
- **Active Status**: Whether a category is visible/usable
- **Display Order**: Numeric value controlling sort order
- **Audit Fields**: createdBy, updatedBy, deletedBy, createdAt, updatedAt, deletedAt

### **Role Types**
- **ADMIN**: Full access to all operations
- **EDITOR**: Create and update content
- **VIEWER**: Read-only access

---

## Quick Start for AI Assistants

1. **Read This Document First** - Understand project scope and architecture
2. **Check ARCHITECTURE.md** - Detailed architectural patterns and conventions
3. **Review Category Module** - Reference implementation at `/apps/api/src/modules/category`
4. **Follow Existing Patterns** - Don't reinvent, replicate and adapt
5. **Ask Questions** - Clarify before implementing if uncertain

**Key Files to Reference**:
- `/ARCHITECTURE.md` - Architectural documentation
- `/apps/api/src/modules/category/*` - Complete module example
- `/apps/api/src/modules/example/*` - Guards and decorators example
- `/packages/shared/src/*` - Shared types and constants

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-12  
**Maintained By**: Project Architecture Team
