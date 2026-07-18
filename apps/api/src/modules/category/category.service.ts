import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { CategoryRepository } from './category.repository';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryDto,
  CategoryResponseDto,
  PaginatedCategoryResponseDto,
} from './dto';
import { Category} from './entities/category.entity';
import { CategoryStatus } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  // ── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Generate a URL-friendly slug from a name string.
   * Follows BR-154: decompose diacritics, lowercase, alphanumeric + hyphens only,
   * max 200 characters.
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD')                  // Decompose accented chars (é → e + ́)
      .replace(/[\u0300-\u036f]/g, '')   // Strip diacritical marks
      .replace(/[^\w\s-]/g, '')         // Remove non-word chars except spaces/hyphens
      .replace(/\s+/g, '-')             // Replace whitespace with hyphens
      .replace(/-+/g, '-')              // Collapse consecutive hyphens
      .replace(/^-+|-+$/g, '')          // Trim leading/trailing hyphens
      .slice(0, 200);                    // Enforce max length (DATABASE_RULES §16)
  }

  /**
   * Map a Category document (lean) to a CategoryResponseDto.
   * _id is transformed to string id. Internal fields are never exposed.
   */
  private toResponseDto(category: Category): CategoryResponseDto {
    return {
      id: (category._id as Types.ObjectId).toString(),
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      parentId: category.parentId ? category.parentId.toString() : null,
      displayOrder: category.displayOrder,
      status: category.status,
      icon: category.icon ?? null,
      color: category.color ?? null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  // ── Public Operations ──────────────────────────────────────────────────────

  async create(dto: CreateCategoryDto, userId: string): Promise<CategoryResponseDto> {
    const slug = dto.slug ?? this.generateSlug(dto.name);

    // BR-022: Unique name (case-insensitive, globally scoped)
    const nameExists = await this.categoryRepository.findByName(dto.name);
    if (nameExists) {
      throw new ConflictException(`Category with name "${dto.name}" already exists`);
    }

    // BR-023: Unique slug (globally scoped)
    const slugExists = await this.categoryRepository.existsBySlug(slug);
    if (slugExists) {
      throw new ConflictException(`Category with slug "${slug}" already exists`);
    }

    // BR-028: Auto-assign displayOrder if not provided
    const displayOrder =
      dto.displayOrder !== undefined
        ? dto.displayOrder
        : await this.categoryRepository.getNextDisplayOrder();

    const category = await this.categoryRepository.create(
      {
        ...dto,
        slug,
        displayOrder,
        status: dto.status ?? CategoryStatus.ACTIVE,
      },
      new Types.ObjectId(userId),
    );

    return this.toResponseDto(category);
  }

  async findAll(query: CategoryQueryDto): Promise<PaginatedCategoryResponseDto> {
    const result = await this.categoryRepository.findAll(query);

    return {
      data: result.data.map((cat) => this.toResponseDto(cat)),
      meta: result.meta,
    };
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return this.toResponseDto(category);
  }

  async findBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findBySlug(slug);

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return this.toResponseDto(category);
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    userId: string,
  ): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    // BR-031/BR-032: Duplicate name check — exclude current document
    if (dto.name && dto.name.toLowerCase() !== existing.name.toLowerCase()) {
      const nameExists = await this.categoryRepository.existsByName(dto.name, id);
      if (nameExists) {
        throw new ConflictException(`Category with name "${dto.name}" already exists`);
      }
    }

    // BR-031: Slug re-generation when name changes (unless explicit slug provided)
    let resolvedSlug: string | undefined;
    if (dto.slug) {
      resolvedSlug = dto.slug;
    } else if (dto.name && dto.name.toLowerCase() !== existing.name.toLowerCase()) {
      resolvedSlug = this.generateSlug(dto.name);
    }

    if (resolvedSlug && resolvedSlug !== existing.slug) {
      const slugExists = await this.categoryRepository.existsBySlug(resolvedSlug, id);
      if (slugExists) {
        throw new ConflictException(`Category with slug "${resolvedSlug}" already exists`);
      }
    }

    const updated = await this.categoryRepository.update(
      id,
      { ...dto, ...(resolvedSlug !== undefined && { slug: resolvedSlug }) },
      new Types.ObjectId(userId),
    );

    if (!updated) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return this.toResponseDto(updated);
  }

  async remove(id: string, userId: string): Promise<void> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    const deleted = await this.categoryRepository.softDelete(
      id,
      new Types.ObjectId(userId),
    );

    if (!deleted) {
      throw new BadRequestException(`Failed to delete category with ID "${id}"`);
    }
  }

  async restore(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.restore(id);

    if (!category) {
      throw new NotFoundException(
        `Category with ID "${id}" not found or cannot be restored`,
      );
    }

    return this.toResponseDto(category);
  }
}
