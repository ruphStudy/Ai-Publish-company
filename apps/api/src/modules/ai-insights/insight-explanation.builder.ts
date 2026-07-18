import { Injectable } from '@nestjs/common';
import type { NormalizedInsightResponse } from './interfaces/ai-insights.interface';

@Injectable()
export class InsightExplanationBuilder {
  build(insight: NormalizedInsightResponse) { return insight.explanation || `${insight.summary} Supporting analytics and opportunity evidence were used.`; }
}
