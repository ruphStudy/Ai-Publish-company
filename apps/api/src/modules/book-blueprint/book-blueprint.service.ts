import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { BookProjectService } from '../book-project/book-project.service';
import { MarketIntelligenceService } from '../market-intelligence/market-intelligence.service';
import { AIClassificationService } from '../market-intelligence/ai-classification/ai-classification.service';
import { KnowledgeDatabaseService } from '../market-intelligence/knowledge-database/knowledge-database.service';
import { OpportunityScoringService } from '../market-intelligence/opportunity-scoring/opportunity-scoring.service';
import {
  BookBlueprintQueryDto,
  BookBlueprintResponseDto,
  GenerateBookBlueprintDto,
  PaginatedBookBlueprintResponseDto,
  UpdateBookBlueprintDto,
} from './dto';
import { BookBlueprintPipeline } from './book-blueprint.pipeline';
import { BookBlueprintFactory } from './book-blueprint.factory';
import { BookBlueprintMapper } from './book-blueprint.mapper';
import { BookBlueprintRepository } from './book-blueprint.repository';
import { BookBlueprintValidator } from './book-blueprint.validator';
import { BookBlueprintStatus } from './entities/book-blueprint.entity';

@Injectable()
export class BookBlueprintService {
  constructor(
    private readonly bookProjectService: BookProjectService,
    private readonly marketIntelligenceService: MarketIntelligenceService,
    private readonly knowledgeDatabaseService: KnowledgeDatabaseService,
    private readonly classificationService: AIClassificationService,
    private readonly opportunityScoringService: OpportunityScoringService,
    private readonly repository: BookBlueprintRepository,
    private readonly factory: BookBlueprintFactory,
    private readonly validator: BookBlueprintValidator,
    private readonly pipeline: BookBlueprintPipeline,
    private readonly mapper: BookBlueprintMapper,
  ) {}

  async generate(
    dto: GenerateBookBlueprintDto,
    userId: string,
  ): Promise<BookBlueprintResponseDto> {
    const [
      project,
      marketIntelligence,
      knowledge,
      classification,
      opportunityScore,
    ] = await Promise.all([
      this.bookProjectService.findOne(dto.projectId),
      this.marketIntelligenceService.findOne(dto.marketIntelligenceId),
      this.knowledgeDatabaseService.findById(dto.knowledgeRecordId),
      this.classificationService.findByKnowledgeId(dto.knowledgeRecordId),
      this.opportunityScoringService.findByKnowledgeId(dto.knowledgeRecordId),
    ]);

    const sourceValidation = this.validator.validateSources(
      project,
      marketIntelligence,
      knowledge,
      classification,
      opportunityScore,
    );

    if (!sourceValidation.valid) {
      throw new BadRequestException(sourceValidation.errors);
    }

    const blueprintId = await this.generateUniqueBlueprintId();
    const blueprint = await this.pipeline.execute(
      project,
      marketIntelligence,
      knowledge,
      classification,
      opportunityScore,
      blueprintId,
    );
    const created = await this.repository.create(
      blueprint,
      new Types.ObjectId(userId),
    );

    return this.mapper.toResponse(created);
  }

  async findAll(
    query: BookBlueprintQueryDto,
  ): Promise<PaginatedBookBlueprintResponseDto> {
    const result = await this.repository.paginate(query);

    return {
      data: result.data.map((blueprint) => this.mapper.toResponse(blueprint)),
      meta: result.meta,
    };
  }

  async findOne(id: string): Promise<BookBlueprintResponseDto> {
    const blueprint = await this.repository.findById(id);

    if (!blueprint) {
      throw new NotFoundException(`Book blueprint with ID "${id}" not found`);
    }

    return this.mapper.toResponse(blueprint);
  }

  async findByProjectId(projectId: string): Promise<BookBlueprintResponseDto[]> {
    const blueprints = await this.repository.findByProjectId(projectId);

    return blueprints.map((blueprint) => this.mapper.toResponse(blueprint));
  }

  async latestBlueprint(projectId: string): Promise<BookBlueprintResponseDto> {
    const blueprint = await this.repository.latestBlueprint(projectId);

    if (!blueprint) {
      throw new NotFoundException(
        `No book blueprint found for project "${projectId}"`,
      );
    }

    return this.mapper.toResponse(blueprint);
  }

  async update(
    id: string,
    dto: UpdateBookBlueprintDto,
    userId: string,
  ): Promise<BookBlueprintResponseDto> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Book blueprint with ID "${id}" not found`);
    }

    if (existing.status === BookBlueprintStatus.LOCKED) {
      throw new ConflictException(
        `Book blueprint "${existing.blueprintId}" is locked and cannot be updated`,
      );
    }

    if (dto.metadata) {
      const validation = this.validator.validateMetadata(dto.metadata);

      if (!validation.valid) {
        throw new BadRequestException(validation.errors);
      }
    }

    const blueprint = await this.repository.update(
      id,
      dto,
      new Types.ObjectId(userId),
    );

    if (!blueprint) {
      throw new NotFoundException(`Book blueprint with ID "${id}" not found`);
    }

    return this.mapper.toResponse(blueprint);
  }

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await this.repository.softDelete(
      id,
      new Types.ObjectId(userId),
    );

    if (!deleted) {
      throw new NotFoundException(`Book blueprint with ID "${id}" not found`);
    }
  }

  async restore(id: string): Promise<BookBlueprintResponseDto> {
    const blueprint = await this.repository.restore(id);

    if (!blueprint) {
      throw new NotFoundException(
        `Book blueprint with ID "${id}" not found or cannot be restored`,
      );
    }

    return this.mapper.toResponse(blueprint);
  }

  private async generateUniqueBlueprintId(): Promise<string> {
    for (
      let attempt = 0;
      attempt < this.factory.getMaximumIdentifierGenerationAttempts();
      attempt += 1
    ) {
      const blueprintId = this.factory.createBlueprintId();
      const exists = await this.repository.existsByBlueprintId(blueprintId);

      if (!exists) {
        return blueprintId;
      }
    }

    throw new ConflictException('Unable to generate a unique blueprint ID');
  }
}