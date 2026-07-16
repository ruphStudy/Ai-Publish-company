import { MarketKnowledgeResponseDto } from '../../knowledge-database/dto';

export enum ClassificationContentType {
  BOOK = 'book',
  GUIDE = 'guide',
  WORKBOOK = 'workbook',
  JOURNAL = 'journal',
  TREND = 'trend',
  REFERENCE = 'reference',
  UNKNOWN = 'unknown',
}

export enum ClassificationWritingStyle {
  EDUCATIONAL = 'educational',
  PRACTICAL = 'practical',
  INSPIRATIONAL = 'inspirational',
  ANALYTICAL = 'analytical',
  REFERENCE = 'reference',
  UNKNOWN = 'unknown',
}

export enum ClassificationComplexity {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  MIXED = 'mixed',
}

export enum ClassificationDemandLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum ClassificationCompetitionLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum ClassificationMarketMaturity {
  EMERGING = 'emerging',
  GROWING = 'growing',
  MATURE = 'mature',
  SATURATED = 'saturated',
}

export enum ClassificationTopicType {
  EVERGREEN = 'evergreen',
  TRENDING = 'trending',
  SEASONAL = 'seasonal',
  MIXED = 'mixed',
}

export interface ClassificationResult {
  primaryCategory: string | null;
  secondaryCategory: string | null;
  niche: string | null;
  microNiche: string | null;
  targetAudience: string | null;
  contentType: ClassificationContentType;
  writingStyle: ClassificationWritingStyle;
  complexity: ClassificationComplexity;
  demandLevel: ClassificationDemandLevel;
  competitionLevel: ClassificationCompetitionLevel;
  marketMaturity: ClassificationMarketMaturity;
  topicType: ClassificationTopicType;
  commercialIntent: boolean;
  educationalIntent: boolean;
  evergreenScore: number;
  seasonalScore: number;
  aiTags: string[];
  confidenceScore: number;
  classificationVersion: string;
  classifiedAt: Date;
}

export interface ClassificationContext {
  knowledge: MarketKnowledgeResponseDto;
  classificationVersion: string;
}