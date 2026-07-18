import { Injectable } from '@nestjs/common';
import { aiInsightsDefaultPolicy } from './config/ai-insights.config';
import type { InsightGenerationContext } from './interfaces/ai-insights.interface';

@Injectable()
export class InsightPromptBuilder {
  build(context: InsightGenerationContext): { prompt: string; promptVersion: string } { return { prompt: JSON.stringify({ instruction: 'Generate structured, explainable, advisory business insights only. Do not execute actions.', context: { ...context, analytics: context.analytics.slice(0, 5), opportunities: context.opportunities.slice(0, 10) } }), promptVersion: aiInsightsDefaultPolicy.promptVersion }; }
}
