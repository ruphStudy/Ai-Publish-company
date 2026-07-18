import { Module } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsSnapshot, AnalyticsSnapshotSchema } from '../book-analytics/entities/book-analytics.entity';
import { AnalyticsSnapshotRepository } from '../book-analytics/book-analytics.repository';
import { Opportunity, OpportunitySchema } from './entities/opportunity-analytics.entity';
import { OpportunityRefresh, OpportunityRefreshSchema } from './entities/opportunity-refresh.entity';
import { OpportunitySnapshot, OpportunitySnapshotSchema } from './entities/opportunity-snapshot.entity';
import { OpportunityAnalyticsController } from './opportunity-analytics.controller';
import { OpportunityAnalyticsEngine } from './opportunity-analytics.engine';
import { OpportunityAnalyticsService } from './opportunity-analytics.service';
import { OpportunityCacheService } from './opportunity-cache.service';
import { OpportunityConfidenceCalculator } from './opportunity-confidence.calculator';
import { OpportunityConflictResolver } from './opportunity-conflict.resolver';
import { OpportunityDeduplicationService } from './opportunity-deduplication.service';
import { OpportunityEvidenceBuilder } from './opportunity-evidence.builder';
import { OpportunityEventPublisher } from './opportunity-event.publisher';
import { OpportunityQueryService } from './opportunity-query.service';
import { OpportunityRankingService } from './opportunity-ranking.service';
import { OpportunityRefreshCoordinator } from './opportunity-refresh.coordinator';
import { OpportunityRefreshRepository } from './opportunity-refresh.repository';
import { OpportunityRepository } from './opportunity.repository';
import { OpportunityRuleFactory } from './opportunity-rule.factory';
import { OpportunityRuleRegistry } from './opportunity-rule.registry';
import { OpportunityScoringEngine } from './opportunity-scoring.engine';
import { OpportunitySnapshotRepository } from './opportunity-snapshot.repository';
import { OpportunitySnapshotService } from './opportunity-snapshot.service';

@Injectable()
export class OpportunityDetectionCoordinator {}

@Module({ imports: [MongooseModule.forFeature([{ name: Opportunity.name, schema: OpportunitySchema }, { name: OpportunityRefresh.name, schema: OpportunityRefreshSchema }, { name: OpportunitySnapshot.name, schema: OpportunitySnapshotSchema }, { name: AnalyticsSnapshot.name, schema: AnalyticsSnapshotSchema }])], controllers: [OpportunityAnalyticsController], providers: [OpportunityAnalyticsService, OpportunityAnalyticsEngine, OpportunityDetectionCoordinator, OpportunityRuleRegistry, OpportunityRuleFactory, OpportunityScoringEngine, OpportunityRankingService, OpportunityEvidenceBuilder, OpportunityConfidenceCalculator, OpportunityDeduplicationService, OpportunityConflictResolver, OpportunityRefreshCoordinator, OpportunityQueryService, OpportunitySnapshotService, OpportunityCacheService, OpportunityRepository, OpportunitySnapshotRepository, OpportunityRefreshRepository, AnalyticsSnapshotRepository, OpportunityEventPublisher], exports: [OpportunityAnalyticsService, OpportunityAnalyticsEngine, OpportunityRepository, OpportunitySnapshotRepository, OpportunityRefreshRepository] })
export class OpportunityAnalyticsModule {}
