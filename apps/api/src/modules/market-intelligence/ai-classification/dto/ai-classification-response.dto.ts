import type {
  ClassificationCompetitionLevel,
  ClassificationComplexity,
  ClassificationContentType,
  ClassificationDemandLevel,
  ClassificationMarketMaturity,
  ClassificationTopicType,
  ClassificationWritingStyle,
} from '../models/classification-result.model';

export class AIClassificationResponseDto {
  id: string;
  knowledgeId: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedAIClassificationResponseDto {
  data: AIClassificationResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}