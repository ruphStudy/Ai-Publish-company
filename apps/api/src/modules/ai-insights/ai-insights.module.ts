import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookAnalyticsModule } from '../book-analytics/book-analytics.module';
import { OpportunityAnalyticsModule } from '../opportunity-analytics/opportunity-analytics.module';
import { AIInsightsController } from './ai-insights.controller';
import { AIInsightsEngine } from './ai-insights.engine';
import { AIInsightsService } from './ai-insights.service';
import { AIProviderRegistry } from './ai-provider.registry';
import { AIProviderResolver } from './ai-provider.resolver';
import { AIResponseNormalizer } from './ai-response.normalizer';
import { AIInsight, AIInsightSchema } from './entities/ai-insight.entity';
import { InsightRefresh, InsightRefreshSchema } from './entities/ai-insight-refresh.entity';
import { InsightSnapshot, InsightSnapshotSchema } from './entities/ai-insight-snapshot.entity';
import { InsightCacheService } from './insight-cache.service';
import { InsightCoordinator } from './insight-coordinator';
import { InsightEventPublisher } from './insight-event.publisher';
import { InsightEvidenceBuilder } from './insight-evidence.builder';
import { InsightExplanationBuilder } from './insight-explanation.builder';
import { InsightGenerationEngine } from './insight-generation.engine';
import { InsightPromptBuilder } from './insight-prompt.builder';
import { InsightRankingEngine } from './insight-ranking.engine';
import { InsightRefreshRepository } from './insight-refresh.repository';
import { InsightRepository } from './insight.repository';
import { InsightRuleRegistry } from './insight-rule.registry';
import { InsightSnapshotRepository } from './insight-snapshot.repository';
import { InsightSnapshotService } from './insight-snapshot.service';
import { InsightValidationEngine } from './insight-validation.engine';

@Module({
  imports: [
    BookAnalyticsModule,
    OpportunityAnalyticsModule,
    MongooseModule.forFeature([
      { name: AIInsight.name, schema: AIInsightSchema },
      { name: InsightRefresh.name, schema: InsightRefreshSchema },
      { name: InsightSnapshot.name, schema: InsightSnapshotSchema },
    ]),
  ],
  controllers: [AIInsightsController],
  providers: [
    AIInsightsService,
    AIInsightsEngine,
    InsightCoordinator,
    InsightRepository,
    InsightRefreshRepository,
    InsightSnapshotRepository,
    InsightSnapshotService,
    InsightGenerationEngine,
    InsightValidationEngine,
    InsightRankingEngine,
    InsightEvidenceBuilder,
    InsightExplanationBuilder,
    InsightEventPublisher,
    InsightCacheService,
    InsightRuleRegistry,
    InsightPromptBuilder,
    AIResponseNormalizer,
    AIProviderRegistry,
    AIProviderResolver,
  ],
  exports: [AIInsightsService, AIInsightsEngine, InsightRepository, InsightRefreshRepository, InsightSnapshotRepository],
})
export class AIInsightsModule {}
