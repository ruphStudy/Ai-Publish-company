# DATABASE RULES

> **Database Standards for AI Publishing Company**  
> MongoDB + Mongoose + NestJS — Enterprise Edition  
> Used by AI coding assistants, developers, and code reviewers.

---

## 1. Database Philosophy

### **Core Beliefs**

- **Schema is documentation.** Every field in a Mongoose schema must communicate intent clearly through its name, type, and constraints.
- **Design for reads.** Publishing platforms are read-heavy. Index and model data to make the 99% case fast, even if writes become slightly more complex.
- **Data never truly dies.** Use soft delete everywhere. Hard deletes require explicit architectural justification.
- **Fail loudly, early.** Schema-level validation is the last defence. An invalid document must never reach the database.
- **Consistency is non-negotiable.** Every collection follows the same field naming, audit pattern, and index strategy.
- **Plan for millions, implement for thousands.** Every schema decision must be evaluated at 10M+ document scale.

### **Guiding Constraints**
- ODM: Mongoose 8.x
- Database: MongoDB 8.x
- NestJS integration: `@nestjs/mongoose`
- All connections managed through `DatabaseModule`
- One Mongoose model per NestJS module; registered via `MongooseModule.forFeature()`

---

## 2. Collection Naming Conventions

| Rule | Standard | Example |
|------|----------|---------|
| Case | `snake_case`, **lowercase** | `audit_logs`, `refresh_tokens` |
| Plurality | Always **plural** | `categories` not `category` |
| Separator | Underscore `_` | `email_verifications` |
| Length | Short but descriptive | `media_assets` not `media_asset_files_for_upload` |
| Explicit declaration | Always set `collection:` in `@Schema` | `@Schema({ collection: 'categories' })` |

```typescript
// ✅ Good
@Schema({ timestamps: true, collection: 'categories' })
@Schema({ timestamps: true, collection: 'audit_logs' })
@Schema({ timestamps: true, collection: 'refresh_tokens' })

// ❌ Bad
@Schema({ timestamps: true })            // No explicit collection name
@Schema({ collection: 'Category' })      // PascalCase
@Schema({ collection: 'category' })      // Singular
@Schema({ collection: 'categoryList' })  // camelCase
```

---

## 3. Document Field Naming Conventions

| Rule | Standard | Example |
|------|----------|---------|
| Case | `camelCase` | `isActive`, `createdBy`, `deletedAt` |
| Boolean prefix | `is`, `has`, `can`, `should` | `isActive`, `isDeleted`, `hasChildren` |
| Date suffix | `At` for timestamps | `createdAt`, `deletedAt`, `publishedAt` |
| Reference suffix | `By` for actor references | `createdBy`, `deletedBy`, `approvedBy` |
| ID references | `<entity>Id` for FK references | `categoryId`, `authorId` |
| Arrays | Plural noun | `tags`, `roles`, `permissions` |

```typescript
// ✅ Good
isActive: boolean;
isDeleted: boolean;
deletedAt: Date | null;
deletedBy: Types.ObjectId | null;
createdBy: Types.ObjectId;
publishedAt: Date | null;
tags: string[];

// ❌ Bad
active: boolean;           // Missing is/has prefix
deleted_at: Date;          // snake_case
DeletedBy: Types.ObjectId; // PascalCase
create_user: Types.ObjectId;  // snake_case, wrong suffix
```

---

## 4. Primary Key Strategy

### **Use MongoDB Default `_id` (ObjectId)**

- Never define a custom `_id` field unless there is a strong architectural reason
- Always use `Types.ObjectId` from Mongoose for ObjectId references
- Validate ObjectId at repository layer before querying

```typescript
import { Types } from 'mongoose';

// ✅ Validate before use
async findById(id: string): Promise<T | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return this.model.findById(id).lean().exec();
}

// ✅ Cast when creating references
createdBy: new Types.ObjectId(userId)

// ❌ Bad: No validation, will throw on invalid string
async findById(id: string) {
  return this.model.findById(id).exec();
}
```

### **Expose as `id` in API Responses**

- `_id` is always transformed to `id` (string) in response DTOs
- Never expose `_id` directly to API consumers

```typescript
// ✅ In response DTO
@Expose({ name: '_id' })
@Type(() => String)
id: string;
```

### **No Custom String IDs**

Do not use `uuid`, sequential integers, or custom string IDs as the primary key unless required by an integration contract. ObjectIds embed a timestamp and are inherently sortable.

---

## 5. Soft Delete Strategy

### **Every Collection Uses Soft Delete**

Hard delete is **never** used without explicit architectural approval. Soft delete preserves data for audit, recovery, and analytics.

### **Required Soft Delete Fields**

Every collection must include all four fields:

```typescript
@Prop({ default: false, index: true })
isDeleted: boolean;

@Prop({ type: Date, default: null })
deletedAt: Date | null;

@Prop({ type: Types.ObjectId, ref: 'User', default: null })
deletedBy: Types.ObjectId | null;
```

### **Query Middleware — Auto-Exclude Deleted**

Every schema must apply this middleware to filter soft-deleted documents transparently:

```typescript
EntitySchema.pre(/^find/, function (next) {
  const query = this as any;
  if (!query.getOptions()?.includeDeleted) {
    query.where({ isDeleted: { $ne: true } });
  }
  next();
});
```

### **Querying Deleted Records**

When you explicitly need deleted records, pass the option flag:

```typescript
// ✅ Include deleted documents when intentional
const withDeleted = await this.model
  .find({ userId })
  .setOptions({ includeDeleted: true })
  .lean()
  .exec();
```

### **Restore Operation**

Restore resets all three soft-delete fields atomically:

```typescript
async restore(id: string): Promise<T | null> {
  return this.model
    .findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true },
    )
    .setOptions({ includeDeleted: true })
    .lean()
    .exec();
}
```

---

## 6. Audit Fields Standard

### **Mandatory Audit Block**

Every collection must include the complete audit block without exception:

```typescript
// Creation audit
@Prop({ type: Types.ObjectId, ref: 'User', required: true })
createdBy: Types.ObjectId;

// Modification audit
@Prop({ type: Types.ObjectId, ref: 'User', default: null })
updatedBy: Types.ObjectId | null;

// Deletion audit (see Section 5)
@Prop({ default: false, index: true })
isDeleted: boolean;

@Prop({ type: Date, default: null })
deletedAt: Date | null;

@Prop({ type: Types.ObjectId, ref: 'User', default: null })
deletedBy: Types.ObjectId | null;

// Auto-generated timestamps (via @Schema({ timestamps: true }))
createdAt: Date;
updatedAt: Date;
```

### **Populating Audit Fields in Repositories**

Repositories are responsible for injecting audit fields from the authenticated user context:

```typescript
// On create
const entity = new this.model({ ...dto, createdBy: new Types.ObjectId(userId) });

// On update
await this.model.findByIdAndUpdate(id, { ...dto, updatedBy: new Types.ObjectId(userId) });

// On soft delete
await this.model.updateOne(
  { _id: id },
  { isDeleted: true, deletedAt: new Date(), deletedBy: new Types.ObjectId(userId) },
);
```

---

## 7. Required Common Fields

The following fields are mandatory in **every** collection in the system:

| Field | Type | Default | Required | Description |
|-------|------|---------|----------|-------------|
| `_id` | ObjectId | Auto | Auto | MongoDB primary key |
| `isActive` | Boolean | `true` | Yes | Logical active/visible state |
| `isDeleted` | Boolean | `false` | Yes | Soft delete flag |
| `deletedAt` | Date \| null | `null` | Yes | When deleted |
| `deletedBy` | ObjectId \| null | `null` | Yes | Who deleted |
| `createdBy` | ObjectId | — | Yes | Who created |
| `updatedBy` | ObjectId \| null | `null` | Yes | Who last updated |
| `createdAt` | Date | Auto | Auto | Auto by `timestamps: true` |
| `updatedAt` | Date | Auto | Auto | Auto by `timestamps: true` |

Any collection missing these fields fails the Definition of Done.

---

## 8. Timestamp Rules

### **Always Enable `timestamps: true`**

```typescript
// ✅ Required in every schema
@Schema({ timestamps: true, collection: 'your_collection' })
export class YourEntity extends Document {
  // createdAt and updatedAt are auto-managed
  createdAt: Date;  // Declare for TypeScript
  updatedAt: Date;  // Declare for TypeScript
}
```

### **Never Define `createdAt` or `updatedAt` as `@Prop()`**

Declaring them as `@Prop()` overrides the Mongoose timestamps plugin behaviour.

```typescript
// ❌ Never do this
@Prop({ required: true })
createdAt: Date;

// ✅ Do this — declare for TypeScript only, no @Prop
createdAt: Date;
updatedAt: Date;
```

### **Custom Event Timestamps**

For domain events, define explicit nullable timestamps with descriptive names:

```typescript
@Prop({ type: Date, default: null })
publishedAt: Date | null;

@Prop({ type: Date, default: null })
approvedAt: Date | null;

@Prop({ type: Date, default: null })
archivedAt: Date | null;
```

### **Timezone**

All timestamps are stored in **UTC**. Timezone conversion is the responsibility of the API consumer.

---

## 9. MongoDB Indexing Strategy

### **Index Decision Matrix**

| Query Pattern | Index Type | Example |
|--------------|------------|---------|
| Exact match on single field | Single field | `{ email: 1 }` |
| Range query (date, number) | Single field | `{ createdAt: -1 }` |
| Multiple filters together | Compound | `{ isActive: 1, isDeleted: 1 }` |
| Unique constraint | Unique | `{ slug: 1 }, { unique: true }` |
| Full-text search | Text | `{ name: 'text', description: 'text' }` |
| Prefix lookups (autocomplete) | Single field with sort | `{ name: 1 }` |
| Geospatial queries | 2dsphere | `{ location: '2dsphere' }` |

### **Declare Indexes After Schema Creation**

Define all indexes after `SchemaFactory.createForClass()`, not inline on `@Prop()`, for clarity and maintainability:

```typescript
export const CategorySchema = SchemaFactory.createForClass(Category);

// -- Indexes --
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ isActive: 1, isDeleted: 1 });
CategorySchema.index({ createdAt: -1 });
CategorySchema.index({ name: 'text', description: 'text' });
```

Exception: Inline `index: true` on `@Prop()` is acceptable for single-field indexes on high-cardinality fields where visibility is preferred.

### **Naming Compound Indexes**

Always name compound indexes explicitly to ease debugging and management:

```typescript
EntitySchema.index(
  { isActive: 1, isDeleted: 1, createdAt: -1 },
  { name: 'idx_active_deleted_created' },
);
```

### **Minimum Mandatory Indexes Per Collection**

Every collection must have at minimum:

```typescript
Schema.index({ isActive: 1, isDeleted: 1 });
Schema.index({ createdAt: -1 });
```

---

## 10. Unique Constraints

### **Declare at Schema Level**

Unique constraints are declared as index definitions with `{ unique: true }`, not inline on `@Prop({ unique: true })` alone — the index definition is the source of truth.

```typescript
// ✅ Good — explicit index declaration
@Prop({ required: true, lowercase: true, trim: true })
slug: string;

EntitySchema.index({ slug: 1 }, { unique: true });

// ❌ Incomplete — relies only on Mongoose prop, no visible index declaration
@Prop({ required: true, unique: true })
slug: string;
```

### **Handle Duplicate Key Errors**

Repositories must catch MongoDB duplicate key errors (code `11000`) and convert them to `ConflictException`:

```typescript
async create(dto: CreateDto): Promise<Entity> {
  try {
    const entity = new this.model(dto);
    return await entity.save();
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      throw new ConflictException(`Duplicate value for field: ${field}`);
    }
    throw error;
  }
}
```

### **Pre-Validate Before Saving**

For better user-facing error messages, validate uniqueness at the service layer before attempting a write. The `11000` catch is the safety net, not the primary strategy.

---

## 11. Compound Index Guidelines

### **ESR Rule (Equality → Sort → Range)**

Build compound indexes in this field order for optimal query performance:

1. **Equality** fields first (exact match filters: `isActive`, `isDeleted`, `status`)
2. **Sort** fields second (ordering: `createdAt`, `order`, `name`)
3. **Range** fields last (range filters: date ranges, numeric ranges)

```typescript
// ✅ ESR order — filtering active docs, sorted by createdAt
EntitySchema.index({ isActive: 1, isDeleted: 1, createdAt: -1 });

// ✅ Supports: find({ isActive: true, isDeleted: false }).sort({ createdAt: -1 })
```

### **Cover Common Queries**

Design compound indexes to cover (include) the fields used in `find()`, `sort()`, and `select()` so MongoDB can satisfy the query from the index alone (covered query):

```typescript
// Query: find active categories, sorted by order, returning name + slug
EntitySchema.index({ isActive: 1, isDeleted: 1, order: 1 });
// Then .select('name slug order') achieves a covered query
```

### **Avoid Redundant Indexes**

A compound index `{ a: 1, b: 1 }` already covers queries on `{ a: 1 }` alone. Do not create a separate `{ a: 1 }` index unless there are high-frequency queries on `a` alone that justify it.

### **Index Limit**

Keep total indexes per collection under **10**. Every index adds write overhead and memory consumption. Review and remove unused indexes in each phase.

---

## 12. Search Optimization

### **Full-Text Search via MongoDB Atlas / Text Indexes**

For keyword search across string fields, use a text index:

```typescript
// ✅ Define text index
EntitySchema.index({ name: 'text', description: 'text' });

// ✅ Query using $text
const filter: FilterQuery<Entity> = {};
if (search) {
  filter.$text = { $search: search };
}

const results = await this.model
  .find(filter)
  .sort({ score: { $meta: 'textScore' } })  // Sort by relevance
  .lean()
  .exec();
```

### **Text Index Weights**

Assign higher weights to more important fields to improve search relevance:

```typescript
EntitySchema.index(
  { name: 'text', description: 'text', tags: 'text' },
  { weights: { name: 10, tags: 5, description: 1 }, name: 'idx_text_search' },
);
```

### **Prefix Search (Autocomplete)**

For autocomplete use cases, use a case-insensitive regex on an indexed field:

```typescript
// Only for low-cardinality or indexed fields
const filter = { name: new RegExp(`^${escapeRegex(term)}`, 'i') };
```

> **Note**: Regex searches bypass indexes unless the pattern is anchored at the start (`^`). Always anchor prefix searches.

### **Elasticsearch for Advanced Search**

At scale (> 1M documents with complex relevance requirements), migrate full-text search to Elasticsearch or MongoDB Atlas Search. The repository interface remains unchanged — only the implementation swaps.

---

## 13. Pagination Strategy

### **Offset Pagination (Standard)**

Use for standard paginated list endpoints. Performant up to ~100k documents per collection.

```typescript
const page = query.page || 1;
const limit = Math.min(query.limit || 10, 100);  // Hard cap at 100
const skip = (page - 1) * limit;

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

### **Cursor Pagination (High-Scale)**

Use cursor-based pagination for infinite scroll, feeds, or collections exceeding 1M documents. `skip()` degrades linearly at scale.

```typescript
// Use _id or createdAt as cursor — both are indexed
const cursor = query.cursor; // Last seen document _id (as string)

const filter: FilterQuery<Entity> = { ...baseFilter };
if (cursor && Types.ObjectId.isValid(cursor)) {
  filter._id = { $lt: new Types.ObjectId(cursor) };
}

const data = await this.model
  .find(filter)
  .sort({ _id: -1 })
  .limit(limit + 1)  // Fetch one extra to determine hasNextPage
  .lean()
  .exec();

const hasNextPage = data.length > limit;
const items = hasNextPage ? data.slice(0, -1) : data;
const nextCursor = hasNextPage ? items[items.length - 1]._id.toString() : null;

return { data: items, meta: { hasNextPage, nextCursor } };
```

### **Page Size Limits**

| Consumer | Max `limit` |
|----------|-------------|
| Standard API | 100 |
| Internal/admin | 500 |
| Exports / batch | Handled separately via streaming |

Never allow unbounded queries. Every `find()` must have `.limit()`.

---

## 14. Relationship Guidelines

### **Document Relationships in MongoDB**

MongoDB supports three patterns. Choose based on access patterns:

| Pattern | When to Use | Example |
|---------|------------|---------|
| **Embedded** | Data always accessed together, 1:1 or 1:few, sub-doc ≤ 16MB | Address inside User |
| **Reference (DBRef)** | 1:many, many:many, or independently queried documents | Category → Articles |
| **Hybrid** | Embed a subset of fields, reference full document | Embed `{ id, name }` for display, ref for detail |

### **Reference Pattern (Preferred for Cross-Module)**

```typescript
// ✅ Store ObjectId reference
@Prop({ type: Types.ObjectId, ref: 'Category', required: true })
categoryId: Types.ObjectId;

// ✅ Type-safe reference definition
@Prop({ type: Types.ObjectId, ref: 'User', required: true })
createdBy: Types.ObjectId;
```

### **Populate Sparingly**

`.populate()` triggers additional queries. Only populate in endpoints that explicitly need related data. For list endpoints, return IDs and let consumers request detail.

```typescript
// ✅ Lean read without populate (fast)
const articles = await this.model.find().lean().exec();

// ✅ Populate only when explicitly needed
const article = await this.model.findById(id).populate('createdBy', 'firstName email').lean().exec();
```

---

## 15. Reference vs Embedded Document Rules

### **Use References When**

- The related document is queried independently
- The related document is shared across multiple parent documents
- The sub-document list is unbounded (could grow to many items)
- The related data changes independently of the parent
- Cross-module data (e.g., `users` referenced by `categories`)

```typescript
// ✅ Reference: user is queried independently, shared by many modules
@Prop({ type: Types.ObjectId, ref: 'User', required: true })
createdBy: Types.ObjectId;
```

### **Use Embedded When**

- The sub-document is only ever accessed via the parent
- The data is 1:1 or 1:few (bounded, will not grow unboundedly)
- The sub-document shares the full lifecycle of the parent
- Document size will not exceed 16MB

```typescript
// ✅ Embedded: address only exists within user, bounded size
@Prop({
  type: {
    street: String,
    city: String,
    country: String,
  },
  default: null,
})
address: { street: string; city: string; country: string } | null;
```

### **Never Embed Unbounded Arrays**

```typescript
// ❌ Never do this — articles can grow to millions
@Prop({ type: [Types.ObjectId], ref: 'Article' })
articles: Types.ObjectId[];  // This will eventually exceed 16MB

// ✅ Instead, put the reference on the child document
// Article has: @Prop({ type: Types.ObjectId, ref: 'Category' }) categoryId
```

---

## 16. Slug Generation Rules

### **Format**

- Lowercase only
- Alphanumeric characters and hyphens only: `/^[a-z0-9-]+$/`
- No leading or trailing hyphens
- No consecutive hyphens
- Maximum 200 characters

### **Generation Algorithm**

```typescript
function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')                      // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '')       // Remove diacritics (é → e)
    .replace(/[^\w\s-]/g, '')             // Remove remaining special characters
    .replace(/\s+/g, '-')                  // Replace whitespace with hyphen
    .replace(/-+/g, '-')                   // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '')              // Trim leading/trailing hyphens
    .slice(0, 200);                        // Enforce max length
}

// Examples:
// "Tech & Innovation!"  → "tech-innovation"
// "Café au Lait"        → "cafe-au-lait"
// "  Hello   World  "  → "hello-world"
// "Node.js Tips"        → "nodejs-tips"
```

### **Uniqueness**

- Slugs must be unique within a collection
- Auto-generated slugs that conflict must be suffixed: `technology`, `technology-2`, `technology-3`
- Service layer validates uniqueness before write; schema index enforces it as a safety net

### **Immutability**

- Slugs should not change after first publication (SEO, external links)
- If a slug must change, the old slug must be preserved as a redirect alias

### **Schema Validation**

```typescript
@Prop({
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  match: /^[a-z0-9-]+$/,
  maxlength: 200,
})
slug: string;

// Enforce at schema path level as well
EntitySchema.path('slug').validate(
  (value: string) => /^[a-z0-9-]+$/.test(value),
  'Slug must contain only lowercase letters, numbers, and hyphens',
);
```

---

## 17. Enum Usage

### **Define Enums in Entity Files**

```typescript
// ✅ Define alongside the entity that owns them
export enum ContentStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true, collection: 'articles' })
export class Article extends Document {
  @Prop({ type: String, enum: ContentStatus, default: ContentStatus.DRAFT })
  status: ContentStatus;
}
```

### **Enum Value Strategy**

- Use **string values** for enums stored in MongoDB (not numeric)
- String values are human-readable in the database, easier to debug, safe to query without the enum map
- Values must be lowercase strings: `'draft'`, not `'DRAFT'`

### **Exporting Enums**

Enums shared between frontend and backend must live in `packages/shared/src/`:

```typescript
// packages/shared/src/constants/content-status.ts
export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}
```

Enums private to a single module stay in the entity file.

---

## 18. Validation Rules

### **Schema-Level (Last Line of Defence)**

Apply Mongoose validators for critical constraints directly on fields:

```typescript
@Prop({
  required: true,
  trim: true,
  minlength: [2, 'Name must be at least 2 characters'],
  maxlength: [100, 'Name must not exceed 100 characters'],
})
name: string;

@Prop({
  type: Number,
  min: [0, 'Order must be non-negative'],
  default: 0,
})
order: number;
```

### **Service-Level (Business Rules)**

Uniqueness, cross-field consistency, and domain business rules are validated in the service layer before the database write:

```typescript
// ✅ Service validates before write
const existing = await this.repository.findByName(dto.name);
if (existing) {
  throw new ConflictException(`Entity with name "${dto.name}" already exists`);
}
```

### **Never Rely on a Single Validation Layer**

Use both: DTO validation for API input, service validation for business rules, schema validation as the final safety net.

| Layer | Validates | Tool |
|-------|----------|------|
| DTO | Request shape, types, ranges | class-validator |
| Service | Business rules, uniqueness | Manual checks + NestJS exceptions |
| Schema | Data integrity at storage boundary | Mongoose validators |

---

## 19. Migration Strategy

### **Mongoose Does Not Auto-Migrate**

MongoDB is schema-less at the storage engine level. Schema changes are applied at the application layer. There is no automatic migration.

### **Additive Changes (Safe, No Migration Needed)**

- Adding a new optional field with a default value
- Adding a new index
- Adding a new collection

```typescript
// ✅ Safe: new optional field with default
@Prop({ type: String, default: null })
subtitle: string | null;
```

### **Destructive Changes (Require Migration Script)**

- Renaming a field
- Changing a field's type
- Removing a field
- Changing index structure

### **Migration Script Pattern**

```typescript
// scripts/migrations/001-add-subtitle-to-articles.ts
import { MongoClient } from 'mongodb';

async function migrate() {
  const client = await MongoClient.connect(process.env.DATABASE_URI);
  const db = client.db();
  const collection = db.collection('articles');

  // Backfill new field on existing documents
  await collection.updateMany(
    { subtitle: { $exists: false } },
    { $set: { subtitle: null } },
  );

  console.log('Migration 001 complete');
  await client.close();
}

migrate().catch(console.error);
```

### **Migration Numbering**

Name migration scripts with a sequential prefix and descriptive name:
`001-add-subtitle-to-articles.ts`, `002-rename-category-order-field.ts`

### **Run Before Deployment**

Migrations run as a pre-deployment step in CI/CD, before the application boots. The application must be backward-compatible with pre-migration data.

---

## 20. Versioning Strategy

### **Document Versioning (`__v`)**

Mongoose automatically adds `__v` (version key) for optimistic concurrency on arrays. Do not disable it.

Exclude `__v` from all API responses:

```typescript
// ✅ Exclude in queries
.select('-__v -isDeleted -deletedAt -deletedBy')
```

### **API Versioning Is Separate**

Database schema versioning is independent of API versioning. The API is versioned via URL prefix (`/api/v1/`). Do not conflate the two.

### **Soft Versioning for Content**

For content that needs historical snapshots (e.g., published articles), introduce an explicit version field:

```typescript
@Prop({ type: Number, default: 1 })
version: number;

@Prop({ type: Date, default: null })
publishedAt: Date | null;
```

Increment `version` on each publish event. Store history in a separate `article_revisions` collection.

---

## 21. Performance Best Practices

### **Always Use `.lean()` for Read Operations**

Mongoose documents carry hydration overhead (virtual properties, methods, change tracking). For read-only queries, `.lean()` returns a plain JavaScript object and is significantly faster.

```typescript
// ✅ 40-60% faster reads
const categories = await this.model.find(filter).lean().exec();

// ❌ Unnecessary overhead for read-only use
const categories = await this.model.find(filter).exec();
```

### **Always Use `.exec()` for Explicit Promises**

`.exec()` returns a true Promise with better stack traces than `.then()` chaining on the query object.

### **Field Projection — Return Only What You Need**

```typescript
// ✅ Only the fields the consumer needs
.select('name slug order isActive createdAt')

// ✅ Exclude internal fields from all public responses
.select('-__v -isDeleted -deletedAt -deletedBy -password')
```

### **Parallel Queries**

Use `Promise.all()` for independent queries rather than sequential `await`:

```typescript
// ✅ Parallel — both execute simultaneously
const [data, total] = await Promise.all([
  this.model.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
  this.model.countDocuments(filter).exec(),
]);

// ❌ Sequential — 2x slower
const data = await this.model.find(filter).lean().exec();
const total = await this.model.countDocuments(filter).exec();
```

### **Use `countDocuments()` Not `.find().length`**

```typescript
// ✅ Database-side count
const total = await this.model.countDocuments(filter).exec();

// ❌ Loads all documents into memory just to count
const total = (await this.model.find(filter).exec()).length;
```

---

## 22. Query Optimization Guidelines

### **Validate ObjectId Early**

Invalid ObjectIds throw a CastError at the driver level. Validate before querying:

```typescript
if (!Types.ObjectId.isValid(id)) return null;
```

### **Use `.explain()` in Development**

```typescript
// Check query plan in dev
const explanation = await this.model.find(filter).explain('executionStats');
// Look for: "IXSCAN" (index scan, good) vs "COLLSCAN" (full scan, bad)
```

### **Sort on Indexed Fields**

Sorting on non-indexed fields forces an in-memory sort (`SORT` stage). All sortable fields in query DTOs must correspond to indexed fields.

```typescript
// ✅ Allowed sort fields — all indexed
const ALLOWED_SORT_FIELDS = ['name', 'order', 'createdAt', 'updatedAt'] as const;
```

### **Avoid `$where` and JavaScript Expressions**

MongoDB's `$where` operator runs JavaScript in the database and bypasses indexes. Never use it.

### **Avoid `$or` on Unindexed Fields**

`$or` forces MongoDB to evaluate each branch. Ensure every field inside `$or` is indexed, or the query degrades to a collection scan.

### **Limit Regex Usage**

Regex queries only use indexes for anchored prefix patterns. For general text search, use the text index and `$text` operator.

```typescript
// ✅ Index-friendly (anchored prefix)
{ name: /^Technology/i }

// ❌ Not index-friendly (contains/suffix match)
{ name: /technology/i }
```

---

## 23. Bulk Operations

### **Use `insertMany()` for Bulk Creates**

```typescript
const entities = dtos.map(dto => ({ ...dto, createdBy: userId }));
const result = await this.model.insertMany(entities, { ordered: false });
// ordered: false — continue inserting even if some fail
```

### **Use `bulkWrite()` for Mixed Operations**

```typescript
await this.model.bulkWrite([
  { insertOne: { document: { name: 'Item A', createdBy: userId } } },
  { updateOne: { filter: { _id: id1 }, update: { $set: { name: 'Item B' } } } },
  { deleteOne: { filter: { _id: id2 } } },
], { ordered: false });
```

### **Batch Size**

Process bulk operations in batches of **500–1000 documents** to avoid memory pressure and keep individual operations under MongoDB's 16MB BSON limit.

```typescript
const BATCH_SIZE = 500;

for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);
  await this.model.insertMany(batch);
}
```

### **Background Jobs for Large Bulk Operations**

Bulk operations affecting > 10k documents must be offloaded to a BullMQ background job. Never block an HTTP request for large bulk writes.

---

## 24. Transaction Usage Guidelines

### **When to Use Transactions**

MongoDB multi-document transactions (replica sets only) are appropriate when:

- Writing to **two or more collections** atomically (all-or-none)
- A failure in step 2 must roll back step 1
- Financial or compliance-critical operations

```typescript
// ✅ Example: create entity + audit log atomically
const session = await this.connection.startSession();
try {
  await session.withTransaction(async () => {
    const entity = await this.model.create([dto], { session });
    await this.auditModel.create([{ entityId: entity[0]._id, action: 'CREATE' }], { session });
  });
} finally {
  await session.endSession();
}
```

### **When NOT to Use Transactions**

- Single-collection writes (MongoDB guarantees atomicity per document)
- Reads with no write dependency
- High-throughput paths (transactions add latency and reduce throughput)

### **Transaction Timeouts**

Configure transaction timeout to prevent locks from hanging:

```typescript
session.withTransaction(fn, { maxCommitTimeMS: 5000 });
```

---

## 25. Security Considerations

### **Never Expose Internal Fields**

The following fields must **never** appear in an API response:

| Field | Reason |
|-------|--------|
| `password` | Credential |
| `refreshToken` | Credential |
| `isDeleted` | Internal flag |
| `deletedAt` | Internal flag |
| `deletedBy` | Internal field |
| `__v` | Mongoose internal |

```typescript
// ✅ Exclude sensitive/internal fields in all queries
.select('-password -refreshToken -isDeleted -deletedAt -deletedBy -__v')
```

### **Never Trust Client-Supplied IDs Without Validation**

Always validate ObjectId format before use to prevent injection and `CastError` crashes:

```typescript
if (!Types.ObjectId.isValid(id)) {
  throw new BadRequestException('Invalid identifier format');
}
```

### **Sanitize Query Filter Inputs**

Never spread user-supplied objects directly into a MongoDB filter. This opens NoSQL injection vectors:

```typescript
// ❌ Never do this
const results = await this.model.find(req.query).exec();

// ✅ Build filter explicitly from validated DTO fields
const filter: FilterQuery<Entity> = {};
if (query.isActive !== undefined) filter.isActive = query.isActive;
if (query.search) filter.$text = { $search: query.search };
```

### **Field-Level Access Control**

Use `.select()` in repositories to enforce field-level access based on user role where necessary. Admin endpoints may return more fields than public endpoints.

---

## 26. Backup & Restore Recommendations

### **Backup Strategy**

| Environment | Strategy | Frequency |
|-------------|----------|-----------|
| Development | Docker volume only | N/A |
| Staging | `mongodump` or Atlas snapshot | Daily |
| Production | MongoDB Atlas continuous backup | Hourly + point-in-time |

### **Mongodump for Portable Backups**

```bash
# Backup
mongodump --uri="mongodb://localhost:27017/ai-publishing" --out=./backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/ai-publishing" ./backup/20240101
```

### **Index Rebuild After Restore**

After a full restore, trigger an index rebuild to ensure indexes are consistent:

```bash
db.runCommand({ reIndex: 'categories' })
```

### **Never Restore Directly to Production**

Always restore to a staging environment first, verify data integrity, then promote. Never run `mongorestore` directly against the production cluster.

---

## 27. Future Scalability Guidelines

### **Sharding Readiness**

Design documents to be shard-friendly before sharding becomes necessary:

- Avoid monotonically increasing shard keys (e.g., `ObjectId` alone is a poor shard key for write-heavy collections)
- Prefer compound shard keys: `{ tenantId: 1, _id: 1 }` when multi-tenancy is added
- Keep document size under 4KB where possible to avoid cross-shard aggregation overhead

### **TTL Indexes for Expiring Data**

For temporary data (sessions, OTPs, rate limit counters):

```typescript
// Automatically delete documents 1 hour after createdAt
SessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });
```

### **Horizontal Read Scaling**

Design for MongoDB replica set read preference:

- Route long analytics queries to `secondaryPreferred`
- Keep write operations on the `primary`
- Use connection pooling via Mongoose (configured in `DatabaseModule`)

### **Archive Strategy**

For collections expected to grow beyond 100M documents:

- Implement an archive pattern: hot collection (recent) + cold archive collection
- Move documents older than N months to archive collection
- Provide API flag to query archive (`includeArchived: true`)

### **Schema Evolution**

- Keep schemas backward-compatible during rolling deployments
- New required fields must have defaults during transition
- Use feature flags to enable new schema behaviour incrementally

---

## 28. Example Collection Template

This is the minimum-compliant template for every new collection in this project:

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// -- Enums (if any) --
export enum EntityStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

// -- Schema --
@Schema({ timestamps: true, collection: 'entities' })
export class Entity extends Document {
  // ── Business fields ────────────────────────────────────────
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
    index: true,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/,
    maxlength: 200,
  })
  slug: string;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  @Prop({ type: String, enum: EntityStatus, default: EntityStatus.ACTIVE })
  status: EntityStatus;

  // ── Common required fields ─────────────────────────────────
  @Prop({ default: true, index: true })
  isActive: boolean;

  // ── Soft delete ────────────────────────────────────────────
  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  deletedBy: Types.ObjectId | null;

  // ── Audit ─────────────────────────────────────────────────
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy: Types.ObjectId | null;

  // ── Auto-timestamps (via @Schema timestamps: true) ─────────
  createdAt: Date;
  updatedAt: Date;
}

// -- Schema factory --
export const EntitySchema = SchemaFactory.createForClass(Entity);

// ── Indexes ────────────────────────────────────────────────────
EntitySchema.index({ slug: 1 }, { unique: true });
EntitySchema.index({ isActive: 1, isDeleted: 1 });
EntitySchema.index({ createdAt: -1 });
EntitySchema.index(
  { name: 'text', description: 'text' },
  { name: 'idx_text_search' },
);

// ── Query middleware — auto-exclude soft-deleted documents ─────
EntitySchema.pre(/^find/, function (next) {
  const query = this as any;
  if (!query.getOptions()?.includeDeleted) {
    query.where({ isDeleted: { $ne: true } });
  }
  next();
});

// ── Schema-level validations ───────────────────────────────────
EntitySchema.path('slug').validate(
  (value: string) => /^[a-z0-9-]+$/.test(value),
  'Slug must contain only lowercase letters, numbers, and hyphens',
);
```

---

## 29. Things Never Allowed

### **Absolutely Forbidden**

❌ **Hard delete in production code**
```typescript
// Never do this
await this.model.deleteOne({ _id: id });
await this.model.deleteMany({ isDeleted: true });
```

❌ **Unbounded `find()` without `.limit()`**
```typescript
// Never do this — could return millions of documents
const all = await this.model.find().exec();
```

❌ **Spreading user input into query filters**
```typescript
// Never do this — NoSQL injection vector
const results = await this.model.find({ ...req.body }).exec();
const results = await this.model.find(req.query as any).exec();
```

❌ **ObjectId without validation**
```typescript
// Never do this — throws CastError on invalid strings
await this.model.findById(userSuppliedId).exec();
```

❌ **`.find()` without `.lean()` for read operations**
```typescript
// Never do this for pure reads — unnecessary overhead
const docs = await this.model.find().exec();
```

❌ **Storing secrets in the database**
```typescript
// Never store plaintext passwords, API keys, tokens
@Prop({ required: true })
password: string;  // Must be bcrypt-hashed before storage
```

❌ **Disabling the `isDeleted` query middleware**
```typescript
// Never remove this middleware — soft delete depends on it
// EntitySchema.pre(/^find/, ...) must stay in every schema
```

❌ **Defining `createdAt` / `updatedAt` as `@Prop()`**
```typescript
// Never do this — breaks Mongoose timestamps plugin
@Prop({ required: true })
createdAt: Date;
```

❌ **Missing audit fields on a new schema**
```typescript
// Never ship a schema without createdBy, updatedBy, isDeleted, deletedAt, deletedBy
@Schema({ timestamps: true, collection: 'widgets' })
export class Widget extends Document {
  @Prop({ required: true })
  name: string;
  // ❌ Missing: createdBy, updatedBy, isDeleted, deletedAt, deletedBy
}
```

❌ **Non-explicit collection name**
```typescript
// Never do this — Mongoose infers the name, which may be wrong after refactoring
@Schema({ timestamps: true })
export class Category extends Document {}
```

❌ **Using `$where` or JavaScript operators in queries**
```typescript
// Never do this — bypasses indexes, opens injection risk
await this.model.find({ $where: 'this.name.length > 5' }).exec();
```

❌ **Fetching documents to count them**
```typescript
// Never do this — loads entire result set into memory
const count = (await this.model.find(filter).exec()).length;
```

❌ **`skip()` beyond 100k documents without cursor pagination**
```typescript
// Never do this at scale — degrades O(n) with skip value
await this.model.find().skip(500000).limit(10).exec();
// Use cursor pagination instead
```

---

## Summary

| Concern | Standard |
|---------|----------|
| Collection names | `snake_case`, plural |
| Field names | `camelCase` |
| Primary key | MongoDB ObjectId (`_id`) |
| Soft delete | Always — `isDeleted` + `deletedAt` + `deletedBy` |
| Audit fields | Always — `createdBy` + `updatedBy` |
| Timestamps | `@Schema({ timestamps: true })` |
| Indexes | Declare after `SchemaFactory.createForClass()` |
| Reads | Always `.lean()` + `.exec()` |
| Pagination | Offset (< 100k docs) or Cursor (> 100k docs) |
| Slugs | `/^[a-z0-9-]+$/`, max 200 chars |
| Enums | String values, lowercase |
| Transactions | Only for multi-collection atomic writes |
| Hard delete | Never |

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-12  
**Applies To**: All MongoDB collections in the AI Publishing Company monorepo
