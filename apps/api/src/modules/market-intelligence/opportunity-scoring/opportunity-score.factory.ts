import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  ScoringStrategy} from './interfaces/scoring-strategy.interface';
import {
  SCORING_STRATEGIES_TOKEN
} from './interfaces/scoring-strategy.interface';
import { OpportunityScoringContext } from './models/opportunity-score.model';

@Injectable()
export class OpportunityScoreFactory {
  constructor(
    @Inject(SCORING_STRATEGIES_TOKEN)
    private readonly strategies: ScoringStrategy[],
  ) {}

  resolve(context: OpportunityScoringContext): ScoringStrategy {
    const strategy = this.strategies
      .filter((item) => item.supports(context))
      .sort((left, right) => left.priority - right.priority)[0];

    if (!strategy) {
      throw new NotFoundException(
        `No scoring strategy is registered for knowledge record "${context.knowledge.id}"`,
      );
    }

    return strategy;
  }

  getRegisteredStrategyKeys(): string[] {
    return this.strategies.map((item) => item.key);
  }
}