import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CanonicalRoyalty, CanonicalRoyaltySchema } from '../sales-royalty-normalization/entities/canonical-royalty.entity';
import { CanonicalSales, CanonicalSalesSchema } from '../sales-royalty-normalization/entities/canonical-sales.entity';
import { CanonicalRoyaltyRepository } from '../sales-royalty-normalization/canonical-royalty.repository';
import { CanonicalSalesRepository } from '../sales-royalty-normalization/canonical-sales.repository';
import { AnalyticsAggregationService } from './analytics-aggregation.service';
import { AnalyticsCacheService } from './analytics-cache.service';
import { AnalyticsComparisonService } from './analytics-comparison.service';
import { AnalyticsDimensionResolver } from './analytics-dimension.resolver';
import { AnalyticsMetricFactory } from './analytics-metric.factory';
import { AnalyticsMetricRegistry } from './analytics-metric.registry';
import { AnalyticsPeriodResolver } from './analytics-period.resolver';
import { AnalyticsQueryService } from './analytics-query.service';
import { AnalyticsRefreshCoordinator } from './analytics-refresh.coordinator';
import { AnalyticsSnapshotService } from './analytics-snapshot.service';
import { AnalyticsTrendService } from './analytics-trend.service';
import { AnalyticsRefresh, AnalyticsRefreshSchema, AnalyticsSnapshot, AnalyticsSnapshotSchema } from './entities/book-analytics.entity';
import { AnalyticsRefreshRepository, AnalyticsSnapshotRepository } from './book-analytics.repository';
import { BookAnalyticsController } from './book-analytics.controller';
import { BookAnalyticsCoordinator } from './book-analytics.coordinator';
import { BookAnalyticsEngine } from './book-analytics.engine';
import { BookAnalyticsEventPublisher } from './book-analytics-event.publisher';
import { BookAnalyticsService } from './book-analytics.service';

@Module({ imports: [MongooseModule.forFeature([{ name: AnalyticsSnapshot.name, schema: AnalyticsSnapshotSchema }, { name: AnalyticsRefresh.name, schema: AnalyticsRefreshSchema }, { name: CanonicalSales.name, schema: CanonicalSalesSchema }, { name: CanonicalRoyalty.name, schema: CanonicalRoyaltySchema }])], controllers: [BookAnalyticsController], providers: [BookAnalyticsService, BookAnalyticsEngine, BookAnalyticsCoordinator, AnalyticsQueryService, AnalyticsAggregationService, AnalyticsMetricRegistry, AnalyticsMetricFactory, AnalyticsDimensionResolver, AnalyticsPeriodResolver, AnalyticsSnapshotService, AnalyticsRefreshCoordinator, AnalyticsComparisonService, AnalyticsTrendService, AnalyticsCacheService, AnalyticsSnapshotRepository, AnalyticsRefreshRepository, CanonicalSalesRepository, CanonicalRoyaltyRepository, BookAnalyticsEventPublisher], exports: [BookAnalyticsService, BookAnalyticsEngine, AnalyticsSnapshotRepository, AnalyticsRefreshRepository] })
export class BookAnalyticsModule {}
