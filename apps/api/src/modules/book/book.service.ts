import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { BookRepository } from './book.repository';
import {
  CreateBookDto,
  UpdateBookDto,
  BookQueryDto,
  BookResponseDto,
  PaginatedBookResponseDto,
} from './dto';
import { Book} from './entities/book.entity';
import { BookStatus, BookStage } from './entities/book.entity';

@Injectable()
export class BookService {
  constructor(private readonly bookRepository: BookRepository) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 220);
  }

  private async resolveUniqueSlug(
    baseSlug: string,
    language: string,
    excludeId?: string,
  ): Promise<string> {
    if (!(await this.bookRepository.existsBySlug(baseSlug, excludeId))) {
      return baseSlug;
    }
    const slugWithLang = `${baseSlug}-${language}`;
    if (!(await this.bookRepository.existsBySlug(slugWithLang, excludeId))) {
      return slugWithLang;
    }
    throw new ConflictException(
      `Unable to generate a unique slug for "${baseSlug}". Please provide an explicit slug.`,
    );
  }

  private toResponseDto(book: Book): BookResponseDto {
    return {
      id: (book._id as Types.ObjectId).toString(),
      title: book.title,
      subtitle: book.subtitle ?? null,
      slug: book.slug,
      description: book.description ?? null,
      summary: book.summary ?? null,
      categoryId: (book.categoryId as Types.ObjectId).toString(),
      status: book.status,
      language: book.language,
      targetAudience: book.targetAudience ?? null,
      objective: book.objective ?? null,
      estimatedPages: book.estimatedPages ?? null,
      currentStage: book.currentStage,
      qualityScore: book.qualityScore ?? null,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  }

  async create(dto: CreateBookDto, userId: string): Promise<BookResponseDto> {
    const titleExists = await this.bookRepository.existsByTitleAndLanguage(
      dto.title,
      dto.language,
    );
    if (titleExists) {
      throw new ConflictException(
        `Book with title "${dto.title}" already exists in language "${dto.language}"`,
      );
    }

    const baseSlug = dto.slug ?? this.generateSlug(dto.title);
    const slug = dto.slug
      ? baseSlug
      : await this.resolveUniqueSlug(baseSlug, dto.language);

    if (dto.slug) {
      const slugExists = await this.bookRepository.existsBySlug(slug);
      if (slugExists) {
        throw new ConflictException(`Book with slug "${slug}" already exists`);
      }
    }

    const book = await this.bookRepository.create(
      {
        ...dto,
        slug,
        status: dto.status ?? BookStatus.DRAFT,
        currentStage: dto.currentStage ?? BookStage.IDEA,
      },
      new Types.ObjectId(userId),
    );

    return this.toResponseDto(book);
  }

  async findAll(query: BookQueryDto): Promise<PaginatedBookResponseDto> {
    const result = await this.bookRepository.findAll(query);
    return {
      data: result.data.map((book) => this.toResponseDto(book)),
      meta: result.meta,
    };
  }

  async findOne(id: string): Promise<BookResponseDto> {
    const book = await this.bookRepository.findById(id);
    if (!book) throw new NotFoundException(`Book with ID "${id}" not found`);
    return this.toResponseDto(book);
  }

  async findBySlug(slug: string): Promise<BookResponseDto> {
    const book = await this.bookRepository.findBySlug(slug);
    if (!book) throw new NotFoundException(`Book with slug "${slug}" not found`);
    return this.toResponseDto(book);
  }

  async update(
    id: string,
    dto: UpdateBookDto,
    userId: string,
  ): Promise<BookResponseDto> {
    const existing = await this.bookRepository.findById(id);
    if (!existing) throw new NotFoundException(`Book with ID "${id}" not found`);

    const targetTitle = dto.title ?? existing.title;
    const targetLanguage = dto.language ?? existing.language;
    const titleOrLanguageChanged =
      dto.title?.toLowerCase() !== existing.title.toLowerCase() ||
      (dto.language !== undefined && dto.language !== existing.language);

    if (titleOrLanguageChanged) {
      const titleExists = await this.bookRepository.existsByTitleAndLanguage(
        targetTitle,
        targetLanguage,
        id,
      );
      if (titleExists) {
        throw new ConflictException(
          `Book with title "${targetTitle}" already exists in language "${targetLanguage}"`,
        );
      }
    }

    let resolvedSlug: string | undefined;
    if (dto.slug) {
      resolvedSlug = dto.slug;
      if (resolvedSlug !== existing.slug) {
        const slugExists = await this.bookRepository.existsBySlug(resolvedSlug, id);
        if (slugExists) {
          throw new ConflictException(`Book with slug "${resolvedSlug}" already exists`);
        }
      }
    } else if (dto.title && dto.title.toLowerCase() !== existing.title.toLowerCase()) {
      const baseSlug = this.generateSlug(dto.title);
      if (baseSlug !== existing.slug) {
        resolvedSlug = await this.resolveUniqueSlug(baseSlug, targetLanguage, id);
      }
    }

    const updated = await this.bookRepository.update(
      id,
      { ...dto, ...(resolvedSlug !== undefined && { slug: resolvedSlug }) },
      new Types.ObjectId(userId),
    );
    if (!updated) throw new NotFoundException(`Book with ID "${id}" not found`);

    return this.toResponseDto(updated);
  }

  async remove(id: string, userId: string): Promise<void> {
    const existing = await this.bookRepository.findById(id);
    if (!existing) throw new NotFoundException(`Book with ID "${id}" not found`);

    const deleted = await this.bookRepository.softDelete(id, new Types.ObjectId(userId));
    if (!deleted) throw new BadRequestException(`Failed to delete book with ID "${id}"`);
  }

  async restore(id: string): Promise<BookResponseDto> {
    const book = await this.bookRepository.restore(id);
    if (!book) {
      throw new NotFoundException(
        `Book with ID "${id}" not found or cannot be restored`,
      );
    }
    return this.toResponseDto(book);
  }
}
