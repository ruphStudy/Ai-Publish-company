import type { DataSourceProvider, MarketDataType } from '../../entities/market-intelligence.entity';
import type { DataSourceParams } from '../../interfaces/data-source.interface';

export enum ProviderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  RATE_LIMITED = 'rate_limited',
}

export enum ProviderErrorCode {
  TIMEOUT = 'PROVIDER_TIMEOUT',
  RATE_LIMITED = 'PROVIDER_RATE_LIMITED',
  UNAVAILABLE = 'PROVIDER_UNAVAILABLE',
  VALIDATION_FAILED = 'PROVIDER_VALIDATION_FAILED',
  EXECUTION_FAILED = 'PROVIDER_EXECUTION_FAILED',
  UNAUTHORIZED = 'PROVIDER_UNAUTHORIZED',
  CONFIG_INVALID = 'PROVIDER_CONFIG_INVALID',
  UNKNOWN = 'PROVIDER_UNKNOWN',
}

export interface ProviderConfig {
  key: string;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
  rateLimitRpm?: number;
  rateLimitRpd?: number;
  customConfig?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ProviderError {
  code: ProviderErrorCode;
  message: string;
  provider: DataSourceProvider;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export interface ProviderResponse<T = Record<string, unknown>> {
  success: boolean;
  provider: DataSourceProvider;
  key: string;
  version: string;
  fetchedAt: Date;
  durationMs: number;
  data: T | null;
  rawData: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  error: ProviderError | null;
}

export interface ProviderHealthResult {
  key: string;
  provider: DataSourceProvider;
  version: string;
  isAvailable: boolean;
  status: ProviderStatus;
  latencyMs: number | null;
  checkedAt: Date;
  error: string | null;
  metadata: Record<string, unknown>;
}

export interface ProviderCapability {
  dataType: MarketDataType;
  supportedMarkets?: string[];
  supportedLanguages?: string[];
  requiresAuth: boolean;
  supportsDateRange: boolean;
  supportsKeywords: boolean;
}

export const PROVIDER_TOKEN = 'MARKET_INTELLIGENCE_PROVIDERS';

export interface IProvider {
  readonly key: string;
  readonly name: string;
  readonly version: string;
  readonly provider: DataSourceProvider;
  readonly priority: number;
  readonly capabilities: ProviderCapability[];

  supports(dataType: MarketDataType): boolean;
  isAvailable(): Promise<boolean>;
  validate(params: DataSourceParams): Promise<ValidationResult>;
  execute(params: DataSourceParams, config: ProviderConfig): Promise<ProviderResponse>;
  healthCheck(): Promise<ProviderHealthResult>;
}
