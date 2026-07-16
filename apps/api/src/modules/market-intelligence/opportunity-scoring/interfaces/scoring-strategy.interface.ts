import {
  OpportunityScoreResult,
  OpportunityScoringContext,
} from '../models/opportunity-score.model';

export const SCORING_STRATEGIES_TOKEN = 'SCORING_STRATEGIES';

export interface ScoringStrategy {
  readonly key: string;
  readonly priority: number;

  supports(context: OpportunityScoringContext): boolean;
  score(context: OpportunityScoringContext): Promise<OpportunityScoreResult>;
}