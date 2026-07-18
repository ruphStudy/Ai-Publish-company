# APC-V1 UI Integration Audit

## A. Launch Blockers

### 1. BLOCKER — Main product dashboard is static

- Module: Dashboard / Home
- Frontend file(s): `apps/web/src/pages/dashboard.tsx`
- Backend file(s): Existing candidates include `apps/api/src/modules/book-project/book-project.controller.ts`, `apps/api/src/modules/category/category.controller.ts`, `apps/api/src/modules/book-analytics/book-analytics.controller.ts`, `apps/api/src/modules/ai-insights/ai-insights.controller.ts`, `apps/api/src/modules/background-jobs/background-job.controller.ts`
- Current behavior: The landing dashboard renders hardcoded KPI values (`247`, `1,429`, `84`, `8,450`), static recent book rows, static quick actions, and static AI insight metrics.
- Expected behavior: Dashboard should load authenticated, database-backed portfolio/project/user metrics and recent activity through query hooks.
- Root cause: Page is a standalone static screen and does not use the analytics dashboard foundation or any API client.
- Required change: Replace static values with typed query hooks backed by existing book project/category/analytics/job/AI insight APIs, or create one bounded dashboard summary endpoint if existing APIs cannot efficiently serve the landing view.
- Existing API/service reusable: Yes — category, book project, book analytics, AI insights, background jobs.
- Database seed/default data required: No for the screen itself; useful empty states must handle zero records.
- Dependency: Database initialization for categories/projects improves first-use value but is not required to remove hardcoding.

### 2. BLOCKER — Categories page is entirely mock data and actions do nothing

- Module: Category Management
- Frontend file(s): `apps/web/src/pages/categories.tsx`
- Backend file(s): `apps/api/src/modules/category/category.controller.ts`, `apps/api/src/modules/category/category.service.ts`, `apps/api/src/modules/category/category.repository.ts`
- Current behavior: Category cards are rendered from a local temporary array; search input, filter button, add button, overflow action button, pagination and CRUD flows are not connected.
- Expected behavior: Categories should list real database records, support search/filter/pagination, and expose create/edit/delete/restore actions according to backend authorization.
- Root cause: Frontend page predates the backend category API integration.
- Required change: Add category query/mutation hooks calling existing `/categories` endpoints and replace local array/cards with database-backed list and forms.
- Existing API/service reusable: Yes — category backend already exposes list, slug/id read, update, delete and restore endpoints.
- Database seed/default data required: Yes — launch environment should seed required default category/reference taxonomy if categories are mandatory for project creation.
- Dependency: Auth integration and role-aware action visibility.

### 3. BLOCKER — Primary sidebar links route to non-existent pages

- Module: Navigation / Routing
- Frontend file(s): `apps/web/src/components/layouts/sidebar.tsx`, `apps/web/src/app/App.tsx`
- Backend file(s): Existing backend modules exist for several targets, including book projects, market intelligence, publishing workflow, exports and production modules.
- Current behavior: Sidebar links point to `/knowledge`, `/research`, `/market-intelligence`, `/books`, `/production`, `/generator`, `/pipeline`, `/templates`, and `/publishing`, but `apps/web/src/app/App.tsx` has no matching routes for them.
- Expected behavior: Every navigation item should land on a functional screen or be hidden until implemented.
- Root cause: Navigation was scaffolded independently from routed page implementation.
- Required change: Add connected pages for each launch navigation item or remove/hide those links from launch navigation.
- Existing API/service reusable: Yes for `/market-intelligence`, `/books` or book projects, `/generator` through blueprint/outline/chapter/writing modules, `/publishing` through publishing workflow and provider modules.
- Database seed/default data required: Provider/marketplace/category defaults are required for a useful publishing/generator experience.
- Dependency: Related feature pages and API hooks.

### 4. BLOCKER — Analytics dashboards mostly render unavailable fallback data instead of backend analytics

- Module: Analytics Dashboards
- Frontend file(s): `apps/web/src/features/executive-dashboard/hooks/use-executive-dashboard-queries.ts`, `apps/web/src/features/user-dashboard/hooks/use-user-dashboard-queries.ts`, `apps/web/src/features/sales-dashboard/hooks/use-sales-dashboard-queries.ts`, `apps/web/src/features/revenue-dashboard/hooks/use-revenue-dashboard-queries.ts`, `apps/web/src/features/entity-analytics-dashboard/hooks/use-entity-analytics-queries.ts`, `apps/web/src/features/opportunity-ai-dashboards/hooks/use-intelligence-dashboard-queries.ts`, `apps/web/src/features/operations-admin-dashboards/hooks/use-operations-admin-queries.ts`
- Backend file(s): `apps/api/src/modules/book-analytics/book-analytics.controller.ts`, `apps/api/src/modules/opportunity-analytics/opportunity-analytics.controller.ts`, `apps/api/src/modules/ai-insights/ai-insights.controller.ts`, `apps/api/src/modules/sales-ingestion`, `apps/api/src/modules/royalty-ingestion`, `apps/api/src/modules/background-jobs/background-job.controller.ts`, `apps/api/src/modules/resilience/resilience.controller.ts`
- Current behavior: Most hooks call `useAnalyticsQuery(..., undefined, false)` and return `*UnavailableResponse()` empty/fallback models; widgets display “unavailable” states rather than database-backed metrics.
- Expected behavior: Dashboard widgets should call existing analytics, opportunity, insight, operations, job and resilience APIs with mapped filters.
- Root cause: Dashboard UI definitions were created without binding most widgets to backend endpoints.
- Required change: Wire each widget group to existing backend read endpoints or add minimal aggregate read APIs where frontend dashboard contracts require a consolidated response.
- Existing API/service reusable: Partially — entity/book analytics, opportunity analytics, AI insights, jobs, resilience and settings APIs exist; sales/revenue portfolio-level dashboard aggregate endpoints are missing.
- Database seed/default data required: Yes — normalized sales/revenue/royalty ingestion records and analytics snapshots are required for non-empty dashboards.
- Dependency: Missing aggregate dashboard endpoints for portfolio-level sales/revenue/executive/user/operations dashboards.

## B. Dummy/Mock Data

### 5. HIGH — User Dashboard quick actions are local static shortcuts

- Module: User Dashboard
- Frontend file(s): `apps/web/src/features/user-dashboard/lib/user-dashboard-mappers.ts`, `apps/web/src/features/user-dashboard/hooks/use-user-dashboard-queries.ts`
- Backend file(s): No dedicated user dashboard summary/shortcut endpoint found.
- Current behavior: `defaultQuickActions()` returns a local array of shortcuts; the dashboard query is disabled and falls back to `userDashboardUnavailableResponse()`.
- Expected behavior: Quick actions should be permission-aware, workspace/project-aware and generated from real available modules/routes.
- Root cause: No backend-backed user dashboard model or navigation capability feed.
- Required change: Reuse auth permissions and module registry/route metadata to generate allowed quick actions; remove static fallback as primary data.
- Existing API/service reusable: Partially — auth/local user roles and frontend permission helper exist.
- Database seed/default data required: No.
- Dependency: Broken routes must be fixed first or the static shortcuts continue linking to missing pages.

### 6. HIGH — Frontend platform registry is static while backend platform registry exists separately

- Module: Platform Registry / Provider Marketplace UI
- Frontend file(s): `apps/web/src/features/platform-registry/platform-registry.ts`
- Backend file(s): `apps/api/src/core/platform/platform-capability.registry.ts`
- Current behavior: Frontend hardcodes providers and marketplaces in arrays.
- Expected behavior: Provider/marketplace labels, capabilities and defaults should come from the backend registry or a shared package to avoid drift.
- Root cause: Platform registry was duplicated between frontend and backend.
- Required change: Expose backend registry metadata through a read endpoint or move registry definitions into a shared package consumed by both apps.
- Existing API/service reusable: Backend platform capability registry exists, but no frontend-facing endpoint was verified.
- Database seed/default data required: No if registry remains code-backed; yes if converted to database-managed provider/marketplace definitions.
- Dependency: Settings/provider configuration work.

### 7. MEDIUM — Analytics Overview and Royalty Dashboard are foundation placeholders

- Module: Analytics Overview / Royalty Dashboard
- Frontend file(s): `apps/web/src/features/analytics-dashboard/registry.ts`
- Backend file(s): `apps/api/src/modules/royalty-ingestion`, `apps/api/src/modules/book-analytics/book-analytics.controller.ts`
- Current behavior: `/analytics/overview` and `/analytics/royalty` use `foundation-empty-state` with copy saying business widgets will be connected later.
- Expected behavior: Overview and royalty routes should either have real widgets or be hidden from launch navigation/registry.
- Root cause: Dashboard foundation route entries were left enabled.
- Required change: Connect overview/royalty widgets to existing analytics/royalty APIs or disable these dashboards for launch.
- Existing API/service reusable: Partially — royalty ingestion exists, but a royalty dashboard aggregate read contract is not verified in frontend.
- Database seed/default data required: Royalty data required for non-empty states.
- Dependency: Dashboard API integration.

## C. Broken Routes and Navigation

### 8. HIGH — Quick action routes navigate to missing pages

- Module: User Dashboard / Dashboard quick actions
- Frontend file(s): `apps/web/src/pages/dashboard.tsx`, `apps/web/src/features/user-dashboard/lib/user-dashboard-mappers.ts`
- Backend file(s): Existing backend services exist for several targets.
- Current behavior: Dashboard buttons have no `Link` or handler; user-dashboard quick actions link to `/books`, `/production`, `/publishing`, which are not routed.
- Expected behavior: Quick actions should navigate to implemented routes or invoke connected workflows/forms.
- Root cause: Action metadata is static and not validated against router configuration.
- Required change: Route every action to an existing page or suppress actions whose target route is unavailable.
- Existing API/service reusable: Yes for several workflows, but frontend pages are missing.
- Database seed/default data required: No.
- Dependency: Issue 3.

### 9. HIGH — Entity/dashboard drill-down targets use dashboard keys that are not always routes

- Module: Analytics Drill-down
- Frontend file(s): `apps/web/src/features/entity-analytics-dashboard/entity-registry.ts`, `apps/web/src/features/executive-dashboard/components/executive-sections.tsx`, `apps/web/src/features/user-dashboard/components/user-dashboard-sections.tsx`
- Backend file(s): `apps/api/src/modules/book-analytics/book-analytics.controller.ts`, `apps/api/src/modules/opportunity-analytics/opportunity-analytics.controller.ts`
- Current behavior: Drill-down metadata contains values such as `sales-dashboard`, `opportunity-dashboard`, `book-analytics-dashboard`, while routes are `/analytics/sales`, `/analytics/opportunities`, `/analytics/books`.
- Expected behavior: Drill-down metadata should resolve through the dashboard registry to real route paths while preserving filters.
- Root cause: Dashboard keys and route paths are mixed in link/action metadata.
- Required change: Centralize drill-down route resolution using `DashboardDefinition.route` and validate all drill-down targets.
- Existing API/service reusable: Frontend dashboard registry is reusable.
- Database seed/default data required: No.
- Dependency: Dashboard route registry cleanup.

## D. Missing Backend Integration

### 10. HIGH — Portfolio sales and revenue dashboard endpoints are not exposed in the frontend contract

- Module: Sales Dashboard / Revenue Dashboard
- Frontend file(s): `apps/web/src/features/sales-dashboard/hooks/use-sales-dashboard-queries.ts`, `apps/web/src/features/revenue-dashboard/hooks/use-revenue-dashboard-queries.ts`
- Backend file(s): `apps/api/src/modules/sales-ingestion`, `apps/api/src/modules/royalty-ingestion`, `apps/api/src/modules/book-analytics/book-analytics.controller.ts`
- Current behavior: Sales and revenue hooks do not call endpoints; no dashboard-specific `/sales-dashboard/*` or `/revenue-dashboard/*` API client exists.
- Expected behavior: Sales/revenue widgets should use backend-provided overview, trend, ranking, distribution, freshness and activity data.
- Root cause: Backend ingestion/analytics modules exist, but frontend dashboard aggregate read contracts were not connected.
- Required change: Reuse book analytics and ingestion services to expose bounded read endpoints, then connect hooks.
- Existing API/service reusable: Partially.
- Database seed/default data required: Sales/revenue/royalty normalized records are required.
- Dependency: Analytics snapshot/aggregation availability.

### 11. HIGH — Executive and User dashboards lack aggregate backend read APIs

- Module: Executive Dashboard / User Dashboard
- Frontend file(s): `apps/web/src/features/executive-dashboard/hooks/use-executive-dashboard-queries.ts`, `apps/web/src/features/user-dashboard/hooks/use-user-dashboard-queries.ts`
- Backend file(s): `apps/api/src/modules/ai-insights/ai-insights.controller.ts`, `apps/api/src/modules/book-analytics/book-analytics.controller.ts`, `apps/api/src/modules/opportunity-analytics/opportunity-analytics.controller.ts`
- Current behavior: Executive summary endpoint is present in code but disabled; all other executive/user sections use unavailable fallback responses.
- Expected behavior: Dashboards should compose actual KPIs, risks, opportunities, books, activity and freshness from backend services.
- Root cause: Missing or unwired aggregate read models for executive/user dashboard shells.
- Required change: Connect existing endpoint `/ai-insights/executive-summary` where valid and add/read-model endpoints for the remaining dashboard sections.
- Existing API/service reusable: Partially.
- Database seed/default data required: At least users, projects, analytics snapshots, opportunities and insights.
- Dependency: Auth/user workspace context.

### 12. MEDIUM — Settings UI uses API but has no persisted registry seed requirement because definitions are code-only

- Module: Settings
- Frontend file(s): `apps/web/src/features/settings/settings-page.tsx`, `apps/web/src/features/settings/settings-api.ts`
- Backend file(s): `apps/api/src/modules/settings/settings.registry.ts`, `apps/api/src/modules/settings/settings.controller.ts`
- Current behavior: Registry metadata is code-backed and values persist only when overridden; no database initialization is needed for definitions.
- Expected behavior: Launch documentation or seed process should explicitly state that definitions are registry-backed and only overrides are stored.
- Root cause: Settings definitions are not database records.
- Required change: Decide whether settings registry remains code-backed or requires seeded setting definition records; if code-backed, document it in launch checklist.
- Existing API/service reusable: Yes.
- Database seed/default data required: No for definitions; yes only for environment/workspace overrides.
- Dependency: None.

### 13. MEDIUM — Background Jobs UI can trigger compatibility/no-op jobs

- Module: Background Jobs
- Frontend file(s): `apps/web/src/features/background-jobs/background-jobs-page.tsx`, `apps/web/src/features/background-jobs/background-jobs-api.ts`
- Backend file(s): `apps/api/src/modules/background-jobs/background-job.registry.ts`, `apps/api/src/modules/background-jobs/background-job.handlers.ts`
- Current behavior: The registry exposes many jobs using handler `noop.compatibility`; frontend displays trigger buttons for all definitions.
- Expected behavior: User-facing trigger actions should only be enabled for jobs with real execution handlers or should clearly mark compatibility-only jobs as unavailable.
- Root cause: Registry includes placeholder compatibility definitions for future module delegation.
- Required change: Add capability metadata for executable/manual-triggerable jobs and hide/disable trigger for no-op compatibility handlers.
- Existing API/service reusable: Yes — job registry metadata.
- Database seed/default data required: No.
- Dependency: Actual business job handler integration.

## E. Missing Database Initialization

### 14. HIGH — No verified seed path for mandatory launch reference data

- Module: Database Initialization
- Frontend file(s): `apps/web/src/pages/categories.tsx`, dashboard filters across `apps/web/src/features/*`
- Backend file(s): `apps/api/src/modules/category`, `apps/api/src/core/platform/platform-capability.registry.ts`, `apps/api/src/modules/settings/settings.registry.ts`, `apps/api/src/modules/auth/entities/user.entity.ts`
- Current behavior: Repository contains code registries for settings/platform/jobs but no verified seed script for roles/permissions, default categories, admin user, workspace/project context, provider definitions or marketplace definitions.
- Expected behavior: Launch should initialize required records and/or explicitly document which registries are code-backed.
- Root cause: Product modules assume reference data but seed/bootstrap path is not visible in inspected files.
- Required change: Add or document startup/seed process for admin user, categories, workspace/project defaults, provider/marketplace defaults if database-backed, and initial feature flags/settings overrides where needed.
- Existing API/service reusable: Yes — auth register, categories, settings registry, platform registry.
- Database seed/default data required: Yes.
- Dependency: Decide code-backed vs database-backed registry ownership.

### 15. HIGH — Permission model is role-only while frontend declares fine-grained permissions

- Module: Authorization / Permissions
- Frontend file(s): `apps/web/src/features/analytics-dashboard/hooks/use-dashboard-permissions.ts`, dashboard definitions with permissions such as `analytics:read`, `opportunities:read`, `ai-insights:read`
- Backend file(s): `apps/api/src/modules/auth/entities/user.entity.ts`, `apps/api/src/modules/auth/guards/roles.guard.ts`
- Current behavior: Backend user model stores roles only; frontend permission helper reads optional `user.permissions` from localStorage, but auth `/me` and auth responses return roles only.
- Expected behavior: Frontend and backend should share an authoritative permission model, or frontend should map roles to permissions consistently.
- Root cause: Fine-grained permission metadata was added in frontend definitions without backend permission persistence or API output.
- Required change: Add role-to-permission mapping API/shared helper, or seed/persist permissions and return them from auth endpoints.
- Existing API/service reusable: Partially — RBAC roles exist.
- Database seed/default data required: Yes if permissions become database-backed.
- Dependency: Auth contract decision.

## F. Incomplete User Actions

### 16. HIGH — Dashboard export capabilities are declared but no export action is connected

- Module: Analytics Dashboard Foundation
- Frontend file(s): `apps/web/src/features/analytics-dashboard/components/dashboard-toolbar.tsx`, dashboard definitions across `apps/web/src/features/*`
- Backend file(s): Existing candidates include `apps/api/src/modules/export/export.controller.ts`, analytics controllers.
- Current behavior: Dashboards declare `exportCapabilities`, but toolbar export UI is a passive button and no export API client/mutation is wired.
- Expected behavior: Export should call authorized backend export/report APIs with filters, period and freshness metadata.
- Root cause: Export framework metadata exists in frontend definitions without an implementation path.
- Required change: Connect toolbar export action to existing export service or dashboard-specific export endpoints.
- Existing API/service reusable: Partially — export module exists for book artifacts, not verified for dashboard data exports.
- Database seed/default data required: No.
- Dependency: Dashboard data integration.

### 17. HIGH — Dashboard saved views are localStorage-only

- Module: Dashboard Foundation / Preferences
- Frontend file(s): `apps/web/src/features/analytics-dashboard/services/analytics-dashboard-api.ts`, `apps/web/src/features/analytics-dashboard/state/dashboard-preferences.ts`
- Backend file(s): No saved-view/preferences endpoint verified.
- Current behavior: Saved views persist in localStorage under `analytics:saved-views:*`; preferences are local client state.
- Expected behavior: Saved views/preferences should be user/workspace scoped and survive device/browser changes.
- Root cause: No backend persistence integration for dashboard preferences.
- Required change: Add or reuse user preference/settings endpoints for saved views and dashboard preferences.
- Existing API/service reusable: Yes — Settings Engine could store user/workspace dashboard preferences.
- Database seed/default data required: No.
- Dependency: Settings/user context integration.

### 18. MEDIUM — Settings secret management can save overrides but lacks rotation-specific flow

- Module: Settings / Secret Management
- Frontend file(s): `apps/web/src/features/settings/settings-page.tsx`
- Backend file(s): `apps/api/src/modules/settings/settings-encryption.service.ts`, `apps/api/src/modules/settings/settings.service.ts`
- Current behavior: Secret fields are masked and read-only when value is `********`; UI provides generic save/reset controls but no explicit rotate-secret action.
- Expected behavior: Secret settings should support an intentional rotate flow that never displays current secret and records rotation audit semantics.
- Root cause: Secret fields are rendered by generic dynamic form only.
- Required change: Add rotate-new-secret UX using existing update endpoint or a dedicated rotate endpoint if audit semantics need to differ.
- Existing API/service reusable: Partially — settings update encrypts values.
- Database seed/default data required: No.
- Dependency: Audit semantics for secret rotation.

### 19. MEDIUM — Background job schedule management is read-mostly

- Module: Background Jobs
- Frontend file(s): `apps/web/src/features/background-jobs/background-jobs-page.tsx`
- Backend file(s): `apps/api/src/modules/background-jobs/background-job.controller.ts`
- Current behavior: UI lists schedules but does not expose create/update/enable/disable controls despite backend endpoints.
- Expected behavior: Authorized users should manage schedules from the operations UI.
- Root cause: Schedule UI only renders a table.
- Required change: Add schedule form/dialog and enable/disable actions using existing endpoints.
- Existing API/service reusable: Yes.
- Database seed/default data required: Optional default schedules for cleanup/monitoring.
- Dependency: Job registry manual trigger metadata.

### 20. MEDIUM — Resilience manual recovery UI lacks details/diagnostic depth

- Module: Resilience
- Frontend file(s): `apps/web/src/features/resilience/resilience-page.tsx`
- Backend file(s): `apps/api/src/modules/resilience/resilience.controller.ts`
- Current behavior: Recovery page lists policies, circuits and history; manual retry/recover are available, but no detail page or safe event timeline is rendered.
- Expected behavior: Users should inspect recovery details/events before manual recovery.
- Root cause: Existing frontend uses summary lists only.
- Required change: Add detail panel/page using existing `/resilience/events` and history APIs.
- Existing API/service reusable: Yes.
- Database seed/default data required: No.
- Dependency: None.

## G. Medium/Low-Priority UI Polish

### 21. MEDIUM — Loading/error states are inconsistent outside dashboard shell

- Module: Standalone Pages
- Frontend file(s): `apps/web/src/pages/dashboard.tsx`, `apps/web/src/pages/categories.tsx`, `apps/web/src/features/settings/settings-page.tsx`, `apps/web/src/features/background-jobs/background-jobs-page.tsx`, `apps/web/src/features/resilience/resilience-page.tsx`
- Backend file(s): Not applicable.
- Current behavior: Dashboard and categories have no API loading/error states because they do not query; settings/jobs/resilience have minimal loading/error handling.
- Expected behavior: All connected pages should expose consistent loading, empty, partial and error states.
- Root cause: Standalone pages do not all reuse dashboard state components.
- Required change: Reuse existing `WidgetEmptyState`, `DashboardErrorState` or common empty/error components across standalone pages.
- Existing API/service reusable: Not applicable.
- Database seed/default data required: No.
- Dependency: Page API integration.

### 22. LOW — Header search and notification affordances are not connected

- Module: Layout Header / Notifications
- Frontend file(s): `apps/web/src/components/layouts/header.tsx`
- Backend file(s): `apps/api/src/modules/notification/notification.controller.ts`
- Current behavior: Header contains search/settings/notification visual controls, but notification list/count and global search are not wired in the inspected files.
- Expected behavior: Notification badge/menu should use notification APIs; search should route to a real searchable area or be hidden.
- Root cause: Layout shell was scaffolded before notification/global search integration.
- Required change: Connect notifications to `/notifications` and `/notifications/unread-count`; define global search behavior or remove search input.
- Existing API/service reusable: Yes for notifications.
- Database seed/default data required: No.
- Dependency: Notification preference/recipient data.

### 23. LOW — Some backend endpoints have no frontend usage

- Module: Backend API Surface
- Frontend file(s): No corresponding frontend usage verified for many newer APIs.
- Backend file(s): Examples include `apps/api/src/modules/quality-review/quality-review.controller.ts`, `apps/api/src/modules/content-improvement/content-improvement.controller.ts`, `apps/api/src/modules/plagiarism-detection`, `apps/api/src/modules/fact-consistency`, `apps/api/src/modules/compliance-validation`, `apps/api/src/modules/publication-readiness`, provider package controllers.
- Current behavior: Backend capabilities exist without reachable frontend flows in inspected routes/navigation.
- Expected behavior: Launch-critical backend flows should be reachable from production/generator/publishing screens.
- Root cause: Backend modules were implemented ahead of connected UI screens.
- Required change: Add reachable pages/workflow steps for launch-critical modules or classify endpoints as API-only/post-launch.
- Existing API/service reusable: Yes.
- Database seed/default data required: Depends on workflow.
- Dependency: Missing production/publishing pages.

## H. Recommended Implementation Order

1. Fix route/navigation blockers: either implement or hide `/knowledge`, `/research`, `/market-intelligence`, `/books`, `/production`, `/generator`, `/pipeline`, `/templates`, `/publishing`.
2. Replace `apps/web/src/pages/categories.tsx` mock array with real `/categories` query/mutations.
3. Replace `apps/web/src/pages/dashboard.tsx` static KPIs/recent books/insights with real dashboard summary queries.
4. Define launch seed/bootstrap requirements for admin user, categories, workspace/project context, provider/marketplace defaults and permissions.
5. Establish one authoritative permission contract between backend roles and frontend dashboard permissions.
6. Connect analytics dashboard hooks currently using `undefined, false` to existing backend endpoints, starting with entity analytics and opportunity/AI insights because those APIs already exist.
7. Add missing portfolio-level sales/revenue/executive/user aggregate read endpoints only where existing APIs cannot serve widgets efficiently.
8. Resolve drill-down route mapping by converting dashboard keys to `DashboardDefinition.route`.
9. Wire dashboard export and saved-view persistence using existing export/settings infrastructure.
10. Complete operations UI actions for schedules, job executable metadata and resilience recovery details.
