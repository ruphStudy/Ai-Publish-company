import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';

import { AIClassificationModule } from './ai-classification/ai-classification.module';
import { DataNormalizerModule } from './data-normalizer/data-normalizer.module';
import {
  MarketIntelligence,
  MarketIntelligenceSchema,
} from './entities/market-intelligence.entity';
import { KnowledgeDatabaseModule } from './knowledge-database/knowledge-database.module';
import { MarketIntelligenceController } from './market-intelligence.controller';
import { MARKET_INTELLIGENCE_QUEUE } from './market-intelligence.constants';
import { MarketIntelligenceRepository } from './market-intelligence.repository';
import { MarketIntelligenceSchedulerService } from './market-intelligence.scheduler';
import { MarketIntelligenceService } from './market-intelligence.service';
import { MarketMonitoringModule } from './market-monitoring/market-monitoring.module';
import { OpportunityScoringModule } from './opportunity-scoring/opportunity-scoring.module';
import { AmazonProviderModule } from './providers/amazon/amazon.module';
import { AmazonMarketplaceProvider } from './providers/amazon/amazon.provider';
import { ProviderController } from './providers/provider.controller';
import {
  ProviderRegistration,
  ProviderRegistrationSchema,
} from './providers/entities/provider-registration.entity';
import { ProviderFactoryService } from './providers/factory/provider-factory.service';
import { ProviderHealthService } from './providers/health/provider-health.service';
import { GoogleTrendsProviderModule } from './providers/google-trends/google-trends.module';
import { GoogleTrendsProvider } from './providers/google-trends/google-trends.provider';
import { ProviderRepository } from './providers/provider.repository';
import { ProviderService } from './providers/provider.service';
import { ProviderRegistryService } from './providers/registry/provider-registry.service';
import { SchedulerController } from './scheduler/scheduler.controller';
import {
  JobExecution,
  JobExecutionSchema,
} from './scheduler/entities/job-execution.entity';
import {
  SchedulerJob,
  SchedulerJobSchema,
} from './scheduler/entities/scheduler-job.entity';
import { MarketSchedulerHealthIndicator } from './scheduler/scheduler.health';
import { SchedulerRegistryService } from './scheduler/scheduler-registry.service';
import { SchedulerRepository } from './scheduler/scheduler.repository';
import { SchedulerService } from './scheduler/scheduler.service';
import { TrendHistoryModule } from './trend-history/trend-history.module';

@Module({
  imports: [
    AmazonProviderModule,
    GoogleTrendsProviderModule,
    DataNormalizerModule,
    KnowledgeDatabaseModule,
    AIClassificationModule,
    OpportunityScoringModule,
    TrendHistoryModule,
    MarketMonitoringModule,
    MongooseModule.forFeature([
      { name: MarketIntelligence.name, schema: MarketIntelligenceSchema },
      { name: SchedulerJob.name, schema: SchedulerJobSchema },
      { name: JobExecution.name, schema: JobExecutionSchema },
      { name: ProviderRegistration.name, schema: ProviderRegistrationSchema },
    ]),
    BullModule.registerQueue({ name: MARKET_INTELLIGENCE_QUEUE }),
  ],
  controllers: [
    MarketIntelligenceController,
    SchedulerController,
    ProviderController,
  ],
  providers: [
    MarketIntelligenceService,
    MarketIntelligenceRepository,
    MarketIntelligenceSchedulerService,
    SchedulerService,
    SchedulerRepository,
    SchedulerRegistryService,
    MarketSchedulerHealthIndicator,
    ProviderService,
    ProviderRepository,
    ProviderRegistryService,
    ProviderFactoryService,
    ProviderHealthService,
  ],
  exports: [
    MarketIntelligenceService,
    MarketIntelligenceRepository,
    MarketIntelligenceSchedulerService,
    SchedulerService,
    SchedulerRepository,
    SchedulerRegistryService,
    MarketSchedulerHealthIndicator,
    ProviderService,
    ProviderRepository,
    ProviderRegistryService,
    ProviderFactoryService,
    ProviderHealthService,
    DataNormalizerModule,
    KnowledgeDatabaseModule,
    AIClassificationModule,
    OpportunityScoringModule,
    TrendHistoryModule,
    MarketMonitoringModule,
    MongooseModule,
  ],
})
export class MarketIntelligenceModule implements OnModuleInit {
  constructor(
    private readonly registry: ProviderRegistryService,
    private readonly amazonProvider: AmazonMarketplaceProvider,
    private readonly googleTrendsProvider: GoogleTrendsProvider,
  ) {}

  onModuleInit(): void {
    this.registry.register(this.amazonProvider);
    this.registry.register(this.googleTrendsProvider);
  }
}