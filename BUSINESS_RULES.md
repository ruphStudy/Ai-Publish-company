# BUSINESS RULES

> **Phase 1 — AI Publishing Company**  
> Source of truth for business logic decisions.  
> Used by developers and AI coding assistants to eliminate assumptions.

---

## How to Read This Document

- **BR-XXX** labels are stable rule identifiers. Reference them in code comments, PRs, and issues.
- Rules marked **[PHASE 1]** are active now and must be enforced in code.
- Rules marked **[FUTURE]** must NOT be implemented until explicitly scoped into a sprint.
- Rules marked **[CONSTRAINT]** are hard limits that cannot be changed without architectural review.
- When a rule conflicts with a request, the rule wins. Raise it explicitly.

---

## 1. Business Vision

**BR-001 [PHASE 1]**  
The AI Publishing Company platform exists to allow content teams to organise, classify, and ultimately generate structured published content with AI assistance.

**BR-002 [PHASE 1]**  
Phase 1 establishes the foundational data taxonomy — the classification system (categories and subcategories) and the user authentication layer — that all future content and AI operations depend upon.

**BR-003 [CONSTRAINT]**  
No feature may be implemented that assumes the existence of billing, subscriptions, teams, or organisations. The platform serves a single authenticated user pool in Phase 1.

**BR-004 [CONSTRAINT]**  
No AI content generation, no external API integrations, and no automated publishing pipelines are in scope for Phase 1. The platform collects and organises structured configuration; generation happens in a future phase.

---

## 2. Phase 1 Scope

### **What Phase 1 Is**

**BR-005 [PHASE 1]**  
Phase 1 covers exactly the following domains:

| Domain | Status | Notes |
|--------|--------|-------|
| User Authentication | ✅ Complete | JWT login, register, refresh token |
| User Roles | ✅ Complete | ADMIN, EDITOR, VIEWER |
| Category Management | ✅ Complete | Full CRUD, soft delete, ordering, search |
| Subcategory Schema | ✅ Schema only | Entity and indexes defined, no business logic yet |
| Health Monitoring | ✅ Complete | Infrastructure health endpoint |
| Audit Logging | ✅ Complete | Action tracking infrastructure |
| Core Infrastructure | ✅ Complete | DB, Cache, Queue, Storage modules |

**BR-006 [PHASE 1]**  
Any code change that introduces a module, endpoint, or schema outside the table above is out of scope for Phase 1 and requires explicit sprint approval.

### **What Phase 1 Is Not**

**BR-007 [CONSTRAINT]**  
Phase 1 does not include: book management, article management, content generation, topic selection, outline workflows, export pipelines, publishing workflows, file uploads, email notifications, or search engine integration.

---

## 3. User Roles

### **Role Definitions**

**BR-010 [PHASE 1]**  
The system supports exactly three roles. No additional roles may be added in Phase 1.

| Role | Value (stored) | Description |
|------|---------------|-------------|
| `ADMIN` | `'admin'` | Full system access. Can create, modify, delete, and restore any resource. Manages users and roles. |
| `EDITOR` | `'editor'` | Content management access. Can create and update categories and content. Cannot delete or manage users. |
| `VIEWER` | `'viewer'` | Read-only access. Can retrieve any active, non-deleted resource. Cannot modify anything. |

**BR-011 [PHASE 1]**  
A user may hold multiple roles simultaneously. The system evaluates access by checking whether the user holds **any** of the required roles (OR logic, not AND).

**BR-012 [PHASE 1]**  
Every new user account is assigned the `VIEWER` role by default. Role elevation must be performed by an `ADMIN`.

**BR-013 [PHASE 1]**  
The first user created in the system (the bootstrap user) is created with the `ADMIN` role. This is a one-time operation and is the only way to establish the initial ADMIN.

**BR-014 [PHASE 1]**  
A user cannot remove their own ADMIN role. An ADMIN can only be demoted by a different ADMIN.

**BR-015 [PHASE 1]**  
A soft-deleted user cannot authenticate. Their JWT tokens must be treated as invalid from the moment of deletion.

### **Role-Based Access Matrix — Phase 1**

| Operation | ADMIN | EDITOR | VIEWER |
|-----------|-------|--------|--------|
| Register / Login | ✅ | ✅ | ✅ |
| Refresh token | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Create category | ✅ | ✅ | ❌ |
| Update category | ✅ | ✅ | ❌ |
| Delete category | ✅ | ❌ | ❌ |
| Restore category | ✅ | ❌ | ❌ |
| Read categories | ✅ | ✅ | ✅ |
| View health endpoint | ✅ | ✅ | ✅ |

---

## 4. Category Rules

### **What a Category Is**

**BR-020 [PHASE 1]**  
A category is the top-level content classification unit. It groups related content areas together. In Phase 1, categories are standalone entities with no parent.

**BR-021 [PHASE 1]**  
Categories are the primary taxonomy. Every future content entity (book, article, topic) will reference a category. The category data model is therefore a foundational dependency.

### **Creation Rules**

**BR-022 [PHASE 1]**  
A category name must be unique across the entire `categories` collection. Uniqueness is case-insensitive. `"Technology"` and `"technology"` are considered duplicates.

**BR-023 [PHASE 1]**  
A category slug must be globally unique across the `categories` collection. Slug uniqueness is case-sensitive at the database level, but slugs are always stored in lowercase, making them effectively case-insensitively unique.

**BR-024 [PHASE 1]**  
If a slug is not provided at creation time, the system must auto-generate it from the category name using the canonical slug generation algorithm (see Section 15).

**BR-025 [PHASE 1]**  
A category name must be between 2 and 100 characters after trimming whitespace.

**BR-026 [PHASE 1]**  
A category description is optional. If provided, it must not exceed 500 characters.

**BR-027 [PHASE 1]**  
A category's `isActive` flag defaults to `true` on creation. New categories are visible immediately.

**BR-028 [PHASE 1]**  
A category's `order` field defaults to the next available integer (highest existing `order` + 1) if not explicitly provided. This prevents ordering collisions on bulk creation.

**BR-029 [PHASE 1]**  
The `order` field must be a non-negative integer (≥ 0). Fractional or negative values are not permitted.

**BR-030 [PHASE 1]**  
A category's `icon` and `color` fields are optional. `color`, if provided, must be a valid hexadecimal colour code (e.g., `#3B82F6`).

### **Update Rules**

**BR-031 [PHASE 1]**  
When a category name is updated, the slug is automatically regenerated from the new name **unless** a new slug is explicitly provided in the same request.

**BR-032 [PHASE 1]**  
When updating a category, name and slug uniqueness must be rechecked, excluding the category being updated itself.

**BR-033 [PHASE 1]**  
A category's `createdBy` field is immutable after creation. It cannot be changed by any update operation.

**BR-034 [PHASE 1]**  
Every update operation must record the authenticated user's ID in `updatedBy`.

### **Status Rules**

**BR-035 [PHASE 1]**  
Setting `isActive = false` makes the category invisible to VIEWER-role list queries. ADMIN and EDITOR roles can see inactive categories when explicitly filtered.

**BR-036 [PHASE 1]**  
An inactive category is not deleted. It can be reactivated at any time by an ADMIN or EDITOR.

**BR-037 [PHASE 1]**  
Soft-deleting a category sets `isDeleted = true`, records `deletedAt` and `deletedBy`, and removes the category from all standard query results. The query middleware enforces this automatically.

**BR-038 [PHASE 1]**  
A soft-deleted category cannot be updated. Any update request targeting a soft-deleted category must return `404 Not Found`. The existence of soft-deleted records is not exposed to consumers.

**BR-039 [PHASE 1]**  
Only an ADMIN can restore a soft-deleted category.

**BR-040 [PHASE 1]**  
Restoring a category resets `isDeleted = false`, `deletedAt = null`, and `deletedBy = null`. The category returns to its previous `isActive` state.

### **Deletion Rules**

**BR-041 [PHASE 1]**  
Only an ADMIN role can soft-delete a category.

**BR-042 [PHASE 1]**  
Hard deletes are never permitted through the API. The `DELETE /categories/:id` endpoint performs a soft delete exclusively.

**BR-043 [FUTURE]**  
When the Book module is implemented: deleting a category that has associated books must be blocked unless all associated books are themselves deleted first, or the operation explicitly reassigns/orphans them.

---

## 5. Subcategory Rules

### **Current State**

**BR-050 [PHASE 1]**  
The `Subcategory` entity and its MongoDB schema exist in the codebase as a forward declaration. The schema, collection, and indexes are defined and registered. No controller, service, or repository exists for subcategories in Phase 1.

**BR-051 [CONSTRAINT]**  
No subcategory business logic, endpoints, or DTOs may be implemented in Phase 1. The entity exists solely to pre-define the data contract.

### **Defined Rules for Future Implementation**

**BR-052 [FUTURE]**  
Every subcategory must belong to exactly one parent category (`categoryId` is required and non-nullable).

**BR-053 [FUTURE]**  
A subcategory slug must be unique within its parent category. The same slug may exist in different categories. The compound unique index `{ categoryId: 1, slug: 1 }` enforces this.

**BR-054 [FUTURE]**  
A subcategory name must be unique within its parent category. Case-insensitive.

**BR-055 [FUTURE]**  
Deleting a parent category must cascade the soft delete to all child subcategories.

**BR-056 [FUTURE]**  
Restoring a parent category does not automatically restore its child subcategories. Subcategories must be restored individually or via an explicit bulk restore operation.

**BR-057 [FUTURE]**  
Subcategories do not have a `color` field. Only categories carry a colour designation.

---

## 6. Book Rules

> **All rules in this section are FUTURE scope. No Book module exists in Phase 1.**

**BR-060 [FUTURE]**  
A book must belong to exactly one category.

**BR-061 [FUTURE]**  
A book may optionally belong to one subcategory within its parent category.

**BR-062 [FUTURE]**  
A book must have a unique title within its category.

**BR-063 [FUTURE]**  
A book is always created in `DRAFT` status. It cannot be created in `PUBLISHED` status directly.

**BR-064 [FUTURE]**  
A book title and its auto-generated slug must be unique across the `books` collection.

**BR-065 [FUTURE]**  
A book that references a deleted category cannot be published. Publishing requires the parent category to be active and not deleted.

---

## 7. Topic Selection Rules

> **All rules in this section are FUTURE scope.**

**BR-070 [FUTURE]**  
Topic selection is the process by which an EDITOR or ADMIN selects specific content themes for a book before AI generation is triggered.

**BR-071 [FUTURE]**  
A book must have at least one topic selected before an AI outline generation job can be queued.

**BR-072 [FUTURE]**  
Topics are associated with a book, not with a category. Topic lists do not span books.

**BR-073 [FUTURE]**  
Duplicate topics within the same book are not permitted.

**BR-074 [FUTURE]**  
A maximum topic count per book will be defined at implementation time based on AI provider constraints.

---

## 8. Book Generation Rules

> **All rules in this section are FUTURE scope. The BullMQ queue infrastructure exists but no job processors are implemented.**

**BR-080 [FUTURE]**  
Book generation is an asynchronous operation. It is queued via BullMQ and never processed synchronously within an HTTP request.

**BR-081 [FUTURE]**  
Only one generation job may be active per book at any given time. A second generation request for the same book is rejected if a job is already pending or processing.

**BR-082 [FUTURE]**  
A generation job that fails must be retried up to a configurable number of times before transitioning the book to an `GENERATION_FAILED` status.

**BR-083 [FUTURE]**  
The authenticated user who triggered the generation job must be recorded as the job initiator.

**BR-084 [FUTURE]**  
Book generation may only be triggered by ADMIN or EDITOR roles.

---

## 9. Outline Approval Rules

> **All rules in this section are FUTURE scope.**

**BR-090 [FUTURE]**  
After a book generation job completes successfully, the book enters `PENDING_APPROVAL` status. A human reviewer must approve or reject the generated outline before the book proceeds.

**BR-091 [FUTURE]**  
Only an ADMIN or EDITOR may approve or reject an outline.

**BR-092 [FUTURE]**  
A reviewer cannot approve their own generated outline if they are the sole ADMIN. At least two users with ADMIN or EDITOR role must exist for this constraint to apply.

**BR-093 [FUTURE]**  
Rejecting an outline returns the book to `DRAFT` status and preserves the rejection reason as an audit record.

**BR-094 [FUTURE]**  
Approved outlines transition the book to `APPROVED` status, making it eligible for the next pipeline stage.

---

## 10. AI Usage Rules

> Rules governing how AI features interact with the platform. Generation features are FUTURE scope; the constraints below define the guardrails for when they are built.

**BR-100 [CONSTRAINT]**  
AI generation must never be triggered directly from a controller in a synchronous HTTP request. All AI operations are dispatched as BullMQ jobs.

**BR-101 [CONSTRAINT]**  
AI-generated content is always stored before being presented to a user. Raw AI responses from external APIs are never returned to the consumer without first being persisted and validated.

**BR-102 [CONSTRAINT]**  
No external AI API key or AI provider credential may be hardcoded. All credentials must be loaded from environment variables via the configuration module.

**BR-103 [FUTURE]**  
The AI provider (e.g., OpenAI, Anthropic) is configurable via environment variables. The system must not be hardcoded to a single provider.

**BR-104 [FUTURE]**  
AI generation costs (token usage) must be logged per job for auditing and future cost attribution.

**BR-105 [FUTURE]**  
Users must not be able to trigger AI generation for a resource they do not own or have access to, regardless of their role.

---

## 11. Publishing Rules

> **All rules in this section are FUTURE scope.**

**BR-110 [FUTURE]**  
A book can only be published after its outline has been approved (`APPROVED` status).

**BR-111 [FUTURE]**  
Publishing a book transitions it to `PUBLISHED` status and records `publishedAt` and `publishedBy`.

**BR-112 [FUTURE]**  
A published book is immutable. It cannot be edited after publishing unless it is first moved back to `DRAFT` via an explicit unPublish operation, which requires ADMIN role.

**BR-113 [FUTURE]**  
Unpublishing a book does not delete it. It transitions back to `DRAFT` status with `publishedAt` retained as a historical field.

**BR-114 [FUTURE]**  
A soft-deleted book cannot be published. Deletion takes precedence over status.

---

## 12. Quality Rules

**BR-120 [PHASE 1]**  
Every API endpoint that accepts input must validate it using class-validator DTOs. No unvalidated data may reach the service layer.

**BR-121 [PHASE 1]**  
Every write operation (create, update, delete) on any resource must record the acting user's ID in the corresponding audit field (`createdBy`, `updatedBy`, or `deletedBy`).

**BR-122 [PHASE 1]**  
No endpoint may return a `200 OK` response with an empty resource where the resource was expected. Not-found conditions always return `404 Not Found`.

**BR-123 [PHASE 1]**  
All list endpoints must support pagination. No list endpoint may return an unbounded result set.

**BR-124 [PHASE 1]**  
Deleted resources are not visible in any list or detail endpoint unless the caller holds ADMIN role and explicitly opts in. The default state is: soft-deleted records do not exist from the consumer's perspective.

**BR-125 [PHASE 1]**  
Error responses must follow the standard error format defined in `packages/shared/src/types/api-response.types.ts`. No custom error shapes are permitted.

---

## 13. Export Rules

> **All rules in this section are FUTURE scope.**

**BR-130 [FUTURE]**  
Exported content (PDF, EPUB, DOCX) is generated asynchronously via a BullMQ job. Export requests from HTTP endpoints enqueue a job and return a job ID; the client polls or receives a webhook.

**BR-131 [FUTURE]**  
Exported files are stored in S3-compatible object storage. The API returns a signed, time-limited URL for download. Files are never streamed directly from memory in a single HTTP response.

**BR-132 [FUTURE]**  
Export is available only for books in `PUBLISHED` status.

**BR-133 [FUTURE]**  
Export file formats supported in Phase 2: PDF, EPUB. Additional formats are not in scope until explicitly approved.

---

## 14. Validation Rules

### **Input Validation**

**BR-140 [PHASE 1]**  
String fields must be trimmed of leading and trailing whitespace before persistence. DTOs must apply `@Transform(({ value }) => value?.trim())` or rely on Mongoose's `trim: true` schema option.

**BR-141 [PHASE 1]**  
The `ValidationPipe` is global, with `whitelist: true` and `forbidNonWhitelisted: true`. Any property not declared in a DTO is stripped silently before reaching the service layer, preventing unexpected data injection.

**BR-142 [PHASE 1]**  
Numeric range fields (e.g., `order`, `page`, `limit`) must have explicit `@Min()` and `@Max()` decorators. Negative values and values above defined maximums are rejected.

**BR-143 [PHASE 1]**  
Boolean query parameters sent as URL strings (`"true"`, `"false"`) must be explicitly transformed to native booleans via `@Transform()` before reaching service logic.

**BR-144 [PHASE 1]**  
ObjectId strings received from API consumers must be validated as valid MongoDB ObjectIds before any database query is executed. Invalid ObjectIds return `400 Bad Request`, not `404 Not Found`.

### **Business Rule Validation**

**BR-145 [PHASE 1]**  
Uniqueness checks are the responsibility of the service layer. The service validates uniqueness before attempting a write. The database unique index is the final safety net, not the primary validation mechanism.

**BR-146 [PHASE 1]**  
Validation error responses must identify which field(s) failed and why. Opaque error messages such as `"Validation failed"` without field detail are not acceptable.

---

## 15. Naming Rules

### **Category and Subcategory Names**

**BR-150 [PHASE 1]**  
Names are stored as provided by the user, preserving original casing (e.g., `"AI & Machine Learning"` is stored as-is).

**BR-151 [PHASE 1]**  
Name uniqueness comparison is always case-insensitive. The system compares using a case-insensitive regular expression: `/^name$/i`.

**BR-152 [PHASE 1]**  
Names may contain letters, numbers, spaces, hyphens, ampersands, and common punctuation. No maximum character class restriction beyond the length limit.

### **Slug Rules**

**BR-153 [PHASE 1]**  
Slugs are always lowercase, alphanumeric, with hyphens as the only separator. Pattern: `/^[a-z0-9-]+$/`.

**BR-154 [PHASE 1]**  
Slug generation algorithm (applied in order):
1. Convert to lowercase
2. Trim leading/trailing whitespace
3. Decompose and remove diacritical marks (`é → e`, `ñ → n`)
4. Remove all characters that are not word characters, spaces, or hyphens
5. Replace one or more whitespace characters with a single hyphen
6. Collapse multiple consecutive hyphens to one
7. Strip leading and trailing hyphens
8. Truncate to 200 characters maximum

**BR-155 [PHASE 1]**  
Slugs, once published or exposed via a public URL, should be treated as stable identifiers. Avoid auto-regenerating slugs on name updates unless the user explicitly provides a new slug or the slug was never published. At minimum, the service logs a warning when a slug would change on an existing published entity.

**BR-156 [PHASE 1]**  
A manually supplied slug overrides auto-generation. If the consumer provides a slug, it is used as-is after format validation (`/^[a-z0-9-]+$/`). It is not re-generated from the name.

---

## 16. Duplicate Prevention Rules

**BR-160 [PHASE 1]**  
Category name uniqueness scope: **global** (across all non-deleted categories in the `categories` collection).

**BR-161 [PHASE 1]**  
Category slug uniqueness scope: **global** (across all non-deleted categories in the `categories` collection).

**BR-162 [FUTURE — Subcategory]**  
Subcategory name uniqueness scope: **within parent category** (duplicate names are allowed across different categories).

**BR-163 [FUTURE — Subcategory]**  
Subcategory slug uniqueness scope: **within parent category** (same slug is allowed in different categories).

**BR-164 [PHASE 1]**  
Soft-deleted records are excluded from uniqueness checks. A name or slug held by a deleted record may be reused by a new record.

**BR-165 [PHASE 1]**  
Uniqueness for updates excludes the current document. Updating a category to the same name it already has must not produce a conflict error.

**BR-166 [PHASE 1]**  
Conflict errors (HTTP `409`) must identify the conflicting field and value in the error message:  
`"Category with name \"Technology\" already exists"`.

---

## 17. Status Lifecycle

### **Category Status Flow**

```
           [Create]
               │
               ▼
           isActive: true
           isDeleted: false
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
  [Deactivate]    [Soft Delete]
  isActive: false  isDeleted: true
       │           deletedAt: <now>
       │           deletedBy: <userId>
       │               │
       ▼               ▼
  [Reactivate]    [Restore]
  isActive: true  isDeleted: false
                  deletedAt: null
                  deletedBy: null
```

**BR-170 [PHASE 1]**  
A category has two independent boolean state axes: `isActive` (visibility) and `isDeleted` (existence). They are independent — a category can be inactive but not deleted, or deleted but previously inactive.

**BR-171 [PHASE 1]**  
`isDeleted = true` is the terminal suppression state. A deleted category behaves as non-existent for all API consumers. Only explicit `restore` transitions it back.

**BR-172 [PHASE 1]**  
Valid `isActive` transitions:
- `true → false`: ADMIN or EDITOR can deactivate
- `false → true`: ADMIN or EDITOR can reactivate
- No approval or workflow is required for activation changes in Phase 1

### **User Status Flow**

**BR-173 [PHASE 1]**  
User `isActive` controls login eligibility. An `isActive = false` user cannot obtain new tokens.

**BR-174 [PHASE 1]**  
User `isDeleted = true` permanently suppresses the account. Deleted users cannot be listed, authenticated, or targeted by API operations. Restoration is an ADMIN-only action with no automated trigger.

### **Future Entity Status (Defined for Consistency)**

**BR-175 [FUTURE — Books]**  
Planned book status lifecycle:

```
DRAFT → PENDING_APPROVAL → APPROVED → PUBLISHED
                ↓
            REJECTED → DRAFT
```

Each transition has defined actor permissions and audit requirements. No implementation is permitted in Phase 1.

---

## 18. Future Phase Rules

> These rules define intent for future phases. They must be referenced when building new modules to ensure Phase 1 decisions do not create blockers.

**BR-180 [FUTURE]**  
Phase 2 introduces the Book module, which references Category and (optionally) Subcategory. The category and subcategory schemas defined in Phase 1 are the contracts Phase 2 depends upon — do not change their field names or key index structures without impact analysis.

**BR-181 [FUTURE]**  
Phase 2 introduces BullMQ job processors for book generation. The queue infrastructure (queue module, Redis connection) is already provisioned in Phase 1. No queue implementation is permitted in Phase 1 beyond infrastructure setup.

**BR-182 [FUTURE]**  
Phase 2 introduces the S3 storage client for file exports. The storage module is already provisioned in Phase 1. No file upload/download logic is permitted in Phase 1.

**BR-183 [FUTURE]**  
Phase 3 introduces AI provider integration. The configuration module must support provider selection as an environment variable. No AI SDK may be added as a dependency in Phase 1.

**BR-184 [FUTURE]**  
Phase 3 introduces email notifications (outline approval, export completion). An email provider module will be added. No email library may be added as a dependency in Phase 1.

**BR-185 [FUTURE]**  
Full-text search beyond MongoDB text indexes (Elasticsearch, Atlas Search) is Phase 3+. Do not introduce external search dependencies in Phase 1 or 2 without explicit architectural approval.

---

## 19. Out of Scope

The following are explicitly out of scope for Phase 1. Any pull request, code generation, or architectural decision that introduces these must be rejected and re-scoped:

**BR-190 [CONSTRAINT]** — No SaaS features: no tenants, no organisations, no workspaces, no teams.

**BR-191 [CONSTRAINT]** — No billing, pricing, plans, or subscription tiers.

**BR-192 [CONSTRAINT]** — No file upload endpoints. The S3 client exists as infrastructure only.

**BR-193 [CONSTRAINT]** — No email sending. No email provider SDK, no SMTP configuration.

**BR-194 [CONSTRAINT]** — No AI SDK integration. No calls to OpenAI, Anthropic, or any AI provider.

**BR-195 [CONSTRAINT]** — No BullMQ job processors. Queues are provisioned but empty.

**BR-196 [CONSTRAINT]** — No WebSocket or real-time features.

**BR-197 [CONSTRAINT]** — No GraphQL API. REST only.

**BR-198 [CONSTRAINT]** — No internationalisation (i18n). All content and error messages are English only.

**BR-199 [CONSTRAINT]** — No analytics, metrics dashboards, or reporting endpoints.

**BR-200 [CONSTRAINT]** — No rate limiting or API throttling (planned for Phase 2+).

**BR-201 [CONSTRAINT]** — No user-facing profile management endpoints. Users can authenticate; they cannot update their own profile in Phase 1.

**BR-202 [CONSTRAINT]** — No social login, OAuth, or third-party identity providers.

---

## 20. Business Constraints

> Hard limits that apply across the entire platform regardless of phase.

**BR-210 [CONSTRAINT]**  
All data is multi-user but single-tenant. There is no data isolation between users at the database level in Phase 1. Role-based access control is the only access boundary.

**BR-211 [CONSTRAINT]**  
All timestamps are stored and returned in UTC. Timezone conversion is the responsibility of the API consumer.

**BR-212 [CONSTRAINT]**  
Soft delete is the universal delete mechanism. Hard deletes require a dedicated, audited data retention operation that does not exist in Phase 1.

**BR-213 [CONSTRAINT]**  
Every write operation (create, update, delete) that succeeds must produce an audit record — minimally through the `createdBy`, `updatedBy`, and `deletedBy` fields on the entity itself.

**BR-214 [CONSTRAINT]**  
API pagination is mandatory on all list endpoints. No list endpoint may return more than 100 records in a single response. The hard cap is enforced in the query DTO: `@Max(100)`.

**BR-215 [CONSTRAINT]**  
No credentials, secrets, or API keys may be stored in the database. The only credential stored in the database is the bcrypt-hashed user password.

**BR-216 [CONSTRAINT]**  
All API routes are prefixed with `/api/v1`. No unversioned routes are permitted.

**BR-217 [CONSTRAINT]**  
Authentication is required for every endpoint in the system. There are no public endpoints in Phase 1 (the health endpoint `/api/v1/health` is the only exception).

**BR-218 [CONSTRAINT]**  
The system does not store JWTs. Access tokens are stateless. Refresh tokens are stored as a bcrypt-hashed value in the `users` collection with `select: false` to prevent accidental exposure.

**BR-219 [CONSTRAINT]**  
Every new feature module introduced after Phase 1 must pass the Definition of Done checklist defined in `PROJECT_CONTEXT.md` before being considered complete.

**BR-220 [CONSTRAINT]**  
`CODING_STANDARDS.md`, `DATABASE_RULES.md`, and this document (`BUSINESS_RULES.md`) are the three governing documents for all implementation decisions. Conflicts between these documents and implementation requests must be raised before coding begins.

---

## Quick Reference — Phase 1 Rules Summary

| Domain | Key Rules |
|--------|-----------|
| Roles | 3 roles only: ADMIN, EDITOR, VIEWER |
| Category naming | Globally unique name (case-insensitive), unique slug |
| Category deletion | Soft delete only, ADMIN only |
| Category restore | ADMIN only |
| Slug format | `/^[a-z0-9-]+$/`, max 200 chars, auto-generated from name |
| Pagination | Mandatory on all lists, hard cap of 100 per page |
| Timestamps | UTC only, auto-generated via Mongoose `timestamps: true` |
| Audit | Every write records acting user ID |
| Authentication | JWT required for all endpoints except `/health` |
| Hard delete | Never |
| AI features | Never in Phase 1 |
| File uploads | Never in Phase 1 |
| Email | Never in Phase 1 |
| Billing | Never — not in any current phase |

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-12  
**Applies To**: Phase 1 of the AI Publishing Company platform  
**Governing Documents**: `ARCHITECTURE.md`, `PROJECT_CONTEXT.md`, `CODING_STANDARDS.md`, `DATABASE_RULES.md`
