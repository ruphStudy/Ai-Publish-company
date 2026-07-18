import { Injectable, NotFoundException } from '@nestjs/common';
import type { FilterQuery } from 'mongoose';
import { OpportunityActionDto, OpportunityQueryDto, OpportunityRefreshDto, OpportunityRefreshQueryDto } from './dto';
import { Opportunity, OpportunityRefreshStatus, OpportunityScope, OpportunityStatus } from './entities/opportunity-analytics.entity';
import { OpportunityQueryService } from './opportunity-query.service';
import { OpportunityRefreshRepository } from './opportunity-refresh.repository';
import { OpportunityRepository } from './opportunity.repository';
import { OpportunityRefreshCoordinator } from './opportunity-refresh.coordinator';
import { OpportunitySnapshotRepository } from './opportunity-snapshot.repository';

@Injectable()
export class OpportunityAnalyticsService {
  constructor(private readonly opportunities: OpportunityRepository, private readonly queryService: OpportunityQueryService, private readonly refreshCoordinator: OpportunityRefreshCoordinator, private readonly refreshes: OpportunityRefreshRepository, private readonly snapshots: OpportunitySnapshotRepository) {}
  project(projectId: string, query: OpportunityQueryDto) { return this.queryService.search({ ...query, projectId }); }
  portfolio(query: OpportunityQueryDto) { return this.queryService.search(query); }
  scoped(scope: OpportunityScope, entityId: string, query: OpportunityQueryDto) { return this.queryService.search({ ...query, scope, entityId }); }
  get(id: string) { return this.opportunities.findById(id); }
  top(query: OpportunityQueryDto) { return this.queryService.top(query); }
  evidence(id: string) { return this.get(id).then((item) => item?.evidence ?? []); }
  summaries(projectId?: string) { return this.queryService.summary(projectId); }
  incremental(dto: OpportunityRefreshDto, userId?: string) { return this.refreshCoordinator.refresh({ ...dto, mode: 'INCREMENTAL_REFRESH' as never }, userId); }
  rebuild(dto: OpportunityRefreshDto, userId?: string) { return this.refreshCoordinator.refresh({ ...dto, mode: 'FULL_REBUILD' as never }, userId); }
  async refreshStatus(id: string) { const item = await this.refreshes.findById(id); if (!item) throw new NotFoundException('Opportunity refresh not found'); return item; }
  listRefreshes(query: OpportunityRefreshQueryDto) { const filter: FilterQuery<Opportunity> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.scope) filter.scope = query.scope; if (query.status) filter.status = query.status as unknown as OpportunityStatus; return this.refreshes.paginate(filter as never, query.page, query.limit); }
  cancelRefresh(id: string) { return this.refreshes.update(id, { status: OpportunityRefreshStatus.CANCELLED, cancelledAt: new Date() }); }
  retryFailedRefresh(id: string) { return this.refreshes.update(id, { status: OpportunityRefreshStatus.RETRY_PENDING, retryCount: 1 }); }
  async transition(id: string, status: OpportunityStatus, dto: OpportunityActionDto, userId?: string) { const item = await this.opportunities.findById(id); if (!item) throw new NotFoundException('Opportunity not found'); const now = new Date(); const update: Record<string, unknown> = { status, updatedBy: userId ?? null }; if (status === OpportunityStatus.ACCEPTED) { update.acceptedAt = now; update.acceptedBy = userId ?? null; } if (status === OpportunityStatus.SNOOZED) { update.snoozedUntil = dto.snoozedUntil ? new Date(dto.snoozedUntil) : new Date(Date.now() + 7 * 86_400_000); update.snoozedBy = userId ?? null; } if (status === OpportunityStatus.DISMISSED) { update.dismissedAt = now; update.dismissedBy = userId ?? null; update.dismissalReason = dto.reason ?? null; } if (status === OpportunityStatus.RESOLVED) { update.resolvedAt = now; update.resolvedBy = userId ?? null; update.resolutionReason = dto.reason ?? null; } return this.opportunities.update(id, update); }
  preview(dto: OpportunityRefreshDto) { return { scope: dto.scope, ruleSetVersion: 'opportunity-rules-v1', scoringProfileVersion: 'opportunity-scoring-v1' }; }
  currentSnapshot(scope: OpportunityScope, entityId?: string) { return this.snapshots.findCurrent(scope, entityId ?? null); }
  listSnapshots(query: OpportunityQueryDto) { const filter: FilterQuery<Opportunity> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.scope) filter.scope = query.scope; if (query.entityId) filter.entityId = query.entityId; return this.snapshots.paginate(filter as never, query.page, query.limit); }
  search(query: OpportunityQueryDto) { return this.queryService.search(query); }
  async softDeleteRefresh(id: string, userId?: string) { if (!(await this.refreshes.softDelete(id, userId))) throw new NotFoundException('Opportunity refresh not found'); }
  restoreRefresh(id: string) { return this.refreshes.restore(id); }
}
