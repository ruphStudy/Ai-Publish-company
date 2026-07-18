import { createHash, randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { opportunityAnalyticsDefaultPolicy } from './config/opportunity-analytics.config';
import { OpportunityRefreshStatus, OpportunityScope } from './entities/opportunity-analytics.entity';
import type { OpportunityDocument } from './entities/opportunity-analytics.entity';
import { OpportunitySnapshotRepository } from './opportunity-snapshot.repository';

@Injectable()
export class OpportunitySnapshotService {
  constructor(private readonly snapshots: OpportunitySnapshotRepository) {}
  async create(input: { projectId?: string | null; scope: OpportunityScope; entityId?: string | null; opportunities: OpportunityDocument[]; periodStart: Date; periodEnd: Date; correlationId?: string | null; userId?: string | null }) {
    const ranked = [...input.opportunities].sort((a, b) => b.score - a.score); const fingerprint = createHash('sha256').update(JSON.stringify({ projectId: input.projectId, scope: input.scope, entityId: input.entityId, ids: ranked.map((item) => item.opportunityId), periodStart: input.periodStart, periodEnd: input.periodEnd, ruleSet: opportunityAnalyticsDefaultPolicy.ruleSetVersion })).digest('hex'); const existing = await this.snapshots.findByFingerprint(fingerprint); if (existing) return existing;
    return this.snapshots.create({ snapshotId: `OPS-${randomUUID()}`, projectId: input.projectId ?? null, scope: input.scope, entityId: input.entityId ?? null, analysisPeriodStart: input.periodStart, analysisPeriodEnd: input.periodEnd, comparisonPeriods: [], opportunityIds: input.opportunities.map((item) => item.opportunityId), rankedOpportunityIds: ranked.map((item) => item.opportunityId), categorySummaries: this.countBy(ranked, 'category'), prioritySummaries: this.countBy(ranked, 'priority'), providerSummaries: this.countBy(ranked, 'providerKey'), marketplaceSummaries: this.countBy(ranked, 'marketplaceId'), countrySummaries: this.countBy(ranked, 'countryCode'), formatSummaries: this.countBy(ranked, 'format'), totalEstimatedImpact: null, dataCompleteness: {}, dataFreshness: {}, ruleSetVersion: opportunityAnalyticsDefaultPolicy.ruleSetVersion, scoringProfileVersion: opportunityAnalyticsDefaultPolicy.scoringProfileVersion, sourceAnalyticsSnapshotIds: [...new Set(ranked.flatMap((item) => item.sourceAnalyticsSnapshotIds))], generatedAt: new Date(), status: OpportunityRefreshStatus.COMPLETED, fingerprint, correlationId: input.correlationId ?? null, isDeleted: false, createdBy: input.userId ?? null, updatedBy: input.userId ?? null });
  }
  private countBy(items: OpportunityDocument[], key: keyof OpportunityDocument): Record<string, number> { return items.reduce<Record<string, number>>((acc, item) => { const value = String(item[key] ?? 'UNKNOWN'); acc[value] = (acc[value] ?? 0) + 1; return acc; }, {}); }
}
