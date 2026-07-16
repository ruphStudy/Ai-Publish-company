import { Injectable } from '@nestjs/common';

import {
  OpportunityScoreResult,
  OpportunityScoringContext,
} from './models/opportunity-score.model';

export interface OpportunityScoringValidationResult {
  valid: boolean;
  errors: string[];
}

@Injectable()
export class OpportunityScoringValidator {
  validateContext(
    context: OpportunityScoringContext,
  ): OpportunityScoringValidationResult {
    const errors: string[] = [];

    if (!context.knowledge.id) {
      errors.push('knowledge ID is required');
    }

    if (!context.classification.id) {
      errors.push('classification ID is required');
    }

    if (context.classification.knowledgeId !== context.knowledge.id) {
      errors.push('classification must belong to the supplied knowledge record');
    }

    if (!context.scoreVersion) {
      errors.push('scoreVersion is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateResult(
    result: OpportunityScoreResult,
  ): OpportunityScoringValidationResult {
    const errors: string[] = [];
    const scores = [
      result.overallScore,
      result.demandScore,
      result.competitionScore,
      result.trendScore,
      result.growthScore,
      result.qualityScore,
      result.profitabilityScore,
      result.confidenceScore,
    ];

    if (scores.some((score) => !Number.isFinite(score) || score < 0 || score > 100)) {
      errors.push('all opportunity scores must be between 0 and 100');
    }

    if (!result.recommendationReason.trim()) {
      errors.push('recommendationReason is required');
    }

    if (!result.scoreVersion.trim()) {
      errors.push('scoreVersion is required');
    }

    if (Number.isNaN(result.scoredAt.getTime())) {
      errors.push('scoredAt must be a valid date');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}