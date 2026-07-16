import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { AppLoggerService } from '../../../core/logger/logger.service';
import { AIClassificationService } from '../ai-classification/ai-classification.service';
import { KnowledgeDatabaseService } from '../knowledge-database/knowledge-database.service';
import {
  OpportunityScoreQueryDto,
  OpportunityScoreResponseDto,
  PaginatedOpportunityScoreResponseDto,
} from './dto';
import { OpportunityScoringEngine } from './opportunity-scoring.engine';
import { OpportunityScoringMapper } from './opportunity-scoring.mapper';
import { OpportunityScoringRepository } from './opportunity-scoring.repository';

@Injectable()
export class OpportunityScoringService {
  constructor(
    private readonly knowledgeDatabaseService: KnowledgeDatabaseService,
    private readonly classificationService: AIClassificationService,
    private readonly engine: OpportunityScoringEngine,
    private readonly repository: OpportunityScoringRepository,
    private readonly mapper: OpportunityScoringMapper,
    private readonly logger: AppLoggerService,
  ) {}

  async score(
    classificationId: string,
    userId?: string,
  ): Promise<OpportunityScoreResponseDto> {
    const classification = await this.classificationService.findById(
      classificationId,
    );
    const knowledge = await this.knowledgeDatabaseService.findById(
      classification.knowledgeId,
    );
    const existing = await this.repository.findByKnowledgeId(
      knowledge.id,
      true,
    );

    if (existing?.isDeleted) {
      throw new ConflictException(
        `Opportunity score for knowledge record "${knowledge.id}" is deleted and must be restored before scoring`,
      );
    }

    const result = await this.engine.score({
      knowledge,
      classification,
    });
    const score = await this.repository.upsert(
      new Types.ObjectId(knowledge.id),
      new Types.ObjectId(classification.id),
      this.mapper.toPersistence(result),
      this.toAuditContext(userId, userId),
    );

    this.logger.log({
      message: 'Opportunity score calculated',
      knowledgeId: knowledge.id,
      classificationId,
      opportunityScoreId: (score._id as Types.ObjectId).toString(),
      overallScore: score.overallScore,
      opportunityGrade: score.opportunityGrade,
      scoreVersion: score.scoreVersion,
    });

    return this.mapper.toResponse(score);
  }

  async findById(id: string): Promise<OpportunityScoreResponseDto> {
    const score = await this.repository.findById(id);

    if (!score) {
      throw new NotFoundException(`Opportunity score with ID "${id}" not found`);
    }

    return this.mapper.toResponse(score);
  }

  async findByKnowledgeId(
    knowledgeId: string,
  ): Promise<OpportunityScoreResponseDto> {
    const score = await this.repository.findByKnowledgeId(knowledgeId);

    if (!score) {
      throw new NotFoundException(
        `Opportunity score for knowledge record "${knowledgeId}" not found`,
      );
    }

    return this.mapper.toResponse(score);
  }

  async findAll(
    query: OpportunityScoreQueryDto,
  ): Promise<PaginatedOpportunityScoreResponseDto> {
    const result = await this.repository.findAll(query);

    return {
      data: result.data.map((item) => this.mapper.toResponse(item)),
      meta: result.meta,
    };
  }

  async softDelete(id: string, userId?: string): Promise<void> {
    const deleted = await this.repository.softDelete(id, this.toObjectId(userId));

    if (!deleted) {
      throw new NotFoundException(`Opportunity score with ID "${id}" not found`);
    }
  }

  async restore(
    id: string,
    userId?: string,
  ): Promise<OpportunityScoreResponseDto> {
    const score = await this.repository.restore(id, this.toObjectId(userId));

    if (!score) {
      throw new NotFoundException(
        `Opportunity score with ID "${id}" not found or cannot be restored`,
      );
    }

    return this.mapper.toResponse(score);
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