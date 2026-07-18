import { createHash, randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InsightRefreshStatus, InsightScope } from './entities/ai-insight.entity';
import type { AIInsightDocument } from './entities/ai-insight.entity';
import { InsightSnapshotRepository } from './insight-snapshot.repository';

@Injectable()
export class InsightSnapshotService {
  constructor(private readonly snapshots: InsightSnapshotRepository) {}
  async create(input: { projectId?: string | null; scope: InsightScope; entityId?: string | null; insights: AIInsightDocument[]; correlationId?: string | null; userId?: string | null }) {
    const fingerprint = createHash('sha256').update(JSON.stringify({ projectId: input.projectId, scope: input.scope, entityId: input.entityId, insightIds: input.insights.map((item) => item.insightId) })).digest('hex');
    return this.snapshots.create({ snapshotId: `AIS-${randomUUID()}`, projectId: input.projectId ?? null, scope: input.scope, entityId: input.entityId ?? null, insightIds: input.insights.map((item) => item.insightId), executiveSummary: input.insights.find((item) => item.category === 'EXECUTIVE_SUMMARY') ?? {}, categorySummaries: this.count(input.insights, 'category'), prioritySummaries: this.count(input.insights, 'priority'), generatedAt: new Date(), status: InsightRefreshStatus.COMPLETED, fingerprint, correlationId: input.correlationId ?? null, isDeleted: false, createdBy: input.userId ?? null, updatedBy: input.userId ?? null });
  }
  private count(items: AIInsightDocument[], key: keyof AIInsightDocument): Record<string, number> { return items.reduce<Record<string, number>>((acc, item) => { const value = String(item[key] ?? 'UNKNOWN'); acc[value] = (acc[value] ?? 0) + 1; return acc; }, {}); }
}
