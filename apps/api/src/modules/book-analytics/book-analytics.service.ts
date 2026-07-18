import { Injectable, NotFoundException } from '@nestjs/common';
import type { FilterQuery } from 'mongoose';
import { AnalyticsQueryDto, AnalyticsRefreshDto, AnalyticsRefreshQueryDto, AnalyticsSnapshotQueryDto } from './dto';
import { AnalyticsRefresh, AnalyticsScope, AnalyticsSnapshot, AnalyticsStatus } from './entities/book-analytics.entity';
import { AnalyticsRefreshRepository, AnalyticsSnapshotRepository } from './book-analytics.repository';
import { AnalyticsQueryService } from './analytics-query.service';
import { AnalyticsRefreshCoordinator } from './analytics-refresh.coordinator';

@Injectable()
export class BookAnalyticsService {
  constructor(private readonly queries: AnalyticsQueryService, private readonly refreshCoordinator: AnalyticsRefreshCoordinator, private readonly snapshots: AnalyticsSnapshotRepository, private readonly refreshes: AnalyticsRefreshRepository) {}
  bookSummary(bookId: string, query: AnalyticsQueryDto) { return this.queries.summary(AnalyticsScope.BOOK, { ...query, bookId, entityId: bookId }); }
  bookSales(bookId: string, query: AnalyticsQueryDto) { return this.bookSummary(bookId, query); }
  bookRoyalty(bookId: string, query: AnalyticsQueryDto) { return this.bookSummary(bookId, query); }
  bookComparison(bookId: string, query: AnalyticsQueryDto) { return this.queries.comparison(AnalyticsScope.BOOK, { ...query, bookId, entityId: bookId }); }
  bookTrend(bookId: string, query: AnalyticsQueryDto) { return this.queries.trend(AnalyticsScope.BOOK, { ...query, bookId, entityId: bookId }); }
  bookBreakdown(bookId: string, dimension: string, query: AnalyticsQueryDto) { return this.queries.breakdown(AnalyticsScope.BOOK, dimension, { ...query, bookId, entityId: bookId }); }
  scoped(scope: AnalyticsScope, entityId: string, query: AnalyticsQueryDto) { return this.queries.summary(scope, { ...query, entityId }); }
  project(projectId: string, query: AnalyticsQueryDto) { return this.queries.summary(AnalyticsScope.PROJECT, { ...query, projectId }); }
  portfolio(query: AnalyticsQueryDto) { return this.queries.summary(AnalyticsScope.PORTFOLIO, query); }
  currentSnapshot(scope: AnalyticsScope, entityId: string | null, currency: string) { return this.snapshots.findCurrent(scope, entityId, currency); }
  listSnapshots(query: AnalyticsSnapshotQueryDto) { const filter: FilterQuery<AnalyticsSnapshot> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.scope) filter.scope = query.scope; if (query.entityId) filter.entityId = query.entityId; if (query.reportingCurrency) filter.reportingCurrency = query.reportingCurrency; if (query.status) filter.status = query.status; return this.snapshots.paginate(filter, query.page, query.limit); }
  incremental(dto: AnalyticsRefreshDto, userId?: string) { return this.refreshCoordinator.request({ ...dto, mode: 'INCREMENTAL_REFRESH' as never }, userId); }
  rebuild(dto: AnalyticsRefreshDto, userId?: string) { return this.refreshCoordinator.request({ ...dto, mode: 'FULL_REBUILD' as never }, userId); }
  async refreshStatus(id: string) { const item = await this.refreshes.findById(id); if (!item) throw new NotFoundException('Analytics refresh not found'); return item; }
  listRefreshes(query: AnalyticsRefreshQueryDto) { const filter: FilterQuery<AnalyticsRefresh> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.scope) filter.scope = query.scope; if (query.status) filter.status = query.status; return this.refreshes.paginate(filter, query.page, query.limit); }
  cancelRefresh(id: string) { return this.refreshes.update(id, { status: AnalyticsStatus.CANCELLED, cancelledAt: new Date() }); }
  retryFailed(id: string) { return this.refreshes.update(id, { status: AnalyticsStatus.RETRY_PENDING, retryCount: 1 }); }
  async softDeleteRefresh(id: string, userId?: string) { if (!(await this.refreshes.softDelete(id, userId))) throw new NotFoundException('Analytics refresh not found'); }
  restoreRefresh(id: string) { return this.refreshes.restore(id); }
}
