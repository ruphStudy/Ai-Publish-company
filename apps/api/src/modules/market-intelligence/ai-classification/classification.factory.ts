import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  CLASSIFICATION_STRATEGIES_TOKEN,
  ClassificationStrategy,
} from './interfaces/classification-strategy.interface';
import { ClassificationContext } from './models/classification-result.model';

@Injectable()
export class ClassificationFactory {
  constructor(
    @Inject(CLASSIFICATION_STRATEGIES_TOKEN)
    private readonly strategies: ClassificationStrategy[],
  ) {}

  resolve(context: ClassificationContext): ClassificationStrategy {
    const strategy = this.strategies
      .filter((item) => item.supports(context))
      .sort((left, right) => left.priority - right.priority)[0];

    if (!strategy) {
      throw new NotFoundException(
        `No classification strategy is registered for knowledge record "${context.knowledge.id}"`,
      );
    }

    return strategy;
  }

  getRegisteredStrategyKeys(): string[] {
    return this.strategies.map((item) => item.key);
  }
}