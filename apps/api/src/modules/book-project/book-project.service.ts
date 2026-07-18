import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import {
  BookProjectQueryDto,
  BookProjectResponseDto,
  CreateBookProjectDto,
  PaginatedBookProjectResponseDto,
  UpdateBookProjectDto,
} from './dto';
import { BookProjectFactory } from './book-project.factory';
import { BookProjectMapper } from './book-project.mapper';
import { BookProjectRepository } from './book-project.repository';
import { BookProjectValidator } from './book-project.validator';

@Injectable()
export class BookProjectService {
  constructor(
    private readonly repository: BookProjectRepository,
    private readonly factory: BookProjectFactory,
    private readonly validator: BookProjectValidator,
    private readonly mapper: BookProjectMapper,
  ) {}

  async create(
    dto: CreateBookProjectDto,
    userId: string,
  ): Promise<BookProjectResponseDto> {
    const references = await this.validator.validateReferences(
      dto.categoryId,
      dto.subCategoryId,
    );

    if (!references.valid) {
      throw new BadRequestException(references.errors);
    }

    const metadata = this.validator.validateMetadata(dto.metadata ?? {});

    if (!metadata.valid) {
      throw new BadRequestException(metadata.errors);
    }

    const projectCode = await this.generateUniqueProjectCode();
    const ownerId =
      dto.ownerId && Types.ObjectId.isValid(dto.ownerId)
        ? new Types.ObjectId(dto.ownerId)
        : new Types.ObjectId(userId);

    const project = await this.repository.create(
      {
        ...dto,
        projectCode,
        ownerId,
      },
      new Types.ObjectId(userId),
    );

    return this.mapper.toResponse(project);
  }

  async findAll(
    query: BookProjectQueryDto,
  ): Promise<PaginatedBookProjectResponseDto> {
    const result = await this.repository.paginate(query);

    return {
      data: result.data.map((project) => this.mapper.toResponse(project)),
      meta: result.meta,
    };
  }

  async findOne(id: string): Promise<BookProjectResponseDto> {
    const project = await this.repository.findById(id);

    if (!project) {
      throw new NotFoundException(`Book project with ID "${id}" not found`);
    }

    return this.mapper.toResponse(project);
  }

  async findByProjectCode(projectCode: string): Promise<BookProjectResponseDto> {
    const project = await this.repository.findByProjectCode(projectCode);

    if (!project) {
      throw new NotFoundException(
        `Book project with code "${projectCode}" not found`,
      );
    }

    return this.mapper.toResponse(project);
  }

  async update(
    id: string,
    dto: UpdateBookProjectDto,
    userId: string,
  ): Promise<BookProjectResponseDto> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Book project with ID "${id}" not found`);
    }

    const categoryId = dto.categoryId ?? existing.categoryId.toString();
    const subCategoryId =
      dto.subCategoryId ??
      (existing.subCategoryId ? existing.subCategoryId.toString() : undefined);

    if (dto.categoryId || dto.subCategoryId !== undefined) {
      const references = await this.validator.validateReferences(
        categoryId,
        subCategoryId,
      );

      if (!references.valid) {
        throw new BadRequestException(references.errors);
      }
    }

    if (dto.metadata) {
      const metadata = this.validator.validateMetadata(dto.metadata);

      if (!metadata.valid) {
        throw new BadRequestException(metadata.errors);
      }
    }

    const project = await this.repository.update(
      id,
      dto,
      new Types.ObjectId(userId),
    );

    if (!project) {
      throw new NotFoundException(`Book project with ID "${id}" not found`);
    }

    return this.mapper.toResponse(project);
  }

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await this.repository.softDelete(
      id,
      new Types.ObjectId(userId),
    );

    if (!deleted) {
      throw new NotFoundException(`Book project with ID "${id}" not found`);
    }
  }

  async restore(id: string): Promise<BookProjectResponseDto> {
    const project = await this.repository.restore(id);

    if (!project) {
      throw new NotFoundException(
        `Book project with ID "${id}" not found or cannot be restored`,
      );
    }

    return this.mapper.toResponse(project);
  }

  async count(query?: BookProjectQueryDto): Promise<number> {
    return this.repository.count(query);
  }

  private async generateUniqueProjectCode(): Promise<string> {
    for (
      let attempt = 0;
      attempt < this.factory.getMaximumCodeGenerationAttempts();
      attempt += 1
    ) {
      const projectCode = this.factory.createProjectCode();
      const exists = await this.repository.existsByProjectCode(projectCode);

      if (!exists) {
        return projectCode;
      }
    }

    throw new ConflictException('Unable to generate a unique project code');
  }
}
