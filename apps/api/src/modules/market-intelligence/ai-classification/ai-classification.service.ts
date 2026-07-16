import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { AppLoggerService } from '../../../core/logger/logger.service';
import { KnowledgeDatabaseService } from '../knowledge-database/knowledge-database.service';
import {
  AIClassificationQueryDto,
  AIClassificationResponseDto,
  PaginatedAIClassificationResponseDto,
} from './dto';
import { AIClassificationEngine } from './ai-classification.engine';
import { AIClassificationMapper } from './ai-classification.mapper';
import { AIClassificationRepository } from './ai-classification.repository';

@Injectable()
export class AIClassificationService {
  constructor(
    private readonly knowledgeDatabaseService: KnowledgeDatabaseService,
    private readonly engine: AIClassificationEngine,
    private readonly repository: AIClassificationRepository,
    private readonly mapper: AIClassificationMapper,
    private readonly logger: AppLoggerService,
  ) {}

  async classify(
    knowledgeId: string,
    userId?: string,
  ): Promise<AIClassificationResponseDto> {
    const knowledge = await this.knowledgeDatabaseService.findById(knowledgeId);
    const existing = await this.repository.findByKnowledgeId(knowledgeId, true);

    if (existing?.isDeleted) {
      throw new ConflictException(
        `Classification for knowledge record "${knowledgeId}" is deleted and must be restored before classification`,
      );
    }

    const result = await this.engine.classify(knowledge);
    const classification = await this.repository.upsert(
      new Types.ObjectId(knowledgeId),
      this.mapper.toPersistence(result),
      this.toAuditContext(userId, userId),
    );

    this.logger.log({
      message: 'Market knowledge classified',
      knowledgeId,
      classificationId: (classification._id as Types.ObjectId).toString(),
      classificationVersion: classification.classificationVersion,
      confidenceScore: classification.confidenceScore,
    });

    return this.mapper.toResponse(classification);
  }

  async findById(id: string): Promise<AIClassificationResponseDto> {
    const classification = await this.repository.findById(id);

    if (!classification) {
      throw new NotFoundException(`AI classification with ID "${id}" not found`);
    }

    return this.mapper.toResponse(classification);
  }

  async findByKnowledgeId(
    knowledgeId: string,
  ): Promise<AIClassificationResponseDto> {
    const classification = await this.repository.findByKnowledgeId(knowledgeId);

    if (!classification) {
      throw new NotFoundException(
        `AI classification for knowledge record "${knowledgeId}" not found`,
      );
    }

    return this.mapper.toResponse(classification);
  }

  async findAll(
    query: AIClassificationQueryDto,
  ): Promise<PaginatedAIClassificationResponseDto> {
    const result = await this.repository.findAll(query);

    return {
      data: result.data.map((item) => this.mapper.toResponse(item)),
      meta: result.meta,
    };
  }

  async softDelete(id: string, userId?: string): Promise<void> {
    const deleted = await this.repository.softDelete(id, this.toObjectId(userId));

    if (!deleted) {
      throw new NotFoundException(`AI classification with ID "${id}" not found`);
    }
  }

  async restore(
    id: string,
    userId?: string,
  ): Promise<AIClassificationResponseDto> {
    const classification = await this.repository.restore(id, this.toObjectId(userId));

    if (!classification) {
      throw new NotFoundException(
        `AI classification with ID "${id}" not found or cannot be restored`,
      );
    }

    return this.mapper.toResponse(classification);
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