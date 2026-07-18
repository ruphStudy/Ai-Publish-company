import { Injectable } from '@nestjs/common';
import { opportunityAnalyticsDefaultPolicy } from './config/opportunity-analytics.config';
import { OpportunityPriority, OpportunityRiskLevel } from './entities/opportunity-analytics.entity';
import type { OpportunityRuleDefinition } from './config/opportunity-analytics.config';
import type { OpportunityRuleResult, OpportunityScoreResult } from './interfaces/opportunity-analytics.interface';

@Injectable()
export class OpportunityScoringEngine {
  score(rule: OpportunityRuleDefinition, result: OpportunityRuleResult): OpportunityScoreResult {
    const growth = Number(result.reason.growth ?? 0); const completenessPenalty = result.reason.incomplete ? 20 : 0; const totalScore = Math.max(0, Math.min(100, 50 + growth / 2 - completenessPenalty)); const confidenceScore = result.reason.incomplete ? 45 : 75; const priority = this.priority(totalScore, confidenceScore);
    return { totalScore, financialImpactScore: totalScore, growthPotentialScore: totalScore, urgencyScore: Math.min(100, totalScore + 10), confidenceScore, executionEaseScore: 60, riskReductionScore: rule.category.includes('RISK') || rule.category.includes('DATA') ? 80 : 40, strategicValueScore: totalScore, evidenceStrengthScore: confidenceScore, weightedFactors: rule.scoreConfiguration, scoringProfileId: 'DEFAULT', scoringProfileVersion: opportunityAnalyticsDefaultPolicy.scoringProfileVersion, priority, riskLevel: priority === OpportunityPriority.CRITICAL ? OpportunityRiskLevel.VERY_HIGH : priority === OpportunityPriority.HIGH ? OpportunityRiskLevel.HIGH : OpportunityRiskLevel.MEDIUM };
  }
  private priority(score: number, confidence: number): OpportunityPriority { if (confidence < opportunityAnalyticsDefaultPolicy.minimumConfidenceScore) return OpportunityPriority.INFORMATIONAL; if (score >= opportunityAnalyticsDefaultPolicy.priorityThresholds.CRITICAL) return OpportunityPriority.CRITICAL; if (score >= opportunityAnalyticsDefaultPolicy.priorityThresholds.HIGH) return OpportunityPriority.HIGH; if (score >= opportunityAnalyticsDefaultPolicy.priorityThresholds.MEDIUM) return OpportunityPriority.MEDIUM; return OpportunityPriority.LOW; }
}
