# CODING STANDARDS

> **Enterprise-Level Coding Standards for AI Publishing Company**  
> For AI Assistants, Developers, and Code Reviewers

---

## 1. General Coding Principles

### **Write Code for Humans First**
- Code is read 10x more than it's written
- Prioritize clarity over cleverness
- Self-documenting code > excessive comments
- If you need a comment to explain "what", refactor the code

### **Explicit Over Implicit**
- No magic numbers or strings
- Named constants for all hard-coded values
- Explicit types, avoid type inference for public APIs
- Clear function names that describe intent

### **Fail Fast**
- Validate inputs at boundaries (controllers, services)
- Throw errors early, don't propagate invalid state
- Use guards and validation pipes
- Configuration errors should crash on startup

### **Progressive Disclosure**
- Start with simple implementations
- Add complexity only when needed
- Don't over-engineer for hypothetical futures
- Refactor when patterns emerge, not before

### **Consistency Trumps Preference**
- Follow existing patterns in the codebase
- Match the style of the file you're editing
- Don't mix patterns within a module
- Use established conventions from ARCHITECTURE.md

---

## 2. Clean Architecture Rules

### **Dependency Direction**
```
External World (HTTP, DB, Queue)
         ↓
    Controllers (Infrastructure)
         ↓
     Services (Business Logic)
         ↓
    Repositories (Data Access)
         ↓
    Entities (Domain Models)
```

**Rules**:
- Inner layers never depend on outer layers
- Business logic (services) depends on abstractions, not implementations
- Controllers depend on services, not repositories
- Repositories depend on entities
- Cross-layer dependencies go through interfaces

### **Separation of Concerns**
- **Controllers**: HTTP request/response handling only
- **Services**: Business logic, orchestration, validation
- **Repositories**: Database operations, query building
- **Entities**: Data structure, schema validation
- **DTOs**: Data transfer, validation rules

### **Single Responsibility**
- One module per domain concept (e.g., category, user, article)
- One service method per business operation
- One repository method per query type
- One controller endpoint per HTTP operation

---

## 3. SOLID Principles

### **S - Single Responsibility Principle**
✅ **Good**:
```typescript
class CategoryService {
  create(dto: CreateCategoryDto) { }
  update(id: string, dto: UpdateCategoryDto) { }
}

class CategorySlugGenerator {
  generate(name: string): string { }
}
```

❌ **Bad**:
```typescript
class CategoryService {
  create(dto: CreateCategoryDto) { }
  sendEmailNotification() { }  // Different responsibility
  uploadImage() { }             // Different responsibility
}
```

### **O - Open/Closed Principle**
Open for extension, closed for modification.

✅ **Good**:
```typescript
abstract class BaseRepository<T> {
  abstract findById(id: string): Promise<T>;
  abstract create(entity: T): Promise<T>;
}

class CategoryRepository extends BaseRepository<Category> {
  // Extends functionality without modifying base
}
```

### **L - Liskov Substitution Principle**
Derived classes must be substitutable for base classes.

✅ **Good**:
```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
}

class CategoryRepository implements Repository<Category> {
  async findById(id: string): Promise<Category | null> {
    // Implementation matches contract
  }
}
```

### **I - Interface Segregation Principle**
Many specific interfaces > one general interface.

✅ **Good**:
```typescript
interface Readable<T> {
  findById(id: string): Promise<T>;
}

interface Writable<T> {
  create(entity: T): Promise<T>;
  update(id: string, entity: T): Promise<T>;
}
```

❌ **Bad**:
```typescript
interface Repository<T> {
  findById(id: string): Promise<T>;
  create(entity: T): Promise<T>;
  update(id: string, entity: T): Promise<T>;
  delete(id: string): Promise<void>;
  sendEmail(): void;  // Unrelated to repository
}
```

### **D - Dependency Inversion Principle**
Depend on abstractions, not concretions.

✅ **Good**:
```typescript
@Injectable()
class CategoryService {
  constructor(
    private readonly repository: CategoryRepository,  // Abstraction
  ) {}
}
```

---

## 4. DRY, KISS, and YAGNI Guidelines

### **DRY (Don't Repeat Yourself)**

✅ **Good**:
```typescript
// Shared in packages/shared/src/utils
export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-');
}

// Used in multiple services
this.slug = slugify(this.name);
```

❌ **Bad**:
```typescript
// Duplicated in CategoryService
private slugify(text: string) { /* implementation */ }

// Duplicated in ArticleService
private slugify(text: string) { /* same implementation */ }
```

**Rule**: Extract to shared package after 2nd duplication.

### **KISS (Keep It Simple, Stupid)**

✅ **Good**:
```typescript
async findById(id: string): Promise<Category | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return this.categoryModel.findById(id).lean().exec();
}
```

❌ **Bad**:
```typescript
async findById(id: string): Promise<Category | null> {
  try {
    const isValid = this.validateObjectId(id);
    if (!isValid) throw new Error('Invalid ID');
    const result = await this.executeQuery(() => 
      this.categoryModel.findById(id).lean().exec()
    );
    return result || null;
  } catch (error) {
    if (error.message === 'Invalid ID') return null;
    throw error;
  }
}
```

### **YAGNI (You Aren't Gonna Need It)**

✅ **Good**:
```typescript
// Implement only what's needed now
class CreateCategoryDto {
  name: string;
  description?: string;
}
```

❌ **Bad**:
```typescript
// Over-engineering for future features
class CreateCategoryDto {
  name: string;
  description?: string;
  futureField1?: string;  // Not needed yet
  futureField2?: number;  // Not needed yet
  metadata?: Record<string, any>;  // Speculative
}
```

---

## 5. Naming Conventions

### **Variables**
- **camelCase** for all variables
- Descriptive names, avoid abbreviations
- Boolean variables start with `is`, `has`, `should`, `can`

```typescript
// ✅ Good
const categoryName = 'Technology';
const isActive = true;
const hasChildren = false;
const shouldValidate = true;

// ❌ Bad
const cat = 'Technology';  // Abbreviation
const active = true;       // Missing prefix
const x = 10;              // Not descriptive
```

### **Functions/Methods**
- **camelCase** for functions and methods
- Verb or verb phrase describing action
- Async functions should be obvious from context

```typescript
// ✅ Good
async createCategory(dto: CreateCategoryDto): Promise<Category>
async findById(id: string): Promise<Category | null>
validateSlug(slug: string): boolean
transformToDto(entity: Category): CategoryResponseDto

// ❌ Bad
async category(dto: CreateCategoryDto)  // Not a verb
async get(id: string)                   // Too generic
check(slug: string)                     // Unclear return
dto(entity: Category)                   // Not descriptive
```

### **Classes**
- **PascalCase** for all classes
- Noun or noun phrase
- Suffix indicates purpose: `Service`, `Controller`, `Repository`, `Module`, `Dto`, `Entity`

```typescript
// ✅ Good
class CategoryService { }
class CategoryController { }
class CategoryRepository { }
class CreateCategoryDto { }
class Category { }

// ❌ Bad
class categoryService { }      // Wrong case
class HandleCategories { }     // Verb, not noun
class CategorySvc { }          // Abbreviation
```

### **Interfaces**
- **PascalCase** with descriptive name
- **No** `I` prefix
- Use noun phrases

```typescript
// ✅ Good
interface Repository<T> { }
interface PaginatedResult<T> { }
interface Logger { }

// ❌ Bad
interface IRepository<T> { }   // Don't use I prefix
interface RepositoryInterface { }  // Redundant suffix
```

### **Enums**
- **PascalCase** for enum name
- **SCREAMING_SNAKE_CASE** for values

```typescript
// ✅ Good
enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

// ❌ Bad
enum UserRole {
  Admin = 'admin',    // Wrong case
  editor = 'editor',  // Wrong case
}
```

### **Constants**
- **SCREAMING_SNAKE_CASE** for true constants
- **camelCase** for configuration objects

```typescript
// ✅ Good
const MAX_PAGE_SIZE = 100;
const DEFAULT_TIMEOUT = 5000;
const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

const databaseConfig = {
  host: 'localhost',
  port: 27017,
};

// ❌ Bad
const maxPageSize = 100;  // Should be SCREAMING_SNAKE_CASE
const DATABASE_CONFIG = { };  // Should be camelCase for objects
```

### **Files**
- **kebab-case** for all files
- Suffix indicates type: `.service.ts`, `.controller.ts`, `.dto.ts`, `.entity.ts`, `.module.ts`

```
✅ Good:
create-category.dto.ts
category.service.ts
category.controller.ts
category.repository.ts
category.entity.ts
category.module.ts
jwt-auth.guard.ts

❌ Bad:
CreateCategoryDto.ts       // PascalCase
category_service.ts        // snake_case
categoryService.ts         // camelCase
CategoryService.ts         // PascalCase
```

### **Folders**
- **kebab-case** for all folders
- Singular for feature modules
- Plural for collections

```
✅ Good:
src/modules/category/
src/modules/auth/
src/common/filters/
src/common/guards/
apps/api/
packages/shared/

❌ Bad:
src/modules/categories/     // Should be singular
src/modules/Category/        // PascalCase
src/common/Filter/           // PascalCase
```

---

## 6. Folder Structure Standards

### **Module Structure**
Every feature module must follow this structure:

```
module-name/
├── dto/
│   ├── create-module.dto.ts
│   ├── update-module.dto.ts
│   ├── query-module.dto.ts
│   ├── module-response.dto.ts
│   └── index.ts
├── entities/
│   └── module.entity.ts
├── module.controller.ts
├── module.service.ts
├── module.repository.ts
├── module.module.ts
├── index.ts
└── README.md (optional but recommended)
```

### **DTO Folder Rules**
- One DTO per file
- Group related DTOs in `dto/` folder
- Always export via `index.ts`

### **Entity Folder Rules**
- Database schemas in `entities/` folder
- One entity per file
- Export schema and factory

### **Barrel Exports**
Every folder with multiple files must have `index.ts`:

```typescript
// dto/index.ts
export * from './create-category.dto';
export * from './update-category.dto';
export * from './query-category.dto';
export * from './category-response.dto';
```

---

## 7. DTO Standards

### **Create DTO**
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Technology',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'All tech content',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
```

**Rules**:
- Use `@ApiProperty` for required fields
- Use `@ApiPropertyOptional` for optional fields
- Always include `description` and `example`
- Stack validators: `@IsString()` before `@IsNotEmpty()`
- Optional fields use `?:` syntax

### **Update DTO**
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  // All fields from CreateCategoryDto become optional
  // Add update-specific fields here if needed
}
```

**Rules**:
- Extend `PartialType(CreateDto)` for consistency
- Don't duplicate validation from Create DTO
- Only add update-specific fields

### **Query DTO**
```typescript
export class QueryCategoryDto {
  @ApiPropertyOptional({ description: 'Search term' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ type: Boolean })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

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

**Rules**:
- Use `@Transform()` for boolean query params
- Use `@Type(() => Number)` for numeric query params
- Set sensible defaults in Swagger docs
- Validate ranges with `@Min()` and `@Max()`

### **Response DTO**
```typescript
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class CategoryResponseDto {
  @Expose({ name: '_id' })
  @Type(() => String)
  id: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date;
}
```

**Rules**:
- Use `@Exclude()` at class level
- Use `@Expose()` for each field to return
- Transform `_id` to `id` for clean API
- Exclude internal fields (isDeleted, __v, etc.)

---

## 8. Entity/Schema Standards

### **Entity Definition**
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'categories' })
export class Category extends Document {
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
  })
  slug: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy: Types.ObjectId | null;

  createdAt: Date;  // Auto-generated by timestamps
  updatedAt: Date;  // Auto-generated by timestamps
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexes
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ isActive: 1, isDeleted: 1 });
CategorySchema.index({ name: 'text', description: 'text' });

// Query middleware for soft delete
CategorySchema.pre(/^find/, function (next) {
  const query = this as any;
  if (!query.getOptions()?.includeDeleted) {
    query.where({ isDeleted: { $ne: true } });
  }
  next();
});
```

**Rules**:
- Always extend `Document`
- Enable `timestamps: true` for createdAt/updatedAt
- Specify `collection` name explicitly
- Include soft delete fields: `isDeleted`, `deletedAt`, `deletedBy`
- Include audit fields: `createdBy`, `updatedBy`
- Add indexes after schema creation
- Use query middleware to exclude soft-deleted records

---

## 9. Repository Standards

### **Repository Pattern**
```typescript
@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
  ) {}

  async create(dto: CreateCategoryDto, userId: Types.ObjectId): Promise<Category> {
    const entity = new this.categoryModel({
      ...dto,
      createdBy: userId,
    });
    return entity.save();
  }

  async findById(id: string): Promise<Category | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    
    return this.categoryModel
      .findById(id)
      .select('-isDeleted -deletedAt -deletedBy -__v')
      .lean()
      .exec() as any;
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    userId: Types.ObjectId,
  ): Promise<Category | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    return this.categoryModel
      .findByIdAndUpdate(
        id,
        { ...dto, updatedBy: userId },
        { new: true },
      )
      .select('-isDeleted -deletedAt -deletedBy -__v')
      .lean()
      .exec() as any;
  }

  async softDelete(id: string, userId: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const result = await this.categoryModel
      .updateOne(
        { _id: id },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: userId,
        },
      )
      .exec();

    return result.modifiedCount > 0;
  }
}
```

**Rules**:
- One repository per entity
- Only database operations, no business logic
- Validate ObjectId before queries
- Use `.lean()` for read operations (better performance)
- Use `.select()` to exclude internal fields
- Return `null` for not found, not exceptions
- Always populate audit fields (createdBy, updatedBy, deletedBy)
- Use soft delete by default

---

## 10. Service Standards

### **Service Pattern**
```typescript
@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async create(dto: CreateCategoryDto, userId: string): Promise<CategoryResponseDto> {
    // Validate business rules
    const existingByName = await this.categoryRepository.findByName(dto.name);
    if (existingByName) {
      throw new ConflictException(`Category with name "${dto.name}" already exists`);
    }

    // Generate derived values
    const slug = dto.slug || this.generateSlug(dto.name);

    // Delegate to repository
    const category = await this.categoryRepository.create(
      { ...dto, slug },
      new Types.ObjectId(userId),
    );

    // Transform to response DTO
    return this.toResponseDto(category);
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id);
    
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return this.toResponseDto(category);
  }

  private generateSlug(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, '-');
  }

  private toResponseDto(category: Category): CategoryResponseDto {
    return {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
```

**Rules**:
- One service per domain
- Business logic only, delegate data access to repositories
- Throw exceptions for error cases (let global filter handle)
- Transform entities to response DTOs
- Private methods for utilities (slug generation, transformations)
- Validate business rules before database operations
- Use descriptive error messages

---

## 11. Controller Standards

### **Controller Pattern**
```typescript
@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, type: CategoryResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate category' })
  async create(
    @Body() createDto: CreateCategoryDto,
    @CurrentUser() user: User,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.create(createDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, type: PaginatedCategoryResponseDto })
  async findAll(
    @Query() query: QueryCategoryDto,
  ): Promise<PaginatedCategoryResponseDto> {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoryService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.categoryService.remove(id, user.id);
  }
}
```

**Rules**:
- HTTP layer only, delegate to services
- Use `@ApiTags()` for Swagger grouping
- Use `@UseGuards()` for authentication/authorization
- Document with `@ApiOperation()`, `@ApiResponse()`
- Use `@Roles()` decorator for role-based access
- Use `@CurrentUser()` to extract user from JWT
- Return DTOs, not entities
- Don't catch exceptions (let global filter handle)

---

## 12. Dependency Injection Rules

### **Constructor Injection**
✅ **Good**:
```typescript
@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly logger: Logger,
  ) {}
}
```

❌ **Bad**:
```typescript
@Injectable()
export class CategoryService {
  private categoryRepository: CategoryRepository;
  
  setCategoryRepository(repo: CategoryRepository) {
    this.categoryRepository = repo;
  }
}
```

### **Visibility Modifiers**
- Use `private readonly` for dependencies
- Use `private` for utility methods
- Use `public` only when necessary (usually not)

### **Injection Tokens**
```typescript
// ✅ Good: Use class as token
constructor(private readonly categoryService: CategoryService) {}

// ✅ Good: Use string token for interfaces
constructor(@Inject('LOGGER') private readonly logger: Logger) {}
```

---

## 13. Validation Rules

### **DTO Validation**
- Always validate at boundaries (controllers)
- Use class-validator decorators
- Chain validators for comprehensive checks
- Provide clear error messages

```typescript
@IsString({ message: 'Name must be a string' })
@IsNotEmpty({ message: 'Name is required' })
@MinLength(2, { message: 'Name must be at least 2 characters' })
@MaxLength(100, { message: 'Name must not exceed 100 characters' })
name: string;
```

### **Custom Validators**
```typescript
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsSlug(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSlug',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /^[a-z0-9-]+$/.test(value);
        },
        defaultMessage() {
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        },
      },
    });
  };
}
```

### **Global Validation Pipe**
Already configured in `main.ts`:
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,        // Auto-transform to DTO instances
    whitelist: true,        // Strip properties not in DTO
    forbidNonWhitelisted: true,  // Throw error for extra properties
  }),
);
```

---

## 14. Error Handling Standards

### **Use NestJS Built-in Exceptions**
```typescript
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

// ✅ Good
throw new NotFoundException(`Category with ID "${id}" not found`);
throw new ConflictException(`Category with name "${name}" already exists`);
throw new BadRequestException('Invalid input data');
```

### **Don't Catch Errors You Can't Handle**
```typescript
// ✅ Good: Let error propagate to global filter
async findOne(id: string): Promise<CategoryResponseDto> {
  const category = await this.categoryRepository.findById(id);
  if (!category) {
    throw new NotFoundException(`Category not found`);
  }
  return this.toResponseDto(category);
}

// ❌ Bad: Catching unnecessarily
async findOne(id: string): Promise<CategoryResponseDto> {
  try {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category not found`);
    }
    return this.toResponseDto(category);
  } catch (error) {
    throw error;  // Pointless catch
  }
}
```

### **Descriptive Error Messages**
- Include entity name and identifier
- Explain what went wrong
- Avoid technical jargon in user-facing messages

```typescript
// ✅ Good
throw new NotFoundException(`Category with ID "${id}" not found`);
throw new ConflictException(`Category with slug "${slug}" already exists`);

// ❌ Bad
throw new NotFoundException('Not found');
throw new ConflictException('Duplicate');
```

---

## 15. Logging Standards

### **Log Levels**
- **error**: Exceptions, failures, critical issues
- **warn**: Deprecations, unusual behavior
- **info**: Significant business events (user created, order placed)
- **debug**: Detailed debugging information (dev only)

### **Structured Logging**
```typescript
// ✅ Good: Structured
this.logger.log({
  message: 'Category created',
  categoryId: category.id,
  userId: user.id,
  timestamp: new Date(),
});

// ❌ Bad: Unstructured
this.logger.log(`Category ${category.id} created by ${user.id}`);
```

### **What to Log**
```typescript
// ✅ Good: Log business events
this.logger.log({ message: 'Category created', categoryId });
this.logger.error({ message: 'Failed to create category', error });

// ❌ Bad: Log too much
this.logger.debug({ message: 'Entering findById', id });
this.logger.debug({ message: 'Query executed', query });
this.logger.debug({ message: 'Result found', result });
```

### **Don't Log Sensitive Data**
- Never log passwords, tokens, API keys
- Redact sensitive fields in production
- Use correlation IDs instead of full user data

---

## 16. Configuration Standards

### **Environment Variables**
- Define all config in `configuration.ts`
- Validate with Joi schema in `env.validation.ts`
- Group by concern (api, database, redis, jwt)

```typescript
// configuration.ts
export default () => ({
  api: {
    port: parseInt(process.env.API_PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    uri: process.env.DATABASE_URI || 'mongodb://localhost:27017/ai-publishing',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
});
```

### **Validation Schema**
```typescript
// env.validation.ts
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  API_PORT: Joi.number().default(3000),
  DATABASE_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
});
```

---

## 17. Environment Variable Rules

### **Naming**
- SCREAMING_SNAKE_CASE
- Prefix with service name if in monorepo
- Group related variables with common prefix

```bash
# ✅ Good
NODE_ENV=production
API_PORT=3000
DATABASE_URI=mongodb://localhost:27017/ai-publishing
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
REDIS_HOST=localhost
REDIS_PORT=6379

# ❌ Bad
nodeEnv=production
port=3000
db=mongodb://localhost
secret=key
```

### **Required vs Optional**
- Mark required variables in Joi schema
- Provide sensible defaults for optional variables
- Fail fast on startup if required variables missing

### **.env.example**
- Always maintain `.env.example` with all variables
- Use placeholder values, not real secrets
- Document each variable

```bash
# .env.example
NODE_ENV=development
API_PORT=3000
DATABASE_URI=mongodb://localhost:27017/ai-publishing
JWT_SECRET=your-secret-key-change-in-production
```

---

## 18. TypeScript Best Practices

### **Type Safety**
```typescript
// ✅ Good: Explicit types
function createCategory(name: string): Promise<Category> {
  return this.categoryRepository.create({ name });
}

// ❌ Bad: Implicit any
function createCategory(name) {
  return this.categoryRepository.create({ name });
}
```

### **Avoid `any`**
```typescript
// ✅ Good: Use generics or unknown
function parseJson<T>(json: string): T {
  return JSON.parse(json);
}

function processData(data: unknown): void {
  if (typeof data === 'string') {
    // Type narrowing
  }
}

// ❌ Bad
function parseJson(json: string): any {
  return JSON.parse(json);
}
```

### **Use Type Guards**
```typescript
// ✅ Good
function isCategory(obj: unknown): obj is Category {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    'slug' in obj
  );
}

if (isCategory(data)) {
  console.log(data.name);  // TypeScript knows it's Category
}
```

### **Readonly When Appropriate**
```typescript
// ✅ Good
class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}
}

// Prevents accidental reassignment
```

---

## 19. Async/Await Rules

### **Always Use async/await**
```typescript
// ✅ Good
async findById(id: string): Promise<Category> {
  const category = await this.categoryRepository.findById(id);
  return category;
}

// ❌ Bad: Promise chains
findById(id: string): Promise<Category> {
  return this.categoryRepository.findById(id)
    .then(category => category);
}
```

### **Parallel Operations**
```typescript
// ✅ Good: Parallel
const [categories, total] = await Promise.all([
  this.categoryModel.find(filter).exec(),
  this.categoryModel.countDocuments(filter).exec(),
]);

// ❌ Bad: Sequential
const categories = await this.categoryModel.find(filter).exec();
const total = await this.categoryModel.countDocuments(filter).exec();
```

### **Error Handling**
```typescript
// ✅ Good: Let errors propagate
async createCategory(dto: CreateCategoryDto): Promise<Category> {
  return await this.categoryRepository.create(dto);
}

// ❌ Bad: Unnecessary try/catch
async createCategory(dto: CreateCategoryDto): Promise<Category> {
  try {
    return await this.categoryRepository.create(dto);
  } catch (error) {
    throw error;  // Pointless
  }
}
```

---

## 20. API Response Standards

### **Success Response Format**
```typescript
// Single entity
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Technology",
  "slug": "technology",
  "createdAt": "2024-01-01T00:00:00.000Z"
}

// Collection (paginated)
{
  "data": [
    { "id": "...", "name": "Technology" },
    { "id": "...", "name": "Science" }
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

### **Error Response Format**
Handled by global exception filter:
```typescript
{
  "statusCode": 404,
  "errorCode": "NOT_FOUND",
  "message": "Category with ID \"123\" not found",
  "path": "/api/v1/categories/123",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### **HTTP Status Codes**
- `200` OK - Successful GET, PUT
- `201` Created - Successful POST
- `204` No Content - Successful DELETE
- `400` Bad Request - Validation error
- `401` Unauthorized - Missing/invalid token
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource doesn't exist
- `409` Conflict - Duplicate resource
- `500` Internal Server Error - Unexpected error

---

## 21. Pagination Standards

### **Query Parameters**
```typescript
?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

### **Pagination DTO**
```typescript
export class PaginationDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}
```

### **Pagination Logic**
```typescript
const page = query.page || 1;
const limit = query.limit || 10;
const skip = (page - 1) * limit;

const [data, total] = await Promise.all([
  this.model.find().skip(skip).limit(limit).exec(),
  this.model.countDocuments().exec(),
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

---

## 22. Search Standards

### **Full-Text Search**
```typescript
// Create text index in schema
CategorySchema.index({ name: 'text', description: 'text' });

// Query with text search
const filter: any = {};
if (search) {
  filter.$text = { $search: search };
}
const results = await this.categoryModel.find(filter).exec();
```

### **Field-Specific Search**
```typescript
// Case-insensitive search
const filter = {
  name: new RegExp(searchTerm, 'i'),
};
```

### **Search DTO**
```typescript
@ApiPropertyOptional({ description: 'Search term' })
@IsString()
@IsOptional()
search?: string;
```

---

## 23. MongoDB Best Practices

### **Indexes**
- Add indexes for frequently queried fields
- Compound indexes for common query combinations
- Text indexes for search functionality
- Unique indexes for unique constraints

### **Lean Queries**
```typescript
// ✅ Good: lean() for read operations
const category = await this.categoryModel.findById(id).lean().exec();

// ❌ Bad: Full Mongoose document when not needed
const category = await this.categoryModel.findById(id).exec();
```

### **Field Selection**
```typescript
// ✅ Good: Select only needed fields
const category = await this.categoryModel
  .findById(id)
  .select('name slug createdAt')
  .lean()
  .exec();

// Exclude fields
.select('-password -isDeleted -__v')
```

### **Query Optimization**
- Use projection to limit fields returned
- Use `.lean()` for read-only operations
- Use `.exec()` to get real promises
- Batch operations with `Promise.all()`

---

## 24. Performance Guidelines

### **Database**
- Create indexes for common queries
- Use lean queries for read operations
- Batch database operations
- Avoid N+1 queries
- Use aggregation pipelines for complex queries

### **Caching**
- Cache frequently accessed data
- Set appropriate TTL values
- Invalidate cache on updates
- Use Redis for distributed caching

### **API**
- Implement pagination for large datasets
- Support field selection (sparse fieldsets)
- Use compression for responses
- Implement rate limiting

### **Code**
- Avoid unnecessary computations
- Use lazy loading where appropriate
- Minimize dependencies
- Profile and measure performance

---

## 25. Security Guidelines

### **Authentication**
- All endpoints require JWT by default
- Use `@UseGuards(JwtAuthGuard)` on controllers
- Extract user with `@CurrentUser()` decorator

### **Authorization**
- Use `@Roles()` decorator for role-based access
- Apply least privilege principle
- Validate user permissions in services

### **Input Validation**
- Validate all inputs with class-validator
- Sanitize user input
- Use whitelist and forbidNonWhitelisted in ValidationPipe

### **Sensitive Data**
- Never log passwords, tokens, secrets
- Use `.select('-password')` when querying users
- Hash passwords with bcrypt
- Store secrets in environment variables

### **Error Messages**
- Don't leak implementation details
- Use generic messages for sensitive operations
- Log detailed errors server-side only

---

## 26. Testing Expectations

### **Unit Tests**
- Test services independently
- Mock repositories
- Test business logic edge cases
- Aim for 80%+ coverage

### **Integration Tests**
- Test controller → service → repository flow
- Use test database
- Clean up after tests

### **E2E Tests**
- Test complete API workflows
- Test authentication/authorization
- Test error scenarios

### **Test Structure**
```typescript
describe('CategoryService', () => {
  describe('create', () => {
    it('should create category successfully', async () => {
      // Arrange
      const dto = { name: 'Technology' };
      
      // Act
      const result = await service.create(dto, userId);
      
      // Assert
      expect(result.name).toBe('Technology');
    });

    it('should throw ConflictException for duplicate name', async () => {
      // Arrange & Act & Assert
      await expect(service.create(dto, userId)).rejects.toThrow(ConflictException);
    });
  });
});
```

---

## 27. Code Review Checklist

### **Architecture**
- [ ] Follows layered architecture (Controller → Service → Repository)
- [ ] Proper separation of concerns
- [ ] No business logic in controllers
- [ ] No database queries in services (use repositories)

### **Code Quality**
- [ ] Descriptive naming (variables, functions, classes)
- [ ] No magic numbers or strings
- [ ] DRY principle applied
- [ ] KISS principle applied
- [ ] SOLID principles followed

### **TypeScript**
- [ ] No `any` types (or justified with comments)
- [ ] Explicit types for public APIs
- [ ] Proper use of generics
- [ ] No TypeScript errors or warnings

### **Validation**
- [ ] All DTOs have validation decorators
- [ ] Input validation at boundaries
- [ ] Business rule validation in services

### **Error Handling**
- [ ] Uses NestJS built-in exceptions
- [ ] Descriptive error messages
- [ ] No silent failures

### **Documentation**
- [ ] Swagger decorators on all endpoints
- [ ] JSDoc comments for complex logic
- [ ] README updated if needed

### **Security**
- [ ] Authentication guards applied
- [ ] Role-based access control implemented
- [ ] No sensitive data in logs
- [ ] Input sanitization via validation

### **Performance**
- [ ] MongoDB indexes added
- [ ] Lean queries for reads
- [ ] Field selection implemented
- [ ] Parallel operations where appropriate

### **Testing**
- [ ] Unit tests for services
- [ ] Integration tests for endpoints
- [ ] Edge cases covered

---

## 28. Things That Are Never Allowed

### **Absolutely Forbidden**

❌ **`any` type without justification**
```typescript
// Never do this
function process(data: any): any {
  return data;
}
```

❌ **Business logic in controllers**
```typescript
// Never do this
@Post()
async create(@Body() dto: CreateCategoryDto) {
  const slug = dto.name.toLowerCase().replace(/\s/g, '-');  // Business logic
  return this.service.create({ ...dto, slug });
}
```

❌ **Direct database access in services**
```typescript
// Never do this
@Injectable()
class CategoryService {
  constructor(@InjectModel(Category.name) private model: Model<Category>) {}
  
  async create(dto: CreateCategoryDto) {
    return this.model.create(dto);  // Use repository instead
  }
}
```

❌ **Hardcoded configuration**
```typescript
// Never do this
const JWT_SECRET = 'my-secret-key';
const DATABASE_URL = 'mongodb://localhost:27017/mydb';
```

❌ **Ignoring errors**
```typescript
// Never do this
try {
  await this.dangerousOperation();
} catch (error) {
  // Silent failure
}
```

❌ **Logging sensitive data**
```typescript
// Never do this
this.logger.log({ password: user.password, token: jwt });
```

❌ **Skipping validation**
```typescript
// Never do this
@Post()
async create(@Body() dto: any) {  // No validation
  return this.service.create(dto);
}
```

❌ **Hard delete without justification**
```typescript
// Never do this (use soft delete)
async delete(id: string) {
  return this.categoryModel.deleteOne({ _id: id });
}
```

❌ **Missing audit fields**
```typescript
// Never create entities without audit fields
@Prop({ required: true })
name: string;
// Missing: createdBy, updatedBy, isDeleted, etc.
```

❌ **Exposing internal fields**
```typescript
// Never return __v, isDeleted, password, etc.
async findOne(id: string): Promise<Category> {
  return this.categoryModel.findById(id).exec();  // Exposes everything
}
```

---

## Summary

These coding standards ensure:
- **Consistency** across the entire codebase
- **Quality** through proven patterns
- **Maintainability** via clean architecture
- **Security** through validation and authentication
- **Performance** through optimization techniques
- **Testability** through proper separation of concerns

**All code must follow these standards. No exceptions without architectural review.**

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-12  
**Applies To**: All code in AI Publishing Company monorepo
