# Project File Tree

```
ai-publishing-company/
├── .github/
│   └── workflows/
│       └── ci.yml                        # GitHub Actions CI pipeline
│
├── apps/
│   ├── api/                              # NestJS Backend Application
│   │   ├── src/
│   │   │   ├── common/                   # Shared application code
│   │   │   │   └── filters/
│   │   │   │       └── global-exception.filter.ts
│   │   │   │
│   │   │   ├── core/                     # Core infrastructure modules
│   │   │   │   ├── config/               # Configuration management
│   │   │   │   │   ├── configuration.ts
│   │   │   │   │   ├── env.validation.ts
│   │   │   │   │   └── global-config.module.ts
│   │   │   │   └── logger/               # Logging setup
│   │   │   │       └── global-logger.module.ts
│   │   │   │
│   │   │   ├── infrastructure/           # External service adapters
│   │   │   │   ├── cache/                # Redis client
│   │   │   │   │   └── cache.module.ts
│   │   │   │   ├── database/             # MongoDB connection
│   │   │   │   │   └── database.module.ts
│   │   │   │   ├── queue/                # BullMQ job queue
│   │   │   │   │   └── queue.module.ts
│   │   │   │   └── storage/              # S3 client
│   │   │   │       └── storage.module.ts
│   │   │   │
│   │   │   ├── modules/                  # Feature modules
│   │   │   │   ├── auth/                 # Authentication
│   │   │   │   │   ├── strategies/
│   │   │   │   │   │   └── jwt-auth.strategy.ts
│   │   │   │   │   └── auth.module.ts
│   │   │   │   └── health/               # Health checks
│   │   │   │       ├── health.controller.ts
│   │   │   │       └── health.module.ts
│   │   │   │
│   │   │   ├── app.module.ts             # Root module
│   │   │   └── main.ts                   # Application bootstrap
│   │   │
│   │   ├── Dockerfile                    # Production container
│   │   ├── nest-cli.json                 # NestJS CLI config
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   │
│   └── web/                              # React Frontend Application
│       ├── src/
│       │   ├── app/
│       │   │   └── App.tsx               # Root component
│       │   ├── styles/
│       │   │   └── global.css            # Global styles
│       │   ├── main.tsx                  # Application entry
│       │   └── vite-env.d.ts             # Vite type definitions
│       │
│       ├── Dockerfile                    # Production container (Nginx)
│       ├── index.html                    # HTML entry point
│       ├── nginx.conf                    # Nginx configuration
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       └── vite.config.ts
│
├── packages/                             # Shared internal libraries
│   ├── config/                           # Configuration types
│   │   ├── src/
│   │   │   └── index.ts                  # AppConfiguration interface
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── logger/                           # Logger contracts
│   │   ├── src/
│   │   │   └── index.ts                  # AppLogger interface
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/                           # Shared types & constants
│       ├── src/
│       │   ├── constants/
│       │   │   └── app.constants.ts      # App-wide constants
│       │   ├── errors/
│       │   │   └── error-codes.ts        # Error code enum
│       │   ├── types/
│       │   │   ├── api-response.types.ts # API response interfaces
│       │   │   └── auth.types.ts         # JWT payload interface
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── .dockerignore                         # Docker ignore patterns
├── .env.example                          # Environment variable template
├── .gitignore                            # Git ignore patterns
├── .prettierrc                           # Prettier configuration
├── ARCHITECTURE.md                       # This documentation
├── README.md                             # Setup and usage guide
├── docker-compose.yml                    # Local infrastructure
├── eslint.config.mjs                     # ESLint configuration
├── package.json                          # Root workspace config
├── pnpm-workspace.yaml                   # pnpm workspace definition
├── tsconfig.base.json                    # Base TypeScript config
└── turbo.json                            # Turborepo pipeline config
```

## File Count Summary

- **Total Directories:** 31
- **Total Files:** 52
- **Backend Files:** 15
- **Frontend Files:** 9
- **Shared Package Files:** 8
- **Configuration Files:** 11
- **Infrastructure Files:** 4
- **Documentation Files:** 5

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Monorepo** | pnpm workspaces | Package management |
| **Build** | Turborepo | Build orchestration & caching |
| **Backend Framework** | NestJS | Enterprise Node.js framework |
| **Frontend Framework** | React 19 | UI library |
| **Frontend Build** | Vite | Fast build tooling |
| **Language** | TypeScript | Type safety |
| **Database** | MongoDB | Document database |
| **Cache** | Redis | In-memory cache |
| **Queue** | BullMQ | Background job processing |
| **Storage** | S3 / MinIO | Object storage |
| **Auth** | JWT + Passport | Token-based authentication |
| **API Docs** | Swagger | OpenAPI documentation |
| **Logging** | Pino | Structured logging |
| **Validation** | Joi + class-validator | Input validation |
| **Container** | Docker | Containerization |
| **CI/CD** | GitHub Actions | Automated pipelines |
| **Linting** | ESLint | Code quality |
| **Formatting** | Prettier | Code formatting |

## Port Mapping

| Service | Port | Description |
|---------|------|-------------|
| API | 3000 | NestJS backend |
| Web | 5173 | Vite dev server |
| Web Preview | 4173 | Vite preview server |
| MongoDB | 27017 | Database |
| Redis | 6379 | Cache & queue |
| MinIO | 9000 | S3-compatible storage |
| MinIO Console | 9001 | Admin UI |
| API Docs | 3000/docs | Swagger UI |

## Build Pipeline (Turborepo)

```
┌─────────────────┐
│  Root Workspace │
└────────┬────────┘
         │
    ┌────┴─────┬──────────┐
    ▼          ▼          ▼
┌─────────┐ ┌──────┐  ┌────────┐
│ Shared  │ │Config│  │ Logger │
│ Package │ │ Pkg  │  │  Pkg   │
└────┬────┘ └───┬──┘  └───┬────┘
     │          │         │
     └──────────┴─────────┴───────┐
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
                ┌───────┐                   ┌───────┐
                │  API  │                   │  Web  │
                │  App  │                   │  App  │
                └───────┘                   └───────┘
```

**Build Order:**
1. Shared packages (`config`, `logger`, `shared`)
2. Applications (`api`, `web`) - built in parallel

**Turborepo Benefits:**
- Caches build outputs
- Only rebuilds changed packages
- Parallel execution
- Remote caching ready

## Environment Variables

See `.env.example` for full list. Key variables:

**API:**
- `API_PORT` - Backend port
- `JWT_SECRET` - JWT signing key
- `MONGODB_URI` - Database connection
- `REDIS_HOST` / `REDIS_PORT` - Cache/queue
- `S3_*` - Storage configuration

**Web:**
- `VITE_API_BASE_URL` - Backend API URL

## Quick Reference

### Install Dependencies
```bash
pnpm install
```

### Development
```bash
pnpm dev              # Start all apps
pnpm docker:up        # Start infrastructure
```

### Production Build
```bash
pnpm build            # Build all apps
```

### Code Quality
```bash
pnpm lint             # Lint all code
pnpm typecheck        # Type check
pnpm format           # Format code
```

### Testing
```bash
pnpm test             # Run all tests
```

### Docker
```bash
docker compose up -d  # Start services
docker compose down   # Stop services
```

### Build Docker Images
```bash
docker build -f apps/api/Dockerfile -t ai-publishing-api .
docker build -f apps/web/Dockerfile -t ai-publishing-web .
```
