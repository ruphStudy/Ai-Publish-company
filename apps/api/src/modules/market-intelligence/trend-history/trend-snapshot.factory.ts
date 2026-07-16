import { Inject, Injectable } from '@nestjs/common';

import { AIClassificationResponseDto } from '../ai-classification/dto';
import { MarketKnowledgeResponseDto } from '../knowledge-database/dto';
import { OpportunityScoreResponseDto } from '../opportunity-scoring/dto';
import {
  TREND_HISTORY_CONFIG_TOKEN,
  TrendHistoryConfig,
} from './config/trend-history.config';
import { TrendSnapshotData } from './models/trend-history.model';

@Injectable()
export class TrendSnapshotFactory {
  constructor(
    @Inject(TREND_HISTORY_CONFIG_TOKEN)
    private readonly config: TrendHistoryConfig,
  ) {}

  create(
    knowledge: MarketKnowledgeResponseDto,
    classification: AIClassificationResponseDto | null,
    opportunityScore: OpportunityScoreResponseDto | null,
  ): TrendSnapshotData {
    return {
      knowledgeRecordId: knowledge.id,
      provider: knowledge.provider,
      externalId: knowledge.externalId,
      snapshotDate: new Date(),
      snapshotVersion: this.config.snapshotVersion,
      trendScore: knowledge.trendScore,
      opportunityScore: opportunityScore?.overallScore ?? null,
      demandScore: opportunityScore?.demandScore ?? null,
      competitionScore: opportunityScore?.competitionScore ?? null,
      searchVolume: knowledge.searchVolume,
      rating: knowledge.rating,
      reviewCount: knowledge.reviewCount,
      price: knowledge.price,
      classification: classification
        ? {
            primaryCategory: classification.primaryCategory,
            secondaryCategory: classification.secondaryCategory,
            niche: classification.niche,
            demandLevel: classification.demandLevel,
            competitionLevel: classification.competitionLevel,
            topicType: classification.topicType,
            confidenceScore: classification.confidenceScore,
            classificationVersion: classification.classificationVersion,
          }
        : null,
      metadata: {
        currency: knowledge.currency,
        sourceUrl: knowledge.sourceUrl,
        language: knowledge.language,
        providerMetadata: knowledge.metadata,
        opportunityGrade: opportunityScore?.opportunityGrade ?? null,
        recommendation: opportunityScore?.recommendation ?? null,
      },
    };
  }
}