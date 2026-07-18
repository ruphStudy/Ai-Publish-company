import { Injectable } from '@nestjs/common';
import type { InsightGenerationContext } from './interfaces/ai-insights.interface';

@Injectable()
export class InsightEvidenceBuilder {
  build(context: InsightGenerationContext) { return [{ analyticsCount: context.analytics.length, opportunityCount: context.opportunities.length, scope: context.scope, entityId: context.entityId ?? null }]; }
}
