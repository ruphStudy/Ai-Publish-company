import { createHash, randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { bookAnalyticsDefaultPolicy } from './config/book-analytics.config';
import { AnalyticsRefreshDto } from './dto';
import { AnalyticsMode, AnalyticsStatus } from './entities/book-analytics.entity';
import { AnalyticsRefreshRepository } from './book-analytics.repository';
import { BookAnalyticsEngine } from './book-analytics.engine';
import { BookAnalyticsEventPublisher } from './book-analytics-event.publisher';
import { AnalyticsEventType } from './entities/book-analytics.entity';

@Injectable()
export class BookAnalyticsCoordinator {
  constructor(private readonly refreshes: AnalyticsRefreshRepository, private readonly engine: BookAnalyticsEngine, private readonly events: BookAnalyticsEventPublisher) {}
  async refresh(dto: AnalyticsRefreshDto, userId?: string) {
    const idempotencyKey = dto.idempotencyKey ?? createHash('sha256').update(JSON.stringify(dto)).digest('hex'); const existing = await this.refreshes.findByIdempotencyKey(idempotencyKey); if (existing) return existing;
    const refresh = await this.refreshes.create({ refreshId: `ARF-${randomUUID()}`, projectId: dto.projectId ?? null, scope: dto.scope, entityIds: dto.entityIds ?? [], mode: dto.mode, status: AnalyticsStatus.CALCULATING, period: { period: dto.period, from: dto.from, to: dto.to }, comparisonPeriod: null, reportingCurrency: dto.reportingCurrency ?? bookAnalyticsDefaultPolicy.defaultReportingCurrency, analyticsPolicyVersion: bookAnalyticsDefaultPolicy.policyVersion, idempotencyKey, maximumRetries: bookAnalyticsDefaultPolicy.maximumRetries, startedAt: new Date(), rebuildReason: dto.rebuildReason ?? null, correlationId: dto.correlationId ?? null, createdBy: userId ?? null, updatedBy: userId ?? null });
    this.events.publish(dto.mode === AnalyticsMode.INCREMENTAL_REFRESH ? AnalyticsEventType.ANALYTICS_REFRESH_STARTED : AnalyticsEventType.ANALYTICS_REQUESTED, { refreshId: refresh.refreshId });
    try { await this.engine.calculate({ projectId: dto.projectId, scope: dto.scope, period: dto.period, from: dto.from, to: dto.to, reportingCurrency: dto.reportingCurrency }, true, userId); return this.refreshes.update(String(refresh._id), { status: AnalyticsStatus.COMPLETED, recordsProcessed: 1, snapshotsCreated: 1, completedAt: new Date(), updatedBy: userId ?? null }); } catch (error) { return this.refreshes.update(String(refresh._id), { status: AnalyticsStatus.FAILED, failedAt: new Date(), errorCount: 1, updatedBy: userId ?? null }); }
  }
}
