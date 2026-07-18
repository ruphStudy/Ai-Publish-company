import { createHash, randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { bookAnalyticsDefaultPolicy } from './config/book-analytics.config';
import { AnalyticsStatus, AnalyticsSnapshotType } from './entities/book-analytics.entity';
import { AnalyticsSnapshotRepository } from './book-analytics.repository';
import type { AnalyticsPeriodRange } from './interfaces/book-analytics.interface';

@Injectable()
export class AnalyticsSnapshotService {
  constructor(private readonly snapshots: AnalyticsSnapshotRepository) {}
  async create(input: { projectId?: string | null; scope: string; entityId?: string | null; entityType: string; period: AnalyticsPeriodRange; reportingCurrency: string; metricValues: Record<string, unknown>; comparisonValues: Record<string, unknown>; trends: Record<string, unknown>[]; dimensionBreakdowns: Record<string, unknown>; dataCompleteness: Record<string, unknown>; correlationId?: string | null; userId?: string | null }) {
    const fingerprint = createHash('sha256').update(JSON.stringify({ projectId: input.projectId, scope: input.scope, entityId: input.entityId, period: input.period, currency: input.reportingCurrency, policy: bookAnalyticsDefaultPolicy.policyVersion, metrics: input.metricValues })).digest('hex');
    const existing = await this.snapshots.findByFingerprint(fingerprint); if (existing) return existing;
    return this.snapshots.create({ snapshotId: `ANS-${randomUUID()}`, projectId: input.projectId ?? null, scope: input.scope as never, entityId: input.entityId ?? null, entityType: input.entityType, periodType: input.period.periodType === 'LIFETIME' ? AnalyticsSnapshotType.LIFETIME : AnalyticsSnapshotType.CUSTOM, periodStart: input.period.periodStart, periodEnd: input.period.periodEnd, comparisonPeriodStart: input.period.comparisonPeriodStart, comparisonPeriodEnd: input.period.comparisonPeriodEnd, reportingCurrency: input.reportingCurrency, metricValues: input.metricValues, comparisonValues: input.comparisonValues, trends: input.trends, dimensionBreakdowns: input.dimensionBreakdowns, dataCompleteness: input.dataCompleteness, sourceCheckpoint: {}, analyticsPolicyVersion: bookAnalyticsDefaultPolicy.policyVersion, normalizationProfileVersions: [], generatedAt: new Date(), validUntil: null, status: AnalyticsStatus.COMPLETED, fingerprint, correlationId: input.correlationId ?? null, isDeleted: false, createdBy: input.userId ?? null, updatedBy: input.userId ?? null });
  }
}
