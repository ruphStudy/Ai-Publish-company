import { Injectable, NotFoundException } from '@nestjs/common';
import type { FilterQuery } from 'mongoose';
import { GenerateInsightsDto, InsightQueryDto, InsightRefreshDto, InsightRefreshQueryDto } from './dto';
import { AIInsight, InsightCategory, InsightRefreshMode, InsightScope, InsightStatus } from './entities/ai-insight.entity';
import { InsightCoordinator } from './insight-coordinator';
import { InsightRefreshRepository } from './insight-refresh.repository';
import { InsightRepository } from './insight.repository';
import { InsightSnapshotRepository } from './insight-snapshot.repository';

@Injectable()
export class AIInsightsService {
  constructor(private readonly coordinator: InsightCoordinator, private readonly insights: InsightRepository, private readonly refreshes: InsightRefreshRepository, private readonly snapshots: InsightSnapshotRepository) {}
  executiveSummary(projectId?: string) { return this.generate({ scope: projectId ? InsightScope.PROJECT : InsightScope.PORTFOLIO, projectId, entityId: projectId }); }
  portfolio(query: InsightQueryDto) { return this.search({ ...query, scope: InsightScope.PORTFOLIO }); }
  project(projectId: string, query: InsightQueryDto) { return this.search({ ...query, projectId }); }
  scoped(scope: InsightScope, entityId: string, query: InsightQueryDto) { return this.search({ ...query, scope, entityId }); }
  risk(projectId?: string) { return this.search({ projectId, category: InsightCategory.RISK }); }
  opportunityExplanations(projectId?: string) { return this.search({ projectId, category: InsightCategory.OPPORTUNITY }); }
  generate(dto: GenerateInsightsDto, userId?: string) { return this.coordinator.generate(dto, userId); }
  refresh(dto: InsightRefreshDto, userId?: string) { return this.coordinator.refresh({ ...dto, mode: InsightRefreshMode.INCREMENTAL_REFRESH }, userId); }
  rebuild(dto: InsightRefreshDto, userId?: string) { return this.coordinator.refresh({ ...dto, mode: InsightRefreshMode.FULL_REBUILD }, userId); }
  async refreshStatus(id: string) { const item = await this.refreshes.findById(id); if (!item) throw new NotFoundException('Insight refresh not found'); return item; }
  search(query: InsightQueryDto) { const filter: FilterQuery<AIInsight> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.scope) filter.scope = query.scope; if (query.entityId) filter.entityId = query.entityId; if (query.category) filter.category = query.category; if (query.priority) filter.priority = query.priority; return this.insights.paginate(filter, query.page, query.limit); }
  listRefreshes(query: InsightRefreshQueryDto) { const filter: Record<string, unknown> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.scope) filter.scope = query.scope; if (query.status) filter.status = query.status; return this.refreshes.search(filter, query.page, query.limit); }
  async acknowledge(id: string, userId?: string) { const item = await this.insights.update(id, { status: InsightStatus.ACKNOWLEDGED, updatedBy: userId ?? null }); if (!item) throw new NotFoundException('Insight not found'); return item; }
  async dismiss(id: string, userId?: string) { const item = await this.insights.update(id, { status: InsightStatus.DISMISSED, updatedBy: userId ?? null }); if (!item) throw new NotFoundException('Insight not found'); return item; }
  currentSnapshot(scope: InsightScope, entityId?: string) { return this.snapshots.findCurrent(scope, entityId ?? null); }
}
