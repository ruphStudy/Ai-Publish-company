import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AIClassificationModule } from '../ai-classification/ai-classification.module';
import { AI_CLASSIFICATION_CONFIG_TOKEN } from '../ai-classification/config/ai-classification.config';
import { KnowledgeDatabaseModule } from '../knowledge-database/knowledge-database.module';
import {
  OPPORTUNITY_SCORING_CONFIG_TOKEN,
  loadOpportunityScoringConfig,
} from './config/opportunity-scoring.config';
import {
  OpportunityScore,
  OpportunityScoreSchema,
} from './entities/opportunity-score.entity';
import { SCORING_STRATEGIES_TOKEN } from './interfaces/scoring-strategy.interface';
import { OpportunityScoreCalculator } from './opportunity-score-calculator';
import { OpportunityScoreFactory } from './opportunity-score.factory';
import { OpportunityScoringEngine } from './opportunity-scoring.engine';
import { OpportunityScoringMapper } from './opportunity-scoring.mapper';
import { OpportunityScoringRepository } from './opportunity-scoring.repository';
import { OpportunityScoringService } from './opportunity-scoring.service';
import { OpportunityScoringValidator } from './opportunity-scoring.validator';
import { DefaultScoringStrategy } from './strategies/default-scoring.strategy';

@Module({
  imports: [
    KnowledgeDatabaseModule,
    AIClassificationModule,
    MongooseModule.forFeature([
      { name: OpportunityScore.name, schema: OpportunityScoreSchema },
    ]),
  ],
  providers: [
    {
      provide: OPPORTUNITY_SCORING_CONFIG_TOKEN,
      useFactory: loadOpportunityScoringConfig,
    },
    {
      provide: AI_CLASSIFICATION_CONFIG_TOKEN,
      useFactory: () => ({
        classificationVersion: process.env.AI_CLASSIFICATION_VERSION ?? '1.0.0',
        highDemandTrendScore: Number(
          process.env.AI_CLASSIFICATION_HIGH_DEMAND_TREND_SCORE ?? 70,
        ),
        mediumDemandTrendScore: Number(
          process.env.AI_CLASSIFICATION_MEDIUM_DEMAND_TREND_SCORE ?? 35,
        ),
        highDemandSearchVolume: Number(
          process.env.AI_CLASSIFICATION_HIGH_DEMAND_SEARCH_VOLUME ?? 70,
        ),
        mediumDemandSearchVolume: Number(
          process.env.AI_CLASSIFICATION_MEDIUM_DEMAND_SEARCH_VOLUME ?? 35,
        ),
        highCompetitionReviewCount: Number(
          process.env.AI_CLASSIFICATION_HIGH_COMPETITION_REVIEW_COUNT ?? 500,
        ),
        mediumCompetitionReviewCount: Number(
          process.env.AI_CLASSIFICATION_MEDIUM_COMPETITION_REVIEW_COUNT ?? 100,
        ),
        evergreenTrendScoreMaximum: Number(
          process.env.AI_CLASSIFICATION_EVERGREEN_TREND_SCORE_MAXIMUM ?? 45,
        ),
        seasonalKeywordScore: Number(
          process.env.AI_CLASSIFICATION_SEASONAL_KEYWORD_SCORE ?? 80,
        ),
        maxTags: Number(process.env.AI_CLASSIFICATION_MAX_TAGS ?? 20),
      }),
    },
    OpportunityScoreCalculator,
    DefaultScoringStrategy,
    {
      provide: SCORING_STRATEGIES_TOKEN,
      useFactory: (defaultStrategy: DefaultScoringStrategy) => [
        defaultStrategy,
      ],
      inject: [DefaultScoringStrategy],
    },
    OpportunityScoringValidator,
    OpportunityScoringMapper,
    OpportunityScoreFactory,
    OpportunityScoringEngine,
    OpportunityScoringRepository,
    OpportunityScoringService,
  ],
  exports: [
    OpportunityScoringService,
    OpportunityScoringRepository,
    OpportunityScoringEngine,
  ],
})
export class OpportunityScoringModule {}