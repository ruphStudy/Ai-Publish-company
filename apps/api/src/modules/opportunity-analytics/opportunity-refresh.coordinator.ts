import { createHash, randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { opportunityAnalyticsDefaultPolicy } from './config/opportunity-analytics.config';
import { OpportunityRefreshDto } from './dto';
import { OpportunityEventType, OpportunityRefreshStatus } from './entities/opportunity-analytics.entity';
import { OpportunityAnalyticsEngine } from './opportunity-analytics.engine';
import { OpportunityEventPublisher } from './opportunity-event.publisher';
import { OpportunityRefreshRepository } from './opportunity-refresh.repository';
import { OpportunitySnapshotService } from './opportunity-snapshot.service';

@Injectable()
export class OpportunityRefreshCoordinator {
  constructor(private readonly refreshes: OpportunityRefreshRepository, private readonly engine: OpportunityAnalyticsEngine, private readonly snapshots: OpportunitySnapshotService, private readonly events: OpportunityEventPublisher) {}
  async refresh(dto: OpportunityRefreshDto, userId?: string) {
    const idempotencyKey = dto.idempotencyKey ?? createHash('sha256').update(JSON.stringify(dto)).digest('hex'); const existing = await this.refreshes.findByIdempotencyKey(idempotencyKey); if (existing) return existing;
    const refresh = await this.refreshes.create({ refreshId: `ORF-${randomUUID()}`, projectId: dto.projectId ?? null, scope: dto.scope, entityIds: dto.entityIds ?? [], mode: dto.mode, status: OpportunityRefreshStatus.ANALYZING, analysisPeriod: { from: dto.from, to: dto.to }, comparisonPeriods: [], ruleKeys: dto.ruleKeys ?? [], ruleSetVersion: opportunityAnalyticsDefaultPolicy.ruleSetVersion, scoringProfileVersion: opportunityAnalyticsDefaultPolicy.scoringProfileVersion, idempotencyKey, maximumRetries: opportunityAnalyticsDefaultPolicy.maximumRetries, startedAt: new Date(), rebuildReason: dto.rebuildReason ?? null, correlationId: dto.correlationId ?? null, createdBy: userId ?? null, updatedBy: userId ?? null });
    this.events.publish(OpportunityEventType.OPPORTUNITY_REFRESH_STARTED, { refreshId: refresh.refreshId });
    try { const context = await this.engine.context(dto.projectId, dto.scope, dto.entityIds?.[0], dto.from ? new Date(dto.from) : undefined, dto.to ? new Date(dto.to) : undefined, dto.correlationId); const opportunities = await this.engine.detect(context, dto.ruleKeys, userId); await this.snapshots.create({ projectId: dto.projectId, scope: dto.scope, entityId: dto.entityIds?.[0] ?? null, opportunities, periodStart: context.periodStart, periodEnd: context.periodEnd, correlationId: dto.correlationId, userId }); return this.refreshes.update(String(refresh._id), { status: OpportunityRefreshStatus.COMPLETED, entitiesProcessed: dto.entityIds?.length ?? 1, rulesEvaluated: opportunityAnalyticsDefaultPolicy.rules.length, opportunitiesDetected: opportunities.length, completedAt: new Date(), updatedBy: userId ?? null }); } catch { return this.refreshes.update(String(refresh._id), { status: OpportunityRefreshStatus.FAILED, errorCount: 1, failedAt: new Date(), updatedBy: userId ?? null }); }
  }
}
