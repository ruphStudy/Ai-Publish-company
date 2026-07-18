import type { DataSourceProvider } from '../../entities/market-intelligence.entity';
import type { ProviderResponse } from '../../providers/interfaces/provider.interface';
import type { UnifiedMarketIntelligenceModel } from '../models/unified-market-intelligence.model';

export const PROVIDER_NORMALIZATION_STRATEGIES_TOKEN = 'PROVIDER_NORMALIZATION_STRATEGIES';

export interface ProviderNormalizationStrategy {
  readonly provider: DataSourceProvider;

  normalize(response: ProviderResponse<unknown>): Promise<UnifiedMarketIntelligenceModel[]>;
}