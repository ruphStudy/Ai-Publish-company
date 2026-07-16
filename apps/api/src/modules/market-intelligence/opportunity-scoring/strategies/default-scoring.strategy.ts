import { Injectable } from '@nestjs/common';

import { OpportunityScoreCalculator } from '../opportunity-score-calculator';
import { ScoringStrategy } from '../interfaces/scoring-strategy.interface';
import {
  OpportunityScoreResult,
  OpportunityScoringContext,
} from '../models/opportunity-score.model';

@Injectable()
export class DefaultScoringStrategy implements ScoringStrategy {
  readonly key = 'default-scoring-v1';
  readonly priority = 1;

  constructor(private readonly calculator: OpportunityScoreCalculator) {}

  supports(): boolean {
    return true;
  }

  async score(
    context: OpportunityScoringContext,
  ): Promise<OpportunityScoreResult> {
    return this.calculator.calculate(context);
  }
}