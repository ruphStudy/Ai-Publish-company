import { OnModuleInit } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';

import { AIClassificationModule } from '../ai-classification/ai-classification.module';
import { DataNormalizerModule } from '../data-normalizer/data-normalizer.module';
import { KnowledgeDatabaseModule } from '../knowledge-database/knowledge-database.module';
import {
  MARKET_INTELLIGENCE_QUEUE,
} from '../market-intelligence.constants';
import { MarketIntelligenceSchedulerService } from '../market-intelligence.scheduler';
import { OpportunityScoringModule } from '../opportunity-scoring/opportunity-scoring.module';
import { AmazonProviderModule } from '../providers/amazon/amazon.module';
import { AmazonMarketplaceProvider } from '../providers/amazon/amazon.provider';
import { ProviderFactoryService } from '../providers/factory/provider-factory.service';
import { GoogleTrendsProviderModule } from '../providers/google-trends/google-trends.module';
import { GoogleTrendsProvider } from '../providers/google-trends/google-trends.provider';
import { ProviderRegistryService } from '../providers/registry/provider-registry.service';
import { TrendHistoryModule } from '../trend-history/trend-history.module';
import { MonitoringConfigurationService } from './config/monitoring.configuration.service';
import {
  MonitoringExecution,
  MonitoringExecutionSchema,
} from './entities/monitoring-execution.entity';
import { MarketMonitoringScheduler } from './market-monitoring.scheduler';
import { MarketMonitoringService } from './market-monitoring.service';
import { MonitoringExecutionEngine } from './monitoring-execution.engine';
import { MonitoringFactory } from './monitoring.factory';
import { MonitoringJobRepository } from './monitoring-job.repository';
import { MonitoringJobRunner } from './monitoring-job-runner';
import { MonitoringValidator } from './monitoring.validator';

@Module({
  imports: [
    AmazonProviderModule,
    GoogleTrendsProviderModule,
    DataNormalizerModule,
    KnowledgeDatabaseModule,
    AIClassificationModule,
    OpportunityScoringModule,
    TrendHistoryModule,
    MongooseModule.forFeature([
      { name: MonitoringExecution.name, schema: MonitoringExecutionSchema },
    ]),
    BullModule.registerQueue({ name: MARKET_INTELLIGENCE_QUEUE }),
  ],
  providers: [
    MonitoringConfigurationService,
    MonitoringFactory,
    MonitoringValidator,
    MonitoringJobRepository,
    ProviderRegistryService,
    ProviderFactoryService,
    MarketIntelligenceSchedulerService,
    MonitoringJobRunner,
    MonitoringExecutionEngine,
    MarketMonitoringScheduler,
    MarketMonitoringService,
  ],
  exports: [
    MarketMonitoringService,
    MarketMonitoringScheduler,
    MonitoringJobRepository,
  ],
})
export class MarketMonitoringModule implements OnModuleInit {
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