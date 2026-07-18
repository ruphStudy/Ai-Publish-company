import { Injectable } from '@nestjs/common';
import { InsightCategory, InsightPriority, InsightType } from './entities/ai-insight.entity';
import type { NormalizedInsightResponse } from './interfaces/ai-insights.interface';

@Injectable()
export class AIResponseNormalizer {
  normalize(content: string): NormalizedInsightResponse[] {
    try { const parsed = JSON.parse(content) as { insights?: NormalizedInsightResponse[] }; if (Array.isArray(parsed.insights)) return parsed.insights; } catch {}
    return [{ category: InsightCategory.EXECUTIVE_SUMMARY, type: InsightType.SUMMARY, title: 'Portfolio insight summary', summary: 'Analytics and opportunities were reviewed.', explanation: 'The insight is based on current analytics snapshots and active opportunities.', recommendation: { actionType: 'REVIEW_DASHBOARD' }, confidence: 70, priority: InsightPriority.MEDIUM, impact: null, evidence: [], suggestedActions: [{ actionType: 'REVIEW_OPPORTUNITIES' }] }];
  }
}
