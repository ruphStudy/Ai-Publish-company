# APC Architecture

APC is a pnpm/Turborepo monorepo containing a NestJS API, a React/Vite web application, and shared configuration, logging, and contract packages.

## Runtime structure

```text
Web SPA -> REST API -> MongoDB
                   -> Redis / BullMQ
                   -> S3-compatible storage
                   -> AI and market-data providers
```

The API separates cross-cutting code (`common`), application foundations (`core`), external adapters (`infrastructure`), and bounded feature modules (`modules`). `core/application/workflows/PublishingWorkflowOrchestrator` coordinates publishing stages without persistence or generation logic. Feature services retain their own validation, mapping, repositories, prompts, and business rules.

Publishing direction:

```text
Book Project -> Book Blueprint -> Outline -> Chapter Generator -> AI Writing
             -> Book Metadata -> Cover Prompt -> Table Of Contents -> Export
```

Shared AI networking lives in `core/ai`. Feature modules provide prompts and response-specific parsing; the shared client owns OpenAI transport, timeouts, response extraction, usage extraction, and transport errors. Tests use `MockAiProvider` and never call external AI services.

`market-intelligence` remains one subsystem with internal provider, normalization, knowledge, classification, scoring, monitoring, scheduling, and trend-history modules. Its root barrel exposes public services while ambiguous repository result exports are kept private.

All persistent feature records use soft-delete metadata (`isDeleted`, `deletedAt`, `deletedBy`) and query middleware excludes deleted records by default. Repositories that expose deletion also provide restore behavior.

Configuration is validated at startup. Bootstrap applies configured CORS origins, Swagger enablement, global validation, exception handling, correlation IDs, and rate limiting.

Export supports PDF, print PDF, EPUB, DOCX, and ZIP. ZIP exports include HTML chapters and `manifest.json`; stored artifacts receive SHA-256 checksums. Local storage is the current adapter.

Quality gates are `pnpm build`, `pnpm typecheck`, `pnpm lint`, and `pnpm test`. Generated JavaScript, declarations, source maps, build info, output directories, and npm lockfiles are not source artifacts.
