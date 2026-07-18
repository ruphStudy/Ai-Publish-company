import { Injectable } from '@nestjs/common';
import type { OpportunityDocument } from './entities/opportunity-analytics.entity';

@Injectable()
export class OpportunityRankingService {
  rank(items: OpportunityDocument[]): OpportunityDocument[] { return [...items].sort((a, b) => b.score - a.score || b.confidence - a.confidence); }
}
