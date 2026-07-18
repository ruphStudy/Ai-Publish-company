import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import {
  BookProjectResponseDto,
} from '../book-project/dto';
import {
  MarketIntelligenceResponseDto,
} from '../market-intelligence/dto';
import {
  AIClassificationResponseDto,
} from '../market-intelligence/ai-classification/dto';
import {
  MarketKnowledgeResponseDto,
} from '../market-intelligence/knowledge-database/dto';
import {
  OpportunityScoreResponseDto,
} from '../market-intelligence/opportunity-scoring/dto';
import {
  CreateBookBlueprintData,
} from './interfaces/book-blueprint.repository.interface';
import { BookBlueprintEngine } from './book-blueprint.engine';
import { BookBlueprintFactory } from './book-blueprint.factory';
import { BookBlueprintValidator } from './book-blueprint.validator';

@Injectable()
export class BookBlueprintPipeline {
  constructor(
    private readonly factory: BookBlueprintFactory,
    private readonly validator: BookBlueprintValidator,
    private readonly engine: BookBlueprintEngine,
  ) {}

  async execute(
    project: BookProjectResponseDto,
    marketIntelligence: MarketIntelligenceResponseDto,
    knowledge: MarketKnowledgeResponseDto,
    classification: AIClassificationResponseDto,
    opportunityScore: OpportunityScoreResponseDto,
    blueprintId: string,
  ): Promise<CreateBookBlueprintData> {
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

    const blueprint = this.engine.generate(
      blueprintId,
      project,
      marketIntelligence,
      knowledge,
      classification,
      opportunityScore,
    );

    const metadataValidation = this.validator.validateMetadata(blueprint.metadata);

    if (!metadataValidation.valid) {
      throw new BadRequestException(metadataValidation.errors);
    }

    return {
      ...blueprint,
      projectId: new Types.ObjectId(project.id),
      marketIntelligenceId: new Types.ObjectId(marketIntelligence.id),
      knowledgeRecordId: new Types.ObjectId(knowledge.id),
      classificationId: new Types.ObjectId(classification.id),
      opportunityScoreId: new Types.ObjectId(opportunityScore.id),
    };
  }
}