import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import type { OpportunityScoreResponseDto } from './dto';
import { OpportunityScore } from './entities/opportunity-score.entity';
import { OpportunityScoreResult } from './models/opportunity-score.model';

@Injectable()
export class OpportunityScoringMapper {
  toPersistence(result: OpportunityScoreResult): OpportunityScoreResult {
    return {
      ...result,
      recommendationReason: result.recommendationReason.trim(),
    };
  }

  toResponse(record: OpportunityScore): OpportunityScoreResponseDto {
    return {
      id: (record._id as Types.ObjectId).toString(),
      knowledgeId: (record.knowledgeId as Types.ObjectId).toString(),
      classificationId: (record.classificationId as Types.ObjectId).toString(),
      overallScore: record.overallScore,
      demandScore: record.demandScore,
      competitionScore: record.competitionScore,
      trendScore: record.trendScore,
      growthScore: record.growthScore,
      qualityScore: record.qualityScore,
      profitabilityScore: record.profitabilityScore,
      confidenceScore: record.confidenceScore,
      opportunityGrade: record.opportunityGrade,
      recommendation: record.recommendation,
      recommendationReason: record.recommendationReason,
      scoreVersion: record.scoreVersion,
      scoredAt: record.scoredAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}