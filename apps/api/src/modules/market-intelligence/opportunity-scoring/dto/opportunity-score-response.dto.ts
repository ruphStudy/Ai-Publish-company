import type {
  OpportunityGrade,
  OpportunityRecommendation,
} from '../models/opportunity-score.model';

export class OpportunityScoreResponseDto {
  id: string;
  knowledgeId: string;
  classificationId: string;
  overallScore: number;
  demandScore: number;
  competitionScore: number;
  trendScore: number;
  growthScore: number;
  qualityScore: number;
  profitabilityScore: number;
  confidenceScore: number;
  opportunityGrade: OpportunityGrade;
  recommendation: OpportunityRecommendation;
  recommendationReason: string;
  scoreVersion: string;
  scoredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedOpportunityScoreResponseDto {
  data: OpportunityScoreResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}