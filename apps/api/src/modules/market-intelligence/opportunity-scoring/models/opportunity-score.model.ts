import { AIClassificationResponseDto } from '../../ai-classification/dto';
import { MarketKnowledgeResponseDto } from '../../knowledge-database/dto';

export enum OpportunityGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  F = 'F',
}

export enum OpportunityRecommendation {
  PRIORITIZE = 'prioritize',
  VALIDATE = 'validate',
  MONITOR = 'monitor',
  AVOID = 'avoid',
}

export interface OpportunityScoreResult {
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
}

export interface OpportunityScoringContext {
  knowledge: MarketKnowledgeResponseDto;
  classification: AIClassificationResponseDto;
  scoreVersion: string;
}