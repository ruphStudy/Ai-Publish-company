import { Injectable } from '@nestjs/common';
import { InsightPriority } from './entities/ai-insight.entity';
import type { NormalizedInsightResponse } from './interfaces/ai-insights.interface';

@Injectable()
export class InsightRankingEngine {
  rank(insights: NormalizedInsightResponse[]) { const weight: Record<InsightPriority, number> = { CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFORMATIONAL: 1 }; return [...insights].sort((a, b) => weight[b.priority] - weight[a.priority] || b.confidence - a.confidence); }
}
