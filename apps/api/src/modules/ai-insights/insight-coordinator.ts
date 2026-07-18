import { createHash, randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { aiInsightsDefaultPolicy } from './config/ai-insights.config';
import { GenerateInsightsDto, InsightRefreshDto } from './dto';
import { InsightEventType, InsightRefreshStatus } from './entities/ai-insight.entity';
import { AIInsightsEngine } from './ai-insights.engine';
import { InsightEventPublisher } from './insight-event.publisher';
import { InsightRefreshRepository } from './insight-refresh.repository';
import { InsightSnapshotService } from './insight-snapshot.service';

@Injectable()
export class InsightCoordinator {
  constructor(private readonly engine: AIInsightsEngine, private readonly refreshes: InsightRefreshRepository, private readonly snapshots: InsightSnapshotService, private readonly events: InsightEventPublisher) {}
  generate(dto: GenerateInsightsDto, userId?: string) { return this.engine.generate(dto, userId); }
  async refresh(dto: InsightRefreshDto, userId?: string) {
    const idempotencyKey = dto.idempotencyKey ?? createHash('sha256').update(JSON.stringify(dto)).digest('hex'); const existing = await this.refreshes.findByIdempotencyKey(idempotencyKey); if (existing) return existing;
    const refresh = await this.refreshes.create({ refreshId: `AIR-${randomUUID()}`, projectId: dto.projectId ?? null, scope: dto.scope, entityIds: dto.entityIds ?? [], mode: dto.mode, status: InsightRefreshStatus.GENERATING, idempotencyKey, startedAt: new Date(), maximumRetries: aiInsightsDefaultPolicy.maximumRetries, correlationId: dto.correlationId ?? null, createdBy: userId ?? null, updatedBy: userId ?? null });
    this.events.publish(InsightEventType.INSIGHT_REFRESH_STARTED, { refreshId: refresh.refreshId });
    try { const insights = await this.engine.generate({ scope: dto.scope, projectId: dto.projectId, entityId: dto.entityIds?.[0], correlationId: dto.correlationId }, userId); await this.snapshots.create({ projectId: dto.projectId, scope: dto.scope, entityId: dto.entityIds?.[0] ?? null, insights, correlationId: dto.correlationId, userId }); return this.refreshes.update(String(refresh._id), { status: InsightRefreshStatus.COMPLETED, insightsGenerated: insights.length, completedAt: new Date(), updatedBy: userId ?? null }); } catch { return this.refreshes.update(String(refresh._id), { status: InsightRefreshStatus.FAILED, errorCount: 1, failedAt: new Date(), updatedBy: userId ?? null }); }
  }
}
