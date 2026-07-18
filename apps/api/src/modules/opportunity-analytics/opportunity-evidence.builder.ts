import { Injectable } from '@nestjs/common';
import type { OpportunityRuleResult } from './interfaces/opportunity-analytics.interface';

@Injectable()
export class OpportunityEvidenceBuilder {
  build(result: OpportunityRuleResult): Record<string, unknown>[] { return result.evidence.map((item) => ({ ...item, dataFreshness: new Date(), warnings: [] })); }
}
