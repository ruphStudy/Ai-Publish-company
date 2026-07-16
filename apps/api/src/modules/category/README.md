# Category Module

## Overview

The Category Module implements a complete CRUD API for managing content categories in the AI Publishing Company platform. It follows enterprise-grade architecture patterns with proper separation of concerns, validation, error handling, and documentation.

## Architecture

The module follows the **Repository Pattern** and **Layered Architecture**:

```
Controller (HTTP Layer)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Entity/Schema (Database Model)
```

## Folder Structure

```
category/
├── dto/                           # Data Transfer Objects
│   ├── create-category.dto.ts    # Create request validation
│   ├── update-category.dto.ts    # Update request validation
│   ├── query-category.dto.ts     # Query/filter parameters
│   ├── category-response.dto.ts  # Response serialization
│   └── index.ts                   # Barrel export
├── entities/                      # Database Schemas
│   ├── category.entity.ts        # Category MongoDB schema
│   └── subcategory.entity.ts     # Subcategory schema (future)
├── category.controller.ts         # HTTP endpoints
├── category.service.ts            # Business logic
├── category.repository.ts         # Database operations
├── category.module.ts             # Module registration
└── README.md                      # Documentation
```

## Features Implemented

### ✅ CRUD Operations
- **Create** - POST `/categories`
- **Read All** - GET `/categories` (with pagination)
- **Read One** - GET `/categories/:id`
- **Read by Slug** - GET `/categories/slug/:slug`
- **Update** - PUT `/categories/:id`
- **Delete** - DELETE `/categories/:id` (soft delete)
- **Restore** - POST `/categories/:id/restore`

### ✅ Data Management
- **Soft Delete** - Categories are marked as deleted, not removed from database
- **Active/Inactive Status** - Toggle category visibility
- **Display Order** - Control category order in listings
- **Slug Generation** - Auto-generate URL-friendly slugs from names
- **Audit Fields** - Track who created/updated/deleted categories

### ✅ Search & Filtering
- **Full-Text Search** - Search by name or description
- **Active Filter** - Filter by active/inactive status
- **Pagination** - Page-based navigation with configurable page size
- **Sorting** - Sort by name, order, createdAt, updatedAt (asc/desc)

### ✅ Validation
- **Duplicate Prevention** - Prevent duplicate category names (case-insensitive)
- **Unique Slugs** - Ensure slug uniqueness across categories
- **Input Validation** - All DTOs validated with class-validator
- **Business Rules** - Enforce constraints at service layer

### ✅ Performance
- **MongoDB Indexes** - Optimized for common queries
  - Unique index on `slug`
  - Compound index on `isActive` + `isDeleted`
  - Text search index on `name` + `description`
  - Sorting indexes on `order`, `createdAt`
- **Lean Queries** - Return plain objects instead of Mongoose documents
- **Field Selection** - Exclude unnecessary fields (isDeleted, __v)
- **Parallel Queries** - Fetch data and count simultaneously

### ✅ Documentation
- **Swagger/OpenAPI** - Full API documentation with examples
- **TypeScript Types** - Complete type safety
- **JSDoc Comments** - Inline code documentation

### ✅ Security
- **Authentication** - JWT-based authentication required
- **Authorization** - Role-based access control
  - **ADMIN** - Full access (create, update, delete, restore)
  - **EDITOR** - Create and update categories
  - **VIEWER** - Read-only access
- **Input Sanitization** - Validation prevents injection attacks

## Database Schema

### Category Entity

| Field       | Type      | Required | Indexed | Description                        |
|-------------|-----------|----------|---------|------------------------------------|
| name        | String    | Yes      | Yes     | Category name (2-100 chars)        |
| slug        | String    | Yes      | Unique  | URL-friendly identifier            |
| description | String    | No       | Text    | Category description (max 500)     |
| icon        | String    | No       | No      | Icon identifier or URL             |
| color       | String    | No       | No      | Hex color code                     |
| order       | Number    | Yes      | Yes     | Display order (default: 0)         |
| isActive    | Boolean   | Yes      | Yes     | Active status (default: true)      |
| isDeleted   | Boolean   | Yes      | Yes     | Soft delete flag (default: false)  |
| deletedAt   | Date      | No       | No      | Deletion timestamp                 |
| deletedBy   | ObjectId  | No       | No      | User who deleted                   |
| createdBy   | ObjectId  | Yes      | No      | User who created                   |
| updatedBy   | ObjectId  | No       | No      | User who last updated              |
| createdAt   | Date      | Auto     | Yes     | Creation timestamp                 |
| updatedAt   | Date      | Auto     | No      | Last update timestamp              |

### Indexes

```typescript
// Unique slug
{ slug: 1 } - UNIQUE

// Name lookup
{ name: 1 }

// Active filter
{ isActive: 1, isDeleted: 1 }

// Display order
{ order: 1 }

// Recent categories
{ createdAt: -1 }

// Full-text search
{ name: 'text', description: 'text' }
```

## API Endpoints

### Create Category
```http
POST /categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Technology",
  "description": "All technology-related content",
  "icon": "tech-icon",
  "color": "#3B82F6",
  "order": 0,
  "isActive": true
}
```

**Response:**
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

### Get All Categories
```http
GET /categories?search=tech&isActive=true&sortBy=order&sortOrder=asc&page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
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
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Category by ID
```http
GET /categories/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

### Get Category by Slug
```http
GET /categories/slug/technology
Authorization: Bearer <token>
```

### Update Category
```http
PUT /categories/507f1f77bcf86cd799439011
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tech & Innovation",
  "isActive": false
}
```

### Delete Category (Soft Delete)
```http
DELETE /categories/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Restore Category
```http
POST /categories/507f1f77bcf86cd799439011/restore
Authorization: Bearer <token>
```

## Query Parameters

| Parameter   | Type    | Default   | Description                          |
|-------------|---------|-----------|--------------------------------------|
| search      | string  | -         | Search in name and description       |
| isActive    | boolean | -         | Filter by active status              |
| sortBy      | string  | order     | Sort field (name, order, createdAt)  |
| sortOrder   | string  | asc       | Sort direction (asc, desc)           |
| page        | number  | 1         | Page number (min: 1)                 |
| limit       | number  | 10        | Items per page (1-100)               |

## Validation Rules

### Create Category
- **name**: Required, 2-100 characters
- **slug**: Optional, lowercase alphanumeric + hyphens (auto-generated if not provided)
- **description**: Optional, max 500 characters
- **icon**: Optional, string
- **color**: Optional, valid hex color code
- **order**: Optional, non-negative number (auto-incremented if not provided)
- **isActive**: Optional, boolean (default: true)

### Update Category
- All fields optional (same validation as create)
- Cannot update to duplicate name or slug

## Business Logic

### Slug Generation
1. Convert name to lowercase
2. Remove special characters
3. Replace spaces with hyphens
4. Remove multiple consecutive hyphens
5. Trim leading/trailing hyphens

**Example:** `"Tech & Innovation!"` → `"tech-innovation"`

### Duplicate Prevention
- **Name:** Case-insensitive uniqueness check
- **Slug:** Exact match uniqueness check
- Checks exclude the current category when updating

### Auto-Ordering
If `order` is not provided during creation, the system automatically assigns the next available order number (highest existing order + 1).

### Soft Delete Behavior
- Sets `isDeleted = true`
- Records `deletedAt` timestamp
- Records `deletedBy` user ID
- Automatically excluded from all queries (via query middleware)
- Can be restored by ADMIN users

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (delete)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate name/slug)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "statusCode": 409,
  "errorCode": "VALIDATION_ERROR",
  "message": "Category with name \"Technology\" already exists",
  "path": "/categories",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Usage Examples

### TypeScript Client
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Create category
const category = await api.post('/categories', {
  name: 'Technology',
  description: 'Tech content',
});

// Get all categories
const { data } = await api.get('/categories', {
  params: {
    search: 'tech',
    isActive: true,
    page: 1,
    limit: 10,
  },
});

// Update category
await api.put(`/categories/${id}`, {
  name: 'New Name',
});

// Delete category
await api.delete(`/categories/${id}`);
```

## Testing Checklist

- [ ] Create category with all fields
- [ ] Create category with minimal fields (auto-generate slug & order)
- [ ] Prevent duplicate names (case-insensitive)
- [ ] Prevent duplicate slugs
- [ ] Get all categories with pagination
- [ ] Search categories by text
- [ ] Filter by active status
- [ ] Sort by different fields (asc/desc)
- [ ] Get category by ID
- [ ] Get category by slug
- [ ] Update category name (auto-update slug)
- [ ] Update category with duplicate name (should fail)
- [ ] Soft delete category
- [ ] Verify soft-deleted category excluded from queries
- [ ] Restore deleted category
- [ ] Role-based access (ADMIN, EDITOR, VIEWER)
- [ ] Unauthorized access (no token)

## Future Enhancements

- [ ] Bulk operations (bulk create, update, delete)
- [ ] Category reordering (drag-and-drop)
- [ ] Category analytics (usage stats)
- [ ] Category hierarchy (parent-child relationships)
- [ ] Image upload for category icons
- [ ] Duplicate category detection (fuzzy matching)
- [ ] Category export (CSV, JSON)
- [ ] Category import (CSV, JSON)
- [ ] Category versioning (history tracking)
- [ ] Category templates

## Related Modules

- **Subcategory Module** - Coming soon
- **Auth Module** - Provides authentication & authorization
- **Audit Module** - Tracks user actions

## Notes

- Subcategory entity exists but is not implemented yet
- All timestamps are in UTC
- MongoDB ObjectId is used for references
- Soft delete is preferred over hard delete for data integrity
- Index strategy optimized for read-heavy workloads
