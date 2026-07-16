import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AIClassificationModule } from '../ai-classification/ai-classification.module';
import { KnowledgeDatabaseModule } from '../knowledge-database/knowledge-database.module';
import { OpportunityScoringModule } from '../opportunity-scoring/opportunity-scoring.module';
import {
  TREND_HISTORY_CONFIG_TOKEN,
  loadTrendHistoryConfig,
} from './config/trend-history.config';
import { TrendHistory, TrendHistorySchema } from './entities/trend-history.entity';
import { HistoricalMetricsEngine } from './historical-metrics.engine';
import { TrendComparisonEngine } from './trend-comparison.engine';
import { TrendHistoryEngine } from './trend-history.engine';
import { TrendHistoryMapper } from './trend-history.mapper';
import { TrendHistoryRepository } from './trend-history.repository';
import { TrendHistoryService } from './trend-history.service';
import { TrendHistoryValidator } from './trend-history.validator';
import { TrendSnapshotFactory } from './trend-snapshot.factory';

@Module({
  imports: [
    KnowledgeDatabaseModule,
    AIClassificationModule,
    OpportunityScoringModule,
    MongooseModule.forFeature([
      { name: TrendHistory.name, schema: TrendHistorySchema },
    ]),
  ],
  providers: [
    {
      provide: TREND_HISTORY_CONFIG_TOKEN,
      useFactory: loadTrendHistoryConfig,
    },
    TrendSnapshotFactory,
    TrendHistoryValidator,
    TrendHistoryMapper,
    TrendComparisonEngine,
    HistoricalMetricsEngine,
    TrendHistoryEngine,
    TrendHistoryRepository,
    TrendHistoryService,
  ],
  exports: [
    TrendHistoryService,
    TrendHistoryRepository,
    TrendHistoryEngine,
  ],
})
export class TrendHistoryModule {}