import type { DataSourceProvider, MarketDataType } from '../entities/market-intelligence.entity';
import type { RawDataResult } from './data-source.interface';

export interface NormalizedData {
  title: string;
  description?: string;
  genre?: string;
  keywords: string[];
  language?: string;
  market?: string;
  opportunityScore?: number;
  periodStart?: Date;
  periodEnd?: Date;
  providerMetadata?: Record<string, unknown>;
  payload: Record<string, unknown>;
}

export const DATA_NORMALIZER_TOKEN = 'DATA_NORMALIZER_STRATEGIES';

export interface IDataNormalizer {
  normalize(rawData: RawDataResult): Promise<NormalizedData>;
  supports(provider: DataSourceProvider, dataType: MarketDataType): boolean;
}
