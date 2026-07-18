# AI Publishing Company

Enterprise monorepo for the AI Publishing platform.

The repository includes the stabilized publishing pipeline from project and blueprint creation through outline, chapter and manuscript generation, metadata, cover prompts, table of contents, and multi-format export. Cross-feature coordination lives in the publishing workflow orchestrator, while AI transport is shared under `apps/api/src/core/ai`.

## Architecture

- **Monorepo**: pnpm workspaces with Turbo for build orchestration
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: NestJS + TypeScript
- **Database**: MongoDB
- **Cache/Queue**: Redis + BullMQ
- **Storage**: S3-compatible (MinIO for local)
- **Auth**: JWT with Passport

## Project Structure

```
ai-publishing-company/
├── apps/
│   ├── api/              # NestJS backend application
│   └── web/              # React frontend application
├── packages/
│   ├── config/           # Shared configuration types
│   ├── logger/           # Shared logger contracts
│   └── shared/           # Shared types, constants, utilities
├── .github/              # CI/CD workflows
└── [config files]        # Root workspace configuration
```

## Prerequisites

- Node.js >= 20.11.0
- pnpm >= 9.0.0
- Docker & Docker Compose

## Quality gates

Run `pnpm build`, `pnpm typecheck`, `pnpm lint`, and `pnpm test` before merging. API tests use a deterministic mock AI provider and do not call OpenAI.

## Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd ai-publishing-company
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start infrastructure**
   ```bash
   pnpm docker:up
   ```

4. **Run development servers**
   ```bash
   pnpm dev
   ```

   - API: http://localhost:3000
   - API Docs: http://localhost:3000/docs
   - Web: http://localhost:5173

## Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all workspaces
- `pnpm typecheck` - Type-check all workspaces
- `pnpm test` - Run tests across all workspaces
- `pnpm format` - Format code with Prettier
- `pnpm docker:up` - Start infrastructure (MongoDB, Redis, MinIO)
- `pnpm docker:down` - Stop infrastructure

## Application Details

### API (`apps/api`)

NestJS backend with enterprise architecture:

- **Core**: Configuration, logging, global modules
- **Modules**: Feature-based modules (auth, health)
- **Infrastructure**: Database, cache, queue, storage abstractions
- **Common**: Shared filters, guards, interceptors, decorators

### Web (`apps/web`)

React frontend ready for feature development:

- **App**: Main application shell
- **Styles**: Global CSS and design tokens

### Packages

- **@ai-publishing/config**: Configuration type definitions
- **@ai-publishing/logger**: Logger contracts and interfaces
- **@ai-publishing/shared**: Shared constants, types, error codes

## Infrastructure

### Local Development

Docker Compose provides:
- MongoDB on port 27017
- Redis on port 6379
- MinIO on ports 9000 (API) and 9001 (Console)

### Production

Each app has a production-ready Dockerfile:
- `apps/api/Dockerfile` - Multi-stage build for NestJS
- `apps/web/Dockerfile` - Nginx-based static serving

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs:
- Linting (ESLint)
- Type checking (TypeScript)
- Building (Turbo)
- Testing (Jest/Vitest)

## Next Steps

1. Add business feature modules in `apps/api/src/modules/`
2. Add UI feature modules in `apps/web/src/features/`
3. Extend shared packages with domain types
4. Configure deployment pipeline
5. Add comprehensive test coverage

## License

Private - All Rights Reserved
