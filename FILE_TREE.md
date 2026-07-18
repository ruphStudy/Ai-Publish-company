# APC File Tree

```text
apps/
  api/
    src/
      common/                 # HTTP middleware, filters, interceptors
      core/
        ai/                   # shared AI transport and test provider
        application/workflows # publishing orchestration
        config/               # validated application configuration
        logger/               # structured logging
      infrastructure/         # MongoDB, Redis, BullMQ, S3 adapters
      modules/
        auth audit health
        category book book-project book-blueprint
        outline chapter-generator ai-writing
        book-metadata cover-prompt table-of-contents export
        market-intelligence/  # Sprint 2 intelligence subsystem
  web/
    src/
      app components hooks lib pages styles
packages/
  config/                     # shared configuration contracts
  logger/                     # shared logger contracts
  shared/                     # API/auth types, constants, error codes
docker/                       # MongoDB, Redis and Nginx configuration
docs/design/                  # design system documentation
```

The repository uses `pnpm-workspace.yaml` and `turbo.json`. `pnpm-lock.yaml` is the only package lockfile. TypeScript source remains in `src`; compiler output belongs in ignored `dist` directories.
