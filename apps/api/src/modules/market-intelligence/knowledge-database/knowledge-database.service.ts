import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { AppLoggerService } from '../../../core/logger/logger.service';
import { UnifiedMarketIntelligenceModel } from '../data-normalizer/models/unified-market-intelligence.model';
import {
  MarketKnowledgeQueryDto,
  MarketKnowledgeResponseDto,
  PaginatedMarketKnowledgeResponseDto,
} from './dto';
import { KnowledgeDatabaseDuplicateDetectionService } from './knowledge-database-duplicate-detection.service';
import { KnowledgeDatabaseMapper } from './knowledge-database.mapper';
import { KnowledgeDatabaseRepository } from './knowledge-database.repository';
import { KnowledgeDatabaseValidator } from './knowledge-database.validator';

@Injectable()
export class KnowledgeDatabaseService {
  constructor(
    private readonly repository: KnowledgeDatabaseRepository,
    private readonly mapper: KnowledgeDatabaseMapper,
    private readonly validator: KnowledgeDatabaseValidator,
    private readonly duplicateDetectionService: KnowledgeDatabaseDuplicateDetectionService,
    private readonly logger: AppLoggerService,
  ) {}

  async create(
    model: UnifiedMarketIntelligenceModel,
    userId?: string,
  ): Promise<MarketKnowledgeResponseDto> {
    this.ensureValid(model);

    const existing = await this.repository.findByExternalId(
      model.provider,
      model.externalId,
      true,
    );

    if (existing) {
      throw new ConflictException(
        `Knowledge record already exists for provider "${model.provider}" and external ID "${model.externalId}"`,
      );
    }

    const record = await this.repository.create(
      this.mapper.toPersistence(model),
      this.toAuditContext(userId, userId),
    );

    return this.mapper.toResponse(record);
  }

  async createMany(
    models: UnifiedMarketIntelligenceModel[],
    userId?: string,
  ): Promise<MarketKnowledgeResponseDto[]> {
    const uniqueModels = this.validateAndDeduplicate(models);

    await Promise.all(
      uniqueModels.map(async (model) => {
        const exists = await this.repository.findByExternalId(
          model.provider,
          model.externalId,
          true,
        );

        if (exists) {
          throw new ConflictException(
            `Knowledge record already exists for provider "${model.provider}" and external ID "${model.externalId}"`,
          );
        }
      }),
    );

    const records = await this.repository.createMany(
      uniqueModels.map((model) => this.mapper.toPersistence(model)),
      this.toAuditContext(userId, userId),
    );

    return records.map((record) => this.mapper.toResponse(record));
  }

  async upsert(
    model: UnifiedMarketIntelligenceModel,
    userId?: string,
  ): Promise<MarketKnowledgeResponseDto> {
    this.ensureValid(model);

    const existing = await this.repository.findByExternalId(
      model.provider,
      model.externalId,
      true,
    );

    if (existing?.isDeleted) {
      throw new ConflictException(
        `Knowledge record for provider "${model.provider}" and external ID "${model.externalId}" is deleted and must be restored before upsert`,
      );
    }

    const record = await this.repository.upsert(
      this.mapper.toPersistence(model),
      this.toAuditContext(userId, userId),
    );

    this.logger.log({
      message: 'Market knowledge upserted',
      provider: model.provider,
      externalId: model.externalId,
      dataVersion: record.dataVersion,
    });

    return this.mapper.toResponse(record);
  }

  async upsertMany(
    models: UnifiedMarketIntelligenceModel[],
    userId?: string,
  ): Promise<MarketKnowledgeResponseDto[]> {
    const uniqueModels = this.validateAndDeduplicate(models);

    await Promise.all(
      uniqueModels.map(async (model) => {
        const existing = await this.repository.findByExternalId(
          model.provider,
          model.externalId,
          true,
        );

        if (existing?.isDeleted) {
          throw new ConflictException(
            `Knowledge record for provider "${model.provider}" and external ID "${model.externalId}" is deleted and must be restored before upsert`,
          );
        }
      }),
    );

    const records = await this.repository.upsertMany(
      uniqueModels.map((model) => this.mapper.toPersistence(model)),
      this.toAuditContext(userId, userId),
    );

    this.logger.log({
      message: 'Market knowledge batch upserted',
      receivedCount: models.length,
      persistedCount: records.length,
      duplicateCount: models.length - uniqueModels.length,
    });

    return records.map((record) => this.mapper.toResponse(record));
  }

  async findById(id: string): Promise<MarketKnowledgeResponseDto> {
    const record = await this.repository.findById(id);

    if (!record) {
      throw new NotFoundException(`Market knowledge record with ID "${id}" not found`);
    }

    return this.mapper.toResponse(record);
  }

  async findByExternalId(
    provider: UnifiedMarketIntelligenceModel['provider'],
    externalId: string,
  ): Promise<MarketKnowledgeResponseDto> {
    const record = await this.repository.findByExternalId(provider, externalId);

    if (!record) {
      throw new NotFoundException(
        `Market knowledge record for provider "${provider}" and external ID "${externalId}" not found`,
      );
    }

    return this.mapper.toResponse(record);
  }

  async search(
    query: MarketKnowledgeQueryDto,
  ): Promise<PaginatedMarketKnowledgeResponseDto> {
    const result = await this.repository.search(query);

    return {
      data: result.data.map((record) => this.mapper.toResponse(record)),
      meta: result.meta,
    };
  }

  async filter(
    query: MarketKnowledgeQueryDto,
  ): Promise<PaginatedMarketKnowledgeResponseDto> {
    const result = await this.repository.filter(query);

    return {
      data: result.data.map((record) => this.mapper.toResponse(record)),
      meta: result.meta,
    };
  }

  async paginate(
    query: MarketKnowledgeQueryDto,
  ): Promise<PaginatedMarketKnowledgeResponseDto> {
    const result = await this.repository.paginate(query);

    return {
      data: result.data.map((record) => this.mapper.toResponse(record)),
      meta: result.meta,
    };
  }

  async softDelete(id: string, userId?: string): Promise<void> {
    const deleted = await this.repository.softDelete(id, this.toObjectId(userId));

    if (!deleted) {
      throw new NotFoundException(`Market knowledge record with ID "${id}" not found`);
    }
  }

  async restore(
    id: string,
    userId?: string,
  ): Promise<MarketKnowledgeResponseDto> {
    const record = await this.repository.restore(id, this.toObjectId(userId));

    if (!record) {
      throw new NotFoundException(
        `Market knowledge record with ID "${id}" not found or cannot be restored`,
      );
    }

    return this.mapper.toResponse(record);
  }

  async count(query?: MarketKnowledgeQueryDto): Promise<number> {
    return this.repository.count(query);
  }

  private validateAndDeduplicate(
    models: UnifiedMarketIntelligenceModel[],
  ): UnifiedMarketIntelligenceModel[] {
    if (models.length === 0) {
      throw new BadRequestException('At least one normalized market intelligence record is required');
    }

    models.forEach((model) => this.ensureValid(model));

    return this.duplicateDetectionService.removeDuplicates(models).records;
  }

  private ensureValid(model: UnifiedMarketIntelligenceModel): void {
    const validation = this.validator.validate(model);

    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Invalid unified market intelligence model',
        errors: validation.errors,
      });
    }
  }

  private toAuditContext(createdBy?: string, updatedBy?: string): {
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
  } {
    const createdById = this.toObjectId(createdBy);
    const updatedById = this.toObjectId(updatedBy);

    return {
      ...(createdById ? { createdBy: createdById } : {}),
      ...(updatedById ? { updatedBy: updatedById } : {}),
    };
  }

  private toObjectId(userId?: string): Types.ObjectId | undefined {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return undefined;
    }

    return new Types.ObjectId(userId);
  }
}