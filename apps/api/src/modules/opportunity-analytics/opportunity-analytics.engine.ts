import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { AnalyticsSnapshotRepository } from '../book-analytics/book-analytics.repository';
import { opportunityAnalyticsDefaultPolicy } from './config/opportunity-analytics.config';
import { OpportunityCategory, OpportunityEventType, OpportunityStatus, OpportunityType, SuggestedOpportunityActionType } from './entities/opportunity-analytics.entity';
import type { OpportunityEvaluationContext } from './interfaces/opportunity-analytics.interface';
import { OpportunityConflictResolver } from './opportunity-conflict.resolver';
import { OpportunityDeduplicationService } from './opportunity-deduplication.service';
import { OpportunityEvidenceBuilder } from './opportunity-evidence.builder';
import { OpportunityEventPublisher } from './opportunity-event.publisher';
import { OpportunityRepository } from './opportunity.repository';
import { OpportunityRuleFactory } from './opportunity-rule.factory';
import { OpportunityRuleRegistry } from './opportunity-rule.registry';
import { OpportunityScoringEngine } from './opportunity-scoring.engine';

@Injectable()
export class OpportunityAnalyticsEngine {
  constructor(private readonly snapshots: AnalyticsSnapshotRepository, private readonly opportunities: OpportunityRepository, private readonly rules: OpportunityRuleRegistry, private readonly factory: OpportunityRuleFactory, private readonly scoring: OpportunityScoringEngine, private readonly evidence: OpportunityEvidenceBuilder, private readonly dedupe: OpportunityDeduplicationService, private readonly conflicts: OpportunityConflictResolver, private readonly events: OpportunityEventPublisher) {}
  async detect(context: OpportunityEvaluationContext, ruleKeys?: string[], userId?: string) {
    const rules = this.rules.all().filter((rule) => !ruleKeys?.length || ruleKeys.includes(rule.ruleKey)); const detected = [];
    for (const definition of rules) {
      const rule = this.factory.create(definition); if (!rule.supports(context) || !rule.validateData(context)) continue; const result = rule.evaluate(context); this.events.publish(OpportunityEventType.OPPORTUNITY_RULE_EVALUATED, { ruleKey: definition.ruleKey, matched: result.matched }); if (!result.matched) continue;
      const score = this.scoring.score(definition, result); if (score.totalScore < opportunityAnalyticsDefaultPolicy.minimumOpportunityScore || score.confidenceScore < opportunityAnalyticsDefaultPolicy.minimumConfidenceScore) continue;
      const fingerprint = this.dedupe.fingerprint({ projectId: context.projectId, scope: context.scope, entityId: context.entityId, opportunityType: definition.opportunityType, ruleKey: definition.ruleKey, ruleVersion: definition.version, periodStart: context.periodStart, periodEnd: context.periodEnd, evidence: result.evidence.map((item) => item.metricKey) });
      const duplicate = await this.opportunities.findActiveDuplicate(fingerprint); if (duplicate) { detected.push(await this.opportunities.update(String(duplicate._id), { lastDetectedAt: new Date(), score: score.totalScore, confidence: score.confidenceScore }) ?? duplicate); this.events.publish(OpportunityEventType.OPPORTUNITY_DUPLICATE_SUPPRESSED, { opportunityId: duplicate.opportunityId }); continue; }
      const conflictFlags = this.conflicts.detect({ opportunityType: definition.opportunityType, entityId: context.entityId });
      const opportunity = await this.opportunities.create({ opportunityId: `OPA-${randomUUID()}`, projectId: context.projectId ?? null, scope: context.scope, entityType: context.scope, entityId: context.entityId ?? null, category: definition.category, opportunityType: definition.opportunityType, ruleKey: definition.ruleKey, ruleVersion: definition.version, titleKey: definition.ruleKey, structuredReason: result.reason, priority: score.priority, riskLevel: score.riskLevel, status: OpportunityStatus.ACTIVE, score: score.totalScore, confidence: score.confidenceScore, scoringFactors: score, evidence: this.evidence.build(result), estimatedImpact: result.estimatedImpact ?? null, providerKey: result.dimensions.providerKey ?? null, marketplaceId: result.dimensions.marketplaceId ?? null, countryCode: result.dimensions.countryCode ?? null, territoryCode: null, format: result.dimensions.format ?? null, bookId: context.scope === 'BOOK' ? context.entityId ?? null : null, editionId: context.scope === 'EDITION' ? context.entityId ?? null : null, authorId: context.scope === 'AUTHOR' ? context.entityId ?? null : null, seriesId: context.scope === 'SERIES' ? context.entityId ?? null : null, suggestedActionType: definition.suggestedActionType, conflictFlags, conflictResolution: null, fingerprint, firstDetectedAt: new Date(), lastDetectedAt: new Date(), expiresAt: new Date(Date.now() + opportunityAnalyticsDefaultPolicy.expiryDays * 86_400_000), sourceAnalyticsSnapshotIds: context.analyticsSnapshots.map((item) => String(item.snapshotId)).filter(Boolean), ruleSetVersion: opportunityAnalyticsDefaultPolicy.ruleSetVersion, scoringProfileVersion: opportunityAnalyticsDefaultPolicy.scoringProfileVersion, correlationId: context.correlationId ?? null, isDeleted: false, createdBy: userId ?? null, updatedBy: userId ?? null });
      this.events.publish(OpportunityEventType.OPPORTUNITY_DETECTED, { opportunityId: opportunity.opportunityId, score: opportunity.score }); detected.push(opportunity);
    }
    return detected;
  }
  async context(projectId: string | undefined, scope: OpportunityEvaluationContext['scope'], entityId: string | undefined, from?: Date, to?: Date, correlationId?: string): Promise<OpportunityEvaluationContext> {
    const snapshots = projectId ? await this.snapshots.findByProjectId(projectId) : scope ? await this.snapshots.findByScope(scope as never) : []; return { projectId, scope, entityId, analyticsSnapshots: snapshots.map((item) => item.toObject() as Record<string, unknown>), periodStart: from ?? new Date(Date.now() - 30 * 86_400_000), periodEnd: to ?? new Date(), correlationId };
  }
}
