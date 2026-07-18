import { createHash, randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { AnalyticsSnapshotRepository } from '../book-analytics/book-analytics.repository';
import { OpportunityRepository } from '../opportunity-analytics/opportunity.repository';
import { aiInsightsDefaultPolicy } from './config/ai-insights.config';
import { GenerateInsightsDto } from './dto';
import { AIInsight, InsightEventType, InsightStatus } from './entities/ai-insight.entity';
import { InsightRepository } from './insight.repository';
import { InsightEvidenceBuilder } from './insight-evidence.builder';
import { InsightEventPublisher } from './insight-event.publisher';
import { InsightExplanationBuilder } from './insight-explanation.builder';
import { InsightGenerationEngine } from './insight-generation.engine';
import { InsightRankingEngine } from './insight-ranking.engine';
import { InsightValidationEngine } from './insight-validation.engine';

@Injectable()
export class AIInsightsEngine {
  constructor(private readonly analytics: AnalyticsSnapshotRepository, private readonly opportunities: OpportunityRepository, private readonly insights: InsightRepository, private readonly generation: InsightGenerationEngine, private readonly validation: InsightValidationEngine, private readonly ranking: InsightRankingEngine, private readonly evidenceBuilder: InsightEvidenceBuilder, private readonly explanations: InsightExplanationBuilder, private readonly events: InsightEventPublisher) {}
  async generate(dto: GenerateInsightsDto, userId?: string) {
    this.events.publish(InsightEventType.INSIGHT_STARTED, { scope: dto.scope, projectId: dto.projectId, entityId: dto.entityId });
    const analytics = dto.projectId ? await this.analytics.findByProjectId(dto.projectId) : await this.analytics.findByScope(dto.scope as never);
    const opportunities = dto.projectId ? await this.opportunities.findByProjectId(dto.projectId) : await this.opportunities.findByScope(dto.scope as never);
    const context = { projectId: dto.projectId ?? null, scope: dto.scope, entityId: dto.entityId ?? null, analytics: analytics.map((item) => item.toObject() as Record<string, unknown>), opportunities: opportunities.map((item) => item.toObject() as Record<string, unknown>), metadata: {}, correlationId: dto.correlationId ?? null };
    const generated = await this.generation.generate(context, dto.aiProvider, dto.model); const ranked = this.ranking.rank(generated.insights); this.validation.validate(ranked);
    const persisted: AIInsight[] = [];
    for (const item of ranked) {
      const fingerprint = this.fingerprint({ projectId: dto.projectId, scope: dto.scope, entityId: dto.entityId, category: item.category, type: item.type, title: item.title, promptVersion: generated.promptVersion, analytics: analytics.map((a) => a.snapshotId), opportunities: opportunities.map((o) => o.opportunityId) });
      const existing = await this.insights.findByFingerprint(fingerprint); if (existing) { persisted.push(existing); continue; }
      const insight = await this.insights.create({ insightId: `AII-${randomUUID()}`, projectId: dto.projectId ?? null, scope: dto.scope, entityId: dto.entityId ?? null, category: item.category, type: item.type, title: item.title, summary: item.summary, explanation: this.explanations.build(item), recommendation: item.recommendation, confidence: item.confidence, priority: item.priority, impact: item.impact, evidence: [...this.evidenceBuilder.build(context), ...item.evidence], affectedEntities: [{ scope: dto.scope, entityId: dto.entityId ?? null }], suggestedActions: item.suggestedActions, supportingMetrics: {}, supportingOpportunities: opportunities.map((o) => o.opportunityId), supportingAnalytics: analytics.map((a) => a.snapshotId), promptVersion: generated.promptVersion, aiProvider: generated.provider, model: generated.model, generatedAt: new Date(), status: InsightStatus.ACTIVE, fingerprint, correlationId: dto.correlationId ?? null, isDeleted: false, createdBy: userId ?? null, updatedBy: userId ?? null });
      this.events.publish(InsightEventType.INSIGHT_GENERATED, { insightId: insight.insightId, provider: generated.provider, model: generated.model }); persisted.push(insight);
    }
    this.events.publish(InsightEventType.INSIGHT_COMPLETED, { count: persisted.length }); return persisted;
  }
  private fingerprint(input: Record<string, unknown>): string { return createHash('sha256').update(JSON.stringify(input)).digest('hex'); }
}
