# APC-V1-GEN-001 Verification

## Root cause found

- The Generation page treated the existence of a persisted blueprint `_id` as user-facing proof of generation completion.
- Blueprint generation is synchronous and deterministic; it does not create Background Jobs executions.
- The page linked users to Background Jobs even though blueprint generation does not dispatch a job, so the Jobs page correctly showed zero executions.
- Blueprint content was already persisted by the backend, but the UI rendered only the raw database identifier and did not display the generated content.
- Outline generation uses the configured OpenAI-compatible provider through `OpenAiClientService`; without a configured API key or approved blueprint, it fails instead of creating fake completed output.
- Chapter generation uses the configured OpenAI-compatible provider through `OpenAiClientService`; without a configured API key and valid outline chapter target, it fails instead of creating fake completed output.

## Files changed

- `apps/api/src/modules/book-blueprint/book-blueprint.engine.ts`
- `apps/api/src/modules/workflow-context/workflow-context.service.ts`
- `apps/web/src/pages/projects.tsx`
- `docs/reviews/APC-V1-GEN-001-VERIFICATION.md`

## Provider used

- Blueprint: `deterministic-blueprint-engine`, synchronous local generation, no paid external API call.
- Outline: `openai` via shared `OpenAiClientService`, model from `OPENAI_MODEL` or default `gpt-5`.
- Chapter/content: `openai` via shared `OpenAiClientService`, model from `OPENAI_MODEL` or default `gpt-5`.

## Synchronous or asynchronous behavior

- Blueprint generation is synchronous.
- No Background Jobs execution is created for blueprint generation.
- Outline generation is synchronous provider-backed request/response.
- Chapter generation is synchronous provider-backed request/response.

## Status lifecycle verified

- Blueprint UI now displays `RUNNING` while the mutation is pending.
- Workflow context now reports generation `COMPLETED` only when the latest blueprint contains required generated fields.
- Workflow context now reports generation `FAILED` when a blueprint record exists but required generated fields are missing.
- Workflow context now reports generation `READY` when required source records exist and no blueprint exists.
- Workflow context now reports generation `BLOCKED` when Market Intelligence or Knowledge records are missing.
- Background-job tracking was removed from the blueprint action area because the workflow is not job-backed.

## Blueprint output verified

- Blueprint response contains persisted user-facing fields:
  - title
  - subtitle
  - target audience
  - objective
  - positioning / unique angle
  - tone and style
  - chapter objectives
  - target word count
  - target chapter count
  - publishing strategy
  - provider/model-safe metadata
  - created/updated time
- UI now renders these fields instead of using the raw database ID as the primary result.

## Outline output verified

- UI now fetches the latest outline for the latest blueprint.
- UI displays outline title, summary, status, chapter count, estimated word count, AI provider/model and chapter preview when a persisted outline exists.
- Outline generation remains blocked by backend validation when the blueprint is not approved or the provider is not configured.

## Chapter/content output verified

- Chapter generation was audited as provider-backed through the existing chapter generator pipeline.
- No raw-ID-only completion UI was added for chapter/content generation in this workflow.
- Remaining blocker: the current project generation page has no complete chapter/content action wired into this tab.

## Background-job behavior verified

- Blueprint generation does not use the Background Jobs Engine.
- No execution is expected for blueprint generation.
- The misleading Track background jobs action was removed from the Generation workflow card.
- Remaining blocker: if future generation becomes asynchronous, the backend must dispatch a real job execution and the UI must show `QUEUED`/`RUNNING` from that execution.

## Automated test flow result

- Existing relevant tests were executed:
  - `src/modules/book-blueprint/book-blueprint.factory.spec.ts`
  - `src/modules/outline/outline.validator.spec.ts`
  - `src/modules/chapter-generator/chapter.validator.spec.ts`
- A browser E2E framework for the complete generation flow was not present in the current repository.
- No fake completed records were manually inserted.

## Remaining blockers

- Full outline and chapter/content runtime generation require a configured valid AI provider API key unless a deliberate development mock provider is implemented behind an explicit environment flag.
- The Generation page does not yet expose a complete chapter/content generation workflow.
- There is no Background Jobs integration for generation because the current generation services are synchronous.
- No Playwright/Cypress complete browser E2E suite exists for this flow.

## Build result

```text
pnpm build
exit code: 0
```

## Test result

```text
pnpm --filter @ai-publishing/api test -- book-blueprint outline chapter-generator
exit code: 0
Test Suites: 3 passed, 3 total
Tests: 3 passed, 3 total
```

## Manual test steps for the user

1. Start infrastructure from:
   `/Users/ankitsaraf/Project Code/AI-publish_copany/Ai-Publish-company`
   ```bash
   docker compose up -d mongodb redis minio
   ```
2. Start API from:
   `/Users/ankitsaraf/Project Code/AI-publish_copany/Ai-Publish-company/apps/api`
   ```bash
   pnpm dev
   ```
3. Start UI from:
   `/Users/ankitsaraf/Project Code/AI-publish_copany/Ai-Publish-company/apps/web`
   ```bash
   pnpm dev
   ```
4. Login with the seeded safe admin account.
5. Open:
   `http://localhost:5173/generation/<projectId>`
6. Use test project:
   - Title: `Passive Income with AI`
   - Subtitle: `A Practical Guide to Building Automated Income Streams`
   - Description: `A test publishing project used to validate the complete APC generation workflow.`
   - Niche: `AI-powered passive income`
   - Language: `en`
   - Market: `US`
   - Target words: `30000`
   - Target chapters: `10`
7. Select valid Market Intelligence and Knowledge records.
8. Click Generate blueprint.
9. Verify the result panel shows generated blueprint fields, not only a database ID.
10. Verify no Background Jobs execution is expected for blueprint generation.
11. Approve the blueprint before generating an outline.
12. Configure a valid AI provider before outline or chapter/content generation.
