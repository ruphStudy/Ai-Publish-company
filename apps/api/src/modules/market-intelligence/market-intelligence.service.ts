import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { MarketIntelligenceRepository } from './market-intelligence.repository';
import {
  CreateMarketIntelligenceDto,
  UpdateMarketIntelligenceDto,
  MarketIntelligenceQueryDto,
  MarketIntelligenceResponseDto,
  PaginatedMarketIntelligenceResponseDto,
} from './dto';
import { MarketIntelligence} from './entities/market-intelligence.entity';
import { MarketIntelligenceStatus } from './entities/market-intelligence.entity';

@Injectable()
export class MarketIntelligenceService {
  constructor(
    private readonly repository: MarketIntelligenceRepository,
  ) {}

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
      .slice(0, 320);
  }

  private async resolveUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    if (!(await this.repository.existsBySlug(baseSlug, excludeId))) {
      return baseSlug;
    }
    const ts = Date.now().toString(36);
    const suffixed = `${baseSlug}-${ts}`;
    if (!(await this.repository.existsBySlug(suffixed, excludeId))) {
      return suffixed;
    }
    throw new ConflictException(`Unable to generate a unique slug for "${baseSlug}". Please provide an explicit slug.`);
  }

  private toResponseDto(record: MarketIntelligence): MarketIntelligenceResponseDto {
    return {
      id: (record._id as Types.ObjectId).toString(),
      title: record.title,
      slug: record.slug,
      description: record.description ?? null,
      source: record.source,
      dataType: record.dataType,
      status: record.status,
      normalizedData: record.normalizedData ?? null,
      opportunityScore: record.opportunityScore ?? null,
      genre: record.genre ?? null,
      keywords: record.keywords ?? [],
      language: record.language ?? null,
      market: record.market ?? null,
      periodStart: record.periodStart ?? null,
      periodEnd: record.periodEnd ?? null,
      providerMetadata: record.providerMetadata ?? null,
      processingError: record.processingError ?? null,
      lastProcessedAt: record.lastProcessedAt ?? null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async create(dto: CreateMarketIntelligenceDto, userId: string): Promise<MarketIntelligenceResponseDto> {
    const baseSlug = dto.slug ?? this.generateSlug(dto.title);
    const slug = dto.slug
      ? baseSlug
      : await this.resolveUniqueSlug(baseSlug);

    if (dto.slug && (await this.repository.existsBySlug(slug))) {
      throw new ConflictException(`Market intelligence record with slug "${slug}" already exists`);
    }

    const record = await this.repository.create(
      {
        ...dto,
        slug,
        status: dto.status ?? MarketIntelligenceStatus.PENDING,
      },
      new Types.ObjectId(userId),
    );

    return this.toResponseDto(record);
  }

  async findAll(query: MarketIntelligenceQueryDto): Promise<PaginatedMarketIntelligenceResponseDto> {
    const result = await this.repository.findAll(query);
    return {
      data: result.data.map((r) => this.toResponseDto(r)),
      meta: result.meta,
    };
  }

  async findOne(id: string): Promise<MarketIntelligenceResponseDto> {
    const record = await this.repository.findById(id);
    if (!record) throw new NotFoundException(`Market intelligence record with ID "${id}" not found`);
    return this.toResponseDto(record);
  }

  async findBySlug(slug: string): Promise<MarketIntelligenceResponseDto> {
    const record = await this.repository.findBySlug(slug);
    if (!record) throw new NotFoundException(`Market intelligence record with slug "${slug}" not found`);
    return this.toResponseDto(record);
  }

  async update(
    id: string,
    dto: UpdateMarketIntelligenceDto,
    userId: string,
  ): Promise<MarketIntelligenceResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException(`Market intelligence record with ID "${id}" not found`);

    let resolvedSlug: string | undefined;
    if (dto.slug) {
      resolvedSlug = dto.slug;
      if (resolvedSlug !== existing.slug && (await this.repository.existsBySlug(resolvedSlug, id))) {
        throw new ConflictException(`Market intelligence record with slug "${resolvedSlug}" already exists`);
      }
    } else if (dto.title && dto.title.toLowerCase() !== existing.title.toLowerCase()) {
      const baseSlug = this.generateSlug(dto.title);
      if (baseSlug !== existing.slug) {
        resolvedSlug = await this.resolveUniqueSlug(baseSlug, id);
      }
    }

    const updated = await this.repository.update(
      id,
      { ...dto, ...(resolvedSlug !== undefined && { slug: resolvedSlug }) },
      new Types.ObjectId(userId),
    );
    if (!updated) throw new NotFoundException(`Market intelligence record with ID "${id}" not found`);

    return this.toResponseDto(updated);
  }

  async remove(id: string, userId: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException(`Market intelligence record with ID "${id}" not found`);

    const deleted = await this.repository.softDelete(id, new Types.ObjectId(userId));
    if (!deleted) throw new BadRequestException(`Failed to delete market intelligence record with ID "${id}"`);
  }

  async restore(id: string): Promise<MarketIntelligenceResponseDto> {
    const record = await this.repository.restore(id);
    if (!record) throw new NotFoundException(`Market intelligence record with ID "${id}" not found or cannot be restored`);
    return this.toResponseDto(record);
  }
}
