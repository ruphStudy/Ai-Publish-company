import { BadRequestException, Injectable } from '@nestjs/common';
import type { NormalizedInsightResponse } from './interfaces/ai-insights.interface';

@Injectable()
export class InsightValidationEngine {
  validate(insights: NormalizedInsightResponse[]): void { if (!insights.length) throw new BadRequestException('AI insight response did not contain insights'); insights.forEach((insight) => { if (!insight.title || !insight.summary) throw new BadRequestException('AI insight response is missing required fields'); }); }
}
