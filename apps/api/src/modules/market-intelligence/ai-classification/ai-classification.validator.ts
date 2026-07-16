import { Injectable } from '@nestjs/common';

import { MarketKnowledgeResponseDto } from '../knowledge-database/dto';
import {
  ClassificationContext,
  ClassificationResult,
} from './models/classification-result.model';

export interface AIClassificationValidationResult {
  valid: boolean;
  errors: string[];
}

@Injectable()
export class AIClassificationValidator {
  validateKnowledge(
    knowledge: MarketKnowledgeResponseDto,
  ): AIClassificationValidationResult {
    const errors: string[] = [];

    if (!knowledge.id) {
      errors.push('knowledge ID is required');
    }

    if (!knowledge.provider) {
      errors.push('knowledge provider is required');
    }

    if (!knowledge.externalId) {
      errors.push('knowledge externalId is required');
    }

    if (!knowledge.title) {
      errors.push('knowledge title is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateContext(
    context: ClassificationContext,
  ): AIClassificationValidationResult {
    const result = this.validateKnowledge(context.knowledge);
    const errors = [...result.errors];

    if (!context.classificationVersion) {
      errors.push('classification version is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateResult(
    result: ClassificationResult,
  ): AIClassificationValidationResult {
    const errors: string[] = [];

    if (!result.classificationVersion) {
      errors.push('classificationVersion is required');
    }

    if (result.aiTags.some((tag) => !tag.trim())) {
      errors.push('aiTags cannot contain empty values');
    }

    if (!this.isScore(result.evergreenScore)) {
      errors.push('evergreenScore must be between 0 and 100');
    }

    if (!this.isScore(result.seasonalScore)) {
      errors.push('seasonalScore must be between 0 and 100');
    }

    if (!this.isScore(result.confidenceScore)) {
      errors.push('confidenceScore must be between 0 and 100');
    }

    if (Number.isNaN(result.classifiedAt.getTime())) {
      errors.push('classifiedAt must be a valid date');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private isScore(value: number): boolean {
    return Number.isFinite(value) && value >= 0 && value <= 100;
  }
}