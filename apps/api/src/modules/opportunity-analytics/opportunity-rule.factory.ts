import { Injectable } from '@nestjs/common';
import type { OpportunityRule, OpportunityEvaluationContext } from './interfaces/opportunity-analytics.interface';
import type { OpportunityRuleDefinition } from './config/opportunity-analytics.config';

@Injectable()
export class OpportunityRuleFactory {
  create(definition: OpportunityRuleDefinition): OpportunityRule {
    return { definition, supports: (context: OpportunityEvaluationContext) => definition.supportedScopes.includes(context.scope), validateData: (context: OpportunityEvaluationContext) => context.analyticsSnapshots.length > 0, evaluate: (context: OpportunityEvaluationContext) => { const snapshot = context.analyticsSnapshots[0] ?? {}; const metricValues = snapshot.metricValues as Record<string, unknown> | undefined; const comparisonValues = snapshot.comparisonValues as Record<string, { percentageChange?: number | null }> | undefined; const growth = comparisonValues?.netSales?.percentageChange ?? comparisonValues?.unitsSold?.percentageChange ?? 0; const incomplete = Number((snapshot.dataCompleteness as Record<string, unknown> | undefined)?.normalizedRecordCoverage ?? 1) < (definition.thresholdConfiguration.completeness ?? 0); const matched = definition.ruleKey === 'ANALYTICS_DATA_INCOMPLETE' ? incomplete : Number(growth) >= (definition.thresholdConfiguration.growthRate ?? 0); return { matched, reason: { ruleKey: definition.ruleKey, growth, incomplete }, evidence: [{ metricKey: definition.requiredMetrics[0] ?? 'dataCompleteness', currentValue: metricValues?.netSales ?? null, percentageChange: growth, periodStart: context.periodStart, periodEnd: context.periodEnd, supportingSnapshotIds: [snapshot.snapshotId].filter(Boolean) }], dimensions: { providerKey: null, marketplaceId: null, countryCode: null, format: null }, estimatedImpact: null }; } };
  }
}
