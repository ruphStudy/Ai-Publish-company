import { Injectable } from '@nestjs/common';
import { bookAnalyticsDefaultPolicy } from './config/book-analytics.config';
import { AnalyticsQueryDto } from './dto';
import { AnalyticsScope, AnalyticsStatus } from './entities/book-analytics.entity';
import { AnalyticsAggregationService } from './analytics-aggregation.service';
import { AnalyticsCacheService } from './analytics-cache.service';
import { AnalyticsComparisonService } from './analytics-comparison.service';
import { AnalyticsDimensionResolver } from './analytics-dimension.resolver';
import { AnalyticsPeriodResolver } from './analytics-period.resolver';
import { AnalyticsSnapshotService } from './analytics-snapshot.service';
import { AnalyticsTrendService } from './analytics-trend.service';
import { CanonicalRoyaltyRepository } from '../sales-royalty-normalization/canonical-royalty.repository';
import { CanonicalSalesRepository } from '../sales-royalty-normalization/canonical-sales.repository';

@Injectable()
export class BookAnalyticsEngine {
  constructor(private readonly sales: CanonicalSalesRepository, private readonly royalties: CanonicalRoyaltyRepository, private readonly periods: AnalyticsPeriodResolver, private readonly dimensions: AnalyticsDimensionResolver, private readonly aggregation: AnalyticsAggregationService, private readonly comparisons: AnalyticsComparisonService, private readonly trends: AnalyticsTrendService, private readonly snapshots: AnalyticsSnapshotService, private readonly cache: AnalyticsCacheService) {}
  async calculate(query: AnalyticsQueryDto, persist = false, userId?: string) {
    const period = this.periods.resolve(query.period ?? bookAnalyticsDefaultPolicy.defaultAnalyticsPeriod, query.from ? new Date(query.from) : undefined, query.to ? new Date(query.to) : undefined);
    const cacheKey = JSON.stringify({ query, period }); const cached = this.cache.get<Record<string, unknown>>(cacheKey); if (cached && !persist) return cached;
    const [sales, royalties, previousSales, previousRoyalties] = await Promise.all([this.sales.search(this.dimensions.salesFilter(query, period.periodStart, period.periodEnd), 1, 10000), this.royalties.search(this.dimensions.royaltyFilter(query, period.periodStart, period.periodEnd), 1, 10000), period.comparisonPeriodStart && period.comparisonPeriodEnd ? this.sales.search(this.dimensions.salesFilter(query, period.comparisonPeriodStart, period.comparisonPeriodEnd), 1, 10000) : Promise.resolve({ items: [] }), period.comparisonPeriodStart && period.comparisonPeriodEnd ? this.royalties.search(this.dimensions.royaltyFilter(query, period.comparisonPeriodStart, period.comparisonPeriodEnd), 1, 10000) : Promise.resolve({ items: [] })]);
    const metricValues = this.aggregation.aggregate(sales.items, royalties.items); const previousValues = this.aggregation.aggregate(previousSales.items, previousRoyalties.items); const comparisonValues = this.comparisons.compare(metricValues, previousValues); const trends = this.trends.salesTrend(sales.items, 'netSales', query.granularity); const dimensionBreakdowns = { provider: this.aggregation.breakdown(sales.items as never, 'providerKey' as never, 'netAmount' as never), marketplace: this.aggregation.breakdown(sales.items as never, 'marketplaceId' as never, 'netAmount' as never), country: this.aggregation.breakdown(sales.items as never, 'countryCode' as never, 'netAmount' as never), format: this.aggregation.breakdown(sales.items as never, 'format' as never, 'netAmount' as never) };
    const dataCompleteness = { salesDataAvailable: sales.items.length > 0, royaltyDataAvailable: royalties.items.length > 0, normalizedRecordCoverage: 1, latestSalesDate: sales.items[0]?.saleDateUtc ?? null, latestRoyaltyDate: royalties.items[0]?.reportingDate ?? null, lastAnalyticsRefreshAt: new Date(), stale: false, warnings: [] };
    const result = { scope: query.scope ?? AnalyticsScope.BOOK, entityId: query.entityId ?? query.bookId ?? null, projectId: query.projectId ?? null, period, reportingCurrency: query.reportingCurrency ?? bookAnalyticsDefaultPolicy.defaultReportingCurrency, metricValues, comparisonValues, trends, dimensionBreakdowns, dataCompleteness, status: AnalyticsStatus.COMPLETED };
    if (persist) await this.snapshots.create({ projectId: result.projectId, scope: result.scope, entityId: result.entityId, entityType: result.scope, period, reportingCurrency: result.reportingCurrency, metricValues, comparisonValues, trends, dimensionBreakdowns, dataCompleteness, userId });
    this.cache.set(cacheKey, result, bookAnalyticsDefaultPolicy.cacheTtlSeconds); return result;
  }
}
