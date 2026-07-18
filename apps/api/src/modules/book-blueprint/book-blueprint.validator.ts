import { Injectable } from '@nestjs/common';
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

export interface BookBlueprintValidationResult {
  valid: boolean;
  errors: string[];
}

@Injectable()
export class BookBlueprintValidator {
  validateSources(
    project: BookProjectResponseDto,
    marketIntelligence: MarketIntelligenceResponseDto,
    knowledge: MarketKnowledgeResponseDto,
    classification: AIClassificationResponseDto,
    opportunityScore: OpportunityScoreResponseDto,
  ): BookBlueprintValidationResult {
    const errors: string[] = [];

    if (!Types.ObjectId.isValid(project.id)) {
      errors.push('Book project ID is invalid');
    }

    if (!Types.ObjectId.isValid(marketIntelligence.id)) {
      errors.push('Market intelligence ID is invalid');
    }

    if (!Types.ObjectId.isValid(knowledge.id)) {
      errors.push('Knowledge record ID is invalid');
    }

    if (!Types.ObjectId.isValid(classification.id)) {
      errors.push('Classification ID is invalid');
    }

    if (!Types.ObjectId.isValid(opportunityScore.id)) {
      errors.push('Opportunity score ID is invalid');
    }

    if (classification.knowledgeId !== knowledge.id) {
      errors.push('Classification does not belong to the supplied knowledge record');
    }

    if (opportunityScore.knowledgeId !== knowledge.id) {
      errors.push('Opportunity score does not belong to the supplied knowledge record');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateMetadata(metadata: Record<string, unknown>): BookBlueprintValidationResult {
    try {
      JSON.stringify(metadata);

      return {
        valid: true,
        errors: [],
      };
    } catch {
      return {
        valid: false,
        errors: ['metadata must be JSON-compatible'],
      };
    }
  }
}