import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { DataSourceProvider } from '../entities/market-intelligence.entity';
import {
  ProviderNormalizationStrategy} from './interfaces/provider-normalization-strategy.interface';
import {
  PROVIDER_NORMALIZATION_STRATEGIES_TOKEN
} from './interfaces/provider-normalization-strategy.interface';

@Injectable()
export class NormalizationFactory {
  constructor(
    @Inject(PROVIDER_NORMALIZATION_STRATEGIES_TOKEN)
    private readonly strategies: ProviderNormalizationStrategy[],
  ) {}

  resolve(provider: DataSourceProvider): ProviderNormalizationStrategy {
    const strategy = this.strategies.find((item) => item.provider === provider);

    if (!strategy) {
      throw new NotFoundException(
        `No normalization strategy is registered for provider "${provider}"`,
      );
    }

    return strategy;
  }

  supports(provider: DataSourceProvider): boolean {
    return this.strategies.some((item) => item.provider === provider);
  }

  getSupportedProviders(): DataSourceProvider[] {
    return this.strategies.map((item) => item.provider);
  }
}