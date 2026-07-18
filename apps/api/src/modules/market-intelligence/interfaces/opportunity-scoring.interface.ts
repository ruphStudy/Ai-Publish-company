import type { MarketDataType } from '../entities/market-intelligence.entity';
import type { NormalizedData } from './data-normalizer.interface';

export interface ScoredData extends NormalizedData {
  opportunityScore: number;
  scoringVersion: string;
  scoringFactors: Record<string, number>;
}

export const OPPORTUNITY_SCORER_TOKEN = 'OPPORTUNITY_SCORER_STRATEGIES';

export interface IOpportunityScorer {
  score(normalizedData: NormalizedData): Promise<ScoredData>;
  supports(dataType: MarketDataType): boolean;
  readonly scoringVersion: string;
}
