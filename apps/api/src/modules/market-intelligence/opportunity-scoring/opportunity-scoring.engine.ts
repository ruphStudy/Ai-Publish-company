import { BadRequestException, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';

import {
  OpportunityScoringConfig} from './config/opportunity-scoring.config';
import {
  OPPORTUNITY_SCORING_CONFIG_TOKEN
} from './config/opportunity-scoring.config';
import { OpportunityScoreFactory } from './opportunity-score.factory';
import { OpportunityScoringValidator } from './opportunity-scoring.validator';
import {
  OpportunityScoreResult,
  OpportunityScoringContext,
} from './models/opportunity-score.model';

@Injectable()
export class OpportunityScoringEngine {
  constructor(
    private readonly factory: OpportunityScoreFactory,
    private readonly validator: OpportunityScoringValidator,
    @Inject(OPPORTUNITY_SCORING_CONFIG_TOKEN)
    private readonly config: OpportunityScoringConfig,
  ) {}

  async score(
    context: Omit<OpportunityScoringContext, 'scoreVersion'>,
  ): Promise<OpportunityScoreResult> {
    const scoringContext: OpportunityScoringContext = {
      ...context,
      scoreVersion: this.config.scoreVersion,
    };
    const contextValidation = this.validator.validateContext(scoringContext);

    if (!contextValidation.valid) {
      throw new BadRequestException({
        message: 'Invalid opportunity scoring context',
        errors: contextValidation.errors,
      });
    }

    const strategy = this.factory.resolve(scoringContext);
    const result = await strategy.score(scoringContext);
    const resultValidation = this.validator.validateResult(result);

    if (!resultValidation.valid) {
      throw new BadRequestException({
        message: 'Invalid opportunity scoring result',
        errors: resultValidation.errors,
      });
    }

    return result;
  }
}