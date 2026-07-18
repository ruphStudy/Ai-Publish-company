import type { OpportunityPriority, OpportunityRiskLevel, OpportunityScope } from '../entities/opportunity-analytics.entity';
import type { OpportunityRuleDefinition } from '../config/opportunity-analytics.config';

export interface OpportunityEvaluationContext { projectId?: string | null; scope: OpportunityScope; entityId?: string | null; analyticsSnapshots: Array<Record<string, unknown>>; periodStart: Date; periodEnd: Date; correlationId?: string | null }
export interface OpportunityRuleResult { matched: boolean; reason: Record<string, unknown>; evidence: Record<string, unknown>[]; dimensions: Record<string, string | null>; estimatedImpact?: Record<string, unknown> | null }
export interface OpportunityScoreResult { totalScore: number; financialImpactScore: number; growthPotentialScore: number; urgencyScore: number; confidenceScore: number; executionEaseScore: number; riskReductionScore: number; strategicValueScore: number; evidenceStrengthScore: number; weightedFactors: Record<string, unknown>; scoringProfileId: string; scoringProfileVersion: string; priority: OpportunityPriority; riskLevel: OpportunityRiskLevel }
export interface OpportunityRule { definition: OpportunityRuleDefinition; supports(context: OpportunityEvaluationContext): boolean; validateData(context: OpportunityEvaluationContext): boolean; evaluate(context: OpportunityEvaluationContext): OpportunityRuleResult }
