import { DataSourceProvider, MarketDataType } from '../entities/market-intelligence.entity';

export interface DataSourceParams {
  provider: DataSourceProvider;
  dataType: MarketDataType;
  language?: string;
  market?: string;
  keywords?: string[];
  genre?: string;
  periodStart?: Date;
  periodEnd?: Date;
  options?: Record<string, unknown>;
}

export interface RawDataResult {
  provider: DataSourceProvider;
  dataType: MarketDataType;
  fetchedAt: Date;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export const DATA_SOURCE_TOKEN = 'DATA_SOURCE_STRATEGIES';

export interface IDataSource {
  readonly provider: DataSourceProvider;
  fetch(params: DataSourceParams): Promise<RawDataResult>;
  isAvailable(): Promise<boolean>;
  supports(dataType: MarketDataType): boolean;
}
