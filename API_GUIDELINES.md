# API GUIDELINES

> **REST API Design Standards — AI Publishing Company**  
> Permanent API standard for all backend modules.  
> Used by developers, code reviewers, and AI coding assistants.

---

## How to Read This Document

- All standards in this document are **mandatory** unless explicitly marked **[RECOMMENDED]**.
- `[CONSTRAINT]` marks rules that cannot be overridden without architectural review.
- Examples are drawn from the live codebase (`category` module) and represent the reference implementation.
- When a rule conflicts with a request, raise the conflict before writing code.

---

## 1. API Design Philosophy

### **Guiding Principles**

**Predictability over cleverness.**  
Every developer and AI tool that reads a response should be able to predict the shape of the next one. Consistency eliminates decision fatigue and integration bugs.

**Explicit over implicit.**  
Status codes, error payloads, and field names must communicate intent without requiring the consumer to read source code or documentation.

**Design the consumer's experience first.**  
Ask: *What does the API client need to render this UI or process this data?* Shape the response around that answer, not around what is convenient for the database.

**Fail loudly, fail early.**  
Bad input is rejected at the HTTP boundary with precise, actionable error messages. Ambiguous inputs never reach the service layer.

**Every API is a public contract.**  
Once an endpoint is deployed and consumed, its shape is a commitment. Additive changes are safe; breaking changes require versioning and deprecation.

### **Non-Negotiables**

- All endpoints are RESTful
- All request bodies are JSON
- All responses are JSON
- All communication is HTTPS in production
- All routes are authenticated (except `/health`)
- All routes carry a version prefix
- All responses — success and error — have a consistent, documented shape

---

## 2. REST API Standards

### **Resource-Oriented Design**

APIs are modelled around resources (nouns), not actions (verbs). The HTTP method expresses the action.

```
✅ POST   /api/v1/categories          Create a category
✅ GET    /api/v1/categories          List categories
✅ GET    /api/v1/categories/:id      Get one category
✅ PUT    /api/v1/categories/:id      Replace/update a category
✅ DELETE /api/v1/categories/:id      Delete a category

❌ POST   /api/v1/createCategory
❌ GET    /api/v1/getCategories
❌ POST   /api/v1/categories/delete
```

### **Stateless Requests**

Every request must be self-contained. The server holds no client session state. Authentication context is carried in the `Authorization` header on every request.

### **Uniform Interface**

All modules follow the same URL patterns, HTTP methods, status codes, and response shapes. A developer who learns the `categories` API can immediately use the `users` or `articles` API.

---

## 3. API Naming Conventions

### **URL Segments**

| Type | Convention | Example |
|------|-----------|---------|
| Resource collections | `kebab-case`, plural noun | `/categories`, `/audit-logs` |
| Resource identifiers | `:id` | `/categories/:id` |
| Sub-resources | Nested after parent | `/categories/:id/subcategories` |
| Named actions | Verb phrase after resource | `/categories/:id/restore` |
| Query parameters | `camelCase` | `?sortBy=name&isActive=true` |

### **Naming Rules**

- Resource names are always **plural**: `/categories`, not `/category`
- Use **kebab-case** for multi-word resource names: `/audit-logs`, not `/auditLogs`
- Query parameter names are **camelCase**: `?sortBy`, `?isActive`, `?searchTerm`
- Never use underscores in URL paths
- Never expose internal identifiers (`_id`, `__v`) in URLs

```
✅ GET /api/v1/audit-logs
✅ GET /api/v1/categories?sortBy=name&isActive=true
✅ POST /api/v1/categories/:id/restore

❌ GET /api/v1/AuditLogs
❌ GET /api/v1/audit_logs
❌ GET /api/v1/categories?sort_by=name
```

---

## 4. URI Design Rules

### **Global Prefix**

All routes are prefixed with `/api/v1`. This is configured once in `main.ts`:

```typescript
app.setGlobalPrefix('api/v1');
```

No controller may define a route outside this prefix.

### **Controller Path**

Controller paths use the **plural resource name** with no leading slash:

```typescript
@Controller('categories')     // ✅ Results in /api/v1/categories
@Controller('audit-logs')     // ✅ Results in /api/v1/audit-logs

@Controller('/categories')    // ❌ Leading slash is redundant
@Controller('Category')       // ❌ PascalCase
@Controller('category')       // ❌ Singular
```

### **Route Parameters**

Use `:id` as the identifier parameter name by default. Use descriptive names only for sub-resource lookups:

```typescript
@Get(':id')                       // ✅ Standard resource lookup
@Get('slug/:slug')                // ✅ Lookup by slug
@Post(':id/restore')              // ✅ Named action on resource
@Get(':categoryId/subcategories') // ✅ Sub-resource with typed param
```

### **Nesting Depth**

Limit URI nesting to **two levels** maximum:

```
✅ /api/v1/categories/:id/subcategories
❌ /api/v1/categories/:id/subcategories/:subId/topics/:topicId
```

If nesting would exceed two levels, flatten the hierarchy and use query parameters for filtering.

### **Trailing Slashes**

Never use trailing slashes. `/api/v1/categories/` and `/api/v1/categories` are not the same resource.

---

## 5. HTTP Method Guidelines

### **Method Semantics**

| Method | Semantics | Body | Idempotent | Safe |
|--------|-----------|------|------------|------|
| `GET` | Read resource(s) | None | Yes | Yes |
| `POST` | Create resource or trigger action | Required | No | No |
| `PUT` | Full or partial update | Required | Yes | No |
| `DELETE` | Remove resource | None | Yes | No |
| `PATCH` | Partial update (not used here) | Required | No | No |

### **Project Convention**

This project uses `PUT` for both full and partial updates. `PATCH` is not used. Update DTOs extend `PartialType(CreateDto)` which makes all fields optional, giving PUT PATCH-like semantics without the ambiguity.

```typescript
// ✅ Update convention — PUT with partial payload
@Put(':id')
async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {}
```

### **Action Endpoints**

Non-CRUD operations use `POST` with a descriptive path suffix:

```typescript
@Post(':id/restore')     // ✅ Restore a soft-deleted resource
@Post(':id/publish')     // ✅ Trigger a state transition
@Post(':id/archive')     // ✅ Move to archived state
@Post('bulk/delete')     // ✅ Bulk operation
```

### **Never Use GET for State-Changing Operations**

```
❌ GET /api/v1/categories/:id/delete
❌ GET /api/v1/categories/:id/activate
```

GET requests must be side-effect free and safe to retry, cache, and bookmark.

---

## 6. HTTP Status Code Standards

### **Success Codes**

| Code | Name | When to Use |
|------|------|-------------|
| `200` | OK | Successful GET, PUT, POST (non-creation) |
| `201` | Created | Successful POST that creates a new resource |
| `204` | No Content | Successful DELETE or action with no response body |

```typescript
// ✅ Correct status codes
@Post()                                  // → 201 Created (default for @Post)
@Get()                                   // → 200 OK (default for @Get)
@Put(':id')                              // → 200 OK (default for @Put)
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)         // → 204 No Content (must be explicit)
async remove(): Promise<void> {}
```

### **Client Error Codes**

| Code | Name | When to Use |
|------|------|-------------|
| `400` | Bad Request | Validation failure, malformed request, invalid ObjectId |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | Valid token but insufficient role/permissions |
| `404` | Not Found | Resource does not exist or is soft-deleted |
| `409` | Conflict | Duplicate unique field (name, slug, email) |
| `422` | Unprocessable Entity | Business rule violation (distinct from 400 validation) |

### **Server Error Codes**

| Code | Name | When to Use |
|------|------|-------------|
| `500` | Internal Server Error | Unhandled exception, unexpected failure |
| `503` | Service Unavailable | Dependency down (database, cache) |

### **Rules**

- Never return `200` for an error condition
- Never return `500` for a client mistake
- `404` does NOT reveal whether a soft-deleted record exists
- `401` means "please authenticate"; `403` means "you are authenticated but not permitted"
- The global exception filter handles all mappings automatically via NestJS exceptions

---

## 7. Standard Success Response Format

### **Single Resource Response**

Return the resource object directly — no wrapper envelope for single resources:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Technology",
  "slug": "technology",
  "description": "All technology-related content",
  "icon": "tech-icon",
  "color": "#3B82F6",
  "order": 0,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### **Collection Response (Paginated)**

All list responses use the `data` + `meta` envelope:

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Technology",
      "slug": "technology",
      "isActive": true,
      "order": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### **Rules**

- `id` is always a string (transformed from MongoDB `_id`)
- Timestamps are always ISO 8601 UTC strings: `"2024-01-01T00:00:00.000Z"`
- `null` is a valid value for optional nullable fields; do not omit them
- Internal fields (`isDeleted`, `deletedAt`, `deletedBy`, `__v`) are **never** included
- Audit actor IDs (`createdBy`, `updatedBy`) are **not** included in standard responses unless the endpoint explicitly provides them

---

## 8. Standard Error Response Format

All errors — regardless of type — are shaped by the global exception filter and follow this exact structure:

```json
{
  "statusCode": 404,
  "errorCode": "VALIDATION_ERROR",
  "message": "Category with ID \"507f1f77bcf86cd799439011\" not found",
  "path": "/api/v1/categories/507f1f77bcf86cd799439011",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "correlationId": "a3f1c2d4-1234-5678-abcd-ef1234567890"
}
```

### **Field Definitions**

| Field | Type | Description |
|-------|------|-------------|
| `statusCode` | `number` | HTTP status code (mirrors the HTTP response code) |
| `errorCode` | `string` | Machine-readable error category from `ERROR_CODES` enum |
| `message` | `string` | Human-readable description of the error |
| `path` | `string` | The request URL that produced the error |
| `timestamp` | `string` | ISO 8601 UTC timestamp of when the error occurred |
| `correlationId` | `string` | UUID for tracing this request across logs |

### **`errorCode` Values**

Defined in `packages/shared/src/errors/error-codes.ts`:

| Code | When Applied |
|------|-------------|
| `VALIDATION_ERROR` | All `HttpException` subclasses (400, 404, 409, etc.) |
| `INTERNAL_ERROR` | Unhandled exceptions, 500 responses |
| `UNAUTHORIZED` | 401 authentication failures |
| `FORBIDDEN` | 403 authorisation failures |

### **Rules**

- Never return a different error shape, even for custom scenarios
- The `message` field must be human-readable and actionable: `"Category with name \"Technology\" already exists"`, not `"Duplicate"`
- Never expose stack traces in any environment in the `message` field
- `correlationId` matches the `X-Correlation-ID` response header for log correlation

---

## 9. Validation Error Response Format

NestJS class-validator failures produce a `400 Bad Request`. The global exception filter wraps the class-validator detail:

```json
{
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "name must be longer than or equal to 2 characters, name should not be empty",
  "path": "/api/v1/categories",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "correlationId": "a3f1c2d4-1234-5678-abcd-ef1234567890"
}
```

### **Rules**

- Validation errors always return `400 Bad Request`
- The `message` field includes all failing constraints, comma-separated
- Validators must include custom messages: `@IsString({ message: 'Name must be a string' })`
- `forbidNonWhitelisted: true` ensures extra properties return 400 rather than silently passing
- The `whitelist: true` option strips unknown properties before they reach the service

---

## 10. Pagination Standards

### **Query Parameters**

All paginated list endpoints accept these standard parameters:

| Parameter | Type | Default | Constraint | Description |
|-----------|------|---------|------------|-------------|
| `page` | `integer` | `1` | `min: 1` | Page number (1-based) |
| `limit` | `integer` | `10` | `min: 1, max: 100` | Records per page |

### **DTO Implementation**

```typescript
@ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1, example: 1 })
@Type(() => Number)
@IsInt()
@Min(1)
@IsOptional()
page?: number;

@ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10, example: 10 })
@Type(() => Number)
@IsInt()
@Min(1)
@Max(100)
@IsOptional()
limit?: number;
```

### **Response Meta Object**

```typescript
meta: {
  total: number;      // Total records matching the filter
  page: number;       // Current page
  limit: number;      // Records per page
  totalPages: number; // Math.ceil(total / limit)
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

### **Implementation**

```typescript
const page  = query.page  ?? 1;
const limit = query.limit ?? 10;
const skip  = (page - 1) * limit;

const [data, total] = await Promise.all([
  this.model.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
  this.model.countDocuments(filter).exec(),
]);

const totalPages = Math.ceil(total / limit);

return {
  data,
  meta: {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  },
};
```

### **Rules**

- Every list endpoint **must** be paginated — no unbounded queries
- The hard cap is `limit: 100` — enforce with `@Max(100)` in the DTO
- `page` is 1-based, not 0-based
- `total` reflects records matching the current filter, not the entire collection count
- `@Type(() => Number)` is required to coerce URL query string values to numbers

---

## 11. Sorting Standards

### **Query Parameters**

| Parameter | Type | Default | Allowed Values | Description |
|-----------|------|---------|----------------|-------------|
| `sortBy` | `string` | module-defined | Whitelist per module | Field to sort by |
| `sortOrder` | `string` | `'asc'` | `'asc'`, `'desc'` | Sort direction |

### **DTO Implementation**

```typescript
@ApiPropertyOptional({
  description: 'Field to sort by',
  enum: ['name', 'order', 'createdAt', 'updatedAt'],
  default: 'order',
})
@IsString()
@IsOptional()
@IsIn(['name', 'order', 'createdAt', 'updatedAt'])
sortBy?: string;

@ApiPropertyOptional({
  description: 'Sort direction',
  enum: ['asc', 'desc'],
  default: 'asc',
})
@IsString()
@IsOptional()
@IsIn(['asc', 'desc'])
sortOrder?: 'asc' | 'desc';
```

### **Rules**

- The `sortBy` whitelist must only contain **indexed fields**. Sorting on non-indexed fields forces a collection scan.
- Declare the allowed sort fields using `@IsIn([...])` — never allow arbitrary field names
- Default sort field and direction are set per module in the service layer
- Multi-field sorting is not exposed to consumers in Phase 1; use a fixed secondary sort (e.g., always `_id` as tiebreaker) internally

---

## 12. Filtering Standards

### **Filter Parameters**

Filters are passed as individual named query parameters — never as a nested object:

```
✅ GET /api/v1/categories?isActive=true&search=technology
❌ GET /api/v1/categories?filter[isActive]=true
❌ GET /api/v1/categories?filter={"isActive":true}
```

### **Boolean Filter Coercion**

URL query strings are always strings. Booleans must be explicitly transformed:

```typescript
@Transform(({ value }) => {
  if (value === 'true'  || value === true)  return true;
  if (value === 'false' || value === false) return false;
  return undefined;
})
@IsBoolean()
@IsOptional()
isActive?: boolean;
```

### **Date Range Filters**

```typescript
@ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
@IsDateString()
@IsOptional()
createdAfter?: string;

@ApiPropertyOptional({ example: '2024-12-31T23:59:59.999Z' })
@IsDateString()
@IsOptional()
createdBefore?: string;
```

### **Enum Filters**

```typescript
@ApiPropertyOptional({ enum: ContentStatus })
@IsEnum(ContentStatus)
@IsOptional()
status?: ContentStatus;
```

### **Rules**

- All filter parameters are optional
- Filters compose with AND logic by default (multiple filters narrow the result set)
- Filters only apply to the query scope — soft-deleted records are always excluded regardless of filters
- Never expose internal filter flags (`isDeleted`, `__v`) as API parameters

---

## 13. Search Standards

### **Query Parameter**

```
GET /api/v1/categories?search=technology
```

A single `search` string parameter that performs full-text search across pre-defined fields.

### **DTO**

```typescript
@ApiPropertyOptional({
  description: 'Full-text search across name and description',
  example: 'technology',
})
@IsString()
@IsOptional()
search?: string;
```

### **Implementation**

Full-text search uses MongoDB's text index. The fields searched are defined by the schema's text index, not by the API consumer:

```typescript
// Schema
EntitySchema.index({ name: 'text', description: 'text' });

// Repository
const filter: FilterQuery<Entity> = {};
if (query.search) {
  filter.$text = { $search: query.search };
}
```

### **Rules**

- The `search` parameter name is **standardised** — do not rename it per module
- Search is additive with other filters (it narrows the filtered result set)
- Text search requires a MongoDB text index — the index is mandatory if search is exposed
- Minimum search term length: `1` character (enforced by `@MinLength(1)` if required)
- Never implement search with unanchored regex (`/term/i`) on large collections — use text indexes

---

## 14. Bulk Operation Standards

### **Bulk Endpoints**

Bulk operations are distinct endpoints, not overloaded single-resource endpoints:

```
POST   /api/v1/categories/bulk          Bulk create
PUT    /api/v1/categories/bulk          Bulk update
DELETE /api/v1/categories/bulk          Bulk soft delete
```

### **Bulk Request Shape**

```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "data": { "isActive": false }
}
```

### **Bulk Response Shape**

```json
{
  "succeeded": ["507f1f77bcf86cd799439011"],
  "failed": [
    {
      "id": "507f1f77bcf86cd799439012",
      "reason": "Not found"
    }
  ],
  "meta": {
    "total": 2,
    "successCount": 1,
    "failureCount": 1
  }
}
```

### **Rules**

- Bulk operations that exceed **500 items** must be rejected with `400 Bad Request`
- Bulk operations affecting > 10k records must be offloaded to a BullMQ job; the endpoint returns `202 Accepted` with a job ID
- Partial success is the expected behaviour — bulk operations do not use transactions by default
- Each item's failure reason must be reported independently
- All bulk write operations require ADMIN role unless otherwise specified

---

## 15. File Upload API Guidelines

> The S3 infrastructure exists but file upload endpoints are not implemented in Phase 1. These guidelines define the standard for when they are built.

### **Multipart Form Uploads**

```
POST /api/v1/media/upload
Content-Type: multipart/form-data
```

### **Response**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "filename": "cover.jpg",
  "mimeType": "image/jpeg",
  "size": 204800,
  "url": "https://cdn.example.com/media/cover.jpg",
  "uploadedAt": "2024-01-01T00:00:00.000Z"
}
```

### **Rules**

- File upload endpoints are always separate from resource creation; files are uploaded first, then referenced by ID
- Maximum file size must be validated at the HTTP layer before reaching the service
- Accepted MIME types must be whitelisted — never accept arbitrary content types
- Files are stored in S3; the API never streams files from the database
- Signed URLs (time-limited) are used for download; never expose direct S3 bucket URLs
- File processing (resizing, conversion) is asynchronous — dispatched as BullMQ jobs

---

## 16. Authentication & Authorization Guidelines

### **Authentication**

Every endpoint requires a valid JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

The `JwtAuthGuard` is applied at the controller level:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SomeController {}
```

### **Authorization — Role-Based Access Control**

Roles are enforced with the `@Roles()` decorator + `RolesGuard`:

```typescript
@Post()
@Roles(UserRole.ADMIN, UserRole.EDITOR)
async create(@CurrentUser() user: User) {}

@Delete(':id')
@Roles(UserRole.ADMIN)
async remove(@CurrentUser() user: User) {}
```

### **Extracting the Current User**

Always use the `@CurrentUser()` decorator — never access `req.user` directly:

```typescript
async create(
  @Body() dto: CreateEntityDto,
  @CurrentUser() user: User,
): Promise<EntityResponseDto> {
  return this.service.create(dto, user.id);
}
```

### **Role Access Matrix Convention**

Document the role matrix for every controller in its Swagger description or module README:

| Operation | ADMIN | EDITOR | VIEWER |
|-----------|-------|--------|--------|
| Create | ✅ | ✅ | ❌ |
| Read | ✅ | ✅ | ✅ |
| Update | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| Restore | ✅ | ❌ | ❌ |

### **Rules**

- `JwtAuthGuard` and `RolesGuard` are applied **together** at the controller class level
- `@Roles()` is applied at the method level for operation-specific access
- No endpoint skips authentication except `GET /api/v1/health`
- The user object from the JWT payload must never be trusted for sensitive operations without re-validating against the database (the guard handles this)
- User ID from `user.id` is always a string; cast to `Types.ObjectId` in the repository layer, not in the controller

---

## 17. Versioning Strategy

### **Current Version**

`v1` — Applied as global prefix in `main.ts`:

```typescript
app.setGlobalPrefix('api/v1');
```

All current routes are under `/api/v1/`.

### **Version Increment Policy**

| Change Type | Action Required |
|-------------|----------------|
| Add optional field to response | None (backward-compatible) |
| Add new endpoint | None (additive) |
| Add optional query parameter | None (additive) |
| Remove field from response | New version required |
| Change field name or type | New version required |
| Change HTTP method or status code | New version required |
| Remove endpoint | Deprecation then removal |

### **Introducing v2**

When a breaking change is necessary:

1. Create a parallel `v2` controller for the affected resource
2. Keep `v1` operating in **read-only / deprecated** mode
3. Announce deprecation via `Deprecation` and `Sunset` response headers
4. Remove `v1` after the sunset date (minimum 6 months after announcement)

```typescript
// v2 controller
@ApiTags('categories-v2')
@Controller({ path: 'categories', version: '2' })
```

### **[CONSTRAINT]**

The global prefix `api/v1` must not be changed. New versions are introduced as parallel routes, never by modifying the existing prefix.

---

## 18. Request Validation Rules

### **Global ValidationPipe**

Configured once in `main.ts` and applies globally:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,              // Auto-instantiate DTOs and coerce types
    whitelist: true,              // Strip unknown properties silently
    forbidNonWhitelisted: true,   // Reject requests with unknown properties
  }),
);
```

### **Controller Responsibilities**

- Declare `@Body()`, `@Query()`, and `@Param()` with typed DTOs
- Never accept raw `any` or `object` from request bindings
- `@Body() dto: CreateEntityDto` — the pipe validates automatically

### **Coercion Rules**

| Input Type | Coercion Required | Tool |
|-----------|-------------------|------|
| Numeric query param | `@Type(() => Number)` | class-transformer |
| Boolean query param | `@Transform(...)` | class-transformer |
| Date query param | `@IsDateString()` | class-validator |
| Enum query param | `@IsEnum(MyEnum)` | class-validator |

### **ObjectId Validation**

```typescript
// In repository — validate before query
if (!Types.ObjectId.isValid(id)) return null;

// In service — throw structured error
const entity = await this.repository.findById(id);
if (!entity) throw new NotFoundException(`Entity with ID "${id}" not found`);
```

Never throw `CastError` from Mongoose — it exposes internal implementation details.

### **Rules**

- Never use `@Body() body: any` — always use typed DTOs
- Never pass `req.body` directly to a service method
- Class-validator decorators are required on every DTO property
- `@IsOptional()` must be stacked **after** the type decorator (`@IsString()`) and **before** length/format decorators
- Custom error messages are required on all validators where the default message is ambiguous

---

## 19. DTO Usage Guidelines

### **DTO Taxonomy**

Every module defines exactly these four DTO types:

| DTO | File | Purpose |
|-----|------|---------|
| `CreateEntityDto` | `create-entity.dto.ts` | POST request body |
| `UpdateEntityDto` | `update-entity.dto.ts` | PUT request body |
| `QueryEntityDto` | `query-entity.dto.ts` | GET query parameters |
| `EntityResponseDto` | `entity-response.dto.ts` | Response shape |

### **Create DTO**

```typescript
export class CreateEntityDto {
  @ApiProperty({ description: 'Entity name', example: 'Technology', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Description', maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
```

### **Update DTO**

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateEntityDto } from './create-entity.dto';

export class UpdateEntityDto extends PartialType(CreateEntityDto) {}
```

Always extend `PartialType(CreateEntityDto)` — never redefine the same validators.

### **Query DTO**

```typescript
export class QueryEntityDto {
  @ApiPropertyOptional({ description: 'Search term', example: 'technology' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ['name', 'createdAt'], default: 'createdAt' })
  @IsIn(['name', 'createdAt'])
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
```

### **Rules**

- Use `@ApiProperty()` for required fields, `@ApiPropertyOptional()` for optional
- Always provide `description` and `example` in every Swagger decorator
- Barrel-export all DTOs from `dto/index.ts`
- Do not share DTOs between modules — each module owns its own DTO types

---

## 20. Response DTO Guidelines

### **Pattern**

Use `@Exclude()` at class level with `@Expose()` per field to whitelist the response shape:

```typescript
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class EntityResponseDto {
  @ApiProperty({ description: 'Entity ID', example: '507f1f77bcf86cd799439011' })
  @Expose({ name: '_id' })
  @Type(() => String)
  id: string;

  @ApiProperty({ description: 'Entity name', example: 'Technology' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt: Date;
}
```

### **Service Transformation**

Response DTOs are populated manually in the service layer via a private `toResponseDto()` method. Do **not** rely on `class-transformer`'s `plainToInstance` automatically:

```typescript
private toResponseDto(entity: Entity): EntityResponseDto {
  return {
    id: entity._id.toString(),
    name: entity.name,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
```

### **Rules**

- `_id` is always transformed to `id` (string)
- `__v`, `isDeleted`, `deletedAt`, `deletedBy` are **never** included
- `password`, `refreshToken`, or any credential field is **never** included
- Timestamps are returned as `Date` objects; JSON serialisation converts them to ISO 8601 strings automatically
- All fields in the response DTO must have `@ApiProperty` or `@ApiPropertyOptional` decorators

---

## 21. Error Handling Strategy

### **Throw NestJS Built-In Exceptions**

```typescript
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

throw new NotFoundException(`Entity with ID "${id}" not found`);
throw new ConflictException(`Entity with name "${name}" already exists`);
throw new BadRequestException('Invalid input: order must be non-negative');
```

### **Do Not Catch What You Cannot Handle**

```typescript
// ✅ Good — let errors propagate to the global filter
async findOne(id: string): Promise<EntityResponseDto> {
  const entity = await this.repository.findById(id);
  if (!entity) throw new NotFoundException(`Entity with ID "${id}" not found`);
  return this.toResponseDto(entity);
}

// ❌ Bad — pointless re-throw
async findOne(id: string): Promise<EntityResponseDto> {
  try {
    // ...
  } catch (error) {
    throw error; // Adds nothing
  }
}
```

### **Catch Only for Recovery**

Only catch exceptions when you intend to handle them (e.g., convert a Mongoose duplicate key error):

```typescript
// ✅ Catch to convert Mongoose error to business exception
try {
  await entity.save();
} catch (error: any) {
  if (error.code === 11000) {
    throw new ConflictException(`Duplicate value for field: ${Object.keys(error.keyPattern)[0]}`);
  }
  throw error; // Re-throw all others
}
```

### **Error Message Format**

- Include the entity name and the identifier or value that caused the error
- Use double quotes around variable values: `"Technology"`
- Be specific: `"Category with slug \"tech\" already exists"`, not `"Conflict"`
- Do not expose implementation details (SQL, Mongoose internals, file paths)

---

## 22. Logging & Audit Requirements

### **Correlation ID**

Every request receives a `correlationId` — a UUID generated by `CorrelationIdMiddleware`. Consumers can supply their own via the `X-Correlation-ID` request header:

```
X-Correlation-ID: a3f1c2d4-1234-5678-abcd-ef1234567890
```

The server echoes this ID in the `X-Correlation-ID` response header and includes it in every log entry and error response.

### **What Must Be Logged**

| Event | Level | Required Fields |
|-------|-------|----------------|
| Unhandled exception | `error` | `correlationId`, `method`, `url`, `statusCode`, `error`, `stack` |
| Successful write operation | `log` | `correlationId`, `entityId`, `action`, `userId` |
| Authentication failure | `warn` | `correlationId`, `email`, `reason` |
| Slow query (> 500ms) | `warn` | `correlationId`, `query`, `duration` |

### **What Must Never Be Logged**

- Passwords (plaintext or hashed)
- JWT tokens or refresh tokens
- API keys or secrets
- Full request bodies containing credentials

### **Audit Trail**

Every write operation (create, update, soft delete, restore) persists the acting user's ID in the entity's audit fields. This is the primary audit mechanism. No separate audit log table is required in Phase 1.

---

## 23. Performance Best Practices

### **Database**

- Always use `.lean()` for read queries — returns plain objects, not Mongoose documents
- Always use `.exec()` for explicit promise resolution
- Use `Promise.all()` for independent parallel queries (data fetch + count)
- Use `.select()` to project only required fields — never fetch the entire document when a subset is needed
- All query filter fields must be indexed

### **Pagination**

- Never allow an unbounded query to the database — every find has `.limit()`
- For large collections (> 100k documents), prefer cursor-based pagination

### **Caching** [RECOMMENDED]

```typescript
// Cache frequently read, rarely changed data via Redis
const cacheKey = `categories:active`;
const cached = await this.redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const data = await this.repository.findAll({ isActive: true });
await this.redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 min TTL
return data;
```

### **Response Size**

- Return only the fields the consumer needs — avoid over-fetching
- For list endpoints, return summary fields; provide a detail endpoint for the full object
- Compress responses with gzip (configured at the Nginx/load-balancer level)

---

## 24. Security Best Practices

### **Input Validation**

- Every request body and query string is validated through a typed DTO
- `whitelist: true` strips unknown properties silently
- `forbidNonWhitelisted: true` rejects requests that contain unknown properties

### **NoSQL Injection Prevention**

Never spread user input into MongoDB filter objects:

```typescript
// ❌ Injection vector
const results = await this.model.find(req.query as any).exec();

// ✅ Build filter explicitly from validated DTO fields
const filter: FilterQuery<Entity> = {};
if (query.isActive !== undefined) filter.isActive = query.isActive;
if (query.search) filter.$text = { $search: query.search };
```

### **Sensitive Data**

- Use `.select('-password -refreshToken')` in all user queries
- Never return credential fields in any response
- Never log credential values

### **CORS**

CORS is configured in `main.ts`. In production, `origin` should be restricted to known frontend domains — not `true` (allow all):

```typescript
// Development
app.enableCors({ origin: true, credentials: true });

// Production
app.enableCors({ origin: ['https://app.example.com'], credentials: true });
```

### **HTTPS**

All production traffic is TLS-terminated at the load balancer or Nginx reverse proxy. The NestJS application does not handle TLS directly.

---

## 25. Idempotency Guidelines

### **Naturally Idempotent Methods**

- `GET` — Safe and idempotent by definition
- `PUT` — Sending the same update twice must produce the same result
- `DELETE` — Deleting an already-deleted resource returns `404`, not an error

### **POST Idempotency**

`POST` is not idempotent by default. For operations where duplicate submission is a risk (e.g., payment, job trigger), use an idempotency key:

```
POST /api/v1/books/:id/generate
Idempotency-Key: client-generated-uuid-v4
```

The server caches the response for the given key for a TTL period. A duplicate request with the same key returns the cached response rather than executing again.

### **Rules**

- Delete endpoints must return `404` for already-deleted resources, not `204` — this is the correct idempotent behaviour
- Update endpoints must be safe to retry — applying the same update twice must produce the same state

---

## 26. Rate Limiting Recommendations

> Rate limiting is not implemented in Phase 1 but is required before public exposure.

### **Planned Strategy**

Use `@nestjs/throttler` with Redis store for distributed rate limiting:

```typescript
ThrottlerModule.forRoot({
  ttl: 60,    // Window in seconds
  limit: 100, // Max requests per window per IP
})
```

### **Recommended Limits by Endpoint Type**

| Endpoint Type | Requests / Minute | Notes |
|--------------|-------------------|-------|
| Read (GET) | 300 | Per authenticated user |
| Write (POST, PUT) | 60 | Per authenticated user |
| Delete | 20 | Per authenticated user |
| Authentication | 10 | Per IP (before auth) |
| AI generation trigger | 5 | Per user (future) |

### **Rate Limit Response**

```json
{
  "statusCode": 429,
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again in 30 seconds.",
  "path": "/api/v1/categories",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "correlationId": "a3f1c2d4-..."
}
```

---

## 27. API Documentation Standards (Swagger/OpenAPI)

### **Swagger is Mandatory**

Every endpoint must be fully documented with Swagger decorators. Undocumented endpoints fail the Definition of Done checklist.

### **Controller-Level Decorators**

```typescript
@ApiTags('categories')          // Groups endpoints in Swagger UI
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()                // Declares bearer auth for all endpoints
export class CategoryController {}
```

### **Method-Level Decorators**

```typescript
@Post()
@ApiOperation({
  summary: 'Create a new category',
  description: 'Creates a category. Requires ADMIN or EDITOR role.',
})
@ApiBody({ type: CreateCategoryDto })
@ApiResponse({ status: 201, description: 'Created successfully', type: CategoryResponseDto })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
@ApiResponse({ status: 409, description: 'Duplicate name or slug' })
async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {}
```

### **Parameter Documentation**

```typescript
@Get(':id')
@ApiParam({
  name: 'id',
  description: 'MongoDB ObjectId of the resource',
  example: '507f1f77bcf86cd799439011',
})
async findOne(@Param('id') id: string): Promise<EntityResponseDto> {}
```

### **DTO Documentation**

```typescript
@ApiProperty({
  description: 'Entity name',
  example: 'Technology',
  minLength: 2,
  maxLength: 100,
})
@IsString()
@IsNotEmpty()
name: string;
```

### **Required Swagger per Endpoint**

| Decorator | Required |
|-----------|----------|
| `@ApiTags()` on controller | ✅ |
| `@ApiBearerAuth()` on controller | ✅ |
| `@ApiOperation({ summary })` per method | ✅ |
| `@ApiBody()` for POST/PUT | ✅ |
| `@ApiResponse()` for every possible status | ✅ |
| `@ApiParam()` for path parameters | ✅ |
| `@ApiProperty` on every DTO field | ✅ |

### **Swagger UI Location**

```
http://localhost:3000/docs
```

---

## 28. API Testing Guidelines

### **Testing Pyramid**

```
         ╔══════════╗
         ║  E2E      ║  ← Full HTTP cycle, real DB (few, critical paths)
         ╠══════════╣
         ║ Integration║  ← Controller → Service → Repository (mocked DB)
         ╠══════════╣
         ║  Unit     ║  ← Service logic, pure functions (majority)
         ╚══════════╝
```

### **Unit Test Coverage**

Test the service layer independently with a mocked repository:

```typescript
describe('EntityService.create', () => {
  it('should create entity and return response DTO', async () => {
    mockRepository.findByName.mockResolvedValue(null);
    mockRepository.existsBySlug.mockResolvedValue(false);
    mockRepository.create.mockResolvedValue(mockEntity);

    const result = await service.create(createDto, userId);

    expect(result.name).toBe(createDto.name);
    expect(result.id).toBeDefined();
  });

  it('should throw ConflictException for duplicate name', async () => {
    mockRepository.findByName.mockResolvedValue(existingEntity);

    await expect(service.create(createDto, userId))
      .rejects.toThrow(ConflictException);
  });
});
```

### **E2E Test Coverage**

Every endpoint must have E2E tests covering:
- ✅ Happy path (valid input, correct role)
- ✅ Validation error (invalid DTO)
- ✅ Unauthorized (no token)
- ✅ Forbidden (wrong role)
- ✅ Not found (invalid ID)
- ✅ Conflict (duplicate name/slug)

### **Test Data**

- Use a dedicated test database, never the development or production database
- Clean up test data in `afterEach` / `afterAll`
- Use factories for consistent test data creation

---

## 29. API Deprecation Strategy

### **Deprecation Process**

1. **Announce** — Add `@deprecated` JSDoc comment on the method and a deprecation notice in `@ApiOperation`
2. **Signal** — Add `Deprecation` and `Sunset` response headers
3. **Minimum Notice Period** — 6 months for external consumers; 2 months for internal
4. **Remove** — Only after the sunset date has passed

### **Deprecation Headers**

```typescript
@Get('old-endpoint')
@Header('Deprecation', 'true')
@Header('Sunset', 'Sat, 01 Jan 2025 00:00:00 GMT')
@Header('Link', '</api/v2/new-endpoint>; rel="successor-version"')
@ApiOperation({
  summary: '[DEPRECATED] Old endpoint',
  description: 'Deprecated. Use /api/v2/new-endpoint instead. Sunset: 2025-01-01',
})
async oldEndpoint() {}
```

### **Rules**

- Never remove an endpoint in the same release that deprecates it
- The replacement endpoint must exist before the deprecation notice goes out
- All deprecation notices must be tracked in a `CHANGELOG.md`

---

## 30. Common API Design Mistakes to Avoid

### **URL Design**

| ❌ Mistake | ✅ Correct |
|-----------|-----------|
| `/getCategories` | `/categories` |
| `/category` (singular) | `/categories` |
| `/categories/delete/:id` | `DELETE /categories/:id` |
| `/categories?filter[name]=tech` | `/categories?search=tech` |
| Four-level deep nesting | Two-level maximum |

### **HTTP Methods**

| ❌ Mistake | ✅ Correct |
|-----------|-----------|
| `GET /categories/delete/:id` | `DELETE /categories/:id` |
| `POST /categories/list` | `GET /categories` |
| `POST /categories/:id` for updates | `PUT /categories/:id` |

### **Status Codes**

| ❌ Mistake | ✅ Correct |
|-----------|-----------|
| `200` with `{ error: "Not found" }` | `404` with error body |
| `500` for validation errors | `400` for client mistakes |
| `200` for resource deletion | `204` |
| `404` for invalid ObjectId format | `400` |

### **Response Shapes**

| ❌ Mistake | ✅ Correct |
|-----------|-----------|
| Returning `_id` in responses | Transform to `id` |
| Returning `__v`, `isDeleted` | Exclude with `.select()` |
| Inconsistent paginated envelope | Always `{ data, meta }` |
| Different error shapes per module | Always global exception filter shape |

### **Validation**

| ❌ Mistake | ✅ Correct |
|-----------|-----------|
| `@Body() body: any` | `@Body() dto: CreateEntityDto` |
| No `@Type()` on numeric query params | `@Type(() => Number)` |
| No boolean transform on query params | `@Transform(({ value }) => ...)` |
| Generic `"Validation failed"` error | Field-specific message |

---

## 31. Example Endpoints

### **CRUD Module Standard Endpoints**

```typescript
@ApiTags('entities')
@Controller('entities')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EntityController {

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Create entity' })
  async create(@Body() dto: CreateEntityDto, @CurrentUser() user: User): Promise<EntityResponseDto>

  @Get()
  @ApiOperation({ summary: 'List entities (paginated)' })
  async findAll(@Query() query: QueryEntityDto): Promise<PaginatedEntityResponseDto>

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  async findOne(@Param('id') id: string): Promise<EntityResponseDto>

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get entity by slug' })
  async findBySlug(@Param('slug') slug: string): Promise<EntityResponseDto>

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Update entity' })
  async update(@Param('id') id: string, @Body() dto: UpdateEntityDto, @CurrentUser() user: User): Promise<EntityResponseDto>

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete entity' })
  async remove(@Param('id') id: string, @CurrentUser() user: User): Promise<void>

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore soft-deleted entity' })
  async restore(@Param('id') id: string): Promise<EntityResponseDto>
}
```

---

## 32. Example Request/Response Payloads

### **POST /api/v1/categories**

**Request**
```http
POST /api/v1/categories
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "name": "Technology",
  "description": "All technology-related content",
  "color": "#3B82F6",
  "order": 0
}
```

**Response — 201 Created**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Technology",
  "slug": "technology",
  "description": "All technology-related content",
  "icon": null,
  "color": "#3B82F6",
  "order": 0,
  "isActive": true,
  "createdAt": "2026-07-12T10:00:00.000Z",
  "updatedAt": "2026-07-12T10:00:00.000Z"
}
```

**Response — 409 Conflict**
```json
{
  "statusCode": 409,
  "errorCode": "VALIDATION_ERROR",
  "message": "Category with name \"Technology\" already exists",
  "path": "/api/v1/categories",
  "timestamp": "2026-07-12T10:00:00.000Z",
  "correlationId": "a3f1c2d4-1234-5678-abcd-ef1234567890"
}
```

---

### **GET /api/v1/categories**

**Request**
```http
GET /api/v1/categories?search=tech&isActive=true&sortBy=order&sortOrder=asc&page=1&limit=10
Authorization: Bearer eyJhbGci...
```

**Response — 200 OK**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Technology",
      "slug": "technology",
      "description": "All technology-related content",
      "icon": null,
      "color": "#3B82F6",
      "order": 0,
      "isActive": true,
      "createdAt": "2026-07-12T10:00:00.000Z",
      "updatedAt": "2026-07-12T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### **DELETE /api/v1/categories/:id**

**Request**
```http
DELETE /api/v1/categories/507f1f77bcf86cd799439011
Authorization: Bearer eyJhbGci...
```

**Response — 204 No Content**
```
(empty body)
```

**Response — 404 Not Found**
```json
{
  "statusCode": 404,
  "errorCode": "VALIDATION_ERROR",
  "message": "Category with ID \"507f1f77bcf86cd799439011\" not found",
  "path": "/api/v1/categories/507f1f77bcf86cd799439011",
  "timestamp": "2026-07-12T10:00:00.000Z",
  "correlationId": "a3f1c2d4-1234-5678-abcd-ef1234567890"
}
```

---

### **Validation Error**

**Request**
```http
POST /api/v1/categories
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{ "name": "X" }
```

**Response — 400 Bad Request**
```json
{
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "name must be longer than or equal to 2 characters",
  "path": "/api/v1/categories",
  "timestamp": "2026-07-12T10:00:00.000Z",
  "correlationId": "a3f1c2d4-1234-5678-abcd-ef1234567890"
}
```

---

## 33. Definition of Done for Every API

An endpoint is complete and ready for review only when all of the following are satisfied:

### **Contract**
- [ ] URL follows REST naming conventions (plural, kebab-case)
- [ ] Correct HTTP method for the operation
- [ ] Correct HTTP status codes returned for all paths (success, not-found, conflict, validation, auth)
- [ ] Route is under `/api/v1/` prefix

### **Validation**
- [ ] `@Body()`, `@Query()`, and `@Param()` use typed DTOs — never `any`
- [ ] All DTO properties have class-validator decorators
- [ ] Boolean query parameters use `@Transform()` for coercion
- [ ] Numeric query parameters use `@Type(() => Number)`
- [ ] ObjectIds are validated before database queries

### **Authentication & Authorization**
- [ ] `JwtAuthGuard` and `RolesGuard` applied at controller class level
- [ ] `@Roles()` applied at method level for every write operation
- [ ] `@CurrentUser()` used to extract user — no direct `req.user` access
- [ ] Unauthenticated request returns `401`
- [ ] Insufficient role returns `403`

### **Response**
- [ ] Single resource returns the entity directly (no wrapper)
- [ ] List endpoints return `{ data: [], meta: {} }`
- [ ] Response DTO excludes internal fields (`_id` → `id`, no `__v`, `isDeleted`, etc.)
- [ ] `null` values for nullable optional fields are present, not omitted

### **Error Handling**
- [ ] All error paths throw NestJS built-in exceptions
- [ ] Error messages are specific and include the entity name and identifier
- [ ] No stack traces or internal details in error messages
- [ ] Soft-deleted resources return `404`, not `410`

### **Documentation**
- [ ] `@ApiTags()` on controller
- [ ] `@ApiBearerAuth()` on controller
- [ ] `@ApiOperation({ summary, description })` on every method
- [ ] `@ApiBody()` on every POST and PUT method
- [ ] `@ApiParam()` on every route parameter
- [ ] `@ApiResponse()` for every HTTP status code the endpoint can return
- [ ] `@ApiProperty` / `@ApiPropertyOptional` on every DTO field with `description` and `example`

### **Performance**
- [ ] Repository read operations use `.lean().exec()`
- [ ] List queries use `.select()` to project required fields only
- [ ] Paginated endpoints have `@Max(100)` on `limit`
- [ ] All query filter fields are indexed in the schema

### **Security**
- [ ] No user-controlled input spread directly into a Mongoose filter
- [ ] No credential fields in any response
- [ ] Correlation ID present in error responses

### **Testing** [RECOMMENDED]
- [ ] Unit tests for service methods
- [ ] E2E test for happy path
- [ ] E2E test for auth failure
- [ ] E2E test for validation error

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-12  
**Applies To**: All REST API endpoints in the AI Publishing Company monorepo  
**Governing Documents**: `ARCHITECTURE.md`, `CODING_STANDARDS.md`, `DATABASE_RULES.md`, `BUSINESS_RULES.md`
