# MongoDB Collections Schema Documentation

## Sprint 1 Collections

### 1. Users Collection

**Collection Name:** `users`

**Purpose:** Store user accounts with authentication and authorization data

**Schema:**
```typescript
{
  _id: ObjectId,
  email: string (unique, required, lowercase, indexed),
  password: string (required, hashed, select: false),
  firstName: string (required, 2-50 chars),
  lastName: string (required, 2-50 chars),
  roles: [string] (enum: admin|editor|viewer, default: viewer),
  isActive: boolean (default: true, indexed),
  refreshToken: string (nullable, select: false),
  isDeleted: boolean (default: false, indexed),
  deletedAt: Date (nullable),
  deletedBy: ObjectId (ref: User, nullable),
  createdBy: ObjectId (ref: User, required),
  updatedBy: ObjectId (ref: User, nullable),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `{ email: 1 }` - Unique login lookup
- `{ isActive: 1, isDeleted: 1 }` - Active user queries
- `{ createdAt: -1 }` - Recent users
- `{ roles: 1 }` - Role-based queries

---

### 2. Categories Collection

**Collection Name:** `categories`

**Purpose:** Top-level content categorization

**Schema:**
```typescript
{
  _id: ObjectId,
  name: string (required, 2-100 chars, indexed),
  slug: string (unique, required, lowercase, url-friendly),
  description: string (max 500 chars),
  icon: string (nullable),
  color: string (nullable),
  order: number (default: 0, min: 0),
  isActive: boolean (default: true, indexed),
  isDeleted: boolean (default: false, indexed),
  deletedAt: Date (nullable),
  deletedBy: ObjectId (ref: User, nullable),
  createdBy: ObjectId (ref: User, required),
  updatedBy: ObjectId (ref: User, nullable),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `{ slug: 1 }` - Unique, URL routing
- `{ name: 1 }` - Name lookup
- `{ isActive: 1, isDeleted: 1 }` - Active categories
- `{ order: 1 }` - Display ordering
- `{ createdAt: -1 }` - Recent categories
- `{ name: 'text', description: 'text' }` - Full-text search

**Relationships:**
- Referenced by: Subcategory.categoryId

---

### 3. Subcategories Collection

**Collection Name:** `subcategories`

**Purpose:** Second-level content categorization under categories

**Schema:**
```typescript
{
  _id: ObjectId,
  name: string (required, 2-100 chars, indexed),
  slug: string (required, lowercase, url-friendly),
  description: string (max 500 chars),
  categoryId: ObjectId (ref: Category, required, indexed),
  icon: string (nullable),
  order: number (default: 0, min: 0),
  isActive: boolean (default: true, indexed),
  isDeleted: boolean (default: false, indexed),
  deletedAt: Date (nullable),
  deletedBy: ObjectId (ref: User, nullable),
  createdBy: ObjectId (ref: User, required),
  updatedBy: ObjectId (ref: User, nullable),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `{ categoryId: 1, slug: 1 }` - Unique within category
- `{ categoryId: 1, order: 1 }` - Ordered list per category
- `{ name: 1 }` - Name lookup
- `{ isActive: 1, isDeleted: 1 }` - Active subcategories
- `{ createdAt: -1 }` - Recent subcategories
- `{ categoryId: 1, isActive: 1, isDeleted: 1 }` - Active by category
- `{ name: 'text', description: 'text' }` - Full-text search

**Relationships:**
- Parent: Category (via categoryId)

---

### 4. Audit Logs Collection

**Collection Name:** `audit_logs`

**Purpose:** Immutable audit trail for all system actions

**Schema:**
```typescript
{
  _id: ObjectId,
  action: string (enum: create|update|delete|restore|login|logout|register|password_change|role_change, required, indexed),
  entityType: string (enum: User|Category|Subcategory, required, indexed),
  entityId: ObjectId (required, indexed),
  performedBy: ObjectId (ref: User, required, indexed),
  ipAddress: string,
  userAgent: string,
  changes: object (field-level changes),
  previousValues: object (before state),
  newValues: object (after state),
  metadata: object (additional context),
  description: string (max 500 chars),
  isSystem: boolean (default: false, system-generated actions),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `{ action: 1, entityType: 1 }` - Action type queries
- `{ entityType: 1, entityId: 1 }` - Entity history
- `{ performedBy: 1, createdAt: -1 }` - User activity timeline
- `{ createdAt: -1 }` - Recent activity
- `{ entityId: 1, createdAt: -1 }` - Entity timeline
- `{ entityType: 1, entityId: 1, createdAt: -1 }` - Compound entity history
- `{ performedBy: 1, action: 1, createdAt: -1 }` - User action history
- `{ createdAt: 1 }` - TTL index (expires after 2 years)

**Special Properties:**
- **Immutable:** Cannot be updated or deleted
- **Auto-expire:** Logs older than 2 years are automatically removed

---

## Common Patterns

### Soft Delete
All collections (except AuditLog) support soft delete:
- `isDeleted: boolean` - Marks record as deleted
- `deletedAt: Date` - Timestamp of deletion
- `deletedBy: ObjectId` - User who deleted the record
- Query middleware automatically excludes soft-deleted records

### Audit Fields
All collections track:
- `createdBy: ObjectId` - User who created the record
- `updatedBy: ObjectId` - User who last updated the record
- `createdAt: Date` - Creation timestamp
- `updatedAt: Date` - Last update timestamp

### Timestamps
All collections use `{ timestamps: true }` for automatic:
- `createdAt` - Set on insert
- `updatedAt` - Updated on every modification

---

## Relationships

```
User (1) ──┬─> (N) Categories (createdBy)
           ├─> (N) Subcategories (createdBy)
           └─> (N) AuditLogs (performedBy)

Category (1) ──> (N) Subcategories (categoryId)
```

---

## Validation Rules

### Slug Validation
- Pattern: `/^[a-z0-9-]+$/`
- Only lowercase letters, numbers, and hyphens
- Used for URL-friendly identifiers

### Email Validation
- Automatically lowercased
- Unique constraint
- Format validated by class-validator

### Password Requirements
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- Stored as bcrypt hash (12 rounds)

---

## Query Patterns

### Find Active Records
```typescript
await model.find({ isActive: true });
// Soft-deleted records excluded automatically
```

### Include Soft-Deleted Records
```typescript
await model.find().setOptions({ includeDeleted: true });
```

### Find by Category
```typescript
await subcategoryModel.find({ categoryId: categoryId, isActive: true });
```

### Audit Trail for Entity
```typescript
await auditLogModel.find({ 
  entityType: 'Category',
  entityId: categoryId 
}).sort({ createdAt: -1 });
```
